# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""Regression gate for the ten-minute audio page contract. No TTS required."""
import contextlib
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import build


class PageDurationTests(unittest.TestCase):
    def test_recordings_over_ten_minutes_or_with_bad_duration_stop_publication(self):
        scratch = Path(os.environ.get("SM_TEST_TMP", "~/Downloads/subject-mastery-build/tmp")).expanduser()
        scratch.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as folder:
            content = Path(folder)
            subject = dict(id="example", title="Example", tagline="A subject.",
                           category="Science", description="An original learning path.", color="#123456")
            (content / "catalog.json").write_text(json.dumps(dict(version=1, subjects=[dict(subject, status="available")])))
            lesson = content / "example/lessons/m01-foundations/l01-introduction.md"
            lesson.parent.mkdir(parents=True)
            lesson.write_text("# Introduction\n\n" + "concept " * 600)
            subject["modules"] = [dict(id="m01-foundations", title="Foundations", summary="Start here.",
                                       lessons=[dict(id="l01-introduction", title="Introduction", summary="An introduction.")])]
            (content / "example/subject.json").write_text(json.dumps(subject))
            for duration in (601, 600.1, 0, -1, "300", float("nan"), float("inf")):
                with self.subTest(duration=duration), patch.object(build, "CONTENT", str(content)), \
                     patch.object(build, "audio_info", return_value=(True, {"durationSec": duration, "voice": "piper:en_US-john-medium"})), \
                     contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                    with self.assertRaises(SystemExit) as result:
                        build.build(check_only=True)
                    self.assertEqual(result.exception.code, 2)
            with patch.object(build, "CONTENT", str(content)), \
                 patch.object(build, "audio_info", return_value=(True, {"durationSec": 600, "voice": "piper:en_US-john-medium"})), \
                 contextlib.redirect_stdout(io.StringIO()):
                build.build(check_only=True)


if __name__ == "__main__":
    unittest.main()
