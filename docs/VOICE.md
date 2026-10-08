# Narration voice

Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved. · help@batesai.org · https://batesai.org

_Decided 2026-10-02. The measurements below were taken that afternoon on this Mac, at the same time as
the content builder and a game were running._

## Decision

**Chosen: `en_US-john-medium`.** This is Piper's "John" voice by Bryce Beattie: a US English male voice
trained on public-domain LibriVox recordings.

| Test | Result |
|---|---|
| Licence | **Commercial use allowed.** The dataset is public domain (LibriVox). The voice was fine-tuned from Bryce's "Kristin" voice, which was trained from scratch on public-domain LibriVox audio. Nothing in the chain comes from lessac (Blizzard 2013, research-only) or Ryan (CC BY-NC-SA). |
| Intelligibility | Mean normalised Whisper WER over 4 lessons (one per pilot subject): **1.82%**. The best voice, `ryan-high` (noncommercial), scored 1.12%, so John is 0.7 points behind and inside the 1-point bar. |
| Render speed | Medium model, **13 to 20x realtime**: 33 to 57 s per lesson including encoding on this busy Mac. ryan-high runs at about 3x realtime, or 2 to 3 min per lesson. |
| Audio sanity | -19.1 to -19.7 LUFS, true peak -1.2 dBFS or lower, **0 clipped samples** in every MP3. |
| Accent | American, like the old contract default `ryan-high`. |

Why John and not the other licence-clean voices:

- **`en_US-ljspeech-medium`** had the best clean WER (1.60%). But Whisper heard **"theology" as "philology"** in 3 of 4 uses in the Theology lesson and 1 of 6 in a probe, which is a bad miss for a subject named Theology. Its MP3s also reach **+0.7 dBTP** and have 3 clipped samples.
- **`en_US-kristin-medium`** (1.89%) turned **"law" into "lore"** in 4 of 7 uses in the history lesson and 2 of 5 in the probe. "Law" is a common word in history, theology and economics (the law of demand).
- **`en_GB-cori-medium`** (1.81%) is effectively tied with John and was the only voice with a perfect probe. It is the **runner-up**. It lost only on the mild American-English preference, and it is faster-paced (142 vs 129 words per minute).
- **`en_US-norman-medium`** (2.16%) was the weakest US voice. Whisper heard Aquinas as "Aquarius", lawgiver as "wargiver", proton as "protein" and Hammurabi as "Henry Warby".
- **High models** (`libritts-high`, `cori-high`, `ljspeech-high`) are about as intelligible as the mediums. They render 6 to 8x slower, though, which is the same cost as ryan-high.

John's known weaknesses:

- **Slow pace.** At `LENGTH_SCALE 1.15` he speaks about 129 words per minute, where ljspeech gives 134, cori 142 and lessac 159. A 1,000-word lesson runs about 7.8 min, against 6.3 min with lessac. The longest lesson so far (1,097 words) is about 8.5 min, so every lesson still fits the 10-minute page rule. Listeners can also speed up playback in the player.
- **Mispronounces "cuneiform"** ("coniform", 4 of 4 times).
- **Nobody has listened to it yet.** Whisper measures intelligibility, not how pleasant a voice sounds. Daniel should play the side-by-side samples listed under "Listen" below before the site switches over.

## Status of the John render (started 2026-10-02 15:11:32)

| Item | Value |
|---|---|
| PID | **70097** (`tts.py`), with Piper worker child **70115** |
| Lessons queued | 151, every lesson in `BUILD/work/content` at start time. Lessons written later are picked up by re-running the command. |
| Output | `~/Downloads/subject-mastery-build/audio-en_US-john-medium/<lesson key>.mp3` + `.json` sidecar (`"voice": "piper:en_US-john-medium"`) |
| Log | `~/Downloads/subject-mastery-build/logs-voice/render-en_US-john-medium.out`, plus `logs-voice/tts-YYYYMMDD.log` |
| Speed | The first 10 lessons took 6 min 52 s, an average of 41 s each (33 to 57 s), so the ETA is **about 17:00** on 2026-10-02. It runs slower while the builder's own `tts.py` is running. |
| First 3 checked | l01: 471 s for 1,033 words (132 wpm), -19.3 LUFS. l02: 472 s for 1,071 words (136 wpm), -19.3 LUFS. l03: 419 s for 956 words (137 wpm), -19.2 LUFS. True peak -1.2 to -1.3 dBFS, 0 clipped samples. Sidecar voice `piper:en_US-john-medium`. Whisper spot-check of l02: raw WER 5.42%, **normalised 1.68%**. Its real errors were "concert" heard as "concept" and "negative" as "an additive"; the rest were spelling variants such as forgo/forego. |

**Resume or continue the render.** `tts.py` skips every lesson whose MP3 and sidecar already match the text and voice, so the same command resumes after a stop and also picks up new lessons:

```sh
B=~/Downloads/subject-mastery-build; V=en_US-john-medium
cd $B && SM_CONTENT_DIR=$B/work/content SM_AUDIO_DIR=$B/audio-$V SM_TMP_DIR=$B/tmp-$V \
  SM_VOICES_DIR=$B/voices SM_LOGS_DIR=$B/logs-voice \
  nohup nice -n 10 python3 -B $B/voice-pipeline/tts.py --voice $V > $B/logs-voice/render-$V.out 2>&1 &
```

`voice-pipeline/` is a local copy of `pipeline/`, so a Drive stall can't hang the run. Refresh it first with
`cp "<repo>/pipeline/"*.py $B/voice-pipeline/` (use `timeout 60` on Drive reads). If the builder has changed `tts.py`'s
normalisation rules since, the refreshed copy re-renders only the lessons whose speakable text changed. This is the same
rule `build.py` uses to call audio "fresh".

## How to switch voices

**One command renders a whole library in any voice** (`SM_VOICES_DIR` was added to `tts.py` on 2026-10-02):

```sh
SM_VOICES_DIR=~/Downloads/subject-mastery-build/voices python3 -B pipeline/tts.py --voice en_US-john-medium
```

Add `SM_AUDIO_DIR=…` to keep it apart from the current audio, as the render above does. Leave `SM_VOICES_DIR` unset for the
voices installed with VanaVoice (`en_GB-cori-medium`, `en_US-ryan-high`, `en_US-lessac-medium` and others).

**Make John the site's voice.** Do this once the content builder has stopped, because it renders with `DEFAULT_VOICE`:

1. Point `build.py` at the John audio: `SM_AUDIO_DIR=~/Downloads/subject-mastery-build/audio-en_US-john-medium python3 -B pipeline/build.py`.
   `build.py` reads the voice from each sidecar, so no code change is needed. While the builder still owns `BUILD/dist`, add
   `SM_DIST_DIR=…` to keep the outputs apart.
2. The public defaults in `pipeline/tts.py` now set `DEFAULT_VOICE = "en_US-john-medium"` and make `VOICES` fall back to
   `~/Downloads/subject-mastery-build/voices` (VanaVoice is read-only, so the file can't go there). Update the "Voice" line in
   `pipeline/README.md` and the example `"voice"` in `docs/CONTRACT.md`.
3. Credit the voice on the About page: "Narration: Piper TTS (MIT), voice 'John' by Bryce Beattie, trained on public-domain
   LibriVox recordings."

**Getting the voice files.** They live outside the repo and are not committed:

```sh
cd ~/Downloads/subject-mastery-build/voices
for e in onnx onnx.json; do curl -L -o en_US-john-medium.$e \
  https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/john/medium/en_US-john-medium.$e; done
shasum -a 256 en_US-john-medium.onnx   # 789c6c875726e627ddee93d51d8727859abe9c091c3d141591f4b83c2072e988
```

## Licences (each read from the MODEL_CARD on 2026-10-02)

Fetched with `curl https://huggingface.co/rhasspy/piper-voices/raw/main/en/<locale>/<name>/<quality>/MODEL_CARD`. Copies are in
`~/Downloads/subject-mastery-build/voices/model-cards/`. The piper-voices repo itself is MIT (its README metadata). Bryce
Beattie's page (https://brycebeattie.com/files/tts/) lists PD for LJSpeech, Cori, Kristin, John, Bryce and Norman and says:
"Feel free to use these for any legal and ethical purpose." Downloaded `.onnx` SHA-256 values matched Hugging Face's LFS ids.

**Tested (licence-clean, plus ryan-high and lessac as references):**

| Voice | Training per MODEL_CARD | Dataset licence | Commercial use? | MODEL_CARD |
|---|---|---|---|---|
| **en_US-john-medium** (US M) | Fine-tuned from Kristin (PD, from scratch); 12.5 h LibriVox | public domain | **Yes** | [card](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/john/medium/MODEL_CARD) |
| en_US-kristin-medium (US F) | From scratch; 11.5 h LibriVox | public domain | Yes | [card](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/kristin/medium/MODEL_CARD) |
| en_US-norman-medium (US M) | From scratch; 15.5 h LibriVox | public domain | Yes | [card](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/norman/medium/MODEL_CARD) |
| en_US-ljspeech-medium / -high (US F) | From scratch; LJ Speech | public domain | Yes | [medium](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ljspeech/medium/MODEL_CARD), [high](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ljspeech/high/MODEL_CARD) |
| en_US-libritts-high (904 speakers; default speaker 0 = `p3922` tested) | From scratch; LibriTTS train-clean-360 | CC BY 4.0 | Yes, with attribution | [card](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/libritts/high/MODEL_CARD) |
| en_GB-cori-medium / -high (GB F) | From scratch; 24 h LibriVox | public domain | Yes | [medium](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_GB/cori/medium/MODEL_CARD), [high](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_GB/cori/high/MODEL_CARD) |
| en_US-ryan-high (reference) | From scratch; RyanSpeech | CC BY-NC-SA 4.0 | **No**, noncommercial only | [card](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ryan/high/MODEL_CARD) |
| en_US-lessac-medium (reference, what the builder renders with now) | From scratch; Blizzard 2013 lessac | [research-only licence](https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html) | **No** | [card](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/lessac/medium/MODEL_CARD) |

**Excluded without testing:**

| Voices | Reason (from MODEL_CARD) |
|---|---|
| alan-medium, alba, aru, jenny_dioco, northern_english_male, semaine, vctk (en_GB); amy-medium, arctic, hfc_female, hfc_male, joe, kusal, l2arctic, libritts_r, mike, reza_ibrahim, sam, ryan-medium (en_US) | "Finetuned from U.S. English lessac voice". They inherit lessac's research-only data, even where their own data is CC0 (joe, mike) or CC BY (alba, vctk). **ryan-medium is also lessac-based**, unlike ryan-high. |
| alan-low, southern_english_female-low (en_GB); amy-low, danny-low, kathleen-low (en_US) | "Finetuned from U.S. English Ryan voice (low quality)", which inherits RyanSpeech's NC-SA. These are also low quality at 16 kHz. |
| ryan-low | RyanSpeech, CC BY-NC-SA. Low quality. |
| bryce-medium | PD own-voice data, but "finetuned … from an unreleased voice", whose training data can't be checked. |

The Piper runtime (VanaVoice's piper-tts 1.7.0, `License: GPL-3.0-or-later`, from OHF-Voice/piper1-gpl) and its espeak-ng
phonemizer are GPL. That licence covers the program, not the audio it produces. The open question about our
`piper_worker.py` importing the `piper` module is tracked in `HANDOFF.md` ("Open decisions") and `NOTICE` item 1. Whichever
voice is chosen, that question stays the same. `NOTICE` item 2 now credits John.

## Measurements

**Method.** `pipeline/voice_compare.py` renders through `tts.py`'s own code: the same `speech_segments`,
`LENGTH_SCALE 1.15` and pauses, and the same `loudnorm I=-19:TP=-1.5` 40 kbps MP3 encode. It sends each MP3 to Groq's free
`whisper-large-v3`, and measures loudness and true peak with `ffmpeg ebur128` and clipping as full-scale samples in the MP3.
Only one Piper process of ours ran at a time, under `nice -n 10`. Results, MP3s and transcripts are in
`~/Downloads/subject-mastery-build/voice-compare-2026-10-02/`.

- **WER raw** is `tts.py compare`'s formula. It counts Whisper's spelling choices as errors: "19th" against "nineteenth", "$20"
  against "twenty dollars", "St." against "Saint", "N A D H" against "NADH". Whisper also always drops "percent" after a number.
- **WER normalised** evens those spellings out and sets aside whole sentences Whisper skipped. Full-file Whisper dropped a
  21-word sentence from Norman's theology render; transcribing that 60 s slice alone showed the audio was fine. The same
  happened once for Cori, with 30 words in biology. Normalised WER is the fairer voice comparison. It is computed the same
  way for every voice: `voice_compare.py --report`.
- **x realtime** is noisy. The builder's own Piper, its LLM runs and a game were running at the same time. All medium models
  are the same size (63.5 MB, 63,531,379 bytes each) and run at the same speed: 11 to 21x realtime in most runs. The low
  readings were cori-medium at 3.6 to 11.7x and one Norman run at 4.2x; they happened while other heavy work was running (the
  builder's `tts.py` was confirmed running during cori-medium's round-1 renders). In the short probe, run back to back, every
  medium voice scored 12.7 to 17.1x. All high models run at 2.2 to 3.6x.

**Round 1: the two lessons of the earlier A/B** (`economics/m01/l01-scarcity-and-the-economic-way-of-thinking`, then
`biblical-studies/m01/l02-general-and-special-revelation`). These are the current texts, so the numbers differ from the
morning A/B, which used older text and a faster pace.

| Voice | Licence | WER raw (econ · theo) | WER norm. (econ · theo) | Mean norm. | Words/min | x realtime | LUFS | Max true peak dBFS | Clipped MP3 samples |
|---|---|---|---|---|---|---|---|---|---|
| en_US-lessac-medium (ref) | research-only | 0.87 · 2.71 | 0.29 · 1.31 | **0.80** | 159 | 10.8–14.4 | -19.7 · -19.8 | -1.5 | 0 |
| en_US-ryan-high (ref) | NC | 2.32 · 2.31 | 0.97 · 0.71 | 0.84 | 160 | 2.9–3.0 | -19.3 · -19.4 | -1.9 | 0 |
| en_US-ljspeech-medium | PD | 1.65 · 3.01 | 0.58 · 1.41 | 0.99 | 137 | 19.8–20.5 | -19.5 · -19.3 | **+0.1** | 0 |
| en_US-ljspeech-high | PD | 1.55 · 3.11 | 0.48 · 1.61 | 1.04 | 139 | 2.6–3.3 | -19.4 · -19.3 | **+0.4** | **1** |
| en_US-libritts-high | CC BY | 1.45 · 2.71 | 0.87 · 1.31 | 1.09 | 157 | 2.4–3.6 | -19.8 · -19.7 | -1.0 | 0 |
| en_GB-cori-high | PD | 1.16 · 2.81 | 0.68 · 1.51 | 1.09 | 148 | 2.2–2.3 | -19.3 · -19.4 | -1.9 | 0 |
| en_GB-cori-medium | PD | 1.65 · 2.81 | 0.97 · 1.41 | 1.19 | 147 | 8.7–11.7 | -19.3 · -19.2 | -2.0 | 0 |
| en_US-kristin-medium | PD | 1.65 · 3.51 | 0.77 · 2.02 | 1.40 | 141 | 19.9–21.1 | -19.4 · -19.6 | -1.0 | 0 |
| **en_US-john-medium** | PD | 1.84 · 2.91 | 1.45 · 1.41 | 1.43 | 134 | 19.8–20.2 | -19.5 · -19.4 | -1.5 | 0 |
| en_US-norman-medium | PD | 1.45 · 7.33 | 0.77 · 2.50 | 1.64 | 154 | 19.8–21.4 | -19.5 · -19.5 | -1.3 | 0 |

**Round 2: the medium finalists plus ryan-high on two more subjects.** These were `biology/m03/l02-glycolysis-and-citric-acid-cycle`
(technical terms) and `world-history/m02/l01-mesopotamia` (names). The ranking above was too close to call on two lessons.

| Voice | WER norm. (bio · hist) | **Mean norm. WER, all 4 lessons** | Words/min, all 4 | Max true peak, all 4 | Clipped MP3 samples, all 4 | Recurring miss (Whisper heard) |
|---|---|---|---|---|---|---|
| en_US-ryan-high (ref, NC) | 1.26 · 1.54 | **1.12** | 154 | -1.9 | 0 | none |
| en_US-ljspeech-medium | 2.52 · 1.89 | 1.60 | 134 | **+0.7** | **3** | theology → "philology" (3/4 in lesson) |
| en_GB-cori-medium | 2.84 · 2.01 | 1.81 | 142 | -2.0 | 0 | none systematic |
| **en_US-john-medium** | 1.60 · 2.84 | **1.82** | 129 | -1.2 | 0 | cuneiform → "coniform" (2/2) |
| en_US-kristin-medium | 2.40 · 2.36 | 1.89 | 137 | -0.8 | 0 | law → "lore" (4/7) |
| en_US-norman-medium | 2.52 · 2.84 | 2.16 | 147 | -1.0 | 0 | many one-off misses |

**Probe of subject words** (`voice-compare-2026-10-02/probe/probe-domain-words.md`, 131 words: theology ×6, law ×5,
cuneiform ×2, carbon ×3 and more). Normalised misses:

| Voice | Misses |
|---|---|
| en_GB-cori-medium | none |
| en_US-ljspeech-medium | "theology" heard as "philology" (1 of 6); "the" as "this" |
| en_US-kristin-medium | "law" heard as "lore" (2 of 5) |
| en_US-john-medium | "cuneiform" heard as "coniform" (2 of 2); "and" as "in" |
| en_US-norman-medium | "Hammurabi" heard as "Henry Warby" |
| en_US-ryan-high | "the study of God" heard as "this a event" |

Errors every voice shares come from espeak-ng phonemes or Whisper's vocabulary, so they don't help choose a voice:

- KJV archaic words: "sheweth", "handywork", "shew".
- "noetic", "ceteris paribus", "Ur-Nammu", "Eshnunna" and "stele".
- Fixing these needs a pronunciation lexicon in `tts.py normalise()`, not a different voice.

**Raw Piper WAVs** from every voice contain some full-scale samples (9 to 74 per lesson), meaning Piper's float output went
past 1.0 before int16 conversion. loudnorm then lowers the level, so the MP3s are clean except ljspeech's.

## Listen (side by side, same text)

`~/Downloads/subject-mastery-build/voice-compare-2026-10-02/<voice>/<lesson>.mp3`. Start with
`theology-l02-general-and-special-revelation.mp3` for `en_US-john-medium`, `en_GB-cori-medium`, `en_US-kristin-medium`,
`en_US-ljspeech-medium` and `en_US-ryan-high`.

## Pathways and open items

1. **Human listening test** (Daniel) of John against Cori. If John sounds worse, switch to `en_GB-cori-medium`. It is just as
   licence-clean, is installed in VanaVoice already, and needs no `SM_VOICES_DIR`.
2. **Per-voice pace.** `LENGTH_SCALE` is global (1.15, tuned for lessac). John would be about 150 wpm near 1.0. Changing it
   changes every audio hash, so do it only when the builder is not rendering. It could be a `{voice: length_scale}` map.
3. **Pronunciation lexicon** for words every voice gets wrong, plus John's "cuneiform": add respellings in `normalise()`.
4. **True peak.** loudnorm's single pass lets some voices exceed -1.5 dBTP (ljspeech up to +0.7). A two-pass loudnorm or an
   `alimiter` after it would fix that for any voice.
5. **Disk.** The candidate models in `~/Downloads/subject-mastery-build/voices/` take 591 MB. All but `en_US-john-medium.*`
   can be deleted once the choice is final; they can be downloaded again and their SHA-256 values are listed above.
6. **Re-run the comparison** for a new candidate. About 14,000 audio-seconds went through Groq's free Whisper in about
   1.5 hours on 2026-10-02 with no HTTP 429; `voice_compare.py` waits and retries if one comes:

   ```sh
   B=~/Downloads/subject-mastery-build; O=$B/voice-compare-2026-10-02
   SM_TMP_DIR=$B/tmp-voice nice -n 10 python3 -B pipeline/voice_compare.py --out $O --voices <voice> $O/lessons/*.md
   python3 -B pipeline/voice_compare.py --out $O --report $O/lessons/*.md
   ```
