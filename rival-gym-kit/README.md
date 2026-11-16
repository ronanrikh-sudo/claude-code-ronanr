# Rival Gym × CAGECRAFT — Custom Fight Kit (front concepts)

Rival Gym kit built on the CAGECRAFT **Legacy** fight kit: black base garments, the Legacy
oval rebuilt around the Rival wordmark, and the Legacy circuit pattern at the hem.

## Concepts
| Idea | Oval / swoosh / sparkles | RIVAL | GYM + rule | Hem pattern |
|------|------|------|------|------|
| **A**   | White | Red | White | Red |
| **B.1** | Red   | Red | Red   | Red |
| **B.2** | White | White | White | White |

Rival Red sampled from the supplied logo: **#C10212**. Off-white print: #F4F4F2.

## Products (front only)
- **Training Tee**: chest oval, no hem pattern.
- **Rashguard**: chest oval and hem pattern (raglan, mesh side panels, Legacy-style).
- **Mid-Length MMA Shorts**: single layer (not 2-in-1), longer than Legacy, side slits; oval over the crotch area and pattern at the hem.

## Deliverables
- `out/deck/Rival-Gym-Fight-Kit-Concepts.pdf`: 6-slide presentation deck
- `out/deck/*.png`: the same slides at 3840×2160
- `out/products/{tee,rashguard,shorts}_{A,B1,B2}.png`: 2000×2500 flat-lay mockups (4:5, matches Shopify shots)
- `out/artwork/rival-oval_{A,B1,B2}.svg`: vector oval lockups

## How it's built
- `scripts/trace_logo.py`: vectorises RIVAL / GYM / rule from `assets/rival-logo-source.png`
  (un-skews the italic, traces, snaps, re-skews) → `assets/rival_paths.json`
- `scripts/emblem.mjs`: the oval (crescent ring, comet swoosh, sparkles, wordmark, GYM lockup) and colourways
- `scripts/pattern.mjs`: Legacy-style hem pattern (lane-grid traces, mirrored motifs, hem fringe)
- `scripts/garments.mjs`: garment templates and fabric shading
- `scripts/build.mjs`: renders product PNGs and transparent cut-outs (Playwright)
- `scripts/crop_cutouts.py`: crops cut-outs for the deck
- `scripts/boards.mjs`: builds the deck PNGs and PDF
- `scripts/artwork.mjs`: exports the oval SVGs

```bash
cd rival-gym-kit
python3 scripts/trace_logo.py assets/rival-logo-source.png assets/rival_paths.json
node scripts/build.mjs out/products
python3 scripts/crop_cutouts.py
node scripts/boards.mjs
node scripts/artwork.mjs
```

Next: back designs (and sleeve details) once a direction is chosen.
