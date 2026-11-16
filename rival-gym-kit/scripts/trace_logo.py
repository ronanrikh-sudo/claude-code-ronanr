"""Vectorise the Rival Gym logo (RIVAL + GYM) from the supplied raster.

No external tracer available, so: coverage map -> 8x bicubic upscale ->
threshold -> pixel-edge boundary loops -> Douglas-Peucker simplify -> SVG paths.
Outputs assets/rival_paths.json with per-letter path data in logo pixel units.
"""
import json, sys, re
import numpy as np
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
S = 8  # upscale factor

im = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
# redness coverage: 0 on white (r=g), 1 on full red (r-g ~ 191)
red_cov = np.clip((r - (g + b) / 2) / 180.0, 0, 1)
# darkness coverage (non-red): 1 on black, 0 on white
lum = 0.299 * r + 0.587 * g + 0.114 * b
dark_cov = np.clip((255 - lum) / 245.0, 0, 1) * (red_cov < 0.3)


K = 24.0 / 68.0          # italic slant (tan) measured from the I stem
PAD = 40                 # px (logo units) left pad so unskewed glyphs stay in frame


def baseline_for(name):
    return {"RIVAL": 232.1, "GYM": 283.5, "RULE": 266.0}[name]


def upscale(cov, base):
    h, w = cov.shape
    img = Image.fromarray((cov * 255).astype(np.uint8), "L")
    img = img.resize((w * S, h * S), Image.BICUBIC)
    # unskew: output (u,v) samples input x = u - PAD*S + K*(base*S - v)
    W2 = (w + PAD) * S
    img = img.transform((W2, h * S), Image.AFFINE,
                        (1, -K, -PAD * S + K * base * S, 0, 1, 0), resample=Image.BICUBIC)
    return np.asarray(img).astype(np.float32) / 255


def snap(p, tol_deg=5.0):
    p = p.copy()
    n = len(p)
    for _ in range(2):
        for i in range(n):
            a, b = p[i], p[(i + 1) % n]
            dx, dy = b - a
            L = np.hypot(dx, dy)
            if L < 6 * S * 0.5:
                continue
            ang = np.degrees(np.arctan2(abs(dy), abs(dx)))
            if ang < tol_deg:
                m = (a[1] + b[1]) / 2; p[i][1] = m; p[(i + 1) % n][1] = m
            elif ang > 90 - tol_deg:
                m = (a[0] + b[0]) / 2; p[i][0] = m; p[(i + 1) % n][0] = m
    return p


def turn_angles(p):
    v1 = p - np.roll(p, 1, axis=0)
    v2 = np.roll(p, -1, axis=0) - p
    c = np.sum(v1 * v2, 1) / (np.linalg.norm(v1, axis=1) * np.linalg.norm(v2, axis=1) + 1e-9)
    return np.degrees(np.arccos(np.clip(c, -1, 1)))


def straighten(p, min_len=22.0 * S, tol=1.7 * S):
    """Collapse long nearly-straight vertex runs (kinks from narrow gaps) to one chord."""
    p = np.roll(p, -int(np.argmax(turn_angles(p))), axis=0)  # start at sharpest corner
    n = len(p)
    q = np.vstack([p, p[:1]])  # closed, no wrap past start
    keep = np.ones(n, bool)
    i = 0
    while i < n:
        best = None
        for j in range(i + 2, n + 1):
            a, b = q[i], q[j]
            d = b - a
            L = np.hypot(*d)
            mids = q[i + 1 : j]
            dev = np.abs(d[0] * (mids[:, 1] - a[1]) - d[1] * (mids[:, 0] - a[0])) / (L + 1e-9)
            if dev.max() > tol:
                break
            if L >= min_len:
                best = j
        if best is not None:
            keep[i + 1 : best] = False
            i = best
        else:
            i += 1
    return p[keep]


def smooth_curves(p, corner_deg=38.0, iters=3):
    """Chaikin on vertices whose turn angle is small (curve), keep sharp corners."""
    for _ in range(iters):
        n = len(p)
        out = []
        for i in range(n):
            a, b, c = p[i - 1], p[i], p[(i + 1) % n]
            v1, v2 = b - a, c - b
            ang = np.degrees(np.arccos(np.clip(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-9), -1, 1)))
            if ang < corner_deg and min(np.linalg.norm(v1), np.linalg.norm(v2)) < 10 * S:
                out.append(b + (a - b) * 0.25)
                out.append(b + (c - b) * 0.25)
            else:
                out.append(b)
        p = np.asarray(out)
    return p


def trace(mask):
    """Return list of closed loops (list of (x,y) vertices at pixel corners)."""
    h, w = mask.shape
    m = np.zeros((h + 2, w + 2), bool)
    m[1:-1, 1:-1] = mask
    nxt = {}
    # Directed edges with foreground on the left (y down coords => clockwise outer)
    # top edge of pixel (fg) where above is bg: from (x+1,y) to (x,y)
    ys, xs = np.where(m[1:-1, 1:-1] & ~m[:-2, 1:-1])
    for y, x in zip(ys, xs):
        nxt.setdefault((x + 1, y), []).append((x, y))
    ys, xs = np.where(m[1:-1, 1:-1] & ~m[2:, 1:-1])  # bottom
    for y, x in zip(ys, xs):
        nxt.setdefault((x, y + 1), []).append((x + 1, y + 1))
    ys, xs = np.where(m[1:-1, 1:-1] & ~m[1:-1, :-2])  # left
    for y, x in zip(ys, xs):
        nxt.setdefault((x, y), []).append((x, y + 1))
    ys, xs = np.where(m[1:-1, 1:-1] & ~m[1:-1, 2:])  # right
    for y, x in zip(ys, xs):
        nxt.setdefault((x + 1, y + 1), []).append((x + 1, y))
    loops = []
    while nxt:
        start = next(iter(nxt))
        loop = [start]
        cur = start
        while True:
            outs = nxt.get(cur)
            if not outs:
                break
            n = outs.pop()
            if not outs:
                del nxt[cur]
            if n == start:
                break
            loop.append(n)
            cur = n
        if len(loop) > 8:
            loops.append(loop)
    return loops


def dp(pts, eps):
    pts = np.asarray(pts, float)
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    d = b - a
    nrm = np.hypot(*d)
    if nrm == 0:
        dist = np.hypot(*(pts - a).T)
    else:
        dist = np.abs(d[0] * (pts[:, 1] - a[1]) - d[1] * (pts[:, 0] - a[0])) / nrm
    i = int(np.argmax(dist))
    if dist[i] > eps:
        l = dp(pts[: i + 1], eps)
        r_ = dp(pts[i:], eps)
        return np.vstack([l[:-1], r_])
    return np.vstack([a, b])


def simplify_closed(loop, eps):
    pts = np.asarray(loop, float)
    # split at the two farthest-apart points for a stable closed DP
    i0 = 0
    i1 = int(np.argmax(np.hypot(*(pts - pts[0]).T)))
    p1 = dp(pts[i0 : i1 + 1], eps)
    p2 = dp(np.vstack([pts[i1:], pts[:1]]), eps)
    return np.vstack([p1[:-1], p2[:-1]])


def signed_area(p):
    x, y = p[:, 0], p[:, 1]
    return 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)


def to_path(polys, base):
    out = []
    for p in polys:
        p = p / S
        p = np.column_stack([p[:, 0] - PAD + K * (base - p[:, 1]), p[:, 1]])
        out.append("M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in p) + "Z")
    return " ".join(out)


result = {}
for name, cov, xr in (("RIVAL", red_cov, (0, 447)), ("GYM", dark_cov, (222, 447)), ("RULE", dark_cov, (0, 222))):
    c = cov.copy()
    c[:, : xr[0]] = 0
    c[:, xr[1] :] = 0
    base = baseline_for(name)
    up = upscale(c, base)
    mask = up > 0.5
    loops = trace(mask)
    polys = [smooth_curves(snap(straighten(snap(simplify_closed(l, 3.2))))) for l in loops]
    polys = [p for p in polys if abs(signed_area(p)) > 40 * S]
    # group into glyphs: outer loops (positive area in this orientation) + holes inside them
    outers = [p for p in polys if signed_area(p) < 0]
    holes = [p for p in polys if signed_area(p) >= 0]
    glyphs = []
    for o in sorted(outers, key=lambda p: p[:, 0].min()):
        x0, x1 = o[:, 0].min() - 1, o[:, 0].max() + 1
        y0, y1 = o[:, 1].min() - 1, o[:, 1].max() + 1
        hs = [h for h in holes if h[:, 0].min() >= x0 and h[:, 0].max() <= x1 and h[:, 1].min() >= y0 and h[:, 1].max() <= y1]
        ob = to_path([o], base)
        bx = [float(v) for v in re.findall(r"[ML]([\d.]+),", ob)]
        by = [float(v) for v in re.findall(r",([\d.]+)", ob)]
        glyphs.append({"bbox": [min(bx), min(by), max(bx), max(by)], "d": to_path([o] + hs, base), "nv": int(sum(len(q) for q in [o] + hs))})
    result[name] = glyphs
    print(name, len(glyphs), "glyphs", [g["nv"] for g in glyphs], [tuple(round(v, 1) for v in g["bbox"]) for g in glyphs])

json.dump(result, open(OUT, "w"), indent=1)
