#!/bin/bash
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
#
# One deliberate verification session for the installed "Subject Mastery.app". Run it once,
# by hand; it is not a loop and never takes focus:
#   1. no instance may be running
#   2. launch in the background (open -g) with the hidden --sm-selftest argument
#   3. wait for logs-app/selftest.json, then capture the app's window (screencapture -l)
#   4. quit it with AppleScript
#   5. relaunch once the same way: persistence = the localStorage marker written by
#      launch 1 is read back by launch 2, and the window frame set by launch 1 is restored
#   6. quit, and confirm no instance is left
# Results: $BUILD_ROOT/logs-app/selftest-launch{1,2}.json, screenshots in $BUILD_ROOT/screens-app/.
# The self-test plays audio MUTED, and never opens a browser (sign-in clicks are only recorded).
#
#   app/verify_app.sh           launch with `open -g` (the real path). The app's first read of
#                               ~/Downloads waits for macOS's "access files in your Downloads
#                               folder" consent, which a person must click once per build.
#   app/verify_app.sh --direct  unattended agents: start the app binary from this shell instead,
#                               so this terminal (which already has Downloads access) is the
#                               privacy-responsible process and no consent dialog appears.
set -euo pipefail
MODE="open"
[ "${1:-}" = "--direct" ] && MODE="direct"

APP="/Applications/Subject Mastery.app"
BID="org.batesai.subjectmastery"
BUILD_ROOT="${SM_BUILD:-$HOME/Downloads/subject-mastery-build}"
LOGS="$BUILD_ROOT/logs-app"
SHOTS="$BUILD_ROOT/screens-app"
# Match the app binary exactly: a plain `pgrep -f 'Subject Mastery'` also matches the content
# pipeline's ffmpeg, whose arguments contain "artist=Subject Mastery".
PROC="Subject Mastery.app/Contents/MacOS/SubjectMastery"

running() { pgrep -f "$PROC" >/dev/null; }
# wait_until <shell condition> <seconds>: one bounded wait, checked every 0.25 s.
wait_until() {
  local n=0
  while ! eval "$1"; do
    n=$((n + 1)); [ "$n" -ge $(($2 * 4)) ] && return 1
    sleep 0.25
  done
}

if running; then echo "Subject Mastery is already running; quit it first. Nothing was done." >&2; exit 3; fi
[ -d "$APP" ] || { echo "$APP is not installed; run app/build_app.sh first." >&2; exit 2; }
mkdir -p "$LOGS" "$SHOTS"

launch() {  # $1 = label
  rm -f "$LOGS/selftest.json" "$LOGS/snapshot.png"
  if [ "$MODE" = direct ]; then
    echo "==> $1: start the binary from this shell (background, no focus change)"
    nohup "$APP/Contents/MacOS/SubjectMastery" --sm-selftest >/dev/null 2>&1 &
    disown
  else
    echo "==> $1: open -g (background, no focus change)"
    open -g -a "$APP" --args --sm-selftest
  fi
  wait_until "[ -s '$LOGS/selftest.json' ]" 120 || { echo "no self-test result after 120 s" >&2; return 1; }
  cp "$LOGS/selftest.json" "$LOGS/selftest-$1.json"
  [ -f "$LOGS/snapshot.png" ] && cp "$LOGS/snapshot.png" "$SHOTS/$1-webview-snapshot.png"
  local wid
  wid="$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['app']['windowNumber'])" "$LOGS/selftest-$1.json")"
  # A locked screen makes this fail ("could not create image from window"); the app's own
  # WKWebView snapshot above still shows what rendered.
  if screencapture -x -o -l "$wid" "$SHOTS/$1-window.png"; then
    echo "    window $wid -> $SHOTS/$1-window.png"
  else
    echo "    screencapture of window $wid failed (screen locked?); see $SHOTS/$1-webview-snapshot.png"
  fi
}

quit_app() {
  echo "==> quit (AppleScript)"
  osascript -e "tell application id \"$BID\" to quit"
  wait_until "! running" 30 || { echo "still running 30 s after quit" >&2; return 1; }
}

launch launch1
quit_app
launch launch2
quit_app
if running; then echo "FAIL: an instance is still running" >&2; exit 1; fi
echo "==> no instance left running"

# Read-only look at WebKit's own storage file for the marker key.
DB="$(find "$HOME/Library/WebKit/$BID" -name 'localstorage.sqlite3' 2>/dev/null | head -1 || true)"
if [ -n "$DB" ]; then
  echo "==> WebKit LocalStorage on disk: ${DB/#$HOME/~}"
  sqlite3 -readonly "$DB" "select key, length(value) from ItemTable order by key;" 2>/dev/null | sed 's/^/    /' || true
fi

python3 - "$LOGS/selftest-launch1.json" "$LOGS/selftest-launch2.json" <<'EOF'
import json, sys
a, b = (json.load(open(p)) for p in sys.argv[1:3])
def checks(r):
    p, s = r.get("page", {}), r.get("server", {})
    rng, au, api = p.get("range", {}), p.get("audio", {}), p.get("api", {})
    return [
        ("page rendered (text > 80 chars)", p.get("render", {}).get("textLength", 0) > 80),
        ("served on the fixed port", s.get("port") == s.get("preferredPort")),
        ("Range mid 206 + bytes match", rng.get("mid", {}).get("status") == 206 and rng.get("mid", {}).get("matchesWhole") is True),
        ("Range suffix 206 + bytes match", rng.get("suffix", {}).get("status") == 206 and rng.get("suffix", {}).get("matchesWhole") is True),
        ("Range past end 416", rng.get("unsatisfiable", {}).get("status") == 416),
        ("<audio> seek lands on target", abs(au.get("afterSeek", -9) - au.get("seekTarget", 0)) < 0.5),
        ("<audio> plays on after seek (muted)", au.get("advancedSeconds", 0) > 1 and au.get("paused") is False),
        ("server answered 206s", s.get("partialResponses", 0) > 0),
        ("/me -> 200 signedIn:false", api.get("meStatus") == 200 and api.get("me") == {"signedIn": False}),
        ("other /api -> 401", api.get("progressStatus") == 401 and api.get("putStatus") == 401),
        ("sign-in link intercepted, page stayed", bool(r.get("signInLinksIntercepted")) and "/api/" not in p.get("afterSignInClick", {}).get("href", "/api/")),
        ("no page errors", not p.get("errors")),
    ]
ok = True
for label, r in (("launch1", a), ("launch2", b)):
    for name, passed in checks(r):
        ok &= passed
        print(f"  {'PASS' if passed else 'FAIL'}  {label}: {name}")
prev = (b.get("page", {}).get("persistence", {}).get("previous") or {}).get("launchId")
wrote = a.get("page", {}).get("persistence", {}).get("wrote", {}).get("launchId")
persist = bool(wrote) and prev == wrote
frame = b.get("app", {}).get("windowFrameAtLaunch") == a.get("windowFrameSetForNextLaunch")
for name, passed in (("localStorage survived the relaunch", persist), ("window frame remembered", frame)):
    ok &= passed
    print(f"  {'PASS' if passed else 'FAIL'}  {name}")
print("ALL PASS" if ok else "SOME CHECKS FAILED")
sys.exit(0 if ok else 1)
EOF
