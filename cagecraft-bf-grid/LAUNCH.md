# Launch the CAGECRAFT "Fight Cards" carousel in the live BFCM campaign

You are picking up a task that's already prepared. The creative is built and checked. What's left is
hosting the images, creating the Meta ads and switching them on. The owner has already approved
launching these ads into the live campaign.

## Context

- **Brand:** CAGECRAFT, an Australian fightwear store on Shopify (cagecraftco.com, prices in AUD).
- **Sale:** the Black Friday / Cyber Monday sale ("BFCM") is live from 20 Nov 2026 and ends **Sunday 29 November**.
  - It's done with Shopify prices: compare-at price = WAS, price = NOW.
  - Fightwear (jerseys, rashguards, shorts) is **30% off**. Hoodies and tees are **25% off**.
  - It is **not** "40% off everything". Don't use that wording anywhere.
- **Ad format:** a static carousel of 10 product cards. Each card opens its own product page. In
  Instagram Stories people tap through the cards, and "Expand story" shows the rest.

## Files

- **Repo:** `ronanrikh-sudo/claude-code-ronanr`
- **Branch:** `claude/zen-edison-4lendn`
- **Folder:** `cagecraft-bf-grid/out/meta/`, which contains:
  - `cagecraft-bfcm26-01-jersey-tiffany.jpg` … `cagecraft-bfcm26-10-rash-legacy.jpg`: the 10 cards
    (1080×1080 JPEG), numbered in card order.
  - `carousel.json`: the full ad spec, ready to use. It holds the ad account, campaign, page, Instagram
    account, primary text, fallback link, URL tags, and each card's image, link, headline,
    description and button. It also lists the three ads (ad set ID and ad name).
  - `cagecraft-bfcm26-carousel-cards.zip`: the same 10 images zipped.
- `cagecraft-bf-grid/README.md` explains the generator, if anything needs re-rendering.

## Meta IDs (also in carousel.json)

- **Ad account:** `1352534789671603`
- **Campaign:** `120253868775770730` ("BFCM SALE | NOV 20"). It's a Sales campaign with a shared
  A$300/day budget, linked to the Shopify catalog.
- **Facebook Page:** `639726185901204`
- **Instagram account:** `17841471928368610`
- **URL tags** (same as the existing BFCM ads):
  `utm_source=meta&utm_medium=paid_social&utm_campaign=bfcm26&utm_content={{ad.name}}`

The three ads to create:

| Ad set | Ad set ID | Ad name |
|---|---|---|
| PROSPECTING \| BROAD ADV+ \| BFCM | `120253868794740730` | CAROUSEL \| BF Fight Cards \| BFCM |
| LOOKALIKE \| PURCHASERS 1% \| BFCM | `120253868795500730` | CAROUSEL \| BF Fight Cards \| LAL BFCM |
| RETARGETING \| WARM \| BFCM | `120253868795150730` | CAROUSEL \| BF Fight Cards \| RT BFCM |

## Card order and the prices printed on each card

| # | Product | Was | Now | Product page |
|---|---|---|---|---|
| 1 | Fight Jersey Tiffany | $79.95 | $55.96 | /products/fight-jersey-2-0-tiffany |
| 2 | Walkout Hoodie Cotton Candy | $109.95 | $82.46 | /products/walkout-hoodie-cotton-candy |
| 3 | Legacy 2-in-1 MMA Shorts | $89.95 | $62.96 | /products/legacy-2-in-1-hybrid-mma-shorts |
| 4 | Walkout Hoodie Diamond | $109.95 | $82.46 | /products/walkout-hoodie-diamond |
| 5 | Fight Jersey Cotton Candy | $79.95 | $55.96 | /products/fight-jersey-2-0-cotton-candy |
| 6 | MENACE Oversized Tee | $64.95 | $48.71 | /products/menace-oversized-tee |
| 7 | Champion Gold Rashguard | $79.95 | $55.96 | /products/champion-gold-rashguard |
| 8 | Walkout Hoodie Concrete | $109.95 | $82.46 | /products/walkout-hoodie-concrete |
| 9 | Fight Jersey Diamond | $79.95 | $55.96 | /products/fight-jersey-2-0-diamond |
| 10 | Legacy Rashguard | $79.95 | $55.96 | /products/legacy-rashguard |

All links are on `https://www.cagecraftco.com`.

## Steps

### 1. Check prices and stock in Shopify

Check all 10 products in Shopify:

- Each one is active and in stock.
- The variant **compare-at price** matches the Was column above.
- The variant **price** matches the Now column above.

The prices are printed into the images, so they must match the store. If any product doesn't match
or is out of stock, **stop and tell the owner** before going further.

To re-render a card with new prices:

1. Edit `price` (was) and `sale` (now) for that product in `cagecraft-bf-grid/products.json`.
2. Run `npm install`, then `node scripts/render.mjs --only cards`.
3. Re-export `out/cards/1x1/<id>.png` to JPEG.

This needs Node, ffmpeg and Playwright.

### 2. Host the 10 images

Use whichever works:

- **Meta ad image library (preferred):** upload each JPEG with `ads_create_upload_url`, then
  `ads_finalize_upload` to get an image hash. Or use `ads_creative_upload_media` with a public URL.
- **Shopify Files:** run `stagedUploadsCreate` (resource IMAGE, POST), upload each file to the staged
  target, run `fileCreate` with the `resourceUrl`, then use the resulting cdn.shopify.com URLs.

### 3. Create one static carousel creative

Use `ads_create_creative`, filled from `carousel.json`:

- **Basics:** `name` "BFCM26 | BF Fight Cards | Carousel", `page_id`, `instagram_user_id`, `message`,
  `link_url` (the fallback), `call_to_action_type` SHOP_NOW, `url_tags`.
- **`cards`:** 10 cards in the order above. Each card has its image hash or URL, `link`, `headline`,
  `description` and `call_to_action_type` SHOP_NOW.
- **Turn off image-altering Advantage+ enhancements.** The prices and text are part of the image, so
  Meta must not crop, expand, retouch or overlay it. Opt out of `image_brightness_and_contrast`,
  `image_touchups`, `image_uncrop`, `image_templates` and `image_background_gen` through
  `degrees_of_freedom_spec`. If one isn't accepted for carousels, drop just that one.
- **Don't set `self_ai_disclosure`.** That's the owner's call; ask them if it comes up.

### 4. Preview before launching

Use `ads_get_ad_preview` on the creative with `INSTAGRAM_STORY` and `INSTAGRAM_STANDARD`. Check that:

- all 10 cards show in order;
- the cards aren't cropped, so the badge, the nameplate and the WAS/NOW prices are fully visible;
- each card's link goes to its own product page.

### 5. Create and switch on the three ads

1. Create each ad with `ads_create_ad`, using `{"creative_id":"<id>"}`, the ad set ID and the ad name.
   They are created paused.
2. Confirm each ad set is still ACTIVE.
3. Activate each ad with `ads_activate_entity`. The owner has already approved this launch.

### 6. Verify and report back

Read the three ads with `ads_get_ad_entities`, checking `effective_status` and delivery. Then report:

- the creative ID;
- the three ad IDs;
- each ad's status, including whether it's in review;
- the preview links.

## Don't

- Edit, pause or delete any existing ad, ad set, budget or campaign setting.
- Change Shopify prices, products or the Meta catalog.
- Use "40% off everything" wording.
- Launch if any price on a card doesn't match the store.
- Retry a failed write blindly. If a step fails, stop and report what happened and why.

## Possible follow-up (not part of this task)

Muscle Nation's version is a catalog carousel, where Meta picks products per viewer, with a branded
image template. That template has to be built by hand in Commerce Manager, using
`cagecraft-bf-grid/out/template/` (frame PNGs, numbered guides and `layers.json`). Once it exists, a
catalog version of this ad can be added next to the static one.
