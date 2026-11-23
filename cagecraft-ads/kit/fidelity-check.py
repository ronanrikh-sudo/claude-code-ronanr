#!/usr/bin/env python3
"""Prove that the garment in a finished still is the real photograph, unaltered.

  python3 -I kit/fidelity-check.py ads/<id>/out/<name>          (reads <name>.png + <name>.placements.json)

For every <img data-product> recorded by render-static.mjs, the source cutout from library/ is resampled
to the same box / rotation and compared with what is actually in the rendered ad, only on pixels that are
fully inside the garment. Reports, per product:
  mean_diff   mean absolute RGB difference on a 0-255 scale over unoccluded garment pixels (resampling noise is ~1-3)
  occluded    share of garment pixels that differ strongly (text, badges or another layer on top of the product)
  verdict     PASS    (mean_diff <= 4.0 and occluded <= 2%)
              REVIEW  (more than 2% of the garment differs strongly from the source. Either an overlay sits on top of
                       it, which is fine only if it is intentional and hides no logo/print, or the garment was
                       recoloured/altered, which is never fine. Look at the image and say which in your report.
                       Pass --allow-cover only for a deliberate overlay.)
              FAIL    (the garment pixels do not match the source photograph: something altered them)
Exit code 1 if any product FAILs, is REVIEW without --allow-cover, or the page reported a product-layer warning."""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

allow_cover = "--allow-cover" in sys.argv
base = [a for a in sys.argv[1:] if not a.startswith("--")][0]
for ext in (".png", ".jpg", ".placements.json"):
    if base.endswith(ext): base = base[: -len(ext)]
kit = os.path.dirname(os.path.abspath(__file__))
library = os.path.join(os.path.dirname(kit), "library")
rep = json.load(open(base + ".placements.json"))
final = Image.open(base + ".png").convert("RGB")
S = rep.get("scale", 1)
F = np.asarray(final).astype(np.float32)
bad = bool(rep.get("warnings"))
for w in rep.get("warnings", []): print("WARNING (layout):", w)
if not rep["products"]: print("no data-product layers recorded: nothing to verify (is the garment tagged?)")
for p in rep["products"]:
    src = Image.open(os.path.join(library, p["src"])).convert("RGBA")
    if p.get("flipX"): src = src.transpose(Image.FLIP_LEFT_RIGHT)
    dw = max(1, round(p["drawnWidth"] * S)); dh = max(1, round(dw * src.height / src.width))
    im = src.resize((dw, dh), Image.LANCZOS)
    if abs(p["rotation"]) > 0.01: im = im.rotate(-p["rotation"], resample=Image.BICUBIC, expand=True)
    bw, bh = max(1, round(p["w"] * S)), max(1, round(p["h"] * S))
    if (im.width, im.height) != (bw, bh): im = im.resize((bw, bh), Image.LANCZOS)
    x0, y0 = round(p["x"] * S), round(p["y"] * S)
    a = np.asarray(im).astype(np.float32)
    # clip to canvas
    cx0, cy0 = max(0, x0), max(0, y0); cx1, cy1 = min(F.shape[1], x0 + bw), min(F.shape[0], y0 + bh)
    if cx1 <= cx0 or cy1 <= cy0: print(f"{p['src']}: entirely off-canvas"); continue
    a = a[cy0 - y0: cy1 - y0, cx0 - x0: cx1 - x0]; f = F[cy0:cy1, cx0:cx1]
    inside = ndimage.binary_erosion(a[..., 3] >= 254, iterations=3)   # stay off the anti-aliased rim
    visible_share = inside.sum() / max(1, ndimage.binary_erosion(np.asarray(im)[..., 3] >= 254, iterations=3).sum())
    if inside.sum() < 500: print(f"{p['src']}: too small to verify"); continue
    # tolerate sub-pixel misregistration: compare against a lightly blurred pair
    d = np.abs(ndimage.gaussian_filter(a[..., :3], (1, 1, 0)) - ndimage.gaussian_filter(f, (1, 1, 0))).mean(-1)
    strong = (d > 28) & inside
    strong = ndimage.binary_opening(strong, iterations=1)             # ignore isolated resampling speckle
    occluded = strong.sum() / inside.sum()
    clean = inside & ~ndimage.binary_dilation(strong, iterations=4)
    mean_diff = float(d[clean].mean()) if clean.sum() else 999.0
    verdict = "FAIL" if mean_diff > 4.0 else ("REVIEW" if occluded > 0.02 else "PASS")
    if verdict == "FAIL" or (verdict == "REVIEW" and not allow_cover): bad = True
    print(f"{verdict:8s} {p['src']:55s} mean_diff={mean_diff:5.2f}  occluded={occluded*100:5.1f}%  on-canvas={visible_share*100:5.1f}%  drawn@{p['upscale']*100:.0f}% of native")
sys.exit(1 if bad else 0)
