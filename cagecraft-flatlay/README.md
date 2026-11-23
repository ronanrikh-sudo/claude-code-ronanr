# CAGECRAFT Fight Jersey flat-lay ad (Tiffany + Diamond)

`out/cagecraft-flatlay-jerseys.mp4`: 21.1 s, 1080×1920 (9:16), 24 fps, H.264, no audio.

## How it was made (Higgsfield)

1. **References.** The front/back flat lays and close-ups of *Fight Jersey Tiffany* and *Fight Jersey Diamond* came from the Shopify store. High-res detail crops were cut from them: chest appliqué, collar and neck label, woven hem label, chain-link side panel, and the back print. The Champion Gold woven-label and chest-embroidery close-ups were also used, because they show the same label and oval logo on black mesh. In total 18 reference images were uploaded to Higgsfield.
2. **Keyframes** (`keyframes/`). These were generated with GPT Image 2.6 at high quality and 4K, using the references, on one consistent mid-grey concrete floor. Each one was checked against the product photos: lettering shape, outline colour (black on Tiffany, white on Diamond), the silver E, the oval embroidery, label text and the side panels. The far drone frame (`00`) is the pair-front master outpainted with FLUX.2 Pro Outpaint, so the jerseys in it are the master's own pixels.
3. **Video.** Every shot is Kling 4.0 image-to-video (1080p, 5 s), starting from a verified keyframe. The opening drone shot also uses the master as its end frame. Camera moves are slow pushes, slides, gentle orbits and rises, kept inside the frame so that no new jersey detail has to be invented.
4. **Edit** (`scripts/edit.py`, `scripts/shots.json`). Clips are trimmed to their cleanest window and joined with hard cuts, plus three short dissolves (aerial→aerial, front→back, and into the finale). The grade is light: a small contrast lift, a soft vignette, fine grain, and fades in and out.

## Shot order

| # | Shot | Keyframe |
|---|------|----------|
| 1 | Drone descends from far onto both jerseys (fronts) | 00 → 01 |
| 2 | Overhead slow orbit, both fronts | 01 |
| 3 | Tiffany front close-up, push-in on appliqué | 03 |
| 4 | Diamond front close-up, slide + push | 04 |
| 5 | Both backs, overhead descend + rotate | 02 |
| 6 | Tiffany back close-up (FIGHT TEAM 25) | 05 |
| 7 | Diamond back close-up, low slider | 06 |
| 8 | Macro: woven hem label | 07 |
| 9 | Macro: embroidered oval logo | 08 |
| 10 | Macro: appliqué satin-stitch edge | 09 |
| 11 | Drone rises away from both fronts | 01 |

## Re-cutting

```bash
CRF=18 python3 scripts/edit.py <dir with s01.mp4…s11.mp4> out.mp4 scripts/shots.json
```

The source clips live in the Higgsfield library (Kling 4.0 jobs):
s01 `c95ec8f0`, s02 `b5ed691c`, s03 `da1c69b5`, s04 `42e4c22d`, s05 `872cf49a`, s06 `6727d680`,
s07 `ea74811c`, s08 `bcc7129b`, s09 `2f5ebfd2`, s10 `08cecbc3`, s11 `1de77b46`.
