# WAR FC × CAGECRAFT — Event Fight Shorts (proposal, round 4)

Pitch to WAR Fighting Championships for official event fight shorts, built in the
`cagecraft-wholesale-process` format (see `.claude/skills/cagecraft-wholesale-process`).

## Brief
- Two cuts: **Fight Short** (loose, side splits) and **Compression Short** (tight, vale-tudo cut)
- Brand colours red / black / white. WAR Red **#ED1C24**, taken from the client's SVG
- Logos: WAR FC (client vector SVG from their Drive), AX Carpentry (presenting sponsor, client PDF converted to SVG, run in white), CAGECRAFT
- Inspiration: professional promotion uniforms (Eternal MMA, Venum UFC); logos integrated, on-brand pattern
- Commercial: in-kind sponsorship (CAGECRAFT on posters, venue access, social features)

## Round 4 (current): War Streaks, Black Corner and White Corner
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
- `out/deck/WAR-FC-Fight-Shorts-Proposal.pdf`: 10 slides (cover, two corners, logo placement, 4 product boards, details, full set, partnership)
- `out/products/{fight-short,compression}_{black,white}_{front,back}.png`: 2000×2500 mockups

## Build
```bash
cd war-fc-kit
node scripts/measure_logos.mjs
node scripts/build.mjs out/products
python3 scripts/crop_cutouts.py
node scripts/boards.mjs
```
Scripts: `brand.mjs` (logo groups, recolouring, CAGECRAFT emblem), `kit.mjs` (shared rendering kit from the Rival pipeline), `shorts.mjs` (both cuts, both corners, waistband panel, crest bar, sash, streaks, logo slots); `textures.py` (round-2 smoke and stone, kept for reference), `boards.mjs` (deck), `trace_emblem.py` (emblem vectorising).
