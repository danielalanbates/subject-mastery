#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""
privacy_scan.py - find secrets and personal data in the files a commit would include.

Run it before every push of the public repo:

    python3 -B tools/privacy_scan.py <repo-or-snapshot> --terms <private-terms.txt> --out scan.md

- The file list is exactly what `git add -A` would stage: the repo's .gitignore is applied
  with a throwaway git dir in a temp folder, so nothing is created inside the scanned tree.
- Generic patterns (API keys, tokens, private keys, e-mail addresses, phone numbers,
  machine-specific paths, IP addresses) live here. Private words (family names, personal
  e-mail addresses, chat ids) are NOT in this public file: they come from --terms, a local
  file of "label | term" lines that must never be committed.
- Matches are masked in the report. Keys and tokens are never printed.
- Exit code: 0 = no findings, 1 = findings (review them), 2 = usage error.
Standard library only; needs `git` on PATH.
"""
import argparse
import os
import re
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True

ALLOWED_EMAILS = {"help@batesai.org", "noreply@anthropic.com"}
# Example and placeholder addresses that are not personal data.
ALLOWED_EMAIL_DOMAINS = {"example.com", "example.org", "example.net", "users.noreply.github.com"}
SKIP_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".icns", ".mp3", ".wav", ".m4a",
            ".woff", ".woff2", ".ttf", ".otf", ".pdf", ".zip", ".gz", ".sqlite", ".sqlite3", ".db"}

# (id, label, regex, severity, proposed fix)
PATTERNS = [
    ("google-key", "Google API key", r"AIza[0-9A-Za-z_\-]{35}", "critical",
     "Remove; rotate the key; read it from secrets at call time."),
    ("groq-key", "Groq API key", r"\bgsk_[A-Za-z0-9]{20,}", "critical", "Remove and rotate."),
    ("openrouter-key", "OpenRouter key", r"\bsk-or-(?:v1-)?[A-Za-z0-9]{20,}", "critical", "Remove and rotate."),
    ("sk-key", "sk- style secret key", r"\bsk-(?!or-)[A-Za-z0-9_\-]{20,}", "critical", "Remove and rotate."),
    ("github-token", "GitHub token", r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{20,}",
     "critical", "Remove and revoke."),
    ("slack-token", "Slack token", r"\bxox[abposr]-[A-Za-z0-9-]{10,}", "critical", "Remove and revoke."),
    ("hf-token", "Hugging Face token", r"\bhf_[A-Za-z0-9]{30,}", "critical", "Remove and revoke."),
    ("nvidia-key", "Nvidia API key", r"\bnvapi-[A-Za-z0-9_\-]{20,}", "critical", "Remove and revoke."),
    ("aws-key", "AWS access key id", r"\bAKIA[0-9A-Z]{16}\b", "critical", "Remove and revoke."),
    ("telegram-bot-token", "Telegram bot token", r"\b\d{8,10}:[A-Za-z0-9_\-]{35}\b", "critical",
     "Remove; revoke with BotFather."),
    ("bearer", "Bearer credential", r"\bBearer\s+(?!token\b|<)[A-Za-z0-9._~+/=\-]{16,}", "critical",
     "Remove the literal credential."),
    ("private-key", "Private key block", r"-----BEGIN [A-Z ]*PRIVATE KEY-----", "critical", "Remove; rotate the key."),
    ("telegram-chat", "Telegram chat id", r"(?i)\b(?:chat[_ ]?id|telegram_chat)\b\W{0,4}-?\d{6,}", "high",
     "Remove the id."),
    ("email", "E-mail address", r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b", "high",
     "Replace with help@batesai.org or remove."),
    ("phone", "Phone number", r"(?<![\w.])(?:\+?1[\s.\-]?)?\(?\b\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}\b(?![\w.])", "high",
     "Remove."),
    ("user-path", "Machine path with a user name", r"/Users/[A-Za-z0-9._\-]+", "medium",
     "Replace with a placeholder ($SM_REPO, ~/…); keep the exact path in docs/LOCAL_PATHS.md."),
    # Literal strings are split so this file does not match its own patterns.
    ("drive-path", "Google Drive account path", r"(?i)CloudStorage/Google" r"Drive-[^/\s\"'`]*", "high",
     "Replace with $SM_REPO; keep the exact path in docs/LOCAL_PATHS.md."),
    ("icloud-path", "iCloud Drive path", r"Mobile Documents/com~apple~" r"CloudDocs", "medium",
     "Replace with a placeholder."),
    ("ipv4", "IPv4 address", r"\b(?:\d{1,3}\.){3}\d{1,3}\b", "low",
     "Keep only loopback / documentation addresses."),
]
IPV4_OK = {"127.0.0.1", "127.1.2.3", "0.0.0.0", "255.255.255.255", "192.0.2.20"}


def mask(kind, text):
    """Never echo a secret; shorten personal data."""
    if kind in ("critical",):
        return f"{text[:4]}…({len(text)} chars)"
    if "@" in text:
        user, _, dom = text.partition("@")
        return f"{user[:1]}…{user[-1:] if len(user) > 1 else ''}@{dom}"
    return text if len(text) <= 60 else text[:57] + "…"


def committed_files(root):
    """Files `git add -A` would stage under root, honouring root's .gitignore files."""
    scratch = os.path.expanduser(os.environ.get("SM_SCAN_TMP", "~/Downloads/subject-mastery-build/tmp"))
    os.makedirs(scratch, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="smscan-", dir=scratch) as tmp:
        gd = os.path.join(tmp, "git")
        subprocess.run(["git", "init", "-q", "--bare", gd], check=True)
        out = subprocess.run(
            ["git", f"--git-dir={gd}", f"--work-tree={root}", "-c", "core.quotepath=off",
             "ls-files", "--others", "--exclude-standard", "-z"],
            check=True, capture_output=True).stdout
    return sorted(p for p in out.decode("utf-8", "replace").split("\0") if p)


def load_terms(path):
    terms = []
    if not path:
        return terms
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "|" not in line:
                continue
            label, term = (s.strip() for s in line.split("|", 1))
            if term:
                terms.append((label, term))
    return terms


def scan(root, terms):
    hits = []
    files = committed_files(root)
    compiled = [(pid, label, re.compile(rx), sev, fix) for pid, label, rx, sev, fix in PATTERNS]
    for rel in files:
        if os.path.splitext(rel)[1].lower() in SKIP_EXT:
            continue
        try:
            with open(os.path.join(root, rel), encoding="utf-8", errors="replace") as f:
                lines = f.read().split("\n")
        except OSError as e:
            hits.append((rel, 0, "read-error", "Could not read file", "high", str(e), "Check by hand."))
            continue
        for n, line in enumerate(lines, 1):
            for pid, label, rx, sev, fix in compiled:
                for m in rx.finditer(line):
                    s = m.group(0)
                    if pid == "email":
                        if s.lower() in ALLOWED_EMAILS or s.lower().split("@", 1)[1] in ALLOWED_EMAIL_DOMAINS:
                            continue
                    if pid == "ipv4":
                        parts = s.split(".")
                        if s in IPV4_OK or any(int(p) > 255 for p in parts):
                            continue
                    hits.append((rel, n, pid, label, sev, mask(sev, s), fix))
            low = line.lower()
            for label, term in terms:
                if term.lower() in low:
                    hits.append((rel, n, "private-term", label, "high", f"[{label}]",
                                 "Remove or replace with a placeholder."))
    return files, hits


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("root")
    ap.add_argument("--terms", help="local 'label | term' file with private words (never commit it)")
    ap.add_argument("--out", help="write a Markdown report here")
    a = ap.parse_args()
    root = os.path.abspath(a.root)
    if not os.path.isdir(root):
        print("not a directory:", root, file=sys.stderr)
        return 2
    files, hits = scan(root, load_terms(a.terms))
    order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    hits.sort(key=lambda h: (order.get(h[4], 9), h[0], h[1]))
    rows = [f"| `{h[0]}:{h[1]}` | {h[4]} | {h[3]} | `{h[5]}` | {h[6]} |" for h in hits]
    report = "\n".join([
        f"Scanned {len(files)} files that `git add -A` would stage under `{os.path.basename(root)}`; "
        f"{len(hits)} findings.",
        "",
        "| File:line | Severity | What | Match (masked) | Proposed fix |",
        "|---|---|---|---|---|",
        *rows,
    ])
    if a.out:
        with open(a.out, "w", encoding="utf-8") as f:
            f.write(report + "\n")
    print(report)
    return 1 if hits else 0


if __name__ == "__main__":
    sys.exit(main())
