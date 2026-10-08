#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""
sync_content.py - copy content/ between the Drive repo and a local working mirror.

Why: Google Drive for desktop sometimes blocks read() on a file for minutes while it
syncs it (observed 2026-10-02 on content/catalog.json and content/economics/subject.json).
A blocked read hangs an unattended writing run forever, so long runs work on a local
mirror (SM_CONTENT_DIR) and this script moves files with timeouts and retries.

    python3 sync_content.py pull    # repo content/  -> ~/Downloads/subject-mastery-build/work/content
    python3 sync_content.py push    # local mirror   -> repo content/  (only changed files)
    python3 sync_content.py status  # list files that differ
    python3 sync_content.py push economics biology   # only these subject folders (or files) under content/

push never deletes files in the repo.
"""
import hashlib
import os
import subprocess
import sys
import time

from subjects import BUILD, REPO_FIXED

# Set SM_REPO_CONTENT when syncing a Downloads mirror into a Drive checkout.
REPO_CONTENT = os.environ.get("SM_REPO_CONTENT") or os.path.join(REPO_FIXED, "content")
WORK_CONTENT = os.environ.get("SM_WORK_CONTENT") or os.path.join(BUILD, "work", "content")
TIMEOUT = 60  # seconds per file operation
SKIP = {".DS_Store"}


def _run(cmd):
    """Run with a hard timeout; returns (ok, output). A Drive stall becomes a retryable failure."""
    try:
        p = subprocess.run(cmd, capture_output=True, timeout=TIMEOUT)
        return p.returncode == 0, p.stdout
    except subprocess.TimeoutExpired:
        return False, b""


def _hash(path):
    ok, out = _run(["shasum", "-a", "256", path])
    return out.split()[0].decode() if ok and out else None


def _files(root):
    for d, _, fs in os.walk(root):
        for f in fs:
            if f in SKIP or f.endswith(".tmp"):
                continue
            full = os.path.join(d, f)
            yield os.path.relpath(full, root)


def diff(src, dst):
    out = []
    for rel in sorted(_files(src)):
        a, b = os.path.join(src, rel), os.path.join(dst, rel)
        if not os.path.exists(b) or _hash(a) != _hash(b):
            out.append(rel)
    return out


def copy(src, dst, rels, retries=5):
    failed = []
    for rel in rels:
        a, b = os.path.join(src, rel), os.path.join(dst, rel)
        os.makedirs(os.path.dirname(b), exist_ok=True)
        for attempt in range(retries):
            ok, _ = _run(["cp", "-p", a, b + ".synctmp"])
            if ok:
                ok, _ = _run(["mv", "-f", b + ".synctmp", b])
            if ok and _hash(a) == _hash(b):
                break
            time.sleep(10 * (attempt + 1))
        else:
            failed.append(rel)
    return failed


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    if cmd == "pull":
        src, dst = REPO_CONTENT, WORK_CONTENT
    elif cmd in ("push", "status"):
        src, dst = WORK_CONTENT, REPO_CONTENT
    else:
        raise SystemExit(__doc__)
    rels = diff(src, dst)
    only = [a.rstrip("/") for a in sys.argv[2:]]
    if only:
        rels = [r for r in rels if any(r == o or r.startswith(o + "/") for o in only)]
    print(f"{cmd}: {len(rels)} file(s) differ ({src} -> {dst})")
    if cmd == "status":
        for r in rels:
            print("  ", r)
        return
    failed = copy(src, dst, rels)
    print(f"{cmd}: copied {len(rels) - len(failed)}, failed {len(failed)}")
    for r in failed:
        print("   FAILED", r)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
