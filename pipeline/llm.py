#!/usr/bin/env python3
# Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
# help@batesai.org · https://batesai.org
"""
llm.py - one generate() function over a fallback chain of FREE LLM providers.

Providers, in default order (all free tiers; nothing here can spend money):
  1. Google Gemini      (GEMINI_API_KEY)        generativelanguage.googleapis.com
  2. Groq               (GROQ_API_KEY)          api.groq.com/openai/v1  (OpenAI-compatible)
  3. GitHub Models      (`gh auth token`)       models.github.ai/inference
  4. OpenRouter         (OPENROUTER_API_KEY)    ONLY ":free" models, price-checked at runtime

Keys are read at call time from
  ~/Library/Application Support/DaemonManager/secrets.json
or from environment variables of the same name. They are never written, logged
or printed. Error text from providers is logged truncated; providers do not echo
keys (Gemini's key travels in a header, never in the URL).

Quota handling: 429/503/timeouts are retried with short backoff when the
provider says the wait is short; otherwise the model is put in a cooldown
(persisted in the build dir so that a restarted run does not hammer an
exhausted quota) and the chain falls through to the next model.

Usage as a library:
    from llm import generate
    r = generate("prompt", system="...", chain="writer")
    r.text, r.provider, r.model

CLI:
    python3 llm.py probe          # test every candidate, print which work
    python3 llm.py state          # show cooldowns
    python3 llm.py clear          # clear cooldowns
"""
import json
import os
import random
import re
import signal
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request

BUILD = os.path.expanduser(os.environ.get("SM_BUILD", "~/Downloads/subject-mastery-build"))
STATE_FILE = os.path.join(BUILD, "logs", "llm_state.json")
SECRETS = os.path.expanduser(os.environ.get("SM_SECRETS_FILE", "~/Library/Application Support/DaemonManager/secrets.json"))
UA = "subject-mastery-pipeline/1.0 (+https://batesai.org)"  # Groq's Cloudflare blocks urllib's default UA (error 1010)

# ---------------------------------------------------------------- candidates
# (provider, model). Order = preference. Probed 2026-10-02:
#   gemini-3.8/3.7/3.6/3.5-flash: exist but often 503 "high demand" on free tier
#   gemini-3-flash-preview: works, ~10 s for 800 words
#   gemini-2.5-flash: works (thinking model; needs a large maxOutputTokens)
#   gemini-2.5-pro: 404 for new users; gemini-3.1-pro-preview: free-tier quota is 0
#   groq openai/gpt-oss-120b, qwen/qwen3.8-27b: work; 8000 tokens/minute, 1000 req/day
#   GitHub Models: models.github.ai answers every request with a bare "OK" text/plain
#                  stub (service appears retired/changed) -> detected and skipped
#   openrouter nvidia/nemotron-3-ultra-550b-a55b:free, nemotron-3-super-120b:free: work
GEMINI_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
]
# Flash-lite models (no thinking, ~5 s per lesson) were not overloaded when the full flash models were (12:10).
GEMINI_LITE = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]
GEMINI_ALL = GEMINI_MODELS + GEMINI_LITE
GROQ_MODELS = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b"]
GITHUB_MODELS = ["openai/gpt-5", "openai/gpt-4.1", "deepseek/deepseek-r1"]
OPENROUTER_MODELS = [
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "qwen/qwen3.8-27b:free",
    "google/gemma-4-31b-it:free",
]

CHAINS = {
    # long-form writing: strongest writers first
    "writer": [("gemini", m) for m in GEMINI_ALL]
    + [("groq", "openai/gpt-oss-120b"), ("github", GITHUB_MODELS[0]), ("github", GITHUB_MODELS[1])]
    + [("openrouter", m) for m in OPENROUTER_MODELS],
    # independent review: a different model family from the writer first
    # (write_lessons excludes the drafting model, so a Groq draft is reviewed by the other Groq family, etc.)
    # OpenRouter's free nemotron-ultra took 290 s for one review on 2026-10-02, so it sits near the end.
    "reviewer": [("groq", "openai/gpt-oss-120b"), ("groq", "qwen/qwen3.8-27b"), ("github", GITHUB_MODELS[0])]
    + [("gemini", m) for m in GEMINI_ALL]
    + [("openrouter", OPENROUTER_MODELS[1]), ("openrouter", OPENROUTER_MODELS[0])],
}


class LLMError(Exception):
    pass


class Result:
    def __init__(self, text, provider, model, usage=None, seconds=0.0):
        self.text = text
        self.provider = provider
        self.model = model
        self.usage = usage or {}
        self.seconds = seconds

    @property
    def label(self):
        return f"{self.provider}:{self.model}"


# ---------------------------------------------------------------- secrets
_secret_cache = {}


def _secret(name):
    if name in _secret_cache:
        return _secret_cache[name]
    val = os.environ.get(name)
    if not val:
        try:
            with open(SECRETS) as f:
                val = json.load(f).get(name)
        except (OSError, ValueError):
            val = None
    if not val and name == "GITHUB_TOKEN":
        try:
            val = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True,
                                 timeout=20).stdout.strip() or None
        except (OSError, subprocess.SubprocessError):
            val = None
    _secret_cache[name] = val
    return val


# ---------------------------------------------------------------- cooldown state
def _load_state():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def _save_state(st):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    tmp = STATE_FILE + ".tmp"
    with open(tmp, "w") as f:
        json.dump(st, f, indent=1, sort_keys=True)
    os.replace(tmp, STATE_FILE)


def _cooldown(provider, model, seconds, reason):
    st = _load_state()
    key = f"{provider}:{model}"
    st[key] = {"until": time.time() + seconds, "reason": reason[:200],
               "set": time.strftime("%Y-%m-%d %H:%M:%S")}
    _save_state(st)
    _log(f"cooldown {key} {int(seconds)}s: {reason[:160]}")


def _cooling(provider, model):
    st = _load_state()
    now = time.time()
    for key in (f"{provider}:{model}", f"{provider}:*"):
        ent = st.get(key)
        if ent and ent.get("until", 0) > now:
            return True
    return False


# ---------------------------------------------------------------- logging
_log_path = None


def set_log(path):
    global _log_path
    _log_path = path


def _log(msg):
    line = f"{time.strftime('%H:%M:%S')} [llm] {msg}"
    print(line, file=sys.stderr, flush=True)
    if _log_path:
        with open(_log_path, "a") as f:
            f.write(line + "\n")


# ---------------------------------------------------------------- http
class _Http(Exception):
    def __init__(self, code, body, headers=None):
        super().__init__(f"HTTP {code}: {body[:300]}")
        self.code = code
        self.body = body
        self.headers = headers or {}


def _deadline_handler(signum, frame):
    raise TimeoutError("hard deadline: the call timed out")


def _post(url, headers, payload, timeout):
    """POST JSON. `timeout` is a HARD total deadline: OpenRouter keeps slow non-streaming requests alive with
    whitespace, so a per-read socket timeout alone never fires (seen 2026-10-02: 5+ minute hangs)."""
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, method="POST",
                                 headers={"Content-Type": "application/json", "User-Agent": UA, **headers})
    use_alarm = threading.current_thread() is threading.main_thread()
    if use_alarm:
        old = signal.signal(signal.SIGALRM, _deadline_handler)
        signal.setitimer(signal.ITIMER_REAL, timeout)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read().decode("utf-8", "replace")
            hdrs = dict(r.headers.items())
    except urllib.error.HTTPError as e:
        raise _Http(e.code, e.read().decode("utf-8", "replace"), dict(e.headers.items()))
    finally:
        if use_alarm:
            signal.setitimer(signal.ITIMER_REAL, 0)
            signal.signal(signal.SIGALRM, old)
    try:
        return json.loads(raw), hdrs
    except ValueError:
        raise _Http(-1, f"non-JSON response: {raw[:120]!r}")


def _get_json(url, headers, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA, **headers})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


# ---------------------------------------------------------------- providers
def _call_gemini(model, system, prompt, max_tokens, temperature, timeout, json_mode):
    key = _secret("GEMINI_API_KEY") or _secret("GOOGLE_API_KEY")
    if not key:
        raise LLMError("no GEMINI_API_KEY")
    cfg = {"maxOutputTokens": max(max_tokens, 1024) + 8192,  # thinking tokens count against this
           "temperature": temperature}
    if json_mode:
        cfg["responseMimeType"] = "application/json"
    payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}], "generationConfig": cfg}
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}
    d, _ = _post(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                 {"x-goog-api-key": key}, payload, timeout)
    cands = d.get("candidates") or []
    if not cands:
        raise LLMError(f"gemini no candidates: {json.dumps(d.get('promptFeedback', {}))[:200]}")
    c = cands[0]
    text = "".join(p.get("text", "") for p in (c.get("content") or {}).get("parts", []) if not p.get("thought"))
    if c.get("finishReason") not in (None, "STOP"):
        raise LLMError(f"gemini finishReason={c.get('finishReason')}")
    return text, d.get("usageMetadata", {})


def _call_openai_compat(url, key, model, system, prompt, max_tokens, temperature, timeout, json_mode,
                        extra=None):
    msgs = []
    if system:
        msgs.append({"role": "system", "content": system})
    msgs.append({"role": "user", "content": prompt})
    payload = {"model": model, "messages": msgs, "max_tokens": max_tokens, "temperature": temperature}
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    if extra:
        payload.update(extra)
    d, hdrs = _post(url, {"Authorization": f"Bearer {key}"}, payload, timeout)
    if "choices" not in d or not d["choices"]:
        raise LLMError(f"no choices: {json.dumps(d)[:200]}")
    ch = d["choices"][0]
    text = (ch.get("message") or {}).get("content") or ""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.S)  # reasoning models that inline their thoughts
    if ch.get("finish_reason") == "length":
        raise LLMError("finish_reason=length (truncated)")
    return text, d.get("usage", {})


def _call_groq(model, system, prompt, max_tokens, temperature, timeout, json_mode):
    key = _secret("GROQ_API_KEY")
    if not key:
        raise LLMError("no GROQ_API_KEY")
    # gpt-oss is a reasoning model and its thinking counts against max_tokens. On long writing jobs "medium"
    # thinking truncated the answer (finish_reason=length, 2026-10-02), so writing uses "low", reviews "medium".
    extra = None
    if model.startswith("openai/gpt-oss"):
        extra = {"reasoning_effort": "low" if max_tokens >= 2500 else "medium"}
    # Groq free tier counts max_tokens against 8000 tokens/minute (gpt-oss); keep it bounded.
    # qwen3.8-27b allows only 1000 OUTPUT tokens per minute (OTPM), so it can review but never write a lesson.
    cap = 1000 if model.startswith("qwen/") else 6500
    return _call_openai_compat("https://api.groq.com/openai/v1/chat/completions", key, model, system, prompt,
                               min(max_tokens + 1500, cap), temperature, timeout, json_mode, extra)


_github_ok = None


def _github_available():
    """models.github.ai currently returns a bare 'OK' for every request; detect once per process."""
    global _github_ok
    if _github_ok is None:
        tok = _secret("GITHUB_TOKEN")
        if not tok:
            _github_ok = False
        else:
            try:
                cat = _get_json("https://models.github.ai/catalog/models",
                                {"Authorization": f"Bearer {tok}", "Accept": "application/json"})
                _github_ok = isinstance(cat, list) and len(cat) > 0
            except Exception:
                _github_ok = False
        if not _github_ok:
            _log("github models: catalog not a JSON list (service stub/unavailable) - skipping provider")
    return _github_ok


def _call_github(model, system, prompt, max_tokens, temperature, timeout, json_mode):
    if not _github_available():
        raise LLMError("github models unavailable")
    return _call_openai_compat("https://models.github.ai/inference/chat/completions", _secret("GITHUB_TOKEN"),
                               model, system, prompt, max_tokens, temperature, timeout, json_mode)


_or_free = None


def _openrouter_free_ids():
    """Model ids whose listed prompt AND completion price is exactly 0 and whose id ends ':free'."""
    global _or_free
    if _or_free is None:
        try:
            d = _get_json("https://openrouter.ai/api/v1/models", {})
            _or_free = {m["id"] for m in d.get("data", [])
                        if m["id"].endswith(":free")
                        and str(m.get("pricing", {}).get("prompt")) in ("0", "0.0")
                        and str(m.get("pricing", {}).get("completion")) in ("0", "0.0")}
        except Exception as e:
            _log(f"openrouter model list failed: {e}")
            _or_free = set()
    return _or_free


def _call_openrouter(model, system, prompt, max_tokens, temperature, timeout, json_mode):
    # Hard guard: never call a paid model. The account holds a few cents of credit.
    if not model.endswith(":free"):
        raise LLMError(f"refusing non-free openrouter model {model}")
    if model not in _openrouter_free_ids():
        raise LLMError(f"{model} not listed as zero-price right now")
    key = _secret("OPENROUTER_API_KEY")
    if not key:
        raise LLMError("no OPENROUTER_API_KEY")
    extra = {"provider": {"max_price": {"prompt": 0, "completion": 0}}}
    # json_mode is not passed on: several free endpoints reject response_format; prompts already ask for JSON.
    return _call_openai_compat("https://openrouter.ai/api/v1/chat/completions", key, model, system, prompt,
                               max_tokens + 8000, temperature, timeout, False, extra)


CALLERS = {"gemini": _call_gemini, "groq": _call_groq, "github": _call_github, "openrouter": _call_openrouter}


# ---------------------------------------------------------------- error classification
def _retry_seconds(err):
    """Return (kind, seconds). kind in {'retry','cooldown','dead','next'}."""
    if isinstance(err, _Http):
        code, body = err.code, err.body
        low = body.lower()
        if code == 429 and "free-models-per-day" in low:
            return "provider_cooldown", 3600
        if code == 429 and "request too large" in low:
            return "next", 0
        if code == 429 and "rate-limited upstream" in low:
            return "cooldown", 600
        if code == 429:
            secs = None
            try:
                for det in json.loads(body).get("error", {}).get("details", []):
                    if "retryDelay" in det:
                        secs = float(str(det["retryDelay"]).rstrip("s"))
            except (ValueError, AttributeError):
                pass
            ra = err.headers.get("retry-after") or err.headers.get("Retry-After")
            if secs is None and ra:
                try:
                    secs = float(ra)
                except ValueError:
                    pass
            if "perday" in low.replace("_", "").replace(" ", "") or "per day" in low or "free-models-per-day" in low:
                return "cooldown", max(secs or 0, 3600)
            if "tokens per day" in low or "(tpd)" in low or "requests per day" in low or "(rpd)" in low:
                return "cooldown", max(secs or 0, 1800)
            if secs is not None and secs <= 90:
                return "retry", secs + 1
            if secs is not None:
                return "cooldown", secs
            return "retry", 20
        if code in (503, 529) or (code == 500 and "overloaded" in low):
            # "high demand": retrying the same model straight away only burns time; rest it
            return "cooldown", 600
        if code in (500, 502, 504):
            return "next_soft", 0
        if code in (401, 403, 404):
            return "dead", 0
        if code == 413 or (code == 400 and "context" in low):
            return "next", 0
        if code == -1:
            return "dead", 0
        return "next", 0
    if isinstance(err, LLMError):
        msg = str(err)
        if "refusing" in msg or "unavailable" in msg or "not listed" in msg or "_API_KEY" in msg:
            return "dead", 0
        if "overloaded" in msg or "503" in msg or "429" in msg:  # errors wrapped in a 200 body (OpenRouter)
            return "cooldown", 600
        return "next", 0
    # timeouts: rest the model at once (a hung model costs `timeout` seconds per try)
    if "timed out" in str(err).lower() or isinstance(err, TimeoutError):
        return "cooldown", 900
    # connection resets etc.
    return "next_soft", 0


def seconds_until_available(cands):
    """0 if any candidate is usable now, else seconds until the first cooldown ends."""
    st = _load_state()
    now = time.time()
    waits = []
    for provider, model in cands:
        until = max(st.get(f"{provider}:{model}", {}).get("until", 0), st.get(f"{provider}:*", {}).get("until", 0))
        if until <= now:
            return 0
        waits.append(until - now)
    return min(waits) if waits else 0


# ---------------------------------------------------------------- public API
def generate(prompt, system=None, chain="writer", max_tokens=3000, temperature=0.6, timeout=240,
             exclude=None, only=None, json_mode=False, min_chars=1, max_attempts_per_model=3):
    """Return Result from the first candidate in `chain` that answers.

    exclude: iterable of "provider:model" or "provider" to skip (e.g. the drafting model for a review).
    only:    iterable of "provider:model" to restrict to.
    """
    cands = CHAINS[chain] if isinstance(chain, str) else chain
    exclude = set(exclude or [])
    errors = []
    for provider, model in cands:
        label = f"{provider}:{model}"
        if label in exclude or provider in exclude:
            continue
        if only and label not in only:
            continue
        if _cooling(provider, model):
            continue
        soft_fail = 0
        for attempt in range(max_attempts_per_model):
            t0 = time.time()
            try:
                text, usage = CALLERS[provider](model, system, prompt, max_tokens, temperature, timeout, json_mode)
                text = (text or "").strip()
                if len(text) < min_chars:
                    raise LLMError(f"too short ({len(text)} chars)")
                dt = time.time() - t0
                _log(f"ok {label} {dt:.1f}s {len(text)} chars")
                return Result(text, provider, model, usage, dt)
            except Exception as e:  # noqa: BLE001 - every failure is classified below
                kind, secs = _retry_seconds(e)
                errors.append(f"{label}: {str(e)[:160]}")
                _log(f"fail {label} attempt {attempt + 1}: {kind} {str(e)[:200]}")
                if kind == "retry" and attempt + 1 < max_attempts_per_model:
                    time.sleep(secs + random.uniform(0, 2))
                    continue
                if kind == "retry":
                    _cooldown(provider, model, 300, str(e))
                elif kind == "cooldown":
                    _cooldown(provider, model, secs, str(e))
                elif kind == "provider_cooldown":
                    _cooldown(provider, "*", secs, str(e))
                elif kind == "dead":
                    _cooldown(provider, model, 6 * 3600, str(e))
                elif kind == "next_soft":
                    soft_fail += 1
                    if soft_fail < 2 and attempt + 1 < max_attempts_per_model:
                        time.sleep(5 + random.uniform(0, 3))
                        continue
                    # overloaded / timing out: rest it a while so we don't pay the timeout every call
                    _cooldown(provider, model, 900, str(e))
                break
    raise LLMError("all providers failed: " + " | ".join(errors[-8:]))


def _probe():
    seen = set()
    for chain in CHAINS.values():
        for provider, model in chain:
            if (provider, model) in seen:
                continue
            seen.add((provider, model))
            t0 = time.time()
            try:
                text, _ = CALLERS[provider](model, None, "In one sentence: what is opportunity cost?", 200, 0.2, 90,
                                            False)
                print(f"OK    {provider}:{model}  {time.time() - t0:.1f}s  {text.strip()[:70]!r}", flush=True)
            except Exception as e:  # noqa: BLE001
                print(f"FAIL  {provider}:{model}  {str(e)[:120]}", flush=True)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "probe"
    if cmd == "probe":
        _probe()
    elif cmd == "state":
        now = time.time()
        for k, v in sorted(_load_state().items()):
            left = v["until"] - now
            if left > 0:
                print(f"{k:55s} {int(left):6d}s  {v['reason'][:90]}")
    elif cmd == "clear":
        _save_state({})
        print("cleared")
    else:
        print(__doc__)
