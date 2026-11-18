# CAGECRAFT Black Friday: product-grid ads

This project builds the "price-tag grid" ad format: a stack of product cards on a solid
brand-colour story, each card with a black Friday badge and WAS/NOW price tags. The layout and
colours are CAGECRAFT's own: Tiffany teal and Cotton Candy pink from the Fight Jersey 2.0 prints,
an extended heavy italic for display text, and on-model photos from the store.

Everything is rendered from data. Change the offer or the products, run one command, and every
price, badge and file updates.

## Outputs (`out/`)

| File | Size | Use |
|---|---|---|
| `story-<id>.mp4` | 1080×1920, ~12–14 s | Story or Reels ad. It holds on the hero, scrolls slowly through the grid, then settles on an end card. |
| `story-<id>.png` | 1080×1920 | Static story (the video's first frame). The part-visible bottom row is deliberate and hints that there is more. |
| `feed-<n>.png` | 1080×1350 | 4:5 feed post with a 2×2 grid and a headline. |
| `cards/<product>.png` | 1080×1080 | One card per product, for carousel ads. |

Stories in `config.json`:

- **tiffany**: deep teal background with the Fight Jersey 2.0 Tiffany as the hero.
- **cottoncandy**: plum background with the Walkout Hoodie Cotton Candy as the hero.
- **concrete**: charcoal background with no hero, so the grid starts straight away.

## Card anatomy

```
┌──────┬───────────────────────────┐
│ LOGO │                 BLACK FRIDAY │  badge: teal eyebrow, outlined 40% OFF,
│      │                   40%OFF     │  EVERYTHING, pink NOW LIVE pill
│      │                  EVERYTHING  │
│ NAME │       photo                 │
│  —   │                 [WAS $79.95] │  white tag with a marker strike
│COLOUR│               [NOW $47.97]   │  black tag, bigger
└──────┴───────────────────────────┘
 strip: black → Tiffany teal, text runs bottom-to-top
```

Every size inside a card is in container units (`cqw`), so a card looks the same at 467 px in
the grid, 964 px as the hero and 1080 px as a single card.

## Running it

```bash
npm install                 # fonts (@fontsource Archivo variable)
npm run images              # download product photos from the Shopify CDN -> assets/img/
npm run render              # everything -> out/
node scripts/render.mjs --only story --no-video   # quick static check
node scripts/render.mjs --only cards
```

You need Node 18+ and ffmpeg. Playwright is loaded with `require`, so either a global install or
`npm i -D playwright` works.

## Changing things

- **Offer**: set `config.json → offer.percentOff`. Every NOW price is recalculated from the live
  price (`price × (1 − pct)`, rounded to the cent). The badge wording is `eyebrow`, `tagline` and
  `pill`.
- **Products**: `products.json` holds the name, colour, AUD price, Shopify image path and crop.
  `focus` is the CSS `object-position` and `zoom` scales the photo inside the card. After adding a
  product, run `npm run images`.
- **Stories**: `config.json → stories[]` sets the background gradient, an optional hero and the grid
  order. Keep the grid to an even number of items so the last row is full.
- **Scroll speed**: change `pxPerSec`, `hold0` and `hold1` in `scripts/render.mjs`.

## Before it goes live

- **The 40% is a placeholder.** On 18 Nov 2026 Shopify had no Black Friday discount. The only
  scheduled sale was the tiered Cyber Monday "20/25/30% off fightwear" (30 Nov to 5 Dec AEDT). A flat
  "40% off everything" claim and its NOW prices must match a real discount, either automatic or
  applied at the price level, for the whole time the ad runs.
- The WAS prices are the current regular prices from Shopify. Re-check them if prices change before
  launch.
- The grids only use products that were in stock on 18 Nov. Remove any that sell out.
- Instagram's UI covers about the top 250 px and bottom 340 px of a story. The cards start at
  236 px, and in the video the end card sits clear of the bottom CTA area.
