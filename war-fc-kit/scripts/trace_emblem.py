"""Vectorise the CAGECRAFT emblem (white print photographed on black) -> assets/cagecraft_emblem.json.
Source: back-neck close-up from the CAGECRAFT Shopify store (Essentials Training Tee 2.0), cropped.
The photo is shot ~8 deg off level, so the image is rotated level first (measured from the letter
baselines). Letters are cleaned as italic straight-edged glyphs (un-skew, straighten, snap); the oval
ring and sparkles keep smooth curves."""
import json, sys
import numpy as np
from PIL import Image, ImageFilter
import trace_logo as T

SRC, OUT = sys.argv[1], sys.argv[2]
LEVEL = float(sys.argv[3]) if len(sys.argv) > 3 else 8.1   # degrees to rotate CCW to level the text
K = float(sys.argv[4]) if len(sys.argv) > 4 else 0.30      # italic slant (tan) of the letter stems
S = T.S
img = Image.open(SRC).convert("L").filter(ImageFilter.GaussianBlur(1.3))
img = img.rotate(LEVEL, resample=Image.BICUBIC, expand=True, fillcolor=20)
a = np.asarray(img).astype(np.float32)
cov = np.clip((a - 70) / 110.0, 0, 1)
h, w = cov.shape
base = h - 1
PAD = 60
S2 = S // 2
im = Image.fromarray((cov * 255).astype(np.uint8), "L").resize((w * S2, h * S2), Image.BICUBIC)
im = im.transform(((w + PAD) * S2, h * S2), Image.AFFINE, (1, -K, -PAD * S2 + K * base * S2, 0, 1, 0), resample=Image.BICUBIC)
up = np.asarray(im).astype(np.float32) / 255
loops = T.trace(up > 0.5)
raw = [T.simplify_closed(l, 1.6) for l in loops]
raw = [p for p in raw if abs(T.signed_area(p)) > 60 * S2]

def bbox(p):
    return p[:, 0].min(), p[:, 1].min(), p[:, 0].max(), p[:, 1].max()

polys = []
for p in raw:
    x0, y0, x1, y1 = bbox(p)
    bw, bh = (x1 - x0) / S2, (y1 - y0) / S2
    if bw > 420:                      # oval ring arcs: smooth curves only
        q = T.smooth_curves(T.simplify_closed(p, 3.6), corner_deg=30.0, iters=5)
    elif bw < 75 and bh < 100:         # sparkles / small ring tips: gentle smoothing
        q = T.smooth_curves(p, corner_deg=40.0, iters=2)
    else:                              # letters: straight italic edges, crisp corners
        q = T.smooth_curves(T.snap(T.straighten(T.snap(T.simplify_closed(p, 3.0)), min_len=10.0 * S2, tol=1.4 * S2)), corner_deg=30.0, iters=2)
    polys.append(q)
outers = [p for p in polys if T.signed_area(p) < 0]
holes = [p for p in polys if T.signed_area(p) >= 0]

def tf(p):
    p = p / S2
    return np.column_stack([p[:, 0] - PAD + K * (base - p[:, 1]), p[:, 1]])

def to_d(ps):
    return " ".join("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in tf(p)) + "Z" for p in ps)

allp = np.concatenate([tf(p) for p in outers])
bb = [float(allp[:, 0].min()), float(allp[:, 1].min()), float(allp[:, 0].max()), float(allp[:, 1].max())]
json.dump({"EMBLEM": {"d": to_d(outers + holes), "bbox": bb, "outers": len(outers), "holes": len(holes)}}, open(OUT, "w"))
# report baseline slope of the letter rows (should be ~0 when level)
letters = [tf(p) for p in outers if 75 < (bbox(p)[2] - bbox(p)[0]) / S2 < 300]
pts = np.array([[q[:, 0].mean(), q[:, 1].max()] for q in letters])
rows = [pts[pts[:, 1] < np.median(pts[:, 1])], pts[pts[:, 1] >= np.median(pts[:, 1])]]
for r in rows:
    if len(r) > 1:
        print("row slope deg", round(np.degrees(np.arctan(np.polyfit(r[:, 0], r[:, 1], 1)[0])), 2), "letters", len(r))
print("outers", len(outers), "holes", len(holes), "bbox", [round(v, 1) for v in bb])
