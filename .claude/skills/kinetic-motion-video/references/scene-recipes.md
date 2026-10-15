# Story structures and scene recipes

Pick a **story structure** for the project, then build each beat from **scene archetypes**. Archetypes are motion recipes, not looks: every colour, font and surface comes from `THEME`. The template ships five of them; the rest are compact recipes and snippets here.

Every recipe assumes the template's conventions:

```ts
const offset = sec(from);                    // scene start (frames)
const frame = useCurrentFrame() + offset;    // absolute frame -> VO times usable directly
const end = sec(to);
// colours/fonts: THEME.*, accent(a), alpha(hex, a), display(size), FONTS.*
// motion: sp(frame, start, SOFT|SNAPPY|BOUNCY), ramp, push(frame, a, b, amt), CAMERA
```

## Contents
1. Story structures
2. Archetype index
3. Recipes 1–15

---

## 1. Story structures

Choose the structure from what the video must *do*, then map one segment (S1, S2…) to each beat.

| Structure | Beats | Good for |
|---|---|---|
| **Problem → turn → work → result → sign-off** | flood or pain · "Now, one…" · 2–4 work beats · output · payoff line · finale | process improvements, internal pitches, tools, B2B |
| **Product reveal** | tease (macro detail, darkness) · reveal (hero) · 3 features · proof (stat or quote) · sign-off | launches, physical or digital products |
| **Data story** | headline number · context · 2–3 supporting stats or charts · so-what line · sign-off | results, reports, impact videos |
| **How it works** | promise · step 1 · step 2 · step 3 · outcome · sign-off | onboarding, explainers, tutorials |
| **Before / after** | "Today…" (grey, cluttered) · hard turn · "With X…" (clean, accent) · comparison · sign-off | transformations, migrations, ROI |
| **Manifesto / brand film** | 4–6 kinetic statements over textures or imagery · brand line · sign-off | culture, recruiting, brand launches |
| **Event / announcement** | hook line · what · when and where (big type) · why come · sign-off | events, webinars, launches |

The turn moment always gets the strongest change: a clean cut, a new world, or the accent's first appearance.

## 2. Archetype index

| # | Archetype | Template file | Beat it serves |
|---|---|---|---|
| 1 | Flood hook + stat counter + chips | `scenes/Hook.tsx` | volume, chaos, "too much" |
| 2 | Terminal / command prompt | `scenes/Terminal.tsx` | "one prompt", automation, dev tools |
| 3 | Checklist ticking on clauses | `scenes/Checklist.tsx` | checks, steps, criteria |
| 4 | Kinetic line (two-line payoff) | `scenes/KineticLine.tsx` | the big idea, before → after |
| 5 | Brand finale (sign-off world) | `scenes/Finale.tsx` | the ending |
| 6 | Recreated list app (inbox, feed, queue) | recipe | the problem in the real tool |
| 7 | Recreated table (spreadsheet fill → flag → check) | recipe | data entry, forms, records |
| 8 | Matching beams | recipe | linking, routing, reconciliation |
| 9 | Output: container → system → report + human | recipe | results, hand-off, review |
| 10 | Stat reveal | recipe | headline numbers |
| 11 | Chart build | recipe | trends, comparisons |
| 12 | Product / device hero | recipe | product reveal |
| 13 | Feature cascade | recipe | 3–6 features |
| 14 | Split before / after | recipe | comparison |
| 15 | Quote / testimonial | recipe | social proof |

---

## Recipe 1 — Flood hook (template `Hook`)
Cards rain in on three parallax layers. The arrival curve `start + span * (k/(n-1))^0.7` accelerates, so the counter lands during the first line. Chips drop with `BOUNCY` on the words that name them. Saturation drains (`saturate(0.7 → 0.35)`), then a push into the cut. Re-skin the cards to the project (tickets, emails, invoices, applications, notifications).

**Optional clock** for "hours lost": an SVG face whose minute hand rotates by `0.7*t² + 30*t` degrees, with a trail arc, a radial scrim behind it and a 2-word label.

## Recipe 2 — Terminal (template `Terminal`)
A welcome box draws on via `clipPath inset`. The prompt types across about 45% of the scene. Tool-call lines follow (a dot, then a result with an L-shaped connector, drawn in CSS rather than glyphs), with a spinner line using the rotating mark. Capability chips sit in the corner (connector, skill, integration), each popping on the word that names it. Best when the scene spans the "one prompt" line plus the following clause. Accent spans get `white-space: nowrap`.

## Recipe 3 — Checklist (template `Checklist`)
`script.json → ticks.segment` gives one tick per clause of that segment, shared with the tick sound. A "paper" card on the left lights the line each tick refers to.

## Recipe 4 — Kinetic line (template `KineticLine`)
Two lines through `display()`. Words spring in on their spoken times, using a per-clause cursor so repeated words resolve correctly. The pivot word draws a connector; line 2 is in the accent; line 1 dims. Hold the complete line for about 1 s. Captions hidden.

## Recipe 5 — Brand finale (template `Finale`)
The mark lands on the story world. The finale world (`THEME.finale`) wipes out of it as a circular `clipPath`, or uses the project's signature device instead. The mark slides aside as the wordmark wipes in, centred as one lockup. A light sweep crosses once. A tagline types into a pill. App or product tiles orbit on a wide ellipse. Hold to the last frame, with minimal copy. Replace the placeholder mark with the user's logo SVG when supplied. Tune `wordW` (about 0.53 × font size per character for grotesks; measure serifs in a still).

## Recipe 6 — Recreated list app (inbox, feed, ticket queue)
A light window in the app's own colours, tilted under `perspective`. New items land at the top and push the rest down:

```tsx
const prog = ARRIVALS.map((a) => sp(frame, a * FPS, SNAPPY));   // ARRIVALS oldest first (s)
const rows: React.ReactNode[] = [];
let below = 0;
for (let i = TOTAL - 1; i >= 0 && below < 11; i--) {
  if (prog[i] <= 0.001) continue;
  rows.unshift(<Row key={i} i={i} y={below * ROW_H} p={prog[i]} />); // older first, newer on top
  below += prog[i];
}
// Row: top = y - (1 - p) * ROW_H; OPAQUE background fading from a tint to white as p -> 1.
```

What sells it: an unread bar, initials avatars, bold sender, coloured subject, grey preview, attachment icon and time, a folder count tracking arrivals, and a reading pane with one realistic item.

## Recipe 7 — Recreated table: fill → flag → check
App-coloured title bar, tabs, a ribbon placeholder, a formula or address bar echoing the active cell, lettered columns, row numbers, a dark header row, tinted input cells, empty rows below, and a status bar.

```tsx
const cellStart = (r, key) => FILL + 4 + r * 7 + INPUT_KEYS.indexOf(key) * 2;
const n = Math.floor(interpolate(frame, [s, s + 5], [0, value.length], clamp));
const flash = Math.max(0, 1 - Math.abs(frame - (s + 5)) / 8);   // cell brightens as it completes
// active cell = latest started -> thick selection box + handle, highlighted header and row number
```

- **Flag** beat: a status column pops Good / Neutral / Bad chips (in a spreadsheet, use its native cell styles). Faulty cells tint, with a corner triangle. Note boxes appear beside them with a leader line, signed by the actor.
- **Check** beat: the table shrinks to about 0.66 and slides aside; a checklist panel slides in; each tick outlines the column it validates. Then a "Ready for X" badge, and the title bar changes to "Saved".

## Recipe 8 — Matching beams
Sources on the left, targets on the right in a **different order**. Per pair: both IDs glow, a bezier beam draws, then the source springs across and docks onto its target (+14 px offset).

```tsx
const glowAt = A + 1 + k * 9, moveAt = A + 8 + k * 9;
// beam: <path d={`M x1 y1 C x1+420 y1, x2-420 y2, x2 y2`} strokeDasharray=1400
//        strokeDashoffset={1400*(1-glow)} opacity={glow*(1-move)} />
// card: left = lerp(LEFT_X, RIGHT_X+14, move); top = lerp(fromY, toY+14, move); rotate = sin(move*PI)*-3deg
```

Match-cut out: the docked target grows into the next scene's full UI.

## Recipe 9 — Output: container → system → report + human
- **Stage A**: a large container (folder, box, inbox) in the accent colour; items arc in; the count on its face rises; the face bumps on each arrival. A dashed connector draws to a system tile, and pulses travel along it (`(frame/22 + i/6) % 1`).
- **Stage B**: the container and system shrink to a top row, and a report panel rises with status rows (dot · name · note). On "human", the flagged rows get accent outlines and the clear rows dim. A person avatar pops onto the corner, and "Further check" pills land on the flagged rows on their words.

## Recipe 10 — Stat reveal
A giant number (160–240 px, `display()`, tabular) counts up with `easeOut(ramp)` over about 0.8–1.2 s, landing on its spoken word. Then the unit and label spring in beneath, and a thin accent rule draws under it. Context variant: a small "from X" value strikes through as the big one lands. Multiple stats: 3 columns cascading 6 frames apart, the hero stat in the accent.

## Recipe 11 — Chart build
Axes or baseline draw first (hairlines). Bars grow from the baseline with `SOFT`, 3 frames apart; lines draw via `strokeDashoffset`. The value that matters gets an accent colour, a callout bubble and a pulse. Keep it to at most 6 bars or 2 lines; label directly, no legends.

## Recipe 12 — Product / device hero
The device or product frame (a CSS-drawn phone or laptop, or a supplied render) enters on `rotateY 25° → 8°` with `SOFT`, a soft floor shadow growing beneath it. The screen content animates inside (reuse UI recipes). A slow orbit (`rotateY` drift of about 6° over the scene) and a light sweep across the glass. Callout labels pop out on hairline leaders as each feature is named.

## Recipe 13 — Feature cascade
3–6 cards in a grid, each with an icon, a 2–4 word title and one line. They enter with a 4-frame stagger (`SNAPPY`, rise plus fade). As the voice names each feature, that card lifts (scale 1.04, accent border, glow) and the others dim to about 60%. End with all cards settled for a 1 s read.

## Recipe 14 — Split before / after
The frame splits with a vertical divider that draws top to bottom. **Before** is desaturated, cluttered, muted text, maybe a ticking clock. **After** is clean, in the accent, with the outcome number. The divider then sweeps left so "after" takes the full frame (match cut into the next scene).

## Recipe 15 — Quote / testimonial
A large quote mark in the accent scales in. The quote is set in display type (serif works beautifully even in sans directions), words springing in on the voice if it's spoken, or 3 frames apart if not. The attribution (avatar circle with initials, name, role) slides up after the quote completes. Hold for at least 2 s. Use fictional names unless the user provides real, approved quotes.
