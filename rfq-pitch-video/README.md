# RFQ pitch video (30 s)

A 30-second explainer, built entirely in code, for an internal pitch: Claude turns a week of supplier RFQ replies into import-ready spreadsheets plus an exceptions report, and a person reviews the flagged items.

- `out/rfq-pitch-30s.mp4`: 1920×1080, 30 fps, 900 frames, H.264 + AAC 320k
- `out/rfq-pitch-30s.srt`: captions (also burned in; toggle `SHOW_CAPTIONS` in `src/config.ts`)
- `out/qc/`: QC frames at 0.5/3/6/10/14/18/22/26/29 s plus a contact sheet

All supplier names, part codes, prices, refs and the folio (`CM-00XXXX`) are fictional. Icons are generic and drawn in code. There are no logos. The pad underneath is synthesised in `scripts/make_audio.py`.

## Build

```bash
npm install
pip install piper-tts numpy scipy
npm run voice      # TTS -> measured segments -> src/timing.json, public/audio/mix.wav, out/*.srt
npm run render     # Remotion render -> mux mastered mix -> ffprobe/loudness checks
npm run studio     # live preview
```

`REMOTION_BROWSER=/path/to/chrome-headless-shell` points the renderer at a local Chromium.

### Voice provider (first available wins)

1. **ElevenLabs** if `ELEVENLABS_API_KEY` is set. The default voice is the premade "Charlie" (Australian male). Override it with `ELEVENLABS_VOICE_ID`.
2. **OpenAI TTS** if `OPENAI_API_KEY` is set (`gpt-4o-mini-tts`, voice `ash`, with calm, credible delivery instructions).
3. **Piper** (local). The default voice is `en-us-ryan-high`, downloaded from the Piper GitHub release. Override it with `PIPER_VOICE` / `PIPER_MODEL`.
4. macOS `say` as a last resort.

The current render uses **Piper `en-us-ryan-high`**, because no API keys were available when it was built. To swap to ElevenLabs, set the key and rerun `npm run build`. The visuals re-time themselves automatically.

## How sync works

`make_audio.py` synthesises each VO segment separately, trims it, and measures it with ffprobe. If the speech would end after 29 s, it raises the rate slightly and regenerates. It finds clause boundaries from detected pauses, snapped from a character-proportional estimate. It then writes `src/timing.json`, and every scene, beat, caption and checklist tick reads its timing from that file. The mix is mastered with two-pass `loudnorm` to −16 LUFS, with true peak below −1 dBTP.

## Scene timing (current render)

| Scene | Start (s) | End (s) | Frames | VO |
|---|---|---|---|---|
| 1 Problem: inbox floods to 200 replies, attachments pile up, clock spins | 0.00 | 8.78 | 0–263 | S1 0.35–8.28 |
| 2 One prompt: terminal types the request, read-only badge | 8.78 | 12.66 | 263–380 | S2 8.88–9.93, S3 clause 1 10.38–12.69 |
| 3 The work: match (ref codes) → fill (green cells) → check (4 ticks) | 12.66 | 19.23 | 380–577 | S3 clauses 2–4 12.76–18.84 |
| 4 Output: folder "196 ready", briefing report, human review | 19.23 | 23.63 | 577–709 | S4 19.34–23.18 |
| 5 Close: kinetic line, then end card on "pilot" | 23.63 | 30.00 | 709–900 | S5 23.73–28.12 |

Speech ends at 28.12 s, which leaves a 1.9 s silent tail on the end card.

## Config

- `src/config.ts`: `ACCENT` (the single brand colour), the caption toggles and the palette
- `src/data.ts`: all on-screen fictional data
- `scripts/make_audio.py`: the script text, pronunciation respellings (`RFQ` → "R F Q", `PDFs` → "P D F's"), gaps and pad
