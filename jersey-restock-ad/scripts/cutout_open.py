"""Key a dark product photographed on flat studio grey -> RGBA, removing enclosed background too
(the gaps between a drawstring bag's cords). Luminance matte so cord edges stay soft and fringe-free;
small enclosed bright areas (the printed logo) are kept opaque."""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]
rgb = np.asarray(Image.open(src).convert("RGB")).astype(np.float32); h, w, _ = rgb.shape
border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]]); bg = np.median(border, 0)
L = rgb @ np.array([0.299, 0.587, 0.114]); Lbg = float(bg @ np.array([0.299, 0.587, 0.114]))
alpha = np.clip((Lbg - L) / (Lbg - 48.0), 0, 1)             # dark product over lighter grey
dark = alpha > 0.5
holes = ndimage.binary_fill_holes(dark) & ~dark              # areas enclosed by product
lab, n = ndimage.label(holes)
if n:
    sizes = ndimage.sum(holes, lab, range(1, n + 1))
    small = np.isin(lab, np.nonzero(sizes < 40000)[0] + 1)   # logo strokes, eyelets; not cord gaps
    alpha = np.maximum(alpha, ndimage.gaussian_filter(ndimage.binary_dilation(small, iterations=2).astype(np.float32), 0.8))
# drop specks
lab2, n2 = ndimage.label(alpha > 0.1)
if n2 > 1:
    sz = ndimage.sum(alpha > 0.1, lab2, range(1, n2 + 1)); speck = np.isin(lab2, np.nonzero(sz < 300)[0] + 1)
    alpha[speck] = 0
a3 = np.maximum(alpha, 0.04)[..., None]
dec = np.clip((rgb - (1 - a3) * bg) / a3, 0, 255)
rgb = np.where((alpha < 0.98)[..., None], dec, rgb)
ys, xs = np.nonzero(alpha > 0.05); m = 10
y0, y1, x0, x1 = max(0, ys.min() - m), min(h, ys.max() + m), max(0, xs.min() - m), min(w, xs.max() + m)
Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8)[y0:y1, x0:x1], "RGBA").save(dst)
print(dst, f"{x1-x0}x{y1-y0}", "bg", bg.astype(int))
