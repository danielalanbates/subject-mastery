# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
# SPDX-License-Identifier: GPL-3.0-or-later
# This Piper adapter is licensed under GPL-3.0-or-later; see LICENSES/GPL-3.0.txt.
# The rest of Subject Mastery retains the license in the repository's LICENSE.
"""
piper_worker.py - one long-lived Piper process that turns text into WAV files.

Run ONLY with VanaVoice's Python (it has the piper-tts 1.7 package); VanaVoice is used
read-only. tts.py starts exactly one of these and feeds it jobs, so the voice model is
loaded once and only one Piper process ever runs.

Protocol (stdin/stdout, one JSON object per line):
  in : {"out": "/path/file.wav", "segments": [["text", pause_after_seconds], ...]}
  out: {"ok": true, "out": "...", "seconds": 123.4}   or   {"ok": false, "error": "..."}
Within a segment, Piper's own sentence split is used, with `sentence_silence` between sentences.
"""
import json
import sys
import wave

from piper import PiperVoice, SynthesisConfig


def main():
    model = sys.argv[1]
    length_scale = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
    sentence_silence = float(sys.argv[3]) if len(sys.argv) > 3 else 0.3
    voice = PiperVoice.load(model)
    rate = voice.config.sample_rate
    cfg = SynthesisConfig(length_scale=length_scale)
    sys.stdout.write(json.dumps({"ready": True, "sample_rate": rate}) + "\n")
    sys.stdout.flush()
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            job = json.loads(line)
            frames = 0
            with wave.open(job["out"], "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(rate)
                for text, pause in job["segments"]:
                    for i, chunk in enumerate(voice.synthesize(text, cfg)):
                        if i > 0:
                            n = int(rate * sentence_silence)
                            wf.writeframes(bytes(n * 2))
                            frames += n
                        wf.writeframes(chunk.audio_int16_bytes)
                        frames += len(chunk.audio_int16_bytes) // 2
                    n = int(rate * float(pause))
                    wf.writeframes(bytes(n * 2))
                    frames += n
            sys.stdout.write(json.dumps({"ok": True, "out": job["out"], "seconds": frames / rate}) + "\n")
        except Exception as e:  # noqa: BLE001 - report every failure to the parent
            sys.stdout.write(json.dumps({"ok": False, "error": f"{type(e).__name__}: {e}"}) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()
