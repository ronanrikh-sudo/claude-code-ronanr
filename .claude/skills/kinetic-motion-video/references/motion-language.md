# Motion language: the constant

This is what makes these videos feel ultra-premium and kinetic, whatever they look like. Colours, fonts and surfaces change per project (`art-direction.md`). **These rules don't.**

## Contents
1. Core principles
2. Springs and temperament
3. Sync to the voice
4. Camera
5. Transitions and match cuts
6. Depth and layering
7. Always alive
8. Kinetic typography
9. UI and data animation
10. Density, holds and pacing
11. Aspect ratios and safe areas
12. Motion QC checklist

---

## 1. Core principles

1. **The voice is the clock.** Every cut, beat, word and tick is placed from measured voice-over timing, never hand-typed seconds.
2. **Nothing moves linearly.** Position, scale and opacity use springs or eased curves. Linear motion is only for counters' underlying ramps and continuous drifts.
3. **One idea per beat, one hero per frame.** Each clause gets one visual change, and each frame has one obvious focal point (usually lit in the accent colour).
4. **Show the thing, don't describe it.** Recreate the real UI, the real document, the real number moving, rather than icons and bullet points.
5. **Continuity over cuts.** Objects carry across scene boundaries (match cuts) so the film feels like one continuous camera move.
6. **Depth.** Layers move at different speeds; the camera is always slightly travelling.
7. **Restraint.** Few elements, big type, generous space. Premium is mostly what you leave out.

## 2. Springs and temperament

From `components/motion.ts`:

| Preset | Role |
|---|---|
| `SOFT` | big layout moves, panels sliding in, camera settles, morphs |
| `SNAPPY` | UI elements, rows, chips, words, icons |
| `BOUNCY` | landings: ticks, drops, stickers, confirmations |

`THEME.motion` picks a temperament that retunes all three, plus `CAMERA` (push strength):
- **calm**: long settles, no overshoot, pushes about 0.6×. Luxury, editorial, wellness.
- **balanced**: the default premium explainer.
- **punchy**: fast attacks, visible overshoot, pushes about 1.5×, shorter holds. Launches, social, sport.

Standard entrances:
- **Enter**: `opacity = min(1, p*1.4)`, translate 20–70 px toward the rest position, scale 0.88 → 1.
- **Word in**: translateY 46 → 0, blur 8 → 0 px, opacity × 1.6, one spring per word on its spoken time.
- **Pop**: scale 0.8 → 1 with `BOUNCY` for ticks, badges and pills.
- **Drop**: translateY −500 → 0 with `BOUNCY`, plus a small settle rotation, for things "landing in a pile".
- **Stagger**: 3–4 frames for list rows; 7 frames per table row; 2 frames per cell inside a row; never more than about 10 frames, or it drags.
- Use `rand(seed)` for organic jitter (positions, rotations). Never `Math.random()`.

## 3. Sync to the voice

- Scenes start **0.1 s before** their voice-over cue (`LEAD`), so the picture changes just ahead of the word.
- Inside a scene, put beats on clause starts (`seg("S3").clauses[i].start`) and words on `wordTime(clause, "word")`.
- **Name it, show it.** When the voice names a thing ("PDFs", "a report", "two hundred"), that thing appears on that word.
- Counters land on their spoken number. Checklist ticks land on their clause. The payoff word lights in the accent colour as it is spoken.
- **Read-time rule.** The payoff line stays complete and still for at least 0.8–1 s before anything replaces it. Dense UI stays for at least 1.5 s. If the voice runs straight on, start the next scene on a later word.
- Captions hide wherever kinetic type already says the line.

## 4. Camera

- **Ambient push**: every scene drifts in, `push(frame, from, to, 0.04–0.09)` (scale 1 → 1.0x), on a full-frame wrapper. The camera never sits dead still.
- **Push-out-of-scene**: in the last 8–10 frames, a fast extra push (+0.12–0.5 × `CAMERA`) with a fade, blur or brightness dip, for a "zoom-through" into the next scene.
- **Recede**: when a new layer takes focus (for example a clock over an inbox), the old layer scales to about 0.94, darkens about 40% and desaturates.
- **3D tilt**: hero windows enter from `rotateX 10–14°` / `rotateY −18°` to a resting slight tilt under `perspective 2000–2600 px`.
- Check the end of every push in stills: nothing important may crop.

## 5. Transitions and match cuts

Prefer, in order:
1. **Match cut / morph**: an element of scene A becomes scene B. A tile grows into the full window; a document shrinks into a file that drops into a folder; a mark lands, and the next world wipes out of it. Interpolate centre and scale across about 12 frames with `SOFT`.
2. **Zoom-through**: push hard into the focal point of A as it fades, then B springs in.
3. **Signature-device wipe**: the project's motif does the transition (circle wipe out of the mark, colour-block wipe, light-trail sweep, hairline draw).
4. **Hard cut on the beat**: clean and confident, especially into the "turn" moment ("Now, one prompt.").

Avoid stock transitions: spins, page curls, glitch, cross-dissolves longer than about 8 frames, slide-pushes of the whole frame.

## 6. Depth and layering

- 2–3 parallax layers (depth 0.5 / 0.72 / 1.0). Back layers are blurred 1–2.5 px and dimmed; they drift at speed × depth.
- Foreground heroes get the strongest shadow (light worlds: soft and low-opacity; dark worlds: deep).
- HUD and stat panels sit above busy layers on a near-opaque fill, so text never fights the background.
- Texture (grain, glow, vignette) sits above everything at low opacity, so the frame feels filmed, not drawn. Flat directions turn it off.

## 7. Always alive

Every frame has at least one thing in motion:
- blinking or typing cursors;
- counters ticking;
- spinners (a rotating mark) on "working" states;
- pulses travelling along connector lines (`(frame/22 + i/6) % 1`);
- slow glow drift;
- orbiting tiles in finales;
- the ambient camera push.

When a scene is holding for reading, the life is ambient (drift, pulse), never a new focal event.

## 8. Kinetic typography

- **Display** type through `display(size)` so the direction's family, weight, tracking and case apply.
- Sizes at 1080p: payoff lines 110–140 px; wordmarks 150–200 px; numbers 100–200 px; labels 19–22 px in tracked caps.
- Animate **by word** on spoken times; never typewriter a headline (typewriting is for terminals and cells).
- **Two-line payoff**: line 1 in the text colour; a pivot word draws a connector (arrow, rule, slash); line 2 in the accent. Line 1 dims to about 45% as line 2 lands.
- At most about 8 words of headline on screen at once.
- **Emphasis tools**: colour (accent), weight, scale-up of one word, an underline or hairline that draws, a highlighter bar that wipes behind the word.

## 9. UI and data animation

- **Typing**: characters interpolated across the window the voice allows; block cursor; a finished line dims to grey once submitted.
- **Lists that fill**: new items insert at the top and push the others down (offset = sum of newer items' progress); rows must be **opaque** while overlapping.
- **Tables and forms**: cells type in row by row; a selection box and the formula or address bar follow the active cell; completed cells flash once.
- **Flags and notes**: status chips pop with `BOUNCY`; comment or note boxes appear beside the cell with a short leader line, authored by the actor ("Claude: …", "Ops: …").
- **Checks**: circle → filled accent with a drawn check (stroke-dash), plus an accent outline on the thing being validated; a soft tick sound on the same frame.
- **Numbers**: drive the displayed value from the animation itself (arrivals, `easeOut(ramp)`); tabular figures; a bump or glow on milestones.
- **Charts**: bars grow with `SOFT` from the baseline, 3-frame stagger; lines draw via stroke-dash; the key value gets a callout in the accent.
- **Connections**: dashed lines draw, then pulses travel along them; the target glows when "received".

## 10. Density, holds and pacing

- About 2.4 voice words per second; one visual change per clause (about every 1.5–3 s); no static stretch longer than about 3 s.
- Open with motion in the first 10 frames; land the hook stat within the first line.
- The "turn" (problem → solution) gets the cleanest cut and the biggest change in the world: different backdrop, saturation, or the accent's first appearance.
- Let the end breathe: the finale holds for 1.5–2.5 s after the last word, with only ambient motion.

## 11. Aspect ratios and safe areas

- 16:9 (1920×1080) is the default; the template scenes are laid out for it.
- **9:16** (1080×1920) for social: stack content vertically, put headlines in the upper-middle third, keep 120 px top and 300 px bottom clear (platform UI), make type about 1.3× larger relative to frame width, captions at about 60% height.
- **1:1** (1080×1080): centre-weighted compositions; HUDs become top bands.
- Re-lay out scenes for the new canvas rather than scaling 16:9 compositions.

## 12. Motion QC checklist

Check this against the stills at every beat, and once against the final MP4's frames:
- [ ] Every scene change lands within about 3 frames before its voice-over word.
- [ ] Each named thing appears on its word; counters, ticks and payoff words land on their audio.
- [ ] One clear focal point per frame; nothing important cropped after camera pushes.
- [ ] Payoff lines hold at least 0.8 s complete; dense UI at least 1.5 s.
- [ ] No overlapping translucent elements making text unreadable.
- [ ] Something is moving in every frame; nothing jitters (deterministic randomness only).
- [ ] Transitions are match cuts, zoom-throughs, signature wipes or clean cuts: no stock effects.
