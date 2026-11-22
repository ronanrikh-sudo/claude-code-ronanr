# WAR FC × CAGECRAFT — Event Fight Shorts (proposal, round 1)

Pitch to WAR Fighting Championships for official event fight shorts, built in the
`cagecraft-wholesale-process` format (see `.claude/skills/cagecraft-wholesale-process`).

## Brief
- Two cuts: **Fight Short** (loose, side splits) and **Compression Short** (tight, vale-tudo cut)
- Brand colours red / black / white. WAR Red **#ED1C24**, taken from the client's SVG
- Logos: WAR FC (client vector SVG from their Drive), AX Carpentry (presenting sponsor, client PDF converted to SVG, run in white), CAGECRAFT
- Inspiration: professional promotion uniforms (Eternal MMA, Venum UFC); logos integrated, on-brand pattern
- Commercial: in-kind sponsorship (CAGECRAFT on posters, venue access, social features)

## Design system
- **Two corner colourways**: Black Corner (black base, red panels) and Red Corner (red base, black panels), so opponents are instantly distinguishable
- **Tonal crown monogram** background (geometric crown from the logo plus its spear bars)
- **Brush-streak side panels** echoing the logo's distressed speed streaks, with quiet zones around every logo
- **Logo slots**: WAR FC primary on the front leg; AX Carpentry on the opposite front leg and the back of the leg; CAGECRAFT on the waistband (front and back; repeated band on compression); vertical WAR on both side panels; full WAR FC crest with PROVE YOU BELONG on the back; crown on the waistband

## Outputs
- `out/deck/WAR-FC-Fight-Shorts-Proposal.pdf`: 9 slides (cover, design system, logo placement map, 4 product boards, full set, partnership and next steps)
- `out/products/{fight-short,compression}_{black,red}_{front,back}.png`: 2000×2500 mockups

## Build
```bash
cd war-fc-kit
node scripts/measure_logos.mjs
node scripts/build.mjs out/products
python3 scripts/crop_cutouts.py
node scripts/boards.mjs
```
Scripts: `brand.mjs` (logo groups, recolouring, crown motif), `kit.mjs` (shared rendering kit from the Rival pipeline), `shorts.mjs` (both cuts, colourways, pattern, panels, logo slots), `boards.mjs` (deck).
