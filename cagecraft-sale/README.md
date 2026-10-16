# CAGECRAFT: Biggest Sale (9:16 social ad)

A ~21.6 s vertical ad built entirely in code with Remotion and three.js using the
`kinetic-motion-video` skill. Look: **Cube Noir**. The world is black, white and grey, with Tiffany
teal and Cotton Candy pink sampled from the hero products. Type is an extended heavy italic that
echoes the wordmark. Red and blue appear only on the fighters, as corner colours.

## The film

| Time (s) | On screen | Voice-over |
|---|---|---|
| 0.0–1.9 | Voxel fighters square up; red throws a rear-leg roundhouse; time ramps into 6% slow motion as the camera pushes in | (none) |
| 1.9–3.3 | Shin lands flush; blue's head shatters into little cubes in ultra slow-mo | (none) |
| 3.3–4.3 | Snap back to full speed on the music drop; blue blows apart into blocks | Fighters. |
| 4.3–5.7 | Tape-stop **freeze**; cold grade; bullet-time orbit round the frozen debris | Stop scrolling. |
| 5.7–8.8 | Every cube flies into a spinning monolith; teal scan on "sale"; slam and flash on "EVER." | The biggest sale in fightwear. Ever. |
| 8.8–10.5 | Cubes form a glowing teal **40%** | Up to 40% off. |
| 10.6–12.8 | Voxel kit bag drops; tee, socks and towel pop out with labels | Free gifts. |
| 12.9–14.4 | Tower stacks layer by layer | Months of building. |
| 14.5–16.7 | Seven day blocks light up; real products float above | One week only. |
| 16.8–18.3 | Cubes assemble the CAGECRAFT wordmark; crisp logo takes over | This is Cagecraft. |
| 18.4–21.6 | SHOP NOW button; press and teal shockwave on the final music hit; URL, offer line, T&Cs | Shop now. |

## Pipeline

```bash
npm install
npm run voice    # scripts/make_mix.py: VO edit + word timing + music edit + SFX + master -> public/audio/mix.wav, src/timing.json
REMOTION_BROWSER=<chrome-headless-shell> node scripts/stills.mjs 2 6 10   # QC stills -> out/frames
REMOTION_BROWSER=<chrome-headless-shell> npm run render                   # -> out/cagecraft-sale.mp4 (+ automated QC)
```

- **Voice:** ElevenLabs "Amelia, Young Australian Female" (`eleven_v4`), take 1 of 4 (all four are in
  `assets/vo/takes/`). Word times come from a pocketsphinx forced alignment
  (`assets/vo/voiceover.words.json`). The take is only cut inside its own pauses; extra silence is
  added after "Ever.", "gifts." and "only.".
- **Music:** ElevenLabs Music, 140 BPM, cut on bar lines only:
  - bar 0 drops on the snap;
  - a real tape-stop on "stop";
  - bar 1 re-enters on "biggest";
  - bar 2 is cut so the final hit lands after "Shop now".
- **Sound effects:** ElevenLabs. The cue sheet is `script.json → sfx` (whoosh, slow-mo drone,
  impact, shatter, snap, freeze, assembly clicks, slams, kit bag, logo, button).
- **Products and logo:** cagecraftco.com images, cut out with `scripts/cutout.py`. The logo is
  inverted to white.

## Code map

- `src/world/rig.ts`: voxel fighters, bones, stance and roundhouse keyframes.
- `src/world/fight.ts`: kick and contact. Blue is placed where the instep lands. Also the
  shatter and debris physics.
- `src/world/time.ts`: the slow-mo time warp and the freeze.
- `src/world/formations.ts`: monolith, 40%, gifts, tower, week, logo, and the ambient field.
- `src/world/cubes.ts`: one cube pool; staggered, arcing flights between formations.
- `src/world/camera.ts`: camera path, impact shake, and projection for the HTML overlays.
- `src/world/World.tsx`: three.js scene, lights, glow material and bloom.
- `src/overlay/*`: one-word captions, stage labels, products, logo, CTA, flashes, grade and grain.

The offer wording ("up to 40% off", free gifts, one week only) is a placeholder until the final
offer is confirmed; it is marked "T&Cs apply".
