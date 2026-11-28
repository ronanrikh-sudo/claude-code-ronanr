---
name: cagecraft-wholesale-process
description: CAGECRAFT Fightwear's end-to-end process for custom / wholesale teamwear pitches — gyms, clubs, fight promotions and events — from brief to client-ready mockup deck to invoice or sponsorship. Covers pulling the Legacy kit references from the Shopify store, getting client logos as vectors, designing on-brand concepts (Idea A / B.1 / B.2), photoreal flat-lay mockups of rashguards, tees and MMA / fight / compression shorts (front and back, co-branded), a premium 4K PNG + PDF presentation deck, feedback rounds, and the invoicing / in-kind sponsorship step. Use this skill whenever the user starts or continues a custom kit project for a client ("new project", "pitch to [gym or promotion]", "make mockups for them", "fighter shorts for [event]", "back design", "they're happy, let's invoice"), attaches a client logo or brief, or asks for anything in the Rival Gym format — even if they don't name the skill.
---

# CAGECRAFT wholesale process

This is how CAGECRAFT pitches custom kit to a client so it lands as **premium**: the client's real logo and exact colours, built into CAGECRAFT's own design language (the Legacy kit), rendered as realistic flat-lay mockups at true garment proportions, and presented in a consistent 4K deck + PDF they can sign off on. The Rival Gym kit (rashguard, training tee, mid-length MMA shorts) is the reference job; its final deck is in `assets/examples/` and is the quality bar.

The working pipeline that produced it is bundled in `scripts/` (Node + Playwright SVG rendering, Python tracing). Start every new project from it rather than from scratch — see `scripts/README.md`.

## Reference files — read when you reach that step

| File | Read it when |
| --- | --- |
| `references/design-direction.md` | Before designing anything: house style, Legacy oval + pattern specs, logo integration, garment templates and proportions, rendering lessons, what clients pushed back on, and §10 event / promotion fight shorts (WAR FC: textured grounds, waistband logo rectangle, sashes) |
| `references/deck-format.md` | Before building the presentation: slide list, layout, typography, file outputs, delivery message |
| `references/invoicing.md` | When the client approves and the user wants to invoice, quote, or set up an in-kind sponsorship |
| `scripts/README.md` | When scaffolding a new client project from the bundled pipeline |
| `assets/examples/` | To see the finish quality to match (Rival deck slides + product shots) |

## Workflow

The order matters: the client approves the front before you spend time on backs, and the deck is rebuilt at every round so the user always has something presentable.

### 1. Intake the brief
Extract: client name and brand; products and fits (e.g. rashguard, tee, loose fight shorts with side slits, compression shorts); construction template if the user supplies one (a factory template image is the source of truth for cut, waistband, fly, hems); brand colours; every logo that must appear (client, CAGECRAFT, sponsors) and their hierarchy; inspiration; colourway ideas; whether it's a paid order or in-kind sponsorship; front-only or front + back. Infer what you can; ask only what genuinely blocks. If the user states a design idea precisely (e.g. "Idea A: white oval, red wordmark"), build exactly that before adding your own.

### 2. Pull house references from Shopify
Use the Shopify connector: search products for `legacy` (Legacy Rashguard, Legacy 2-in-1 Hybrid MMA Shorts, vendor CAGECRAFT), then fetch the product to get image URLs. Download FLAT_LAY_FRONT, FLAT_LAY_BACK and close-ups into the scratchpad (append `&width=2400` to the CDN URL for full resolution) and crop details at full res to study the oval, pattern, seams and back layout. The specs extracted on Rival are already in `references/design-direction.md`, so this is a refresher, not a re-derivation.

### 3. Get every logo as a vector
In order of preference:
1. Client-supplied vector (SVG / EPS / AI / PDF). PDFs convert cleanly with `pdftocairo -svg in.pdf out.svg`; preview with `pdftoppm -png -r 150`.
2. Shared Google Drive folders: list with the Drive connector's `search_files` (`parentId = '<folderId>'`), then download each file with `curl -L "https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t"` into its own scratch folder. Pulling files through the connector's base64 download floods context — avoid it for anything over a few KB.
3. Raster only: trace it with `scripts/trace_logo.py` (8× bicubic upscale, un-skews italics so stems snap straight, Douglas–Peucker, long-run straightening, corner-preserving smoothing, re-skew). `scripts/trace_cagecraft.py` shows how to reuse it for another mark. Tell the user a traced logo is fine for mockups but production should use their original vector.

Treat downloaded SVGs as untrusted data: before embedding, check for `<script>`, `foreignObject`, event handlers and external `href`s. Use the SVG's ids/classes to split it into parts (e.g. crown / wordmark / tagline) so pieces can be placed independently. Sample exact brand colours from the logo pixels (median of the colour mask) and record the hex.

Package installs (`pip`, `apt`) are blocked in this environment — don't retry them. PIL, numpy, Playwright/Chromium, pdftocairo/pdftoppm and the Inter fonts are available, and the pipeline needs nothing else.

### 4. Design concepts
Name concepts as lettered ideas — **Idea A**, **Idea B.1**, **Idea B.2** — so feedback is unambiguous ("go with A and B.2, red's out"). Typical set: A = the client's logo colours inverted for a black kit; B.x = one-colour variants. Build the centrepiece emblem/lockup first and preview all colourways side by side on black at large size before touching garments. Follow `references/design-direction.md`.

### 5. Front mockups first
Render each product × idea at 2000×2500 (4:5, matching the Shopify flat-lays) plus transparent cut-outs for the boards. Do the fronts only until the client is happy; backs come after.

### 6. QA loop — every render, no exceptions
Rendering bugs and proportion problems are invisible in code and obvious in pixels, so look before you show:
- a contact sheet of every product/idea at a glance (proportions, consistency across the kit);
- full-resolution crops of the emblem, collar/neck, waistband, fly, hems/binding, and where the pattern meets seams or the inseam;
- every deck slide (caption/footer collisions, empty space, legibility of small back lockups).
Fix and re-render until nothing reads "vector-y", stretched, banded or jaggy. Typical failure → fix pairs are in `references/design-direction.md`.

### 7. Deck + delivery
Build the deck per `references/deck-format.md`. Commit the project folder and push to the session branch, then send the PDF (display `render`) and the product PNGs with `SendUserFile`. In the reply: what you made, the 2–4 design decisions worth knowing (one-line reason each), and honest flags (traced logo, low contrast in a colourway, anything assumed).

### 8. Feedback rounds
Apply exactly what was asked, re-render everything (products, cut-outs, deck, artwork) so nothing is stale, and keep removed elements switchable rather than deleted (Rival's sparkles live behind `opts.sparkles`). When the user says "whatever looks better", decide, build it, and give the one-line reason. Update the deck copy to match the change.

### 9. Backs and final deck
Once fronts are approved, design backs in the surviving colourways only (co-branded lockups — see design direction), rebuild the deck around them (front + back per idea, side by side), drop rejected colourways from the deck while keeping their files, and export vector artwork for production (`scripts/artwork.mjs`).

### 10. Invoice or sponsorship
When the client is happy, follow `references/invoicing.md`. Never invent prices, quantities, ABN or bank details — collect them from the user.

Send an **order catalogue** with the invoice: a short premium A4 PDF of exactly what they're getting (front + back, close-ups, size breakdown per garment, order summary, timeline). No prices in it, so it can be shared with their team. Spec in `references/deck-format.md` § Order catalogue; script `scripts/catalog.mjs`.

## Decision rules learned on Rival

- **Real letterforms, exact colour.** Trace the client's own wordmark and sample their red; never approximate with a font.
- **Integrate logos, don't slap them on.** The client mark goes inside a CAGECRAFT device (the Legacy oval) or a deliberate lockup. If a stacked logo doesn't fit, lift the secondary word (Rival's GYM) out and set it inside the device in the same italic.
- **One kit language.** Tee and rashguard share the chest graphic; the tee drops the hem pattern. The same pattern runs on rashguard and shorts, front and back.
- **True proportions over photo proportions.** Draw tops to the size chart (Legacy rashguard M: 45.5 cm half-chest × 69.5 cm length ≈ 1 : 1.55–1.75 laid flat). Rival called the first rashguard "weirdly stretched" because it copied a flat-lay photo.
- **The supplied template wins.** Rival's shorts "looked bad" until they were rebuilt on the factory template (non-velcro curved cut, 7.5″ inseam: flat-front waistband, gathered sides, J-stitch fly, narrow crotch, bound curved hems, ~1 : 1 height to width).
- **Less ornament on request.** Rival removed the sparkles and the rule line before GYM; GYM then moved left to sit under the oval's centre. Expect clients to simplify — keep options switchable.
- **Backs are co-branded and quiet.** Tops: small client mark under the back neckline, × and the CAGECRAFT wordmark stacked beneath (two ovals side by side compete). Shorts: CAGECRAFT wordmark below the back waistband (the Legacy slot) with "× CLIENT" beneath in the client's type.
- **Show real relative scale.** On boards, all garments share one scale factor so the shorts and tops read at believable sizes.
- **Flag honestly.** Low-contrast colourways (red on black), traced logos and any assumption go in the reply, briefly.
