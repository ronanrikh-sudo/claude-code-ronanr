---
name: kinetic-motion-video
description: Make ultra-premium, kinetic motion-design videos (explainers, pitches, product launches, data stories, brand films, event promos, social ads) entirely from code with Remotion, synced frame-accurately to a natural AI voice-over. The motion language stays constant (spring physics, voice-synced beats, camera pushes, match cuts, layered depth, recreated UIs, kinetic type) while the look (palette, fonts, surfaces, texture, light or dark, energy, music) is art-directed fresh for each project from its audience, brand and tone. Use this skill whenever the user wants a video, animation, motion graphics, kinetic typography, an animated explainer or pitch, a promo, teaser or ad, or wants to turn a script, idea, product or dataset into an MP4. Use it even if they don't mention Remotion or code, and also when editing, restyling or re-voicing such a video.
---

# Kinetic motion video

This skill makes 15–90 s videos that feel like top-tier product ads. Two layers, deliberately separated:

- **Constant: the motion language.** Everything springs; every beat lands on the voice; the camera always travels; scenes hand off through match cuts and zoom-throughs; real UIs and numbers animate instead of bullet points; something is always alive; the finish is restrained and premium. See `references/motion-language.md`.
- **Chosen per project: the look.** Palette, type, surfaces, texture, light or dark world, motion temperament (calm, balanced or punchy), music mood and a signature device, all art-directed from the project's audience, brand and tone. See `references/art-direction.md`.

Never carry the previous project's colours or fonts forward by default. A board report, a skincare launch and a dev-tool teaser should feel equally kinetic and look nothing alike.

The starter project in `assets/template/` is a **toolkit, not a template video**. It provides the voice-to-timing pipeline, render and QC scripts, theme-driven components and five example scenes. Everything visual reads from `src/theme.ts`, so you re-skin by art direction and assemble the scenes the story needs.

## Workflow

Each step feeds the next; skipping the voice-first order is the usual cause of off-beat videos.

### 1. Understand the project

Pin down:
- **Purpose**: what should the viewer think or do afterwards?
- **Audience**, and **where it plays**: meeting, big screen, muted social feed.
- **Length and aspect**: 16:9 by default; 9:16 or 1:1 for social.
- **Brand assets**: logo, colours, fonts, site, product screens.
- **Real versus fictional data.**

Infer what you can from the request and attachments; ask only about what genuinely blocks you. Default to fictional data and no unbackable claims.

### 2. Art direction

Follow `references/art-direction.md`:
1. Read the signals.
2. Pick or blend a direction from its library (Midnight Signal, Editorial Light, Swiss Bold, Electric, Warm Organic, Luxury Noir, Playful Pop, Corporate Clean), or derive one from the brand.
3. Write the look spec.
4. **Tell the user the look in 2–3 sentences**, then proceed.

The direction sets the theme tokens, the fonts, `THEME.motion` (temperament), the signature device, the finale world, the music mood and the voice casting.

### 3. Script and storyboard

- **Length**: natural narration is about **2.4 words per second** (30 s ≈ 70 words, 40 s ≈ 95). If the user's wording doesn't fit their length, keep their words, let the video run longer and say so. Never speed the voice past natural.
- **Structure**: choose a story structure from `references/scene-recipes.md` §1 (problem → turn → result, product reveal, data story, how-it-works, before/after, manifesto, event).
- **Segments and clauses**: write one **segment** per scene. Clauses, split at commas and full stops, are the beats visuals snap to, so put punctuation where you want visual changes.
- **Storyboard**: map each segment to an archetype (§2 there). Keep headline copy to about 8 words or fewer on screen at once.

### 4. Scaffold and theme

```bash
bash <this-skill>/scripts/new_project.sh ./my-video "My Video"
cd my-video && npm install && pip install numpy scipy   # + piper-tts for the offline voice fallback
```

- `src/theme.ts`: every look token, plus `BRAND`.
- `src/fonts.ts`: `@fontsource` imports for the chosen families; `npm i @fontsource/<family>` first.
- `script.json`: segments and clauses, `voice`, `music.mood` and `music.level_db`, `respell`, `ticks`.
- `src/content.ts`: on-screen copy.
- `src/Video.tsx`: the scene plan.

### 5. Voice-over (one continuous take)

Cast the voice to the direction (`references/audio-voice.md`). Generate the **whole script as one take**, with a blank line between segments, for natural flow.

Pick a provider in this order:
1. **The ElevenLabs connector**, if connected: `creative_list_voices` (sorted by usage, filtered to the casting) → `creative_generate_speech` (`eleven_v4`) → poll `creative_get_flow_run_status` → `curl` the `content_url`s (they expire after about 2 h) → pick the clearest take → `assets/vo/voiceover.mp3`. Each generation spends credits, so never re-run just to retry.
2. An `ELEVENLABS_API_KEY` or `OPENAI_API_KEY` in the environment.
3. Piper, offline.

Then `npm run voice`. It aligns every clause to the real pauses (dynamic programming), sizes the video to the speech, synthesises the mood's music pad, masters to −16 LUFS, and writes `src/timing.json` and the `.srt`. **Read the printed clause table**: each start should follow a pause. If one is wrong, fix the punctuation or pick another take. Don't hand-edit times.

Tell the user which voice you used.

### 6. Build the scenes

- Plan the scenes in `src/Video.tsx`. Each starts on a voice-over cue (`"S2"`, or `"S3.1"` for a clause) and runs to the next one.
- Inside a scene, use absolute frames (`useCurrentFrame() + sec(from)`) and time everything from `T`, `seg()` and `wordTime()`. Never hard-code seconds.
- **Never hard-code colours or fonts in scenes.** Use `THEME.*`, `accent()`, `alpha()`, `display()` and `FONTS.*`. Add a token to the theme if one is missing. The one exception: recreated third-party app UIs keep their own app colours inside their window.
- Adapt the example scenes, or build new ones from the recipes in `references/scene-recipes.md` (stat reveal, chart build, product hero, feature cascade, before/after split, quote, recreated list or table apps, matching beams, output and report). Apply every rule in `references/motion-language.md`.
- Use the **signature device** in at least two transitions and in the finale.

### 7. QC: look at frames, then render

1. Run `REMOTION_BROWSER=<chrome> node scripts/stills.mjs <seconds…>` at every beat: the middle of each clause, and just before and after each cut. **Look at every image** (a tiled contact sheet via ffmpeg `xstack` is fastest). Check against:
   - the motion QC checklist in `motion-language.md` §12;
   - the art-direction quality bar in `art-direction.md` §6: contrast, restraint, consistency, nothing cropped after camera pushes.

   Fix and re-check.
2. Run `npm run render`. It renders, muxes the mastered mix, and checks duration ±0.2 s, audio present, −16 ±1 LUFS and ≤ −1 dBTP, exiting non-zero on failure.
3. Pull frames from the final MP4 and make a contact sheet for the user.

### 8. Report back

Give the user:
- the file paths;
- the look you chose and why (one line);
- the voice used;
- the duration and loudness;
- a scene table (time range · on screen · voice-over line);
- things to review: pronunciation (you can't hear it), look-alike UIs of real products, any wording you changed, and credits spent.

## Gotchas

- **Headless Chrome**: set `REMOTION_BROWSER` to a local `chrome-headless-shell` if Remotion can't download one. In Claude Code cloud containers it's at `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`.
- **Run `npm run voice` before stills or a render**: `<Audio>` needs `public/audio/mix.wav`, and the shipped `timing.json` is only a placeholder.
- **Emoji don't render headless**: draw icons as SVG (`components/Icons.tsx`).
- **Fonts only via `@fontsource` or local `.woff2`** (`fonts.ts`); `Root.tsx` waits for every theme family before the first frame. No system or CDN fonts.
- **ffmpeg can't read and write the same file**: keep "source" and "processed" names distinct.
- **Too few pauses**: if the take has fewer pauses than clauses, `make_audio.py` stops. Add punctuation, or pick or regenerate a take.
- **Trademarks**: recreate third-party UIs in code (layout and colours, generic glyphs), never their logo files or screenshots unless the user supplies assets they have rights to. Flag look-alikes in the report.

## Files

- `scripts/new_project.sh`: scaffold a project from the toolkit.
- `assets/template/`: the toolkit.
  - `src/theme.ts`: the look.
  - `src/fonts.ts`: font loading.
  - `src/components/`: motion presets and temperaments, backdrop and grain, captions, panels, chips, counters, icons.
  - `src/scenes/`: example archetypes.
  - `scripts/make_audio.py`: voice → timing, music and mastering.
  - `scripts/render.mjs` and `scripts/stills.mjs`: render and QC.
- `references/art-direction.md`: **read in step 2.** How to read a project, the look spec, 8 direction recipes with full tokens and fonts, blending, brand fonts, the quality bar.
- `references/motion-language.md`: **read before building scenes.** The constant: springs and temperaments, sync rules, camera, transitions, depth, kinetic type, UI and data animation, pacing, aspect ratios, QC checklist.
- `references/scene-recipes.md`: story structures plus 15 archetypes with snippets.
- `references/audio-voice.md`: voice casting, the ElevenLabs connector flow, alignment, music moods, mastering, troubleshooting.
- `assets/examples/finish-reference-midnight-pitch.jpg`: frames from a finished 40 s pitch. It's a reference for **finish and energy only**: density, polish, sync, layering. **Not a palette or font to copy.**
