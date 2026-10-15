---
name: kinetic-motion-video
description: Build premium kinetic motion-design videos (explainers, pitches, product teasers, internal demos, video ads) entirely from code with Remotion, synced frame-accurately to a natural AI voice-over, in one signature house style. The style is a dark navy world with a single accent colour, glass panels, spring physics, a parallax "flood" hook, recreated app UIs that fill themselves in, checklists that tick on the voice, kinetic typography, and an ivory brand-ad finale. Use this skill whenever the user asks for an explainer or pitch video, animated walkthrough, motion graphics, kinetic typography, a promo or ad video, "a video like the last one", or wants to turn a script or idea into an MP4. Use it even if they don't mention Remotion or code, and also when editing or re-voicing a video built this way.
---

# Kinetic motion video

This skill produces 20–60 s, 1920×1080 MP4s that look like a premium product ad. The voice-over is written and recorded first, and its measured timing then drives every visual beat.

The style was proven on a real pitch video. The template in `assets/template/` is a clean, project-agnostic version of it with five ready scenes. Start from the template, keep the style rules, and change the content.

**See the target look before building.** Open `assets/style-reference-pitch.jpg` (frames from the original 40 s pitch) and `assets/style-reference-template.jpg` (the template's demo render). Match that level of finish.

## The workflow

Each step depends on the previous one, so follow them in order. Skipping the voice-first order is the usual way these videos end up feeling off-beat.

### 1. Brief → script → storyboard

- **Length.** Ask for the target length or infer it. A natural voice speaks about **2.4 words per second**, so 30 s is about 70 words and 40 s is about 95. If the user's wording won't fit their length, keep their words, let the video run longer, and say so. Don't speed the voice up past natural.
- **Structure.** Write the script as **segments** (S1, S2…), one per visual scene. Split each segment into **clauses** at commas and full stops. Clauses are the beats the visuals snap to, so put commas where you want visual changes.
- **The proven arc.** Problem (the flood) → "Now, one prompt" (the turn) → the work, in 2–4 clause beats → the output → the payoff line → the brand sign-off. Adapt the arc to the topic.
- **Storyboard.** Map each segment to a scene archetype from `references/scene-recipes.md`. Never put more than about 8 words of headline copy on screen at once; UI chrome and cards don't count.
- **Data.** Use fictional names and data unless the user supplies real ones. Leave out claims the user can't back up, such as "100x" or "fully automated".

### 2. Scaffold

```bash
bash <this-skill>/scripts/new_project.sh ./my-video   # copies assets/template
cd my-video && npm install && pip install numpy scipy  # + piper-tts for the offline fallback
```

Edit `script.json` (segments, clauses, the voice, acronym respellings, and which segment's clauses tick), `src/content.ts` (all on-screen copy), and `src/config.ts` (`ACCENT`, `BRAND`).

### 3. Voice-over (one continuous take)

Generate the **whole script as one take**, with a blank line between segments. Stitching segments together kills the natural flow. Then pick a provider in this order:

1. **ElevenLabs connector (MCP)**, when it's connected:
   1. Call `creative_list_voices` (gender and language filters, `sort: usage_character_count_1y`) and pick from the top results. "Bella – Professional, Bright, Warm" (`hpp4J3VqNfWAUOO0d1Us`) is a proven default.
   2. Call `creative_generate_speech` with `model_id: eleven_v4`. It produces several takes.
   3. Poll `creative_get_flow_run_status`, then `curl` each `content_url`. The URLs expire after about 2 hours, so download them promptly.
   4. Pick the take that is clearest and best paced (see `references/audio-voice.md`), and save it as `assets/vo/voiceover.mp3`.

   Each call spends credits. Never re-run a generation just to retry.
2. **`ELEVENLABS_API_KEY`** or **`OPENAI_API_KEY`** in the environment: `make_audio.py` calls the API itself.
3. **Piper** (local): the script voices each segment separately and joins them with gaps. It downloads voices from GitHub because HuggingFace is often blocked.

Always tell the user which voice was used.

Then run `npm run voice`. It aligns every clause to the real pauses in the take, sizes the video to the speech, synthesises a ducked music pad, masters the mix to −16 LUFS, and writes `src/timing.json` and the `.srt` captions. **Read the clause table it prints.** Every start time should sit just after a pause. If one looks wrong (a clause crammed into under a second, or a sentence swallowing the next one's first word), fix the punctuation in the script or pick another take. Don't hand-edit the times.

### 4. Build the scenes

- `src/Video.tsx` holds the **scene plan**. Each scene starts on a voice-over cue (`"S3"` = segment start, `"S3.1"` = clause 1), so every cut lands on a beat. Scenes run until the next cue.
- Inside a scene, convert to absolute frames (`const frame = useCurrentFrame() + sec(from)`) and time everything from `T` / `seg()` / `wordTime()`. Never use hard-coded seconds; the next take will differ.
- Reuse or adapt the template scenes (`Hook`, `Terminal`, `Checklist`, `KineticLine`, `Finale`). For anything else (recreated app UIs, matching beams, a folder with a report, a human-review step), follow the recipes and snippets in `references/scene-recipes.md`.
- Keep the style rules below, and read `references/style-guide.md` before building a new scene or surface.

### 5. QC: look at frames, then render

1. Render stills at **every beat**: the middle of each clause, plus just before and after each cut:
   ```bash
   REMOTION_BROWSER=<chrome path> node scripts/stills.mjs 2.0 4.8 7.2 ...
   ```
   **Open and look at every image.** Check for clipped text, overlaps, unreadable contrast, words that appear before they're spoken, payoff lines that leave before they can be read, and anything off-frame after the camera push. Fix, re-render the stills, repeat. Tiling them into one contact sheet with ffmpeg `xstack` makes review fast.
2. Run `npm run render`. It renders, muxes in the mastered mix, and checks that the duration is ±0.2 s, the audio is present, the loudness is −16 ±1 LUFS and the peaks are ≤ −1 dBTP. It exits non-zero on failure.
3. Extract frames from the **final MP4** with `ffmpeg -ss <t> -frames:v 1`, look at them, and build a contact sheet for the user.

### 6. Report back

Give the user:
- the file paths
- the voice used
- the final duration and loudness
- a scene table (time range, what's on screen, voice-over line)
- anything they should check

Always flag pronunciation, because you can't hear the audio. Also flag look-alike UIs of real products and any wording you changed.

## Style rules (the short version)

- **One accent colour carries the film.** Everything else is navy, near-black, white and muted greys. The default accent is coral `#D97757`, swappable in `config.ts`. Status colours (green, amber, red) are only for meaning. Recreated app UIs keep their own app colours, because that is what makes them read as "our Outlook" or "our Excel".
- **Two worlds.** A dark world (navy radial gradient, a slow-drifting accent glow, film grain, a vignette) holds the story. A light **ivory brand world** (`#F0EEE6`, ink `#141413`) arrives only for the finale, as a circular wipe out of the brand mark.
- **Type.** Inter for everything, JetBrains Mono for code, IDs and terminals. Headlines are 104–172 px, weight 700–800, with tight tracking (−4 to −7 px). Big numbers use tabular figures. Captions are 36 px on a dark pill.
- **Surfaces.** Glass panels use a top-lit dark gradient, a 1 px hairline border and a deep soft shadow, with a 24 px radius. Light app windows sit on the dark world with a heavy drop shadow and a slight 3D tilt.
- **Motion.** Everything is a spring: `SOFT` for big moves, `SNAPPY` for UI, `BOUNCY` for ticks and drops. Text rises in with blur-to-sharp. Use one slow camera push per scene (scale 1 → about 1.05), then a fast push or zoom-through into the cut. There are no gimmick transitions; cuts land on voice-over beats.
- **Life.** Something is always moving: typing cursors, counters ticking, pulses travelling along links, orbiting tiles, spinner sparks.
- **Sound.** A synthesised pad sits about 19 dB under the voice and is ducked further while the voice speaks. Soft UI ticks sound only on checklist ticks. There is no stock music.

Full tokens, recipes and do/don't lists are in `references/style-guide.md`.

## Gotchas this pipeline already hit

- **Headless Chrome.** Set `REMOTION_BROWSER` to a local `chrome-headless-shell` if Remotion can't download one. In Claude Code cloud containers it is at `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`.
- **Run `npm run voice` before stills or render.** `<Audio>` needs `public/audio/mix.wav`, and the placeholder `timing.json` is only a stub.
- **Emoji don't render in headless Chrome.** Draw status dots and icons as SVG instead (see `components/Icons.tsx`).
- **Fonts come from `@fontsource`,** and `Root.tsx` delays the first frame until they load. Don't depend on system fonts or Google Fonts at render time.
- **ffmpeg can't write to a file it's reading.** Keep "source" and "processed" audio filenames distinct.
- **Alignment.** If the take has fewer pauses than clauses, `make_audio.py` stops and says so. Add punctuation or regenerate the take.
- **Copyright and trademarks.** Recreate app UIs in code using their colours and layout. Don't use real logo files or screenshots unless the user supplies brand assets and has rights to them. Say in the report that they're look-alikes.

## Files

- `scripts/new_project.sh`: scaffolds a new project from the template.
- `assets/style-reference-*.jpg`: contact sheets of finished renders in this style.
- `assets/template/`: the runnable Remotion project. `script.json` holds the script, `src/content.ts` the on-screen copy, `src/config.ts` the brand settings, `src/Video.tsx` the scene plan, `scripts/make_audio.py` the voice-to-timing, music and mastering pipeline, and `scripts/render.mjs` and `scripts/stills.mjs` the render and QC tools.
- `references/style-guide.md`: design tokens, motion presets, camera and transition grammar, the two worlds, UI recreation rules, and do's and don'ts. Read it before designing new scenes.
- `references/scene-recipes.md`: the scene archetypes with code: flood hook, inbox recreation, spreadsheet fill-and-flag, terminal prompt, matching beams, checklist, folder → system → report with human review, kinetic line, brand finale.
- `references/audio-voice.md`: script-writing rules, voice selection, the ElevenLabs connector flow, how alignment works, the pad and mastering targets, and troubleshooting.
