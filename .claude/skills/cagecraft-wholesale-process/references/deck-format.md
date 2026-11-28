# Deck format — CAGECRAFT client presentation

The deck is what the user presents and sends to the client, so it must stand on its own: every slide is self-explanatory, nothing overlaps, and the garments are large enough to judge. Built by `scripts/boards.mjs` (HTML slides → Playwright screenshots → PDF). See `assets/examples/rival-deck-*.jpg` for the finished look.

## Outputs
- `out/products/<product>_<idea>.png` — 2000×2500 (4:5) flat-lay on the studio background, matching the Shopify product shots. Backs are `<product>-back_<idea>.png`.
- `out/products/cutouts/` — same renders with a transparent background (garment + shadow only); `cutouts_cropped/` crops them to the alpha bbox + 12 px and writes `meta.json` (w, h) for the boards. Regenerable; gitignored.
- `out/deck/NN_<slug>.png` — 1920×1080 CSS px slides rendered at deviceScaleFactor 2 (3840×2160).
- `out/deck/<Client>-Fight-Kit-Designs.pdf` — one slide per page, JPEG-compressed (q90) rasters, 1920×1080 px pages, ~2–3 MB.
- `out/artwork/*.svg` — vector emblem and back lockups per colourway for production.
- The deck script clears `out/deck/` first so stale slides never survive a restructure.

## Slide list (final, front + back)
1. **Cover** (dark, #0d0d0d): kicker "Custom fight kit · Concept proposal", "Designed by CAGECRAFT" credit top right, the hero emblem large and centred, title "CUSTOM FIGHT KIT" (FIGHT KIT in brand colour), one-line product list ("… — front & back in two colourways"), the hem pattern in brand colour fading up from the bottom edge, footer "BUILT ON THE CAGECRAFT LEGACY FIGHT KIT" / month + year.
2. **The centrepiece** (e.g. "The Rival oval"): one dark tile per colourway with the emblem, idea label + one-line colour spec; below, a white card with the client's original logo and three short notes (wordmark redrawn + hex, how the lockup was adapted, Legacy DNA).
3. **Co-branded backs**: 2×2 dark tiles — tops back-neck lockup and shorts waistband lockup, per colourway, large enough to read.
4–7. **Per idea, Front then Back**: kicker "Concept n of N · Front/Back", title "IDEA A · BACK" (letter in brand colour, view in grey), one-line rationale; the three garments side by side at one shared scale with uppercase product captions + one-line construction/placement notes; colour chips in the footer (Base, Oval, Wordmark, Secondary, Pattern).
8. **Side by side**: "Choose your colourway" — a column per idea, Front row and Back row, every garment at a shared scale; footer next step: "Next: confirm A or B.2, plus sizes and quantities per item, and we'll send through the invoice."

Front-only rounds use: cover, centrepiece, one board per idea, side by side ("Pick your direction", next step = back designs).

## Layout and typography
- Light boards: radial studio gradient `#e2e2e0 → #d2d2d0 → #bdbdbb`; margins 84 px; header at top 66 px.
- Fonts (installed locally, no network): **Inter Display** 900 for titles (64 px, uppercase, −0.01em); **Inter** for body. Kickers: 600, 15 px, 0.28em tracking, uppercase, #6a6a6a. Captions: Inter Display 800, 19 px, 0.14em, uppercase. Notes: Inter 500, 15 px, #5d5d5d.
- Brand colour for emphasis words only (one per title).
- Credit: "DESIGNED BY" + the CAGECRAFT wordmark (inverted to black on light slides).
- Footer: left = colour chips or next-step line; right = "CLIENT × CAGECRAFT — NN".
- Garment scale on boards: `k = min(0.42, 640 / tallest cut-out height)`; side-by-side uses a smaller shared k that fits three garments per 850 px column.
- Emblems on slides are inline SVG (crisp at 4K), not PNGs.

## Product shot spec
- 2000×2500, garment centred, ~55–70 % of canvas height, studio gradient + grain, soft drop shadow + contact shadow.
- Same lighting/shading recipe across all products so the kit reads as one shoot.

## Order catalogue (sent with the invoice)
Once sizes and quantities are confirmed, a short A4 portrait PDF (`scripts/catalog.mjs`, 5 pages for 3 garments) shows the client exactly what they're getting. It reads like a product catalogue, not a pitch:
1. **Cover:** dark top with the co-brand lockup (`topsLockup`), "TEAM KIT", "Prepared for <client>", the hem pattern fading up to a thin brand-colour rule; light studio stage below with every garment front at one shared scale, captioned with name + quantity; footer: order number · total pieces / Designed & made by CAGECRAFT.
2. **One page per garment:** full-bleed studio panel with front and back side by side (captions FRONT / BACK), mini lockup + "Team kit catalogue" running header; then number + category, big uppercase name, one spec line (cut · print · idea), two-sentence blurb, quantity large on the right with colour chips; three close-up tiles (Front / Back / Hem-Legs-Finish) with one-line captions; size breakdown as seven size tiles with the majority sizes in black.
3. **Your order:** dark header with the hem pattern, product cards, the full size grid with per-size totals (grand total in brand colour), an invitation to change sizes before production, the payment-to-gym timeline, and a signed thank-you.
- Close-ups are rendered from the vector product SVGs at ~3.5× (crisp in print), not cropped from the PNGs; cut-outs are resized to 3 px per CSS px to keep the file email-sized (~6 MB).
- Order data (quantities, sizes) lives in `scripts/order.mjs`, shared with the invoice, so a size change is made once.
- No prices, costs or bank details: the invoice carries those. The script warns if any page's content runs into its footer; look at every page preview in `out/catalog/preview/` before sending.

## Delivery
1. Commit the project folder (scripts, assets, out/products PNG + SVG, out/deck, out/artwork) on the session branch and push.
2. `SendUserFile` the PDF with `display: "render"`, then the product PNGs as one batch with a short caption.
3. Reply: what you made (one line per deliverable), design decisions worth knowing (one-line reasons), honest flags, and where files live. Offer a shareable web page version in one line rather than publishing a client's logo to a URL unasked.
