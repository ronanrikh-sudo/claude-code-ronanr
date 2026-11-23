import numpy as np, cv2
from PIL import Image
S = 2; H, W = 1440 * S, 1080 * S
rng = np.random.default_rng(21)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32) / S          # 1x poster coords
def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
def value_noise(h, w, cell):
    gh, gw = h // cell + 3, w // cell + 3
    v = rng.random((gh, gw)).astype(np.float32)
    return cv2.resize(v, (gw * cell, gh * cell), interpolation=cv2.INTER_CUBIC)[:h, :w]
def fbm(h, w, base, oct=6):
    o = np.zeros((h, w), np.float32); a, t = 1, 0
    for i in range(oct):
        o += a * value_noise(h, w, max(base >> i, 2)); t += a; a *= 0.55
    return o / t
RED = np.array([0.84, 0.10, 0.13], np.float32)

# key glow: red backlight behind the fighters + cool top spill
g_red = np.exp(-(((xx - 540) / 430) ** 2 + ((yy - 520) / 470) ** 2))
g_top = np.exp(-(((xx - 540) / 380) ** 2 + ((yy + 40) / 260) ** 2))
img = np.zeros((H, W, 3), np.float32) + np.array([0.022, 0.022, 0.026])
img += g_red[..., None] * RED * 0.42
img += g_top[..., None] * np.array([0.55, 0.55, 0.60]) * 0.10

# out-of-focus cage mesh (diamond chain-link), back-lit by the red glow
p = 58.0
u = (xx + yy) / p; v = (xx - yy) / p
wob = (fbm(H, W, 256, 3) - 0.5) * 0.12
du = np.abs(((u + wob) % 1) - 0.5); dv = np.abs(((v - wob) % 1) - 0.5)
wire = np.clip(1 - np.minimum(0.5 - du, 0.5 - dv) * p / 1.6, 0, 1)
wire = cv2.GaussianBlur(wire, (0, 0), 3.2 * S)
mesh_light = 0.15 + 0.85 * (g_red * 0.9 + g_top * 0.6)
img += (wire * mesh_light * (1 - ss(700, 1100, yy)))[..., None] * np.array([0.95, 0.38, 0.36]) * 0.22

# spotlight beams from the rig above, cut through haze
haze = fbm(H, W, 512, 6)
beams = np.zeros((H, W), np.float32)
for x0, ang, wdt, k in [(150, 0.30, 0.050, 0.8), (380, 0.12, 0.040, 0.9), (700, -0.12, 0.040, 0.9), (930, -0.30, 0.050, 0.8), (540, 0.0, 0.030, 0.6)]:
    dx = xx - (x0 + ang * (yy + 60)); spread = wdt * (yy + 60) + 6
    beams += k * np.exp(-(dx / spread) ** 2) * (1 - ss(150, 1000, yy))
beams *= 0.35 + 0.9 * haze
img += beams[..., None] * np.array([0.75, 0.70, 0.72]) * 0.085

# rolling smoke, warmer/redder near the light
q1, q2 = fbm(H, W, 512, 4), fbm(H, W, 512, 4)
mx = (xx * S + (q1 - 0.5) * 520).astype(np.float32); my = (yy * S + (q2 - 0.5) * 400).astype(np.float32)
sm = cv2.remap(fbm(H, W, 640, 6), mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
sm = np.clip((sm - 0.40) / 0.32, 0, 1) ** 1.6
smoke_col = (np.array([0.5, 0.5, 0.53]) * (1 - g_red[..., None]) + np.array([0.95, 0.30, 0.28]) * g_red[..., None])
img += (sm * (0.10 + 0.25 * ss(500, 1200, yy)))[..., None] * smoke_col * 0.55

# vignette + fine concrete grit
vig = 1 - 0.75 * np.clip(((xx - 540) / 700) ** 2 + ((yy - 600) / 900) ** 2, 0, 1)
img *= vig[..., None]
img *= (1 + (fbm(H, W, 16, 3) - 0.5) * 0.10)[..., None]
img = np.clip(img, 0, 1)
Image.fromarray((img ** (1 / 1.0) * 255).astype(np.uint8)).save('bg_ufc.png')

# ---------- FX layer (screen-blended over everything): embers + front haze ----------
fx = np.zeros((H, W, 3), np.float32)
def avoid(x, y):  # keep embers off the faces and the name block
    faces = [(212, 330, 170, 210), (888, 345, 170, 210)]
    return any(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2 < 1 for cx, cy, sx, sy in faces)
lay = np.zeros((H, W, 3), np.float32)
n = 0
while n < 120:
    x = rng.uniform(0, 1080) if rng.random() < 0.5 else (rng.uniform(0, 260) if rng.random() < 0.5 else rng.uniform(820, 1080))
    y = rng.uniform(380, 1000)
    if 860 < y < 1000 and 120 < x < 960: continue
    if avoid(x, y): continue
    n += 1
    L = rng.uniform(2, 16) * S; a = rng.uniform(-2.2, -1.0)   # drifting up and sideways
    x1, y1 = x * S + np.cos(a) * L, y * S + np.sin(a) * L
    heat = rng.random()
    c = np.array([1.0, 0.25 + 0.55 * heat, 0.08 + 0.25 * heat ** 2]) * (rng.uniform(0.25, 0.6) if rng.random() < 0.8 else 1.0)
    cv2.line(lay, (int(x * S), int(y * S)), (int(x1), int(y1)), c.tolist(), max(1, int(rng.uniform(1, 2.6) * S / 2)), cv2.LINE_AA)
fx += cv2.GaussianBlur(lay, (0, 0), 0.8) + cv2.GaussianBlur(lay, (0, 0), 6) * 1.4
bok = np.zeros((H, W, 3), np.float32)
for i in range(16):
    x = rng.uniform(0, 1080); y = rng.uniform(300, 950)
    if avoid(x, y): continue
    r = int(rng.uniform(6, 26) * S)
    c = np.array([1.0, rng.uniform(0.2, 0.5), 0.12]) * rng.uniform(0.10, 0.28)
    cv2.circle(bok, (int(x * S), int(y * S)), r, c.tolist(), -1, cv2.LINE_AA)
fx += cv2.GaussianBlur(bok, (0, 0), 3 * S)
# low front haze rolling over the bodies/names
fh = np.clip((cv2.remap(fbm(H, W, 512, 5), mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT) - 0.45) / 0.3, 0, 1)
fx += (fh * ss(640, 1050, yy) * (1 - ss(1150, 1300, yy)))[..., None] * np.array([0.62, 0.22, 0.22]) * 0.20
Image.fromarray((np.clip(fx, 0, 1) * 255).astype(np.uint8)).save('fx_ufc.png')
print('ok')
