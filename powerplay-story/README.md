# CAGECRAFT: PowerPlay your cart (9:16 Instagram story)

A 29.2 s vertical explainer for the "PowerPlay your cart" button, built with the `kinetic-motion-video`
skill in the same **Cube Noir** look, voice and music as `../cagecraft-sale`.

| Time (s) | On screen | Voice-over |
|---|---|---|
| 0.0–3.0 | Bolt crackles in; WE ALL KNOW / POWERPLAY / FROM SPORTSBET (type only, no logo) | We all know PowerPlay from Sportsbet. |
| 3.0 | Bolt zoom-through wipe; the groove drops | |
| 3.0–5.7 | Phone rises with the live product page; the cart drawer slides in on "cart" | Now, you can PowerPlay your cart. |
| 5.7–10.3 | Push into the gift bar ($1.29 left for Free Kit Bag), then onto the button as it lights up | Get within five dollars of a free gift, and the PowerPlay button lights up. |
| 10.3–14.0 | Tap; "Boosting your cart…"; PowerPlayed; spotlight on the $1.29 boost line | One tap adds a boost, for exactly what you're short. |
| 14.0–17.3 | $1.29 / "takes your cart to $50.00" on the real total; then the free Kit Bag line | A dollar twenty-nine, and the free Kit Bag is yours. |
| 17.3–23.1 | Gift ladder $50–$250 lights tier by tier on each spoken gift | It works on every tier. Socks, free shipping, a towel, even a free tee. |
| 23.1–29.2 | Bolt wipe; POWERPLAY YOUR CART.; ONLY AT + wordmark on the final hit; URL | PowerPlay your cart. Only at CAGECRAFT. |

## Pipeline

```bash
npm install && pip install numpy scipy pocketsphinx
node scripts/capture.cjs                         # real flow on the LIVE site -> public/shots (+ boxes.json)
python3 scripts/align_words.py assets/vo/takes/*.mp3   # score takes, force-align word times
npm run voice                                    # scripts/make_mix.py -> public/audio/mix.wav + src/timing.json
REMOTION_BROWSER=<chrome-headless-shell> node scripts/stills.mjs 3 8 12
REMOTION_BROWSER=<chrome-headless-shell> npm run render   # -> out/cagecraft-powerplay-story.mp4 (+ QC)
```

- **Voice:** ElevenLabs "Amelia - Young Australian Female" (`eleven_v4`), take 2 of 2 (flow `zGOauzyHIMp4GmiUmWmJ`).
  Word times from a pocketsphinx forced alignment; every beat keys off a spoken word.
- **Music:** the sale ad's ElevenLabs track (140 BPM), cut on bar lines: intro under S1, groove drops on "Now",
  final hit (bar 10) just after "CAGECRAFT". SFX from the sale ad's ElevenLabs set (whoosh, button, slam, assemble, logo).
- **UI:** real 1170×2532 captures of cagecraftco.com (theme "BF LIVE + PowerPlay"). Only overlays are added
  (spotlight, highlight rings, the button's shine, the tap ripple); the screens themselves are untouched.

## Code map
- `src/scenes/Hook.tsx` S1 · `src/scenes/Demo.tsx` S2–S5 (phone, camera shots, overlays) · `src/scenes/Ladder.tsx` S6 · `src/scenes/Finale.tsx` S7
- `src/components/` Headline (word-timed kinetic type), BoltWipe (signature transition), Backdrop, FX (flashes, grain, vignette), Shapes (bolt, gift, truck)
