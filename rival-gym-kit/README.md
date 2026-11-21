# Rival Gym × CAGECRAFT — Custom Fight Kit

Rival Gym kit built on the CAGECRAFT **Legacy** fight kit: black base garments, the Legacy
oval rebuilt around the Rival wordmark, and the Legacy circuit pattern at the hem.

## Concepts
| Idea | Oval / swoosh | RIVAL | GYM | Hem pattern |
|------|------|------|------|------|
| **A**   | White | Red | White | Red |
| ~~B.1~~ | Red   | Red | Red   | Red | *(dropped by Rival Gym)* |
| **B.2** | White | White | White | White |

Rival Red sampled from the supplied logo: **#C10212**. Off-white print: #F4F4F2.

## Products
- **Training Tee**: chest oval, no hem pattern.
- **Rashguard**: chest oval and hem pattern (raglan, mesh side panels, Legacy-style), drawn to size-chart proportions.
- **Mid-Length MMA Shorts**: non-velcro curved-cut template (7.5" inseam), single layer (not 2-in-1): elastic waistband with flat front panel, J-stitch faux fly, curved-cut bound hems; oval over the crotch area and pattern at the hem.

## Backs (A and B.2)
- **Tee and Rashguard**: small Rival oval just below the back neckline, with × and the CAGECRAFT wordmark stacked beneath. The rashguard keeps the hem pattern on the back, like the Legacy.
- **Shorts**: CAGECRAFT wordmark below the back waistband (the Legacy back slot), with "× RIVAL GYM" beneath in Rival's italic; hem pattern on the back.

## Deliverables
- `out/deck/Rival-Gym-Fight-Kit-Designs.pdf`: 8-slide deck (oval, co-branded backs, A and B.2 front and back, side by side)
- `out/deck/*.png`: the same slides at 3840×2160
- `out/products/{tee,rashguard,shorts}_{A,B1,B2}.png`: 2000×2500 front flat-lay mockups (4:5, matches Shopify shots)
- `out/products/{tee,rashguard,shorts}-back_{A,B2}.png`: back flat-lay mockups
- `out/artwork/rival-oval_{A,B1,B2}.svg`: vector oval lockups
- `out/artwork/back-lockup-{tops,shorts}_{A,B2}.svg`: vector back lockups

## How it's built
- `scripts/trace_logo.py`: vectorises RIVAL / GYM / rule from `assets/rival-logo-source.png`
  (un-skews the italic, traces, snaps, re-skews) → `assets/rival_paths.json`
- `scripts/trace_cagecraft.py`: vectorises the CAGECRAFT wordmark from `assets/cagecraft-wordmark-source.png` (® dropped for small print) → `assets/cagecraft_paths.json`
- `scripts/emblem.mjs`: back lockups (`topsLockup`, `shortsLockup`) and the oval (crescent ring, comet swoosh, wordmark, GYM) and colourways (sparkles available behind `opts.sparkles`)
- `scripts/pattern.mjs`: Legacy-style hem pattern (lane-grid traces, mirrored motifs, hem fringe)
- `scripts/garments.mjs`: garment templates and fabric shading
- `scripts/build.mjs`: renders product PNGs and transparent cut-outs (Playwright)
- `scripts/crop_cutouts.py`: crops cut-outs for the deck
- `scripts/boards.mjs`: builds the deck PNGs and PDF
- `scripts/artwork.mjs`: exports the oval SVGs

```bash
cd rival-gym-kit
python3 scripts/trace_logo.py assets/rival-logo-source.png assets/rival_paths.json
(cd scripts && python3 trace_cagecraft.py ../assets/cagecraft-wordmark-source.png ../assets/cagecraft_paths.json 0.36)
node scripts/build.mjs out/products
python3 scripts/crop_cutouts.py
node scripts/boards.mjs
node scripts/artwork.mjs
```

Next: Rival Gym confirm A or B.2 plus sizes and quantities, then invoice.
