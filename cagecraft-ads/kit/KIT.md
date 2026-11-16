# CAGECRAFT ad build kit

You are recreating a proven competitor ad format for a CAGECRAFT bestseller. Read this whole file and
`kit/catalog.json` before you design anything.

## The one rule that cannot bend: the garment is real

The owner will only run an ad if the product in it is a truthful depiction: print and logo placement,
colourway, fabric texture (350gsm fleece, polyester mesh), seams, panels, cuffs and fit all exactly as
manufactured. Independent testing shows current image models alter garments in roughly 70% of generations
(logos and lettering first, then prints, colours, added zips and pockets), and mesh is the worst case.

So: **garment pixels never pass through a generative model, in any ad, for any reason.**

| Allowed | Not allowed |
|---|---|
| Real photographs from `library/` (cutouts and photos), placed by translate / uniform scale / rotate / crop | Generating, regenerating, "enhancing", upscaling, relighting, harmonising, inpainting or outpainting any image that contains the garment |
| AI-generated **backgrounds, environments, surfaces, textures, props and b-roll with no clothing product in them**, composited *behind* or *around* the real photograph | Uploading a product photo to an image/video model as a reference, start frame or "product" (no virtual try-on, no AI models wearing it, no image-to-video of the garment, no Higgsfield Marketing Studio / product-ad / avatar tools) |
| Code-drawn layout, type, UI mimics, shapes, gradients, grain, shadows drawn as **separate elements** | Filters, blend modes, tints, colour grading, opacity < 1 (except entrance/exit fades in video) or non-uniform scale on the product layer |
| AI voice-over, music, sound effects, script and copy | AI people, AI hands, AI athletes anywhere near the product |
| Real footage from `library/video/` cut, cropped, captioned | Slow-motion interpolation or AI frame generation on real footage |

If an AI background contains anything that could be read as a garment or a logo, regenerate it or crop it out.
Prefer environments that fit the brand: cage / octagon mesh, gym mats, concrete, lockers, stadium tunnel,
studio paper, asphalt court, night street. Never a different brand's marks.

## Truth rules for copy

All in `kit/catalog.json` → `truth_rules`. In short: no invented specs, reviews, ratings, athlete
endorsements, press quotes, discounts, free shipping, guarantees, countdowns or "selling fast" scarcity.
Prices are AUD ($109.95 hoodie, $79.95 jersey, $89.95 shorts, $79.95 rashguard). The only reviews you may
show are the verbatim ones in the catalogue (Walkout Hoodie), attributed as listed. Do not name or copy the
competitor whose format you are recreating: no competitor names, logos, slogans, copy lines, or lookalike
trade dress. Recreate the **format and persuasion structure**, with CAGECRAFT's own look and words.

Voice: confident, dry, fight-gym Australian. Short lines. Australian spelling. No hype adjectives the
product can't back, no emoji walls, no em dashes.

## Look

`kit/brand.css` (stills) and `kit/remotion/theme.ts` (video) hold the tokens: near-black world, white
type, one accent taken from the colourway in the ad (teal `#16B3B7` for Diamond/Tiffany, pink `#F09EC0` for
Cotton Candy, concrete `#B4B1AB`, navy `#1E2F5C` for Legacy). Display type is Archivo extended heavy italic
caps (`.cc-display`), matching the wordmark; body is Inter Tight. A format that is meant to look native or
lo-fi (Notes app, text thread, sticky note, plain-text "ugly" ad) should look like the real thing instead:
follow the format, not the brand system. Logo: `library/logo/logo-white.png`.

## Workspace

```
cagecraft-ads/
  kit/            this kit (do not edit; if something in it is broken, work around it and say so in your report)
  library/        real product photography (read-only). cut/<slug>/*.png cutouts, photo/<slug>/*, video/*.mp4
  ads/<id>/       YOUR folder. Only write inside it.
```

Never run `npm install` in `cagecraft-ads/` (other builders share `node_modules`). If you truly need an
extra package, install it inside your own `ads/<id>/` folder. Use the scratchpad for throwaway files.

Look at the actual photographs before designing (Read the image files): crop, pose and lighting decide what works.

## Building a still

1. `ads/<id>/ad.html`, body sized to the canvas (default 1080x1350, 4:5), `<link rel="stylesheet" href="../../kit/brand.css">`.
2. Garment cutouts: `<img data-product="cut/<slug>/<file>.png" src="../../library/cut/<slug>/<file>.png">`
   at natural aspect ratio, sized by width only. Shadows are separate blurred elements under it.
   Real photographs used as a cropped photo: any element with `data-photo="photo/<slug>/<file>"`.
   AI-generated imagery: `data-ai="what it is"` on the element.
3. Render: `node kit/render-static.mjs ads/<id>/ad.html --out ads/<id>/out/<id>_4x5`
   (add `--size 1080x1920 --out ads/<id>/out/<id>_9x16` for a Stories/Reels version if the format suits it;
   use a `?v=` query via `--query` or a second html file for the alternate layout).
   Output: `.png` (2x, lossless), `.jpg` (deliverable), `.placements.json`.
4. Prove fidelity: `python3 -I kit/fidelity-check.py ads/<id>/out/<id>_4x5` must print PASS for every
   product. REVIEW means something covers or changed the garment: fix it, or if it is a deliberate overlay
   that hides no logo or print, re-run with `--allow-cover` and say so.
5. Read the rendered JPG yourself and critique it like a creative director: hierarchy, legibility at phone
   size (it will be seen ~375px wide), nothing clipped, no text over the logo/print, safe margins (keep
   key content 60px+ from edges; for 9:16 keep the top 14% and bottom 20% free of key content). Iterate
   until it would stop a thumb. Then do it once more.

## Building a video

9:16, 1080x1920, 30fps, 8 to 20 seconds, built in Remotion. Hook lands in the first 1.5 seconds and must
read with sound off (burned-in captions for any voice-over).

1. `ads/<id>/src/index.ts` (registerRoot) + your compositions; composition id `Main`.
   Import `../../../kit/remotion/fonts`, `theme`, and use `<Product src="cut/..." width=... />` from
   `kit/remotion/Product` for every garment (it only allows geometric placement). Real photos:
   `<Img src={staticFile("lib/photo/...")} />` with crop/scale only. Real footage: `<OffthreadVideo>`.
2. List every library file you use in `ads/<id>/assets.json` (`["cut/...", "photo/...", "video/..."]`);
   the renderer syncs them to `public/lib/`. AI plates and audio go in `ads/<id>/public/` directly.
3. Audio: write the mix to `ads/<id>/audio/mix.wav` (48 kHz stereo, about -16 LUFS, true peak under -1 dBTP).
   Voice-over, music and SFX may be AI-generated. See "AI tools" below. The motion language and the
   voice-to-timing method in `/home/user/claude-code-ronanr/.claude/skills/kinetic-motion-video/` are worth
   reading (`references/motion-language.md`, `references/audio-voice.md`), and
   `/home/user/claude-code-ronanr/cagecraft-sale/` is a finished CAGECRAFT example (its `assets/sfx/` and
   `assets/music/track.mp3` may be reused).
4. Render: `node kit/render-video.mjs ads/<id> --name <id>_9x16` (serialised across builders by a lock; a
   15s ad takes a few minutes; just wait). It writes the mp4 and a contact sheet `out/<id>_9x16.sheet.jpg`.
5. Read the contact sheet and several full-resolution frames
   (`ffmpeg -ss <t> -i out/x.mp4 -frames:v 1 work/f.png`), especially every frame where the garment is on
   screen: it must be the photograph, sharp, unfiltered, logos unobstructed. Check captions are inside the
   safe zone and never sit on the print. Iterate.

## AI tools (budget is shared: be frugal)

Load tools with ToolSearch (`select:<name>`).
- **Higgsfield** for images / b-roll with no product in them: `mcp__Higgsfield__models_explore` to pick a
  model, `mcp__Higgsfield__generate_image` / `generate_video`, `mcp__Higgsfield__jobs_wait`
  (timeout_seconds <= 15, poll), then download the result URL with curl into your folder. Check
  `mcp__Higgsfield__balance` before and after. **Hard cap: 60 credits per still, 200 credits per video.**
  Text-to-image / text-to-video only: never pass a product photo as a reference or start frame.
  One or two generations per need; pick and move on. If a plain code-drawn background would do, use that.
- **ElevenLabs** for voice / music / SFX: `mcp__ElevenLabs__creative_list_voices`,
  `creative_generate_speech`, poll `creative_get_flow_run_status`. One script, default takes, no retries
  for taste. If ElevenLabs is unavailable, try `mcp__Higgsfield__generate_audio`; if neither works, ship
  the video with music/SFX from `cagecraft-sale/assets/` or silent with captions, and say so.
- Never send the owner's name, email or any personal details to these tools. Product and brand names are fine.

## What to hand back

In `ads/<id>/`: source, `out/` deliverables, and `ads/<id>/brief.json`:

```json
{
  "id": "<id>", "title": "...", "format": "static 4:5 | video 9:16 ...", "product": "...",
  "recreates": "the competitor format in one line (no need to name the brand)",
  "hook": "...", "primary_text": "ad copy to paste into Ads Manager (2-4 short lines)", "headline": "...", "cta": "Shop Now",
  "deliverables": ["out/..."],
  "garment_source": ["library paths used for the garment"],
  "ai_generated": ["exactly what was AI-generated, and with which tool/model, or []"],
  "fidelity": "fidelity-check output for stills / what you verified frame-by-frame for video",
  "credits_spent": { "higgsfield": 0, "elevenlabs": "n/a" },
  "notes_for_owner": "anything to double-check before running (claims, usage rights of a person in a photo, etc.)"
}
```

Your final message: a short report with the deliverable paths, the fidelity result, what was AI, credits
spent, and any honest weakness you could not fix. Do not commit or push; do not touch other ads.
