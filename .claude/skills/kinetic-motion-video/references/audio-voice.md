# Audio and voice

The voice-over is the clock for the whole film. This file covers writing the script for the ear, choosing and generating the voice, how the alignment works, and the music and mastering.

## Writing for the voice

- About **2.4 words per second** of natural narration, plus about 0.5 s per paragraph break. Budget: 30 s ≈ 70 words, 40 s ≈ 95 words.
- Use punctuation as beat markers. Every comma or full stop where you want a visual change becomes a clause, and clauses are what scenes and beats snap to. Use one clause per visual beat.
- One paragraph per segment (S1…Sn), one segment per scene. Put a blank line between segments in the take so the voice breathes there.
- Read it aloud in your head. Cut words that don't move the story; keep the user's own phrasing where they gave it.
- **Acronyms**: neural voices (ElevenLabs, OpenAI) usually letter-spell "RFQ", "CM" or "PDFs" correctly from plain text. Basic engines (Piper, `say`) need respellings, which go in `script.json → respell`, e.g. `{"RFQ": "R F Q", "PDFs": "P D F's"}`.

## Choosing the voice

Use this priority order, and tell the user which voice you used:

1. **ElevenLabs connector (MCP)**, when available in the session (tools named `mcp__ElevenLabs__creative_*`):
   1. `creative_list_voices` with `gender`, `languages: ["en"]` and `sort: "usage_character_count_1y"` lists the most-used voices first. Pick to the brief: a warm professional narrator for pitches, an accent if requested. A proven default is **"Bella – Professional, Bright, Warm"** (`hpp4J3VqNfWAUOO0d1Us`). For an Australian male, "Charlie" is a premade option, but check that it is listed.
   2. `creative_generate_speech` with `model_id: "eleven_v4"`, `voice_id`, and `prompt` set to the full script, paragraphs separated by blank lines. It returns several takes on one flow (keep the default count).
   3. Poll `creative_get_flow_run_status(flow_id, session_ids)` about every 3 s until all takes are complete. One take may hit a concurrency limit and lag; you don't have to wait for it.
   4. Download each `content_url` with `curl` (they're signed and expire in about 2 h). Save the URLs to a file and loop over them, because they're too long to paste inline safely.
   5. **Pick a take.** Prefer the one whose pauses fall where the punctuation is. As a rough check, run an offline recogniser (`pip install pocketsphinx`, which has a bundled model) on each take and compare word overlap with the script; the highest-scoring take is usually the cleanest. Copy it to `assets/vo/voiceover.mp3`.
   6. Generation spends the user's credits (about 500 per 40 s take per variation). Don't regenerate just to retry. Say how many credits were used.
2. **`ELEVENLABS_API_KEY`**: `make_audio.py` calls the API with `ELEVENLABS_VOICE_ID` or the `script.json` voice.
3. **`OPENAI_API_KEY`**: `gpt-4o-mini-tts` with a style instruction.
4. **Piper** (offline): voices come from `github.com/rhasspy/piper/releases/download/v0.0.2/voice-<name>.tar.gz` (HuggingFace is often blocked). `en-us-lessac-medium` (female) and `en-us-ryan-high` (male) are the most natural. The pipeline voices each segment separately and joins them with 0.5 s gaps, because Piper barely pauses between sentences.
5. macOS `say` as the last resort.

## How timing is derived (`make_audio.py`)

1. Trim leading and trailing silence, apply a light high-pass and low-mid cut, measure the duration with ffprobe.
2. Detect pause candidates with `silencedetect=noise=-35dB:d=0.05`.
3. **Dynamic-programming alignment** of the K clauses onto K−1 of the M pauses. The cost is the squared relative error between each clause's speaking time (excluding pauses) and its share of the text, plus a penalty when a sentence end sits on a pause shorter than this take's typical sentence pause, or a comma sits on a very long one. Greedy nearest-pause snapping fails as soon as a comma inside a clause makes its own pause, which happens all the time, so keep the DP.
4. Lay the take on the timeline after a 0.4 s lead. Video length = `ceil(lead + take + 1.5 s)`, minimum `MIN_TOTAL_S`.
5. Captions: each clause, split into chunks of 7 words or fewer, time-proportional within the clause. Written to `timing.json` and `out/<output>.srt`.
6. Ticks: one per clause of `script.json → ticks.segment`, at clause start + 0.2 s, used by both the visuals and the sound effect.

**Verify** by reading the printed clause table. Starts should follow pauses; no clause should be implausibly short (about 0.3 s per word is a sanity floor). For a deeper check, list pauses with `ffmpeg -i .build/audio/take.wav -af silencedetect=noise=-35dB:d=0.05 -f null -` and compare by eye.

## Music and mastering

- **Pad**: synthesised in numpy, with three detuned partials per chord tone, a low-passed noise bed, slow swell and a fade in and out. There is one chord per segment, moving from tension to lift to resolution, with the resolving chord on the last segment. No licensed music is needed.
- Level: the pad sits about **19 dB under the voice RMS**, and an envelope follower ducks it a further 44% while the voice speaks.
- **Ticks**: 90 ms sine blips (1320 + 1980 Hz, fast decay) about 14 dB under the voice, only on checklist ticks.
- **Master**: two-pass `loudnorm` to **−16 LUFS integrated, −1.5 dBTP**. `render.mjs` muxes the mastered WAV untouched (AAC 320k) and re-checks: −16 ±1 LUFS, true peak ≤ −1 dBTP.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `ffmpeg … exit status 234` | input and output are the same file; keep source and processed names distinct |
| "Take has N pauses but needs M" | run-on read: add commas or full stops, or pick or regenerate a take |
| A clause swallows the next one's first word | a comma pause outweighed a sentence pause; use another take, or (Piper) segment-wise synthesis already fixes it |
| Voice sounds rushed | the script is too long for the length; trim words or let the video run longer, rather than speeding up |
| Proxy 403 on HuggingFace | use the GitHub-hosted Piper voices |
