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



class SearchIndexTests(unittest.TestCase):
    """data/search.json (CONTRACT v3): available subjects only, path order, no lesson text, deterministic."""

    def test_search_index_lists_available_subjects_topics_and_written_lessons_in_path_order(self):
        scratch = Path(os.environ.get("SM_TEST_TMP", "~/Downloads/subject-mastery-build/tmp")).expanduser()
        scratch.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as folder:
            root = Path(folder)
            content = root / "content"
            subject = dict(id="example", title="Example", tagline="A subject.", category="Science",
                           description="An original learning path.", color="#123456")
            planned = dict(id="later", title="Later", tagline="Not yet.", category="Science", status="planned")
            (content / "example").mkdir(parents=True)
            (content / "catalog.json").write_text(json.dumps(dict(version=1, subjects=[dict(subject, status="available"), planned])))
            written = {"m01-foundations/l01-introduction": "Introduction",
                       "m01-foundations/m01-details/l01-depth": "Depth & Détail",
                       "m02-more/l01-final": "Final"}
            for rel, title in written.items():
                md = content / "example/lessons" / (rel + ".md")
                md.parent.mkdir(parents=True, exist_ok=True)
                md.write_text(f"# {title}\n\n" + "concept " * 600)
            subject["modules"] = [
                dict(id="m01-foundations", title="Foundations", summary="Start here.",
                     lessons=[dict(id="l01-introduction", title="Introduction", summary="An introduction."),
                              dict(id="l02-unwritten", title="Unwritten", summary="Not written yet.")],
                     modules=[dict(id="m01-details", title="Details", summary="Going deeper.",
                                   lessons=[dict(id="l01-depth", title="Depth & Détail", summary="<b>Bold</b> claims.")])]),
                dict(id="m02-more", title="More", lessons=[dict(id="l01-final", title="Final")]),
            ]
            (content / "example/subject.json").write_text(json.dumps(subject))
            dist = root / "dist"
            outputs = []
            for _ in range(2):
                with patch.object(build, "CONTENT", str(content)), patch.object(build, "DIST", str(dist)), \
                     patch.object(build, "AUDIO", str(root / "no-audio")), contextlib.redirect_stdout(io.StringIO()):
                    build.build(with_web=False)
                outputs.append((dist / "data/search.json").read_bytes())
            self.assertEqual(outputs[0], outputs[1], "same content must give the same bytes")
            index = json.loads(outputs[0])
            self.assertEqual(index["version"], 1)
            crumbs = ["Example", "Foundations"]
            self.assertEqual(index["entries"], [
                {"key": "example", "kind": "subject", "title": "Example", "summary": "A subject.", "breadcrumb": []},
                {"key": "example/m01-foundations", "kind": "topic", "title": "Foundations", "summary": "Start here.",
                 "breadcrumb": ["Example"]},
                {"key": "example/m01-foundations/l01-introduction", "kind": "lesson", "title": "Introduction",
                 "summary": "An introduction.", "breadcrumb": crumbs, "minutes": 4},
                {"key": "example/m01-foundations/m01-details", "kind": "topic", "title": "Details",
                 "summary": "Going deeper.", "breadcrumb": crumbs},
                {"key": "example/m01-foundations/m01-details/l01-depth", "kind": "lesson", "title": "Depth & Détail",
                 "summary": "<b>Bold</b> claims.", "breadcrumb": crumbs + ["Details"], "minutes": 4},
                {"key": "example/m02-more", "kind": "topic", "title": "More", "summary": "", "breadcrumb": ["Example"]},
                {"key": "example/m02-more/l01-final", "kind": "lesson", "title": "Final", "summary": "",
                 "breadcrumb": ["Example", "More"], "minutes": 4},
            ])
            raw = outputs[0].decode("utf-8")
            self.assertNotIn("concept", raw, "no lesson body text in the index")
            self.assertNotIn("later", raw, "planned subjects stay out")
            self.assertIn("Détail", raw, "UTF-8, not \\u escapes")


if __name__ == "__main__":
    unittest.main()
