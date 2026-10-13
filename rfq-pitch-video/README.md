# RFQ pitch video: Claude Code

A 40-second video, built entirely in code, pitching IT and management on what Claude Code can do for supplier RFQ replies. It reads replies from Outlook with read-only access, fills the Excel template, flags notes and errors, and gets the files ready for CM. A briefing report sends anything unusual to a person for a further check.

It is also the case for **enabling Claude Code, skills, and an Outlook connector** on the company account. Scene 2 shows the connector and the shared skill doing the work.

- `out/rfq-pitch.mp4`: 1920×1080, 30 fps, 1,200 frames (40 s), H.264 + AAC 320k, −16 LUFS
- `out/rfq-pitch.srt`: captions (also burned in; toggle `SHOW_CAPTIONS` in `src/config.ts`)
- `out/qc/`: QC frames and a contact sheet

All supplier names, part codes, prices, refs and the folio (`CM-00XXXX`) are fictional. The Outlook, Excel and Claude Code screens are styled recreations drawn in code. No logo files or screenshots are used. The music pad is synthesised in `scripts/make_audio.py`.

## Voice-over

**ElevenLabs "Bella – Professional, Bright, Warm"** (the most-used female voice on ElevenLabs over the past year), using the `eleven_v4` model. The script was generated as one continuous take, so the delivery flows naturally. It was picked from three takes and saved at `assets/vo/voiceover.mp3`.

`scripts/make_audio.py` uses that file if it exists. Otherwise it falls back to the ElevenLabs API (`ELEVENLABS_API_KEY`), then OpenAI TTS, then Piper, then macOS `say`. To re-voice the video, replace `assets/vo/voiceover.mp3` and run `npm run build`. The script lives in `SEGMENTS` in that file.

## Build

```bash
npm install
pip install numpy scipy        # plus piper-tts only if you want the offline fallback
npm run voice      # take -> clause timing (pause alignment) -> src/timing.json, public/audio/mix.wav, out/rfq-pitch.srt
npm run render     # Remotion render -> mux mastered mix -> duration/audio/loudness checks
npm run studio     # live preview
```

## How sync works

The take is trimmed and measured with ffprobe. Every clause boundary is then aligned to a real pause by dynamic programming: clause speaking time has to match its share of the text, and sentence ends have to land on longer pauses than commas. Every scene, beat, caption and checklist tick reads `src/timing.json`. The video length follows the speech (speech plus about a 1.5 s tail, minimum 30 s).

## Scene timing (current render)

| Scene | Start (s) | End (s) | Frames | VO |
|---|---|---|---|---|
| 1 Problem: Outlook inbox floods to 200, attachments pile up, clock spins | 0.00 | 10.87 | 0–326 | S1 0.40–10.49 |
| 2 One prompt: Claude Code terminal, Outlook connector (read-only), shared skill | 10.87 | 16.79 | 326–504 | S2 10.97–12.42, S3 clause 1 13.00–16.52 |
| 3 The work: Excel template fills, flags notes and errors, pre-save checks, ready for CM | 16.79 | 23.86 | 504–716 | S3 clauses 2–4, to 23.38 |
| 4 Output: folder of 196 ready → CM, briefing report, human "further check" | 23.86 | 31.50 | 716–945 | S4 23.96–31.03 |
| 5 Close: "Hours of data entry → minutes of review.", then the Claude Code ad finale | 31.50 | 40.00 | 945–1200 | S5 31.60–38.24 |

## Config

- `src/config.ts`: `ACCENT` (Claude coral), the Outlook/Excel colours and the caption toggles
- `src/data.ts`: all fictional on-screen data (emails, template rows, flags, checks, report rows)
- `scripts/make_audio.py`: the script text, the take location and the pad
