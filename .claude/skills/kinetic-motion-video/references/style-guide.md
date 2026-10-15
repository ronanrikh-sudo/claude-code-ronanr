# Style guide: kinetic motion video

These are the tokens and rules behind the look. The template already implements them (`src/config.ts`, `components/`). Use this file when you design a new scene or surface, so it still looks like part of the same film.

## Contents
1. Palette and the two worlds
2. Typography
3. Surfaces
4. Motion presets
5. Camera and transitions
6. Texture: grain, glow, vignette
7. Recreating real app UIs
8. Copy on screen
9. Do / don't

---

## 1. Palette and the two worlds

**Dark world** (the story):

| Token | Value | Use |
|---|---|---|
| `bg` | `#060A14` | base |
| `bgDeep` | `#03050B` | gradient edge |
| `navy` | `#0D1830` | radial gradient centre (50% 42%) |
| `panel` | `#0E1526` → gradient `#141C2F → #0D1424` | glass cards |
| `line` / `lineHi` | `rgba(255,255,255,.09)` / `.16` | hairlines, borders |
| `text` | `#F3F6FB` | primary text |
| `muted` / `dim` | `#93A0B8` / `#5D6A82` | secondary, labels |
| `ok` / `warn` / `bad` | `#3DD68C` / `#FFA53D` / `#FF5A5F` | status only, never decoration |

**Accent**: one colour, coral `#D97757` by default. Use it for the hero moment in each scene: the active step, ticks, the "human review" highlight, the payoff words, glows, typed slash-commands, and the folder face. Helpers: `accent(alpha)` and `color-mix(in srgb, ${ACCENT} 72%, #1A0E08)` for shading.

**Light brand world** (finale only): ivory `#F0EEE6`, ink `#141413`, the accent for the mark. It arrives as a circular `clip-path` wipe that expands from the brand mark. The grain switches to `multiply` at about half strength and the dark vignette fades out (`<Grain lightFrom>` handles this).

**Desaturation as storytelling**: the "problem" scene drains saturation over its length (`saturate(0.7 → 0.35)`) so the clutter feels grey and tired. The accent only really arrives with the solution.

## 2. Typography

- **Inter** for everything, from `@fontsource`. Weights: 400 body, 500 captions, 600 labels, 650–700 titles, 760–800 headlines and numbers.
- **JetBrains Mono** for terminals, IDs, part codes, refs and typed commands.
- Scale at 1920×1080:

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Kinetic headline | 124 | 760 | −4.5 |
| Wordmark | 172 | 760 | −7 |
| HUD number | 104–132 | 800 | −4 to −5, `tabular-nums` |
| Panel title | 30–34 | 700 | −0.5 |
| Checklist item | 27–31 | 600 | −0.3 |
| Body / rows | 22–27 | 500–650 | 0 |
| Small caps label | 19–22 | 600–700 | +2.5–4, uppercase |
| Caption | 36 | 500 | −0.2 |
| Terminal | 26–31 mono | 400/700 | 0 |

- Text should never be smaller than about 15 px after scaling. If a UI has to shrink (for example a sheet scaled to 0.66 beside a panel), check the still.

## 3. Surfaces

- **Glass panel** (`<Panel>`): radius 24, `linear-gradient(180deg,#141C2F,#0D1424)`, a 1 px `lineHi` border, shadow `0 40px 100px rgba(0,0,0,.6)`. Optional accent glow on the border and shadow when the panel is "live".
- **HUD stat** (`<Counter>`): near-opaque `rgba(5,8,16,.96)` so the clutter behind can't bleed through. Uppercase label, huge tabular number, unit underneath.
- **Chip** (`<Chip>`): pill shape, `#161E2F` (or `#1D2639` for the hero chip), heavy shadow, 24 px text with a leading icon.
- **App tile** (`<AppTile>`): a rounded square in the app's own colour with a white glyph. It stands in for a product without using its logo.
- **Light app window**: white, radius 12–14, shadow `0 50px 140px rgba(0,0,0,.6)`, entering with `rotateX(14°→0)` and an optional resting `rotateY(-7°)` tilt under `perspective: 2400px`.
- **Dark terminal**: `#1C1B1A` body, `#252422` title bar, radius 20, an accent glow `0 0 160px accent(.16)`.
- **Ivory card / pill (finale)**: ink background, ivory mono text, accent `>` and cursor.

## 4. Motion presets (`components/motion.ts`)

```ts
SOFT   = { damping: 200, mass: 0.9, stiffness: 120 }  // big layout moves, panels sliding, camera settles
SNAPPY = { damping: 16,  mass: 0.6, stiffness: 170 }  // UI elements, rows, chips, words
BOUNCY = { damping: 11,  mass: 0.7, stiffness: 160 }  // ticks, drops, "landing" moments
sp(frame, startFrame, preset)   // spring 0→1 from a start frame
ramp(frame, a, b)               // clamped linear 0→1
easeInOut / easeOut             // for wipes, pushes, arrows
rand(seed)                      // deterministic jitter, never Math.random()
```

The patterns:
- **Enter**: opacity `min(1, p*1.4)` + translateY 20–70 px + scale 0.88→1.
- **Word in**: translateY 46 → 0, blur 8 → 0, opacity ×1.6. Stagger words by their voice-over times, not by fixed delays.
- **Stagger**: 3–4 frames between list rows; 7 frames per spreadsheet row; 2 frames per cell within a row.
- **Typing**: interpolate characters over the window the voice-over allows, with a solid block cursor (in the accent colour, or white in terminals).
- **Counters**: drive the number from the actual animation (for example the arrived count, or `easeOut(ramp)`), so number and visuals agree.
- **Highlights**: ramp in over 5 frames before the beat, hold, then decay over 7–10 frames (for example a column outline when its check ticks).

## 5. Camera and transitions

- Each scene gets a slow push, `scale 1 → 1.04–1.09` across its duration, on a full-frame `AbsoluteFill`.
- **Exits**, in the last 8–10 frames:
  - a fast push (+0.12–0.5 scale) with a fade or brightness dip: a "zoom-through" into the next scene;
  - or a shrink-and-fade for objects that "become" the next scene (a spreadsheet shrinking into a file that drops into a folder).
- **Match cuts** over wipes: carry an object or colour across the cut. For example, the matched template tile grows into the full spreadsheet; the spark lands on the dark frame and then wipes the ivory world out of itself.
- **Cut timing**: the scene starts `LEAD = 0.1 s` before its voice-over cue. The payoff text must sit fully readable for at least 0.8–1 s before anything replaces it. Delay the next element to a later word if needed.
- Parallax: layers move at speed × depth (0.5 / 0.72 / 1.0), and back layers get `blur(2.2px) brightness(.5)`.

## 6. Texture

- **Grain**: SVG `feTurbulence` (baseFrequency 0.85, 2 octaves, `seed = frame % 12`) at about 7.5% opacity with `overlay` blend, rendered at 960×540 and scaled up.
- **Vignette**: radial gradient, transparent at 55% to `rgba(0,0,0,.55)` at the edge.
- **Accent glow**: a 620 px radial blob at 16% alpha, drifting slowly (sin and cos over about 150 frames).
- **Light sweep** (finale): a narrow white diagonal gradient band that crosses once.

## 7. Recreating real app UIs

When the story happens in a tool the audience uses daily (an email client, a spreadsheet, a CRM, a terminal), **recreate it in code**. That makes the video feel real and specific without screenshots or logo files.

- Copy the **layout grammar**, not the trademark: title bar in the app's colour, ribbon or tabs, panes, the selection box, status bar, avatars with initials, sheet tabs.
- Use the app's real colours (examples: an email client in `#0F6CBD`, a spreadsheet in `#107C41`, a dark CLI in `#1C1B1A`).
- Draw generic glyphs (envelope, grid) on coloured tiles in place of product logos.
- Native conventions sell it: spreadsheet Good / Neutral / Bad cell styles (`#C6EFCE/#006100`, `#FFEB9C/#9C5700`, `#FFC7CE/#9C0006`), a red comment triangle with a yellow note box bearing the author's name, the green selection border with a fill handle, the formula bar echoing the active cell, an email list with a blue unread bar, bold sender and blue subject.
- Light UIs on the dark world are fine and desirable: the contrast makes them pop. Give them a heavy shadow and a slight tilt.
- In the report, say they are look-alikes.

## 8. Copy on screen

- At most about 8 words of headline copy at once. UI content (rows, emails, cells) doesn't count, but must still be legible in the stills.
- Captions: burned in as a dark pill at the bottom (about 54 px margin), chunked to 7 words or fewer, hidden where kinetic type already says the line. Always export the `.srt` too.
- The finale is minimal: wordmark, one typed line, orbiting tiles. No paragraph, no URL, unless the user asks.

## 9. Do / don't

**Do**
- Drive everything from `timing.json`, so re-voicing re-times the whole film.
- Give every scene one hero moment in the accent colour.
- Keep something alive in every frame (cursor, counter, pulse, spinner).
- Use fictional data unless the user supplies real data.

**Don't**
- Use more than one accent, rainbow gradients, or stock transitions (spins, page curls, glitch).
- Use emoji (they don't render headless): draw icons.
- Use `Math.random()`: renders must be deterministic.
- Let the camera push clip important UI. Check the stills at the end of each push.
- Hold dense UI on screen for less than about 1.5 s, or a payoff line for less than about 0.8 s.
