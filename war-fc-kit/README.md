# WAR FC × CAGECRAFT — Event Fight Shorts (proposal, round 2)

Pitch to WAR Fighting Championships for official event fight shorts, built in the
`cagecraft-wholesale-process` format (see `.claude/skills/cagecraft-wholesale-process`).

## Brief
- Two cuts: **Fight Short** (loose, side splits) and **Compression Short** (tight, vale-tudo cut)
- Brand colours red / black / white. WAR Red **#ED1C24**, taken from the client's SVG
- Logos: WAR FC (client vector SVG from their Drive), AX Carpentry (presenting sponsor, client PDF converted to SVG, run in white), CAGECRAFT
- Inspiration: professional promotion uniforms (Eternal MMA, Venum UFC); logos integrated, on-brand pattern
- Commercial: in-kind sponsorship (CAGECRAFT on posters, venue access, social features)

## Round 2 (current)
Round 1 (crown monogram, corner colourways, lace tie) was rejected on style. The user's references were Eternal MMA, Venum UFC Fight Night / Adrenaline and Venum UFC custom fighter shorts. Changes:
- **No external drawstring.** A raised **waistband logo rectangle** at centre front carries the **CAGECRAFT emblem** (traced from the store's back-neck print: `assets/cagecraft_emblem.json`).
- **Concept A, Smoke & Stone**: stone-flake black with red and white smoke rising from the hems and side splits; Greek-key waistband band.
- **Concept B, War Streaks**: tonal claw-streak black with white and red dry-brush sweeps (from the WAR FC logo's streaks); PROVE YOU BELONG sash with red keylines; twin red waistband stripes.
- Placement: WAR FC upper front leg; AX Carpentry lower front leg and back of leg; CAGECRAFT emblem on the waistband panel and wordmark on the back waistband; full WAR FC crest across the back. Textures are cleared behind the logos.

## Outputs
- `out/deck/WAR-FC-Fight-Shorts-Proposal.pdf`: 10 slides (cover, two directions, logo placement, 4 product boards, details, full set, partnership)
- `out/products/{fight-short,compression}_{A,B}_{front,back}.png`: 2000×2500 mockups

## Build
```bash
cd war-fc-kit
node scripts/measure_logos.mjs
python3 scripts/textures.py assets/texture_spec.json
node scripts/build.mjs out/products
python3 scripts/crop_cutouts.py
node scripts/boards.mjs
```
Scripts: `brand.mjs` (logo groups, recolouring, CAGECRAFT emblem), `kit.mjs` (shared rendering kit from the Rival pipeline), `textures.py` (smoke and stone), `shorts.mjs` (both cuts, both concepts, waistband panel, sash, streaks, logo slots), `boards.mjs` (deck), `trace_emblem.py` (emblem vectorising).
