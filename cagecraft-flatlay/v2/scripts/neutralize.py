#!/usr/bin/env python3
"""Remove a colour cast with per-channel tone curves.

Measures the median colour of low-chroma pixels in shadow / midtone / highlight bands
and builds a piecewise-linear curve per channel that maps each band's median to a target
grey (band luminance + a small offset). Offsets default to the neutral-warm balance
of the brand's own flat-lay photo (sunlit concrete reads slightly warm).

Usage: neutralize.py <in> <out>
"""
import sys

import numpy as np
from PIL import Image

BANDS = [(15, 40), (40, 90), (90, 150), (210, 256)]
# target (R-G, B-G) offsets per band, from the reference flat lay
OFFSETS = [(0, 3), (4, -2), (2, 2), (2, 4)]


def main():
    src, dst = sys.argv[1], sys.argv[2]
    full = np.asarray(Image.open(src).convert("RGB")).astype(np.float64)
    small = Image.open(src).convert("RGB")
    small.thumbnail((900, 900))
    a = np.asarray(small).astype(np.float64)
    lum, ch = a.mean(-1), a.max(-1) - a.min(-1)
    xs = [[0.0], [0.0], [0.0]]
    ys = [[0.0], [0.0], [0.0]]
    for (lo, hi), (dr, db) in zip(BANDS, OFFSETS):
        m = (lum >= lo) & (lum < hi) & (ch < 45)
        if m.sum() < 200:
            continue
        med = np.median(a[m], 0)
        L = med.mean()
        g_t = L - (dr + db) / 3.0
        tgt = [g_t + dr, g_t, g_t + db]
        for c in range(3):
            xs[c].append(med[c])
            ys[c].append(float(np.clip(tgt[c], 0, 255)))
    out = np.empty_like(full)
    for c in range(3):
        x = np.array(xs[c] + [255.0])
        y = np.array(ys[c] + [255.0])
        order = np.argsort(x)
        x, y = x[order], np.maximum.accumulate(y[order])
        out[..., c] = np.interp(full[..., c], x, y)
    Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8)).save(dst)


if __name__ == "__main__":
    main()
