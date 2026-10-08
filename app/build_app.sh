#!/bin/bash
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
#
# Builds "Subject Mastery.app" (the local beta) and installs it in /Applications.
#
#   app/build_app.sh               build, then install (archives the old copy first)
#   app/build_app.sh --no-install  build only; the bundle stays in $OUT
#   app/build_app.sh --server-cli  also build SubjectMasteryServer, the server alone, for curl tests
#
# Never builds inside the repo (Google Drive reads can stall for minutes): sources are copied
# to $OUT/src first. Needs Xcode's swiftc, sips, iconutil and codesign. Signing is ad-hoc.
# Refuses to install while the app is running; it never quits or kills anything.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(dirname "$HERE")"
BUILD_ROOT="${SM_BUILD:-$HOME/Downloads/subject-mastery-build}"
OUT="$BUILD_ROOT/app-build"
NAME="Subject Mastery"
APP="$OUT/$NAME.app"
DEST="/Applications/$NAME.app"
SITE="${SM_APP_SITE:-$BUILD_ROOT/dist-live}"
ARCHIVE="$BUILD_ROOT/archive"
TARGET="arm64-apple-macos12.0"
INSTALL=1
SERVER_CLI=0
for a in "$@"; do
  case "$a" in
    --no-install) INSTALL=0 ;;
    --server-cli) SERVER_CLI=1 ;;
    *) echo "unknown option: $a" >&2; exit 2 ;;
  esac
done
T=""; command -v timeout >/dev/null && T="timeout 60"

echo "==> sources -> $OUT/src"
mkdir -p "$OUT/src"
for f in SubjectMastery.swift make_icon.swift Info.plist; do $T cp "$HERE/$f" "$OUT/src/$f"; done
$T cp "$REPO/web/icons/icon-512.png" "$OUT/src/icon-512.png"

echo "==> compile"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
nice -n 10 swiftc -O -swift-version 5 -target "$TARGET" "$OUT/src/SubjectMastery.swift" \
  -o "$APP/Contents/MacOS/SubjectMastery"
if [ "$SERVER_CLI" = 1 ]; then
  nice -n 10 swiftc -O -swift-version 5 -target "$TARGET" -D SM_SERVER_CLI "$OUT/src/SubjectMastery.swift" \
    -o "$OUT/SubjectMasteryServer"
  echo "    server CLI: $OUT/SubjectMasteryServer [folder]"
fi

echo "==> icon"
nice -n 10 swiftc -O -swift-version 5 -target "$TARGET" "$OUT/src/make_icon.swift" -o "$OUT/make_icon"
"$OUT/make_icon" "$OUT/src/icon-512.png" "$OUT/icon-1024.png"
ICONSET="$OUT/AppIcon.iconset"
rm -rf "$ICONSET"; mkdir -p "$ICONSET"
for s in 16 32 128 256 512; do
  sips -z $s $s "$OUT/icon-1024.png" --out "$ICONSET/icon_${s}x${s}.png" >/dev/null
  d=$((s * 2))
  sips -z $d $d "$OUT/icon-1024.png" --out "$ICONSET/icon_${s}x${s}@2x.png" >/dev/null
done
iconutil -c icns "$ICONSET" -o "$APP/Contents/Resources/AppIcon.icns"

echo "==> bundle"
cp "$OUT/src/Info.plist" "$APP/Contents/Info.plist"
if [ ! -f "$SITE/index.html" ]; then
  echo "Build the site first, or set SM_APP_SITE to a verified static build." >&2
  exit 2
fi
# Dereference audio links: the installed app must remain usable independently of Downloads.
cp -RL "$SITE" "$APP/Contents/Resources/Site"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $(date +%Y%m%d.%H%M)" "$APP/Contents/Info.plist"
printf 'APPL????' > "$APP/Contents/PkgInfo"
codesign --force --sign - --timestamp=none "$APP"
codesign --verify --strict "$APP"
echo "    built $APP ($(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$APP/Contents/Info.plist") build $(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$APP/Contents/Info.plist"))"

[ "$INSTALL" = 1 ] || exit 0

echo "==> install -> $DEST"
if pgrep -f "$NAME.app/Contents/MacOS/SubjectMastery" >/dev/null; then
  echo "Subject Mastery is running. Quit it (Subject Mastery > Quit), then run this again. Nothing was installed." >&2
  exit 3
fi
if [ -e "$DEST" ]; then
  STAMP="$(date +%Y%m%d-%H%M%S)"
  mkdir -p "$ARCHIVE/app-$STAMP"
  mv "$DEST" "$ARCHIVE/app-$STAMP/"
  echo "    previous copy archived to $ARCHIVE/app-$STAMP/"
fi
# Move (not copy), so exactly one copy of the bundle exists: the live one.
mv "$APP" "$DEST"
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$DEST" || true
echo "    installed $DEST"
