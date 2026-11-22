"""Vectorise the CAGECRAFT emblem (white print photographed on black) -> assets/cagecraft_emblem.json.
Source: back-neck close-up from the CAGECRAFT Shopify store (Essentials Training Tee 2.0), cropped.
Pipeline as trace_logo.py, with luminance coverage and a light blur to bridge the ink texture."""
import json, sys
import numpy as np
from PIL import Image, ImageFilter
import trace_logo as T

SRC, OUT = sys.argv[1], sys.argv[2]
K = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
S = T.S
img = Image.open(SRC).convert("L").filter(ImageFilter.GaussianBlur(1.2))
a = np.asarray(img).astype(np.float32)
cov = np.clip((a - 70) / 110.0, 0, 1)   # fabric ~30 -> 0, print ~220 -> 1
h, w = cov.shape
base = h - 1
PAD = 40
im = Image.fromarray((cov * 255).astype(np.uint8), "L").resize((w * S // 2, h * S // 2), Image.BICUBIC)
S2 = S // 2
im = im.transform(((w + PAD) * S2, h * S2), Image.AFFINE, (1, -K, -PAD * S2 + K * base * S2, 0, 1, 0), resample=Image.BICUBIC)
up = np.asarray(im).astype(np.float32) / 255
loops = T.trace(up > 0.5)
polys = [T.smooth_curves(T.simplify_closed(l, 1.6), corner_deg=34.0, iters=3) for l in loops]
polys = [p for p in polys if abs(T.signed_area(p)) > 60 * S2]
outers = [p for p in polys if T.signed_area(p) < 0]
holes = [p for p in polys if T.signed_area(p) >= 0]

def tf(p):
    p = p / S2
    return np.column_stack([p[:, 0] - PAD + K * (base - p[:, 1]), p[:, 1]])

def to_d(ps):
    return " ".join("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in tf(p)) + "Z" for p in ps)

allp = np.concatenate([tf(p) for p in outers])
bbox = [float(allp[:, 0].min()), float(allp[:, 1].min()), float(allp[:, 0].max()), float(allp[:, 1].max())]
json.dump({"EMBLEM": {"d": to_d(outers + holes), "bbox": bbox, "outers": len(outers), "holes": len(holes)}}, open(OUT, "w"))
print("outers", len(outers), "holes", len(holes), "bbox", [round(v, 1) for v in bbox])
