#!/bin/bash
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
#
# Render narration for the given subjects with one Piper process, only while free disk is at least
# SM_MIN_FREE_GB (default 11). tts.py skips finished lessons and stops itself near 9.5 GB; this
# wrapper waits for space and resumes it. Gives up after 6 hours.
#   SM_BUILD=~/Downloads/<build> SM_PIPER_PYTHON=<venv>/bin/python tools/render_rest.sh <subject>...
set -u
cd "$(dirname "$0")/.."
B="${SM_BUILD:?set SM_BUILD to the build workspace}"
export SM_VOICES_DIR="${SM_VOICES_DIR:-$B/voices}" SM_AUDIO_DIR="${SM_AUDIO_DIR:-$B/audio}" \
       SM_TMP_DIR="${SM_TMP_DIR:-$B/tmp}" SM_LOGS_DIR="${SM_LOGS_DIR:-$B/logs}"
MIN="${SM_MIN_FREE_GB:-11}"
deadline=$(( $(date +%s) + 6*3600 ))
while [ "$(date +%s)" -lt "$deadline" ]; do
  free=$(df -g / | awk 'NR==2{print $4}')
  if [ "$free" -lt "$MIN" ]; then sleep 60; continue; fi
  out=$(nice -n 19 python3 -B pipeline/tts.py "$@" 2>&1 | tee -a "$SM_LOGS_DIR/render-rest.out" | tail -2)
  echo "$out" | grep -q "STOP: free disk" && continue
  echo "$out" | grep -q "0 lesson(s) to render" && { echo "DONE: nothing left"; exit 0; }
  echo "$out" | grep -q "tts end" && { echo "DONE: $out"; exit 0; }
  echo "FAILED: $out"; exit 1
done
echo "TIMEOUT"; exit 2
