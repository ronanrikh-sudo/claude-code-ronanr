"""Procedural print textures for the WAR FC shorts (numpy only).

- stone(): grey stone-flake ground (scattered irregular flakes + fine speckle) on transparent
- smoke(): billowing smoke plumes from domain-warped fractal noise, coloured with a ramp,
           confined to soft regions around 'source' polylines (outer leg / hem edges)

All outputs are RGBA PNGs on the 2000x2500 garment canvas so they line up with the SVG.
"""
import json
import sys
import numpy as np
from PIL import Image, ImageFilter

W, H = 2000, 2500


# ---------------------------------------------------------------- noise
class Noise:
    def __init__(self, seed, n=512):
        self.t = np.random.default_rng(seed).random((n, n)).astype(np.float32)
        self.n = n

    def value(self, x, y):
        xi, yi = np.floor(x).astype(np.int64), np.floor(y).astype(np.int64)
        xf, yf = (x - xi).astype(np.float32), (y - yi).astype(np.float32)
        u, v = xf * xf * (3 - 2 * xf), yf * yf * (3 - 2 * yf)
        n, t = self.n, self.t
        a, b = t[yi % n, xi % n], t[yi % n, (xi + 1) % n]
        c, d = t[(yi + 1) % n, xi % n], t[(yi + 1) % n, (xi + 1) % n]
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v

    def fbm(self, x, y, octaves=5, lac=2.03, gain=0.5):
        s, amp, norm, f = 0.0, 1.0, 0.0, 1.0
        for i in range(octaves):
            s = s + amp * self.value(x * f + 17.3 * i, y * f - 9.1 * i)
            norm += amp
            amp *= gain
            f *= lac
        return s / norm


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def grid(scale):
    """pixel grid at 1/scale resolution, returned in full-canvas pixel coordinates"""
    w, h = W // scale, H // scale
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    return xs * scale, ys * scale


def to_png(rgb, alpha, path, scale=1):
    a = np.clip(alpha, 0, 1)
    img = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)
    im = Image.fromarray(img, "RGBA")
    if scale != 1:
        im = im.resize((W, H), Image.BICUBIC)
    im.save(path, optimize=True)


# ---------------------------------------------------------------- stone flakes
def stone(path, seed=3, tone=(84, 84, 84), density=0.66):
    X, Y = grid(1)
    nz = Noise(seed)
    p = 1 / 24.0
    wx = nz.fbm(X * p * 0.35 + 3.1, Y * p * 0.35, 3)
    wy = nz.fbm(X * p * 0.35 - 7.7, Y * p * 0.35 + 2.2, 3)
    f = nz.fbm(X * p + 3.5 * wx, Y * p + 3.5 * wy, 4)
    flakes = smoothstep(density, density + 0.035, f)
    # thin crack-like veins from ridged noise
    r = 1 - np.abs(2 * nz.fbm(X * p * 0.6 + 40, Y * p * 0.6 - 12, 4) - 1)
    veins = smoothstep(0.93, 0.975, r) * 0.6
    # sparse fine speckle
    sp = (np.random.default_rng(seed + 1).random((H, W)) > 0.9965).astype(np.float32)
    sp = np.asarray(Image.fromarray((sp * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255 * 2.2
    variation = 0.55 + 0.45 * nz.fbm(X / 300 + 5, Y / 300 - 5, 2)
    alpha = np.clip(np.maximum(flakes * 0.5, veins * 0.25) * variation + np.clip(sp, 0, 1) * 0.35, 0, 1)
    rgb = np.dstack([np.full_like(X, c) for c in tone])
    to_png(rgb, alpha, path)


# ---------------------------------------------------------------- smoke
def seg_dist(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    L2 = vx * vx + vy * vy + 1e-9
    t = np.clip(((px - ax) * vx + (py - ay) * vy) / L2, 0, 1)
    dx, dy = px - (ax + t * vx), py - (ay + t * vy)
    return np.sqrt(dx * dx + dy * dy)


def blur(a, sigma):
    """separable gaussian blur (numpy; PIL can't blur float images)"""
    r = int(3 * sigma + 0.5)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2).astype(np.float32)
    k /= k.sum()
    a = np.pad(a.astype(np.float32), r, mode="edge")
    a = sum(k[i] * a[:, i:i + a.shape[1] - 2 * r] for i in range(2 * r + 1))
    a = sum(k[i] * a[i:i + a.shape[0] - 2 * r, :] for i in range(2 * r + 1))
    return a


def smoke(path, plumes, seed=11, scale=2, clear=()):
    """plumes: [{pts:[[x,y],...] source polyline, r: reach in px, ramp: colour ramp, gain}]
    clear: [[cx, cy, rx, ry], ...] ellipses kept free of smoke so logos sit on black"""
    X, Y = grid(scale)
    nz = Noise(seed)
    p = 1 / 330.0
    qx = nz.fbm(X * p, Y * p, 4)
    qy = nz.fbm(X * p + 5.2, Y * p + 1.3, 4)
    rx = nz.fbm(X * p + 3 * qx + 1.7, Y * p + 3 * qy + 9.2, 4)
    ry = nz.fbm(X * p + 3 * qx + 8.3, Y * p + 3 * qy + 2.8, 4)
    f = nz.fbm(X * p + 3 * rx, Y * p + 3 * ry, 6)                                    # billows
    wisp = 1 - np.abs(2 * nz.fbm(X * p * 2.2 + 2.5 * rx, Y * p * 2.2 + 2.5 * ry, 6) - 1)  # curling filaments
    out_rgb = np.zeros(X.shape + (3,), np.float32)
    out_a = np.zeros(X.shape, np.float32)
    for pl in plumes:
        pts, r = pl["pts"], pl["r"]
        wxp = X + (qx - 0.5) * r * 1.8
        wyp = Y + (qy - 0.5) * r * 1.8
        d = np.full(X.shape, 1e9, np.float32)
        for (ax, ay), (bx, by) in zip(pts[:-1], pts[1:]):
            d = np.minimum(d, seg_dist(wxp, wyp, ax, ay, bx, by))
        mask = np.exp(-((d / r) ** 1.5))
        for cx, cy, ex, ey in clear:
            e = np.sqrt(((X - cx) / ex) ** 2 + ((Y - cy) / ey) ** 2)
            mask = mask * (1 - 0.92 * (1 - smoothstep(0.55, 1.15, e)))
        body = smoothstep(0.16, 0.78, f * (0.5 + 0.85 * mask)) * mask ** 0.65
        fil = (wisp ** 9) * smoothstep(0.03, 0.55, mask)
        dens = np.clip(body * pl.get("gain", 1.0) + fil * 0.75, 0, 1)
        dens = blur(dens, 1.6)
        level = np.clip(body * 0.85 + fil * 0.5, 0, 1)
        level = blur(level, 1.2)
        ramp = pl["ramp"]
        rgb = np.zeros(X.shape + (3,), np.float32)
        for (d0, c0), (d1, c1) in zip(ramp[:-1], ramp[1:]):
            t = np.clip((level - d0) / (d1 - d0), 0, 1)[..., None]
            seg = (level >= d0) & (level <= d1)
            rgb[seg] = (np.array(c0) * (1 - t) + np.array(c1) * t)[seg]
        rgb[level > ramp[-1][0]] = ramp[-1][1]
        alpha = np.clip(dens ** 0.85, 0, 0.97)
        out_rgb = rgb * alpha[..., None] + out_rgb * (1 - alpha[..., None])
        out_a = alpha + out_a * (1 - alpha)
    rgb = np.where(out_a[..., None] > 1e-4, out_rgb / np.maximum(out_a[..., None], 1e-4), 0)
    to_png(rgb, out_a, path, scale)


RED_RAMP = [[0.0, [80, 0, 8]], [0.45, [190, 14, 24]], [0.75, [237, 28, 36]], [1.0, [255, 110, 105]]]
WHITE_RAMP = [[0.0, [70, 70, 70]], [0.5, [168, 168, 166]], [0.85, [232, 232, 230]], [1.0, [250, 250, 248]]]

if __name__ == "__main__":
    spec = json.load(open(sys.argv[1]))
    for job in spec:
        if job["type"] == "stone":
            stone(job["out"], job.get("seed", 3))
        else:
            pl = []
            for p in job["plumes"]:
                p = dict(p)
                p["ramp"] = RED_RAMP if p["ramp"] == "red" else WHITE_RAMP
                pl.append(p)
            smoke(job["out"], pl, job.get("seed", 11), clear=job.get("clear", ()))
        print("wrote", job["out"])
