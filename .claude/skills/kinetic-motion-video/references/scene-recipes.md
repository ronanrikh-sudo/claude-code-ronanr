# Scene recipes

These are the scene archetypes for this style. The template ships five of them, ready to use. The others are given here as compact, working snippets taken from a produced film. Every recipe assumes the template's conventions:

```ts
const offset = sec(from);                    // scene start (frames)
const frame = useCurrentFrame() + offset;    // absolute frame -> VO times usable directly
const end = sec(to);
```

## Contents
| Archetype | In template | Typical voice-over beat |
|---|---|---|
| 1. Flood hook + HUD counter + chips + clock | `scenes/Hook.tsx` (no clock) | "Two hundred X arrive… PDFs, spreadsheets… hours of manual work" |
| 2. Inbox recreation (email-client look-alike) | snippet | the problem, shown in the real tool |
| 3. Terminal prompt + tool calls + capability chips | `scenes/Terminal.tsx` | "Now, one prompt." |
| 4. Matching beams (cards dock onto targets) | snippet | "matches each one to its record" |
| 5. Spreadsheet fill → flag → check | snippet | "fills our template, flags notes or errors" |
| 6. Checklist ticking on clauses | `scenes/Checklist.tsx` | "checks A, B and C" |
| 7. Folder → system → report with human review | snippet | "You get a folder ready for X, and a report…" |
| 8. Kinetic line | `scenes/KineticLine.tsx` | "Hours of X become minutes of Y." |
| 9. Brand finale (ivory ad world) | `scenes/Finale.tsx` | "All with <brand>." |

---

## 1. Flood hook

This is the template's `Hook`. Cards rain in on three parallax layers, and an accelerating arrival curve `t = start + span * (k/(n-1))^0.7` makes the counter hit its target while the first line is still being spoken. Chips drop with `BOUNCY` exactly on the words that name them (`wordTime(clause, "PDFs")`). Saturation drains, and the scene ends with a fast push.

**Optional clock** for "hours of manual work": an SVG face where the minute hand rotates by `0.7*t² + 30*t` degrees (accelerating), with a faint trail arc behind the hand, a `rgba(3,5,11,.94)` radial backdrop so it reads over the clutter, and a 2-word label ("Manual entry").

## 2. Inbox recreation

This is a light email-client window (title bar in the app's blue, folder pane, message list, reading pane) tilted under `perspective`. New mail lands at the top and pushes older rows down smoothly.

```tsx
// ARRIVALS[i] = arrival time (s) of message i, oldest first
const prog = ARRIVALS.map((a) => sp(frame, a * FPS, SNAPPY));
const rows: React.ReactNode[] = [];
let below = 0;                                     // stacked height of newer rows, in rows
for (let i = TOTAL - 1; i >= 0 && below < 11; i--) {
  if (prog[i] <= 0.001) continue;
  // unshift: older rows render first, so newer ones slide over them
  rows.unshift(<Row key={i} i={i} y={below * ROW_H} p={prog[i]} />);
  below += prog[i];
}
// Row: top = y - (1 - p) * ROW_H (slides down from under the list header),
// OPAQUE background that fades from a light blue tint to white as p -> 1.
// A translucent row background makes overlapping rows unreadable.
```

Details that sell it: a 3 px unread bar in the app colour, an initials avatar in rotating colours, a bold sender, a coloured subject, a grey preview, a paperclip and time, the folder count tracking arrivals, "Focused / Other" tabs, and a reading pane showing one reply with attachment chips and an inline price table in mono.

## 3. Terminal prompt

This is the template's `Terminal`: a welcome box that draws on via `clipPath inset`, a prompt typed across about 45% of the scene, then tool-call lines (`⏺` dot → `⎿` result, drawn with CSS borders rather than glyphs). A spinner line with a rotating spark reads "Working…". Corner chips name the capabilities the pitch is about, for example "Outlook connector · Read-only access" or "Shared skill · <name>". Pulse a chip (scale and glow) on the word that names it.

The terminal scene works best when it spans the "Now, one prompt" line **plus** the next clause, so the tool calls have voice-over to sync to. Start the next scene on cue `"S3.1"` rather than `"S3"`.

Keep accent-coloured spans `white-space: nowrap` so a slash-command never wraps mid-word.

## 4. Matching beams

Reply cards on the left and target tiles on the right, in a **different order** so the matching is visible. Each pair: both ref chips glow, a bezier beam draws between them, then the card springs across and docks onto its target, offset +14 px like a stacked paper.

```tsx
const pairs = MATCHES.map((m, k) => {
  const glowAt = A + 1 + k * 9, moveAt = A + 8 + k * 9;   // A = clause start frame
  return {
    glow: ramp(frame, glowAt, glowAt + 5),
    move: sp(frame, moveAt, SNAPPY),
    dock: ramp(frame, moveAt + 10, moveAt + 16),       // target border turns accent
    fromY: ROW_Y[k], toY: ROW_Y[TARGET_ORDER.indexOf(m.ref)],
  };
});
// beam: <path d={`M x1 y1 C x1+420 y1, x2-420 y2, x2 y2`} stroke="url(#beam)"
//        strokeDasharray=1400 strokeDashoffset={1400*(1-glow)} opacity={glow*(1-move)} />
// card: left = lerp(LEFT_X, RIGHT_X+14, move), top = lerp(fromY, toY+14, move),
//       rotate = sin(move*PI) * -3deg
```

**Match cut** out of this beat: the docked target tile grows into the next scene's full UI. Interpolate its centre and scale from the tile's rectangle to the full-size window over about 12 frames.

## 5. Spreadsheet: fill → flag → check

This is a light spreadsheet look-alike: green title bar with AutoSave, ribbon tabs (Home underlined), a placeholder ribbon, formula bar (name box + *fx* + the active value), lettered column headers, row numbers, a dark template header row, pale-green input cells, empty rows 7–12, sheet tabs and a status bar.

**Fill**, typewriter, row by row:
```tsx
const cellStart = (r, key) => FILL + 4 + r * 7 + INPUT_KEYS.indexOf(key) * 2;
const n = Math.floor(interpolate(frame, [s, s + 5], [0, value.length], clamp));
const flash = Math.max(0, 1 - Math.abs(frame - (s + 5)) / 8); // cell brightens as it completes
// active cell = latest started cell -> 3px green selection box + fill handle,
// highlighted column letter and row number, formula bar shows its value.
```

**Flag**, on the "flags" clause: a Flags column fills with the native Good / Neutral / Bad styles (`✓ OK`, `● Note`, `✕ Error`), popping with `BOUNCY`, 3 frames apart. Erroneous cells turn `#FFC7CE` with a red corner triangle. Notes appear as pale-yellow boxes (`#FFFFE1`, grey border, small drop shadow) authored by the assistant (**"Claude:** No price quoted for this line."), with a short leader line. Hide them before the next beat.

**Check**, on the next clause: the sheet shrinks (scale about 0.66) and slides left, and a glass checklist slides in from the right. Each tick outlines the column it validates with a 4 px accent border and glow. After the last tick, a "Ready for <system>" badge appears and the title bar changes to "Saved to <folder>".

Keep the sheet's left edge on screen at the scaled size. Check the frame at the end of the camera push.

## 6. Checklist

This is the template's `Checklist`. `script.json → "ticks": {"segment": "S3"}` produces one tick per clause, at clause start + 0.2 s, shared with the tick sound effect. A light "real UI" card on the left highlights the line each tick refers to.

## 7. Folder → system → report with human review

**Stage A** (first clause): a big folder in the accent colour (dark back, white file sheets that stack up as the count rises, accent front face with `perspective rotateX(-8°)` that bumps on each arrival). Its face reads "<Folder>" and "<N> ready". Files arc in from above. A dashed line then draws to a dark **system tile** ("CM · Import queue", progress bar, "Ready to integrate"), with accent pulses travelling along it:

```tsx
const pulses = Array.from({ length: 6 }, (_, i) => (frame / 22 + i / 6) % 1);
// <circle cx={x0 + (x1-x0)*q} cy={y0 + (y1-y0)*q} r={7} fill={ACCENT} opacity={Math.sin(q*Math.PI)} />
```

**Stage B** (second clause): folder and tile spring up to a small top row (scale 0.4–0.55), and a **briefing report** rises from below. It has a header with an icon, title and folio, and rows of status dot · bold name · note. On the word "human", flagged rows get accent outlines and glow, the all-clear row dims to 55%, and a person avatar with an accent ring pops onto the panel corner. On "further check" (or the matching phrase), a small "Further check" pill with an eye icon appears on each flagged row.

## 8. Kinetic line

This is the template's `KineticLine`. Two lines at 124 px: line 1 in white, which dims to 45% once line 2 starts. An accent arrow (a stroke-dash draw plus the head) draws on the pivot word, and line 2 in the accent colour. Each word springs in on its own spoken time, computed with a per-clause cursor so repeated words like "of" resolve correctly. Hide captions during this scene. Hold the complete line for about 1 s before the next cut. If the voice-over runs straight on, start the next scene on a later word.

## 9. Brand finale

This is the template's `Finale`. The spark (8-ray asterisk) springs in centred on the dark frame. An ivory circle wipes out from it over about 14 frames. The spark scales down and slides left while the wordmark (172 px, ink) wipes in from the left via `clipPath inset`, the pair centred as one lockup. A light sweep crosses once. An ink pill types the tagline in mono with an accent `>` and a blinking accent cursor. Three app tiles orbit on a wide ellipse (rx about 830, ry about 390) clear of the wordmark. Hold to the last frame, with no extra copy.

Adjust `wordW` in `Finale.tsx` (about 92 px per character at 172 px) if the lockup isn't centred in the still. Swap the spark for the user's logo SVG if they supply one.
