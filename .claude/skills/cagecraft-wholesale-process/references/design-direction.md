# Design direction — the CAGECRAFT premium house style

Distilled from the Rival Gym job (approved by the client). Coordinates and numbers below refer to the bundled pipeline (`scripts/`), where every garment is drawn on a 2000×2500 canvas.

## Contents
1. Principles
2. Colour
3. The Legacy oval (centrepiece device)
4. The Legacy circuit hem pattern
5. Logo integration and co-branded lockups
6. Garment templates and proportions
7. Rendering realism (how the mockups look photographic)
8. Failure → fix log
9. What the client changed on Rival

---

## 1. Principles
- **Black base garments, brand colour in the graphics.** The kit reads premium because the base is quiet and the graphics are crisp.
- **The client's brand inside CAGECRAFT's language.** Client wordmark + client colours, set in Legacy devices (oval, hem pattern). It should feel like a CAGECRAFT product made for them, not a blank with logos on it.
- **One system across the kit.** Same chest graphic on tee and rashguard; same pattern on rashguard and shorts, front and back; same lockup logic on every back.
- **Restraint.** No more than one hero graphic per face. Secondary logos are small and placed where teamwear puts them (back neck, below back waistband).
- **Truthful mockups.** Real garment proportions, real construction (seams, binding, waistband, fly), real relative scale between products.

## 2. Colour
- Sample the client colour from their logo: build a mask of the coloured pixels and take the median RGB. Rival Red = **#C10212** (193, 2, 18).
- Print white is off-white **#F4F4F2** (pure white looks digital on fabric).
- Fabric: base #171717 (tee #181818), sleeve/raglan panels a hair darker (#151515), mesh #1c1c1c with #080808 holes, binding/waistband #161616.
- Studio background (product shots and light boards): radial #dcdcda → #cdcdcb → #b3b3b1 with 3 % grain.
- Concept naming: **Idea A** = logo colours inverted for black (Rival: white oval, red RIVAL, white GYM, red pattern); **Idea B.1** = all client colour; **Idea B.2** = all white. On Rival, B.1 (all red) was dropped: red-on-black loses contrast — say so when you show it.

## 3. The Legacy oval (centrepiece device)
Emblem units: ellipse RX 500, RY 205, centred at 0,0 (`scripts/emblem.mjs`).
- **Crescent ring**: drawn from −149° (top-left tip) clockwise to +142° (bottom-left tip); thickness `WMIN 5 → WMAX 54` weighted to the right (`((1+cos t)/2)^1.7`), tapered to points at both tips. The ring is open on the left where the wordmark breaks out.
- **Comet swoosh**: a second crescent peeling off the inside of the ring from +66° (merging at bottom right) to −50° (pointed tip at top right); gap 15 → 35, peak width 31.
- **Wordmark**: client's traced letterforms, 860 units wide, left edge at −548 (breaks out past the ring on the left), top at −112.
- **Secondary word** (Rival's GYM): same italic at 0.44 × wordmark height, tracking 10, under the right half of the wordmark, nudged left (−78) so it centres under the oval. No rule line (client removed it).
- **Sparkles**: four 4-point stars from the Legacy oval — available behind `opts.sparkles`, off by default (client removed them).
- Placement: chest of tee/rashguard ≈ 70 % of chest width, centred ~25 % down the body; shorts front centred over the crotch area, ≈ 84 % of the width at that height, top ~120 px below the waistband.

## 4. The Legacy circuit hem pattern
`scripts/pattern.mjs` — a mirrored motif on a lane grid (1 unit = lane spacing; period 10 lanes; motif height 31 lanes):
- **Bus traces**: groups of parallel lines that step 45° together, run up, step back in and converge to **nested chevrons** at the motif centre (arches), with a centre spine and an arrow shaft above.
- **Edge traces** merge with the neighbouring motif into a shared stem and split again into **Y-chevrons** — the Legacy "M / Y" rhythm.
- **Broken traces** (small gaps) and short ticks in open pockets add the Legacy texture.
- **Hem fringe**: even short dashes on half-lanes along the hem.
- Stroke width 0.3 × unit; unit ≈ 17–18.5 px on the 2000 canvas.
- **Fade**: opacity 1 at the hem → 0.92 (30 %) → 0.5 (60 %) → 0.13 (84 %) → 0 at the top; the band covers the bottom ~40 % of a top and rises to just under the oval on shorts.
- Rashguard: one band centred on the body (motif centre on the centre line). Shorts: one band per leg, rotated to sit square to that leg's hem and mirrored for the other leg, so it's symmetric across the centre seam.

## 5. Logo integration and co-branded lockups
- **Never a logo dump.** Each logo has a role: hero (inside the oval on the chest / over the crotch), signature (back lockups), maker's mark (neck print).
- **Neck print** inside the collar: CAGECRAFT + fabric/size line in grey, like the Legacy.
- **Tops back lockup** (`topsLockup`): client oval, small ×, CAGECRAFT wordmark — stacked and centred just below the back neck band (oval ≈ 12 cm wide). Stacked beats side by side because two ovals compete at small size.
- **Shorts back lockup** (`shortsLockup`): CAGECRAFT wordmark (≈ 500 px wide) just below the back waistband, with "× CLIENT NAME" beneath in the client's own italic at half height — the Legacy "CAGECRAFT / FIGHTWEAR CO." slot. In Idea A the client word keeps its brand colour.
- Drop ® marks at back-neck size (too small to print); keep them where a logo is large.
- Sponsor logos (if any) run in a kit colour (usually white), never their native off-palette colour, unless the sponsor insists.

## 6. Garment templates and proportions
All garments are drawn as half outlines mirrored with `symOutline` / `mirrorD`, so they're perfectly symmetric.

**Rashguard** (short sleeve, raglan): chest ≈ 752 px, HPS → hem ≈ 1320 px (≈ 1 : 1.75 laid flat; size chart M = 45.5 cm half-chest × 69.5 cm length). Raglan flatlock seams from neck to underarm, mesh side panels from the armpit to ~1350, collar binding, sleeve and hem twin stitching, pattern band from ~1346 to the hem.

**Training tee**: set-in sleeves angled down, rib crew neck (radial rib lines), body ≈ 836 px wide, HPS → hem ≈ 1370 px, twin-needle hems, weave grain (matte cotton feel). Chest graphic only — no hem pattern.

**Mid-length MMA shorts** — factory template "NON VELCRO CURVED CUT (7.5″ INSEAM)": single layer (not 2-in-1); wide elastic waistband (~160 px) with a flat front panel (x 836–1164) and gathered sides (irregular ruching); J-stitch faux fly offset right of centre; narrow crotch notch; long, slightly flared legs, ~1 : 1 height to width; curved-cut side hems rounding into the hem; a solid binding strip (~25 px) around each leg opening with a seam line and stitching inside it; the print stops above the binding. Back: fully gathered waistband, centre-back seam, no fly.

**Legacy 2-in-1 shorts** (house reference only): shorter, compression liner, side slits.

New product types (compression shorts, fight shorts with velcro fly, spats, long-sleeve rashguards): get the factory template from the user if possible, then follow the same construction-first approach — silhouette → panels/seams → waistband/hems → print → shading.

## 7. Rendering realism
Order of layers inside the silhouette clip: base fabric → panel tones/mesh → **print (pattern, emblem)** → **shading pass** (folds, creases, edge darkening, grain) → seams/stitching on top → collar/neck details. The print sits under the shading so it bends with the fabric.
- **Folds**: broad soft highlights (`glow`, white 4–7 %, blur 40–70) on chest/legs; a soft dark centre valley; **creases** = dark valley (black 35–55 %, blur 6–10) plus a lit ridge offset 7–10 px (white 4–7 %).
- **Edges**: inner edge darkening (black stroke 110 px, blur 26, 50 %) + tight edge shadow + a 3 px light rim (7 %).
- **Shadow** on the background: blurred silhouette offset (12, 30) at 32 % + contact shadow (3, 7) at 42 %.
- **Grain**: feTurbulence noise at 3–7 % (`weave` with anisotropic frequency for cotton tees).
- **Seams**: flatlock = dark core + dashed zig either side; twin-needle hems = two dashed lines; binding = solid strip + dark seam line + lit ridge + stitch.

## 8. Failure → fix log
| Symptom | Cause | Fix |
| --- | --- | --- |
| Hard horizontal bands across the shading | blur filter region clipped to each stroke's bbox | every blur filter `filterUnits="userSpaceOnUse"` covering the whole canvas |
| Jaggy, aliased print edges | `feDisplacementMap` "fabric warp" | don't displace print; let the shading pass do the realism |
| Garment looks flat charcoal | too little tonal range | stronger glows + crease pairs + edge darkening |
| Rashguard "weirdly stretched" | copied a flat-lay photo's aspect | redraw from the size chart |
| Shorts look like boxer briefs / "bad" | generic silhouette, crotch too low, short legs | rebuild on the factory template, ~1 : 1, real waistband/fly/hem construction |
| Pattern fringe runs under the hem binding | print drawn to the edge | paint a solid binding strip over the print, lift the pattern baseline above it |
| Captions collide with the footer on boards | fixed scale factor | `k = min(0.42, 640 / tallest cut-out)` |
| Garments look wrong next to each other on boards | per-product scaling | one shared scale factor; crop cut-outs to alpha bbox + 12 px |
| Traced logo has notches on diagonals | narrow gaps between glyphs blur together | un-skew, straighten long near-straight runs, snap axis-aligned edges |

## 9. What the client changed on Rival (expect similar asks)
Round 1 (fronts): remove the stars; rashguard looked stretched; remove the rule before GYM and move GYM a little left; shorts mockup looked bad → rebuild on the supplied template.
Round 2: backs = small client oval under the neckline × CAGECRAFT on tops; CAGECRAFT wordmark below the back waistband × RIVAL GYM on shorts; final colourways A and B.2 only (red dropped). The client was "pretty happy" → invoice next.

## 10. Event / promotion fight shorts (learned on WAR FC)
Round 1 for WAR FC used a flat tonal monogram, side panels and a lace tie. The user rejected the style and sent references: Eternal MMA (Engage), Venum UFC Fight Night/Adrenaline, and Venum UFC custom fighter shorts. For promotion and event kits, the bar is **rich, full-bleed artwork**, not a pattern plus panels:
- **Texture-led grounds**: stone-flake black, billowing **red and white smoke** rising from the hems and side splits (Eternal), **dry-brush / claw streaks** (Venum), illustrated motifs. Generate them procedurally: `scripts/textures.py` (domain-warped fractal noise smoke, stone flakes; numpy only) and the `brush()` dry-brush helper in the WAR FC `shorts.mjs`. Keep smoke translucent and soft-edged. Hard thresholds read as molten liquid.
- **Logos on clean ground**: clear the texture behind every logo (`clear` ellipses in the smoke spec), or place a white logo on red smoke. Never put a white logo on white smoke.
- **Waistband**: **no external drawstring.** Use a raised **waistband logo rectangle** at centre front carrying the **CAGECRAFT emblem** (`assets/cagecraft_emblem.json`, traced from the store's back-neck print; production should use the original vector). Add a band either side (Greek-key band, or twin red stripes). On the back waistband, centre the CAGECRAFT wordmark.
- **Sash**: a diagonal band with keylines carrying a tagline or fighter name (Venum). Size the text to the **visible** length of the band on each cut, or it runs off the leg.
- **Placement map** (UFC convention): promotion logo upper front leg, presenting sponsor lower front leg (and the back of the leg), kit-maker emblem on the waistband panel, promotion crest across the back below the waistband.
- Offer **two named directions** (e.g. Concept A Smoke & Stone, Concept B War Streaks) on every cut, front and back, plus a **details slide** of full-res crops (waistband panel, texture, sash).
- Client logo packs on Google Drive often include an Illustrator SVG with named groups (crown / wordmark / tagline). Split and recolour those instead of tracing.

### WAR FC round 3 feedback (apply by default on event shorts)
- **Emblems must be perfectly level.** A logo traced from a product photo inherits the camera tilt. Level the image first (rotate by the angle measured from the letter baselines; WAR FC needed 8.1°), then clean the letters as straight italic glyphs and the ring as smooth curves (`trace_emblem.py`).
- **Waistband logo panel is flat**, set inside the waistband height, like the Rival shorts. It does not protrude above or below the band. Use the CAGECRAFT **emblem** there, never the wordmark.
- **Back waistband**: no boxed logo. Run the CAGECRAFT wordmark large and wide across the band.
- **Waistband pattern must come from the client's brand** (WAR FC: crown centred with spear bars pointing out to each end, between red rules). Generic ornament (Greek key) reads off-brand.
- **Sash lettering**: use a premium sport italic (Saira Black Italic, OFL, embedded as woff2), letter-spaced, flanked by brand spear bars. Measure the text width in the browser so the bars clear it, and keep the text inside a single panel, clear of flatlock seams.
- **Corners**: once a direction is chosen, offer an **inverted opposite-corner** version (black ↔ red ground) rather than more concepts.
- **Accents stay clean**: big white brush splashes looked out of place. Use a few slim tapered streaks that follow the flow, and stop every streak before it reaches a logo (`clearLen` against logo boxes).
- **Front vs back**: the big promotion crest goes across the upper front, with the presenting sponsor on the lower leg opposite the sash. The back carries a matched crest + sponsor pair on the hips.

### WAR FC round 4 feedback: logo hierarchy and alternate colourway
- **Logo hierarchy on event kit**: the promotion leads and the paying sponsor gets big credit. CAGECRAFT stays modest. The back waistband wordmark is about a third of the waistband width (320 px on the 2000 px fight short), not a full-width banner.
- **Front waistband emblem** must sit *inside* the panel with even margins (fight short ≈172 px wide in a 276 × 160 panel; compression ≈122 px in a 216 × 106 panel). If it nearly touches the edges, it's too big.
- **Back pair**: promotion crest about 440 px wide and sponsor mark about 280 px wide on the fight short, so both read from the cage.
- **Alternate corner**: a red-ground inversion was rejected. The approved alternate is a **white base** (#EEEEEC) with soft grey streaks, **dark red accents** (#8E0B13 brushes and sash), black marks and the brand red kept for the logo. The black waistband stays on both corners.
- White fabric needs its own rendering: `shadingPass(..., { light: true })`, `flatlock(..., light)`, creases and gathers at about 40 % strength, grey seams and split linings. Black-fabric shading on white reads as dirt.

### WAR FC round 5 feedback: logo variations per brand
- **Give each important brand two different lockups**, never the same badge repeated. WAR FC: the full crest on the front, a **wide wordmark** (crown removed: WAR + FIGHTING CHAMPIONSHIPS) across the back below the waistband, and the **crown emblem** on its own on the open back leg. Presenting sponsor: their **stacked logo** on the lower front leg plus a **horizontal wordmark** running up the **outer side of the leg** (rotated to follow the side edge or side panel).
- **Research the sponsor's branding** (website, socials) before inventing anything. AX Carpentry's site was an unfinished template with no logo or fonts, so the supplied logo file was the only real asset. Build variations **only from the sponsor's own vector parts** (monogram, roofline, letter paths). Never retype their name in a guessed font. Flag derived lockups for the sponsor's sign-off.
- Add a **Logo system** slide to the deck (each brand's primary and secondary lockups on dark tiles, labelled with where each goes) before the placement map.
- When a new mark lands where the accent streaks start, move the streak origin. `clearLen` silently drops streaks whose origin sits inside a logo's clear zone.

### WAR FC round 6 feedback: restraint
- **One mark per zone.** Round 5 (crest, stacked sponsor logo, side wordmark, sash and streaks on one front) read "way too crowded". The approved front has the promotion crest, the sponsor **wordmark on one side**, the sponsor **emblem only** (no text) on the other leg beside the sash, and the sash.
- **Accent gestures must start at an edge.** Streaks floating mid-leg looked "off". Compose the swipes as one diagonal: the red brush at the sash-side hip, and white streaks coming off the opposite side near the hem. On the back, skip the red swipe if it would cross the sash.

### WAR FC round 7 feedback: side views
- "On the side" means the **actual side of the garment**, shown in a **turned (side-on) view**, not a mark squeezed along the front panel's edge. Deliver four views per short: front, back, and **both sides**. Every product board shows all four; the placement map shows all four with numbered pins and a four-column legend below.
- Side-view construction (`sideView()` in the WAR FC `shorts.mjs`): a profile silhouette with the **waist opening seen slightly from above** (dark ellipse), a narrower waist than hip, a **seat curve** and gluteal fold at the back, a **front notch** where the torso meets the leg, and a **curved hem**. Without these cues a side view reads as a skirt. The fight short shows the side split at the side seam; the compression short shows the side panel between two flatlock seams.
- Sponsor wordmark runs the **full height of one side** (rotated, reading bottom-to-top). The sponsor emblem goes on the **other side, outside (below) the sash**, where the sash wraps round. The front is then the promotion crest + sash only.
- **Hero vs supporting (round 8):** the promotion's front crest is the hero, the largest mark on the kit (fight short ≈800 px wide, compression ≈560 px on the 2000 px canvas). The back wide wordmark is supporting and visibly smaller (≈560 / 420 px). When the hero grows, re-check its spear tips against the sash and hip swipe.

### WAR FC round 9: client (promotion owner) notes
- **No promotion logo over the crotch.** Put the hero crest **across one leg**, angled about -10° for energy. The leg's width (outer edge to centre seam) caps its size, so keep the hero relationship by trimming the back mark, not by crossing seams.
- **No plain legs.** The leg without the sash gets a **repeat stripe**: a slimmer echo of the sash at the mirrored angle (together they form a V), no lettering, finishing in a brand spear tip.
- **Same sponsor wordmark on both sides.** The sash comes round from the front and back and **stops in spear tips either side of the side panel**, leaving the full height clear for the wordmark.
- Keep logos off seams: move a construction seam (the compression front side seam moved toward the edge) rather than letting a flatlock line cut through a logo, and offset side wordmarks onto the panel beside a side seam.
- **Round 10, the promotion wordmark as a diagonal band:** the hero became the long WAR FC wordmark (crown removed) inside a band that **mirrors the tagline sash** (same origin and angle mirrored about the centre line), so the front reads as a **V**. Make the band slightly wider than the sash so it leads, and read it downward toward the crotch (rotate 180° inside the mirrored band). On the white corner the band stays black so the logo keeps its true white/red. Both bands wrap round and stop in spear tips either side of the side-panel wordmarks. With the hero this big, the back wordmark returns to its full supporting size.

### WAR FC round 11: when a client rejects twice, show options
- The diagonal WAR band (round 10) was rejected outright. After two misses on the same element, **stop guessing one at a time** and present **lettered options** for that element, keeping everything already approved fixed (back, sides, sash, waistband). WAR FC front directions: **A Fight Night** (full crest big and level on the lower leg, the UFC / PFL / ONE event-short convention), **B Vertical** (long wordmark up the leg's outer edge + crown), **C Back-matched** (front mirrors the approved back layout). Mark one **Recommended**; product boards show that one.
- Deck pattern for options: one slide per cut in the main corner with the options large side by side, plus one slide with the alternate corner and both cuts in two rows. Render each option as its own view (`front-A`, `front-B`, `front-C`) so switching the recommendation is a one-line change (`REC`).
