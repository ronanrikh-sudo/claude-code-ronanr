# WAR FC × CAGECRAFT — Event Fight Shorts (proposal, round 9)

Pitch to WAR Fighting Championships for official event fight shorts, built in the
`cagecraft-wholesale-process` format (see `.claude/skills/cagecraft-wholesale-process`).

## Brief
- Two cuts: **Fight Short** (loose, side splits) and **Compression Short** (tight, vale-tudo cut)
- Brand colours red / black / white. WAR Red **#ED1C24**, taken from the client's SVG
- Logos: WAR FC (client vector SVG from their Drive), AX Carpentry (presenting sponsor, client PDF converted to SVG, run in white), CAGECRAFT
- Inspiration: professional promotion uniforms (Eternal MMA, Venum UFC); logos integrated, on-brand pattern
- Commercial: in-kind sponsorship (CAGECRAFT on posters, venue access, social features)

## Round 9 (current): Benny's notes
- WAR FC crest moved off the crotch: angled across the left front leg (hero; back wide wordmark trimmed to keep it supporting)
- Plain left leg now carries the crest plus a **repeat stripe**: a slimmer echo of the sash, forming a V with it and ending in a WAR spear tip
- AX Carpentry: the **same wordmark on both sides**; on the sash side the sash stops in spear tips either side of the wordmark
- Compression front side seam moved toward the edge so the crest clears it; fight-short side wordmark offset off the side seam

## Round 8: logo hierarchy
- Front WAR FC crest is the hero: about 33 % larger (fight short 800 px, compression 560 px wide). The back wide wordmark is supporting: about 30 % smaller (560 / 420 px). Hip swipe and compression sash nudged to clear the bigger crest.

## Round 7: side views
- New **turned side views** for both cuts: wearer's right side carries the **AX Carpentry wordmark** running the full height of the side; wearer's left side shows the **sash wrapping round** with the **AX emblem** below it on the side panel.
- Front is now just the WAR FC crest, sash and swipes; back unchanged.
- Product boards show four views (front, back, both sides); the placement map covers all four.

## Round 6: decluttered
- Front: WAR FC crest; AX **wordmark up the outer side** of one leg; AX **emblem** (house + monogram, no text) on the other leg beside the PROVE YOU BELONG sash. The stacked AX logo was removed from the front.
- Swipe rebuilt as one diagonal gesture: red brush at the sash-side hip, white streaks coming off the opposite side near the hem. The back drops the red swipe so nothing crosses the sash.
- Back: wide WAR FC wordmark below the waistband, crown on the open leg (raised), white streaks off the lower outer side.

## Round 5: logo variations
- Researched AX Carpentry: axcarpentry.com.au ("AX Carpentry Constructions") is an unfinished site template with no logo or fonts, so all AX variations are built from the supplied logo's own vector parts.
- **AX Carpentry**: stacked logo on the lower front leg; new **horizontal wordmark** (AX monogram + CARPENTRY) running up the outer side of the same leg (`axWordmark` in `brand.mjs`; needs AX's sign-off)
- **WAR FC**: full crest on the front; **wide wordmark** (WAR + FIGHTING CHAMPIONSHIPS, no crown) across the back below the waistband; **crown emblem** on the open back leg
- New deck slide: Logo system (primary and secondary lockups per brand)

## Round 4: War Streaks, Black Corner and White Corner
- Front waistband emblem made smaller so it sits inside the flat panel with even margins
- Back: CAGECRAFT wordmark reduced; WAR FC crest and AX Carpentry (presenting sponsor) enlarged as a large pair
- Red Corner replaced by a **White Corner**: white base, soft grey streaks, dark red (#8E0B13) brushes and sash, black marks; light-fabric shading and seams

## Round 3: War Streaks, Black Corner and Red Corner
Round 1 (monogram) and round 2 (Smoke & Stone vs War Streaks) led here. The client chose War Streaks; this round adds an inverted Red Corner and these fixes:
- CAGECRAFT emblem re-traced **level** (the source photo was ~8° off), with clean italic letters
- **Flat** waistband logo panel (like Rival's) with the emblem; no external drawstring
- On-brand **crest bar** waistband pattern (WAR crown and spear bars between red rules) instead of the Greek key
- Back waistband: large, wide CAGECRAFT wordmark, no box
- PROVE YOU BELONG sash in **Saira Black Italic** (OFL, `assets/fonts`), flanked by spear bars, kept inside one panel
- White splash replaced by slim tapered streaks that stop short of every logo
- Layout: big WAR FC crest across the upper front with AX on the lower leg; the back carries a matched WAR FC + AX pair on the hips

## Outputs
- `out/deck/WAR-FC-Fight-Shorts-Proposal.pdf`: 11 slides (cover, two corners, logo system, logo placement, 4 product boards, details, full set, partnership)
- `out/products/{fight-short,compression}_{black,white}_{front,back,side-wordmark,side-sash}.png`: 2000×2500 mockups

## Build
```bash
cd war-fc-kit
node scripts/measure_logos.mjs
node scripts/build.mjs out/products
python3 scripts/crop_cutouts.py
node scripts/boards.mjs
```
Scripts: `brand.mjs` (logo groups, recolouring, CAGECRAFT emblem), `kit.mjs` (shared rendering kit from the Rival pipeline), `shorts.mjs` (both cuts, both corners, waistband panel, crest bar, sash, streaks, logo slots); `textures.py` (round-2 smoke and stone, kept for reference), `boards.mjs` (deck), `trace_emblem.py` (emblem vectorising).
