# CAGECRAFT: Fight Jersey 2.0 re-edit (9:16 Meta ads, 3 hooks)

This is a re-edit of the account's winning rooftop jersey video, "AD 3 | JERSEYS FL ROOFTOP"
(Meta video 1115083488043854). The original opened on 3.5 s of fade from black. Only about 12% of
viewers got past about 3 seconds, and the video had no on-screen text.

This edit makes these changes:
- It cuts the fade-in.
- It opens on the brightest shot, with the hook on screen from the first frames.
- It adds titles in the brand's type.
- It replaces the fade-out with a free kit bag end card.

**Look:** "Cube Noir", shared with `cagecraft-sale/`:
- Black and white, with extended heavy italic Archivo caps that echo the wordmark.
- Two accents, sampled from the jerseys in the footage: Diamond `#35C6F2` and Cotton Candy `#F49AD8`.
- Signature device: a split hairline, half Diamond and half Cotton Candy.
- Film grain and vignette.
- A teal-to-pink light sweep across the key words.
- Punchy springs.

## Deliverables (`out/`)

| File | Hook (first 1.7 s) |
|---|---|
| `CAGECRAFT-FightJersey2-Restock-9x16.mp4` | FIGHT JERSEY 2.0 / **JUST RESTOCKED** |
| `CAGECRAFT-FightJersey2-Colourway-9x16.mp4` | **DIAMOND** or **COTTON CANDY?** |
| `CAGECRAFT-FightJersey2-KitBag-9x16.mp4` | **FREE KIT BAG** / WITH ANY ORDER, with the kit bag dropping in |

Each version also has a `-thumb.jpg`, made from frame 30 with the hook fully in. Upload it as the
ad thumbnail.

The video specs:
- 1080×1920, 30 fps, 10.0 s.
- H.264 High (CRF 16) with AAC 320k.
- Audio mastered to about −14 LUFS.

All text sits between y = 290 and y = 1240. That keeps it clear of the Reels UI (the top 14% and
the bottom 35%) and inside the 4:5 feed crop (y 285–1635), so one 9:16 file covers Reels,
Stories and Feed.

## The edit

| Frames | Time (s) | Shot | On screen |
|---|---|---|---|
| 0–58 | 0.00–1.97 | Backs, both jerseys | The hook (one of three) |
| 59–116 | 1.97–3.90 | Diamond close-up | COLOURWAY 01 / DIAMOND |
| 117–175 | 3.90–5.87 | Cotton Candy close-up. The music drop lands on this cut. | COLOURWAY 02 / COTTON CANDY |
| 176–233 | 5.87–7.80 | Fronts, 2× slow motion | DIAMOND · COTTON CANDY / FIGHT JERSEY / 2.0 |
| 234–299 | 7.80–10.0 | End card over the defocused fronts | Logo, kit bag, FREE KIT BAG, WITH ANY ORDER, SHOP NOW →, CAGECRAFTCO.COM, "One kit bag per customer." |

- **Music:** the original ad's track, unchanged, started at its bar line at 1.445 s. The track is
  123 BPM, so one bar is 58.5 frames. Every picture cut lands on a downbeat.
- **Sound effects** (brand set from `cagecraft-sale/assets/sfx`), all kept low:
  - a slam on the open;
  - a whoosh into the end card;
  - a logo sting;
  - a click on SHOP NOW.
- **Footage:** Meta's 720p rendition. The Drive original is over the connector's 10 MB limit. The
  footage was lightly denoised, upscaled with lanczos to 1080×1920 and gently sharpened. All type
  and graphics render natively at 1080p.

## Ad copy to pair with each version

**Restock**
- Headline: Fight Jersey 2.0, Back In Stock
- Primary text: Back in stock: the Fight Jersey 2.0 in Diamond and Cotton Candy. Lightweight,
  breathable and cut to move. Built for the gym, worn everywhere else. Free kit bag with any order.

**Colourway**
- Headline: Diamond or Cotton Candy?
- Primary text: Diamond or Cotton Candy? The Fight Jersey 2.0 is lightweight, breathable and cut
  to move. Pick your side. Free kit bag with any order.

**Kit bag**
- Headline: Free Kit Bag With Any Order
- Primary text: Free kit bag with any order. Grab the Fight Jersey 2.0 in Diamond or Cotton
  Candy: lightweight, breathable, cut to move.

**All three**
- Description: One kit bag per customer.
- CTA: Shop Now.
- Destination: `https://www.cagecraftco.com/products/fight-jersey-2-0-cotton-candy`, the same as
  the original ad.

"Free kit bag with any order · one per customer" matches the FREEKITBAG discount: buy any item,
get one kit bag free, one use per customer. It also matches the corrected pop-up copy.

## Rebuild

```bash
npm install
scripts/build_plate.sh public/footage/source-meta-720p.mp4                       # -> public/footage/footage.mp4
scripts/mix.sh public/footage/source-meta-720p.mp4 ../cagecraft-sale/assets/sfx public/audio/mix.wav
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
node scripts/stills.mjs Restock 30 85 145 205 262 --safe   # QC stills with the safe zones drawn on
node scripts/render.mjs                                     # all three versions + thumbnails
```

Code map:
- `src/Ad.tsx`: the plate (per-shot framing, push, zoom-through), the type system and the three
  hooks, the colourway titles, the product title, the end card, and the finish.
- `src/theme.ts`: the look tokens and `fit()`, which sizes a display line to the safe width using
  the real font.
- `src/config.ts`: the cut frames and the safe area.
