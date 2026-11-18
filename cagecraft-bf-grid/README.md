# CAGECRAFT Black Friday: "Fight Card" product ads

Product cards for Black Friday in CAGECRAFT's own look, rendered from Shopify data:

- an **octagon (cage) discount badge** with a Black Friday tab and an "Everything" tab
- a **full-bleed on-model photo**
- a **slanted black nameplate** with a Tiffany-teal edge and chain-link mesh
- a **"tale of the tape" price box**: WAS and NOW rows with labels on the left and prices on the right

The colours are Tiffany teal and Cotton Candy pink from the Fight Jersey 2.0. The type is Archivo
extended heavy italic, which echoes the wordmark.

## Making it shoppable (tap a product, land on that product)

The "tap a product and swipe" behaviour comes from **Meta's ad format, not from the image**. In
Instagram Stories a **carousel** ad shows 1 to 5 cards and then **Expand story** for up to 10. Each
card opens its own link. With a **catalog** carousel, each card is a product from the catalog and
opens that product's page. That is almost certainly how Muscle Nation's ad works: every card has the
same layout, the product name and prices are filled in per product, and "Expand story" sits under the
page name.

There are two ways to get the same behaviour. Both use the artwork in this folder.

### A. Advantage+ catalog carousel with an image template (recommended)

Meta picks the products for each viewer, and prices come live from the catalog. CAGECRAFT already has
this connected: the catalog "Shopify Product Catalog (j1jz2k-tn.myshopify.com)" has 32 products
(183 variants), syncs from Shopify, is eligible for catalog ads and is linked to the pixel.

1. **Put the sale price into Shopify.** On 18 Nov every product in the Meta catalog had an empty
   `sale_price`. For each product in the sale, set **Compare-at price** to today's price and **Price**
   to the Black Friday price. The Facebook & Instagram channel syncs these to the catalog as `price`
   and `sale_price`. The product pages then show the same prices as the ad, which Meta requires.
   Change them back when the sale ends.
2. **Build the image template** in Commerce Manager → the Shopify catalog → *Image templates* →
   *Create*. Use 1:1, then copy the design into 4:5 and 9:16. For each ratio:
   - **Layer 0, product layer.** Fill the canvas. Use image **1** for most products: Shopify's second
     image is usually the on-model shot. Image **0** is the flat lay; with *background removal* turned
     on, that gives a clean product-on-black look instead.
   - **Image layer: `out/template/frame-<ratio>.png`.** Place it at full canvas size, above the product.
     It contains the badge, wordmark, nameplate, scrims and the WAS/NOW labels.
   - **Catalog field layers** (white, bold), positioned from `out/template/layers.json`, with
     `out/template/guide-<ratio>.png` as a visual check:
     - **title**: left-aligned, two lines max
     - **price**: grey, right-aligned; turn on strikethrough if the editor offers it
     - **current price**: large, right-aligned
   - **Conditional display on the price layers**: show them only when a sale price exists, so products
     without one never show "WAS = NOW".
3. **Create a product set**, for example "BF: in stock": availability = in stock, excluding the Gift
   Card and Lanyard.
4. **Set up the ad in Ads Manager:**
   - **Campaign:** Sales objective, Advantage+ catalog ads on, choose the Shopify catalog.
   - **Ad set:** select the product set.
   - **Ad:** Carousel format, then choose your image template.
   - **Advantage+ creative:** turn **off** dynamic overlays and background generation (Meta's help
     says both can cover the template). Keep image touch-ups on so the 4:5 and 9:16 versions can be
     used.
   - **Placements:** include Instagram Stories.

Image templates are built in Commerce Manager's editor, which none of the API tools here can reach,
so step 2 is done by hand. It takes about 20 minutes per ratio with the guide open.

### B. Manual carousel with these exact cards (fastest)

Upload up to 10 cards from `out/cards/1x1/` (or `4x5/`) as a carousel ad. Give each card its product
link, `https://www.cagecraftco.com/products/<handle>`, using the handles in `products.json`. In Stories
the cards behave the same way: tap a card to open its product, and use Expand story to see the rest.

The trade-offs:

- Everyone sees the same 10 products.
- The prices are baked into the images, so they must match the store for the whole time the ad runs.

### What isn't tappable

`story-*.mp4/png` and `feed-*.png` are single images or videos, good for organic posts and brand-awareness ads. One image
can only link to one place.

## Outputs (`out/`)

| Path | Size | Use |
|---|---|---|
| `cards/1x1/<product>.png` | 1080×1080 | Carousel cards (route B), feed |
| `cards/4x5/<product>.png` | 1080×1350 | Carousel cards for feed placements |
| `template/frame-<ratio>.png` | 1:1, 4:5, 9:16 | Transparent overlay for the Meta image template (route A). The 9:16 version keeps clear of the Stories interface. |
| `template/guide-<ratio>.png` | same | Frame with the dynamic layers numbered |
| `template/layers.json` | n/a | Pixel boxes, alignment and font size for each catalog-field layer |
| `story-<id>.mp4` / `.png` | 1080×1920 | Organic story: scrolling grid ending on a "Shop the sale" card |
| `feed-<n>.png` | 1080×1350 | Organic 4:5 post with headline and a 2×2 grid |

## Running it

```bash
npm install                  # fonts (@fontsource Archivo variable)
npm run images               # product photos from the Shopify CDN -> assets/img/
npm run render               # everything -> out/
node scripts/render.mjs --only cards|template|story|feed [--no-video]
```

You need Node 18+ and ffmpeg. Playwright is loaded with `require`, so either a global install or
`npm i -D playwright` works.

## Changing things

- **Offer**: set `config.json → offer.percentOff`. The badge text is `eyebrow` and `tagline`. Every
  NOW price on the baked cards is recalculated as `price × (1 − pct)`, rounded to the cent. In route A
  the prices come from the catalog instead.
- **Products**: `products.json` holds the display name, colour, AUD price, Shopify image path and crop.
  `focus` is the CSS `object-position` and `zoom` scales the photo. After adding a product, run
  `npm run images`.
- **Stories**: `config.json → stories[]` sets the two light colours, an optional hero and the grid
  order. Use an even number of grid items.
- **Look**: everything is in `src/page.html`. Card sizes are in `cqw`, so one change applies at every
  size.

## Before it goes live

- **The 40% is a placeholder.** On 18 Nov Shopify had no Black Friday discount. The only scheduled
  sale was the tiered Cyber Monday "20/25/30% off fightwear" (30 Nov to 5 Dec AEDT).
- **The ad's prices must match the site.** The ad and the product page have to show the same price,
  and the WAS price must be a genuine recent price.
- **Stock**: the cards only use products that were in stock on 18 Nov. In route A, the product set's
  in-stock filter handles this automatically.
