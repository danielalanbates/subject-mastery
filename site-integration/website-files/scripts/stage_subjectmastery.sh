#!/usr/bin/env bash
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
#
# Stage the Subject Mastery web player into public/subjectmastery/ so the next
# `npm run build` copies it to dist/subjectmastery/ (served at
# https://batesai.org/subjectmastery/).
#
#   scripts/stage_subjectmastery.sh            # from ~/Downloads/subject-mastery-build/dist
#   scripts/stage_subjectmastery.sh /path/dist # from somewhere else
#
# The player is built by the subject-mastery repo, never committed here (see
# .gitignore), the same arrangement as public/play/. Run this, then build,
# then deploy — see subject-mastery/site-integration/README.md for the full
# runbook. The script refuses to stage anything Cloudflare Pages would reject
# or that is plainly not a finished build.
set -euo pipefail

cd "$(dirname "$0")/.."
SITE="$PWD"
SRC="${1:-$HOME/Downloads/subject-mastery-build/dist}"
DEST="$SITE/public/subjectmastery"

# Cloudflare Pages limits (free plan): 25 MiB per file, 20,000 files per
# deployment for the whole site.
MAX_FILE_BYTES=$((25 * 1024 * 1024))
MAX_FILES=15000   # leaves room for the rest of the site

fail() { echo "!! $*" >&2; exit 1; }

[ -d "$SRC" ] || fail "no player build at $SRC"
[ -f "$SRC/index.html" ] || fail "$SRC/index.html is missing — build the player first"
[ -f "$SRC/data/catalog.json" ] || echo "   warning: $SRC/data/catalog.json is missing; the player will show no subjects"

if [ -n "$(find "$SRC" -type l -print -quit)" ]; then
  fail "$SRC contains symlinks; stage a real copy (find \"$SRC\" -type l)"
fi

big="$(find "$SRC" -type f -size +"$MAX_FILE_BYTES"c -print | head -5)"
[ -z "$big" ] || fail "files over 25 MiB (Cloudflare Pages limit):"$'\n'"$big"

count="$(find "$SRC" -type f | wc -l | tr -d ' ')"
[ "$count" -le "$MAX_FILES" ] || fail "$count files is too many for one Pages deployment (cap here: $MAX_FILES)"

echo "==> staging $count files from $SRC"
rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$SRC/." "$DEST/"
# Finder litter is not part of the build.
find "$DEST" -name '.DS_Store' -delete

[ -f "$DEST/index.html" ] || fail "copy failed: $DEST/index.html missing"
echo "==> staged into public/subjectmastery/ ($(du -sh "$DEST" | cut -f1))"
