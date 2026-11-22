"""Vectorise the CAGECRAFT wordmark (white on transparent PNG) -> assets/cagecraft_paths.json.
Same pipeline as trace_logo.py: alpha coverage -> 8x bicubic -> optional italic unskew ->
threshold -> boundary loops -> simplify / straighten / snap / smooth -> re-skew. The (R) mark is dropped."""
import json, sys
import numpy as np
from PIL import Image
import trace_logo as T

SRC, OUT = sys.argv[1], sys.argv[2]
K = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0  # italic slant (tan)
S = T.S
a = np.asarray(Image.open(SRC).convert("RGBA")).astype(np.float32)[..., 3] / 255.0
h, w = a.shape
cov = a.copy()
cov[:, 1150:] = 0  # drop the (R)
base = h - 1
PAD = 20
img = Image.fromarray((cov * 255).astype(np.uint8), "L").resize((w * S, h * S), Image.BICUBIC)
img = img.transform(((w + PAD) * S, h * S), Image.AFFINE, (1, -K, -PAD * S + K * base * S, 0, 1, 0), resample=Image.BICUBIC)
up = np.asarray(img).astype(np.float32) / 255
loops = T.trace(up > 0.5)
polys = [T.smooth_curves(T.snap(T.straighten(T.snap(T.simplify_closed(l, 3.0))))) for l in loops]
polys = [p for p in polys if abs(T.signed_area(p)) > 40 * S]
outers = sorted([p for p in polys if T.signed_area(p) < 0], key=lambda p: p[:, 0].min())
holes = [p for p in polys if T.signed_area(p) >= 0]

def to_d(ps):
    out = []
    for p in ps:
        p = p / S
        p = np.column_stack([p[:, 0] - PAD + K * (base - p[:, 1]), p[:, 1]])
        out.append("M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in p) + "Z")
    return " ".join(out)

glyphs = []
for o in outers:
    x0, x1, y0, y1 = o[:, 0].min() - 1, o[:, 0].max() + 1, o[:, 1].min() - 1, o[:, 1].max() + 1
    hs = [q for q in holes if q[:, 0].min() >= x0 and q[:, 0].max() <= x1 and q[:, 1].min() >= y0 and q[:, 1].max() <= y1]
    glyphs.append(to_d([o] + hs))
allx = np.concatenate([np.column_stack([p[:, 0] / S - PAD + K * (base - p[:, 1] / S), p[:, 1] / S]) for p in outers])
bbox = [float(allx[:, 0].min()), float(allx[:, 1].min()), float(allx[:, 0].max()), float(allx[:, 1].max())]
json.dump({"CAGECRAFT": {"d": " ".join(glyphs), "bbox": bbox, "n": len(glyphs)}}, open(OUT, "w"), indent=1)
print("glyphs", len(glyphs), "bbox", [round(v, 1) for v in bbox])
