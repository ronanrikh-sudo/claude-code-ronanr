# CAGECRAFT Fight Jersey flat-lay ad v2 (Tiffany + Diamond, court layout)

This version reworks v1 based on feedback: the layout now follows the brand's own court flat lay, accessories are added, the opening shot is no wider than the reference, the look is photoreal with texture and stitching up front, and the teal is greener.

- `out/cagecraft-flatlay-v2-1080x1920.mp4`: 21.4 s, 1080×1920, 24 fps, for social upload
- `out/cagecraft-flatlay-v2-2160x3840.mp4`: the same cut in 4K (2160×3840, ~33 Mbps, sized under GitHub's 100 MB limit). The full-quality 4K master (~69 Mbps, 185 MB) is in the Higgsfield media library as `cagecraft-flatlay-v2-2160x3840-master.mp4`.
- `out/contact-sheet.jpg`: one frame per second

## What changed from v1

| Feedback | Fix |
|---|---|
| Looked fake | Hard afternoon sun on a weathered court instead of soft studio light. Every keyframe was regenerated on prompts written around real material: sewn tackle-twill appliqué, satin-stitch borders, perforated micro-mesh. All shots are Kling 4.0 at **4K** (v1 was 1080p). A whisper of sensor grain is added in the edit. |
| Layout not aesthetic | The hero frame is built from the brand's own court flat lay (`JERSEY_TOP_VIEW_BOTH.png` on Shopify): diagonal staggered jerseys across the court line, with the grey Concrete jersey swapped for the black Diamond. |
| Accessories | CAGECRAFT boxing gloves, a white basketball and rolled hand wraps, placed as in the reference. |
| Drone started too far out | Shot 1 starts exactly at the reference framing and only descends. Nothing in the film is wider than it. |
| Teal too blue | Hue measured on every frame and pulled from about 186° to **175°** (greener) with a cyan-only correction, so whites, blacks and concrete are untouched. The colour cast on the concrete was also neutralised to match the reference photo. |

## Shot order

1. Drone descends onto the layout (fronts).
2. Slow diagonal glide from Tiffany to Diamond along the court line.
3. Tiffany front close-up.
4. Diamond front close-up.
5. Both backs, overhead descent.
6. Tiffany back close-up (FIGHT TEAM 25).
7. Diamond back close-up.
8. Macro of the woven hem label.
9. Macro of the embroidered oval logo.
10. Macro of the appliqué satin stitch and twill.
11. Macro of the chain-link side seam and hem.
12. Drone rises and settles on the hero layout.

## Rebuild

```bash
HUE=-5 CRF=17 python3 scripts/edit_v2.py <clips dir> out.mp4 scripts/shots.json            # 1080x1920
RES=2160 HUE=-5 CRF=18 python3 scripts/edit_v2.py <clips dir> out_4k.mp4 scripts/shots.json  # 4K
```

The keyframe colour tools are `scripts/neutralize.py` (concrete cast) and `scripts/teal_fix.py` (selective teal hue). The QC tools are `scripts/hue.py`, `scripts/concrete.py` and `scripts/qc_motion.py`.

Source clips (Kling 4.0 4K, Higgsfield job ids): s01 `c846ea6b`, s02b `a63ef6d4`, s03 `745d6fdb`,
s04 `068ba4f7`, s05 `c01d6fee`, s06 `8e7d775f`, s07 `dce07676`, s08 `dc3f8522`, s09 `7982adc5`,
s10 `a00d85df`, s11 `098b87d7`, s12 `8597d45d`.
