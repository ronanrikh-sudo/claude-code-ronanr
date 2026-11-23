#!/usr/bin/env python3
"""Shift only the teal/cyan pixels toward green (selective hue rotation).

Usage: teal_fix.py <in> <out> [shift_deg=-9] [center_deg=185] [half_width=22]
Pixels whose hue is near `center` and that are reasonably saturated are rotated by
`shift` degrees, with a smooth falloff so edges/anti-aliasing blend naturally.
Whites, blacks, greys, concrete and skin are untouched (low saturation or other hues).
"""
import sys

import numpy as np
from PIL import Image


def rgb_to_hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn
    h = np.zeros_like(mx)
    m = d > 1e-6
    rm = m & (mx == r)
    gm = m & (mx == g) & ~rm
    bm = m & ~rm & ~gm
    h[rm] = ((g - b)[rm] / d[rm]) % 6
    h[gm] = (b - r)[gm] / d[gm] + 2
    h[bm] = (r - g)[bm] / d[bm] + 4
    h = h * 60.0
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0)
    return h, s, mx


def hsv_to_rgb(h, s, v):
    h = (h % 360) / 60.0
    i = np.floor(h).astype(int) % 6
    f = h - np.floor(h)
    p, q, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
    out = np.zeros(h.shape + (3,))
    for k, (rr, gg, bb) in enumerate([(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]):
        sel = i == k
        out[sel, 0], out[sel, 1], out[sel, 2] = rr[sel], gg[sel], bb[sel]
    return out


def main():
    src, dst = sys.argv[1], sys.argv[2]
    shift = float(sys.argv[3]) if len(sys.argv) > 3 else -9.0
    center = float(sys.argv[4]) if len(sys.argv) > 4 else 185.0
    half = float(sys.argv[5]) if len(sys.argv) > 5 else 22.0
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(np.float64) / 255.0
    h, s, v = rgb_to_hsv(a)
    dist = np.abs(((h - center + 180) % 360) - 180)
    w_h = np.clip(1 - (dist / half) ** 2, 0, 1)
    w_s = np.clip((s - 0.15) / 0.2, 0, 1)
    w_v = np.clip((v - 0.12) / 0.15, 0, 1)
    w = w_h * w_s * w_v
    h2 = h + shift * w
    out = hsv_to_rgb(h2, s, v)
    Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)).save(dst, quality=95)


if __name__ == "__main__":
    main()
