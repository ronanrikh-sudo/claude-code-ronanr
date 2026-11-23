import numpy as np, cv2
from PIL import Image
rng = np.random.default_rng(3)
# film grain tile (2x scale), luminance only, slightly clumped
g = rng.normal(0, 1, (1024, 1024)).astype(np.float32)
g = 0.65 * g + 0.35 * cv2.GaussianBlur(g, (0, 0), 0.9) * 2.2
g = np.clip(128 + g * 34, 0, 255).astype(np.uint8)
Image.fromarray(g, 'L').save('grain.png')

# volumetric smoke: domain-warped fbm, 1x poster size
H, W = 1440, 1080
def value_noise(h, w, cell):
    gh, gw = h // cell + 3, w // cell + 3
    v = rng.random((gh, gw)).astype(np.float32)
    return cv2.resize(v, (gw * cell, gh * cell), interpolation=cv2.INTER_CUBIC)[:h, :w]
def fbm(h, w, base, octaves=6):
    out = np.zeros((h, w), np.float32); amp, tot = 1.0, 0
    for o in range(octaves):
        out += amp * value_noise(h, w, max(base >> o, 2)); tot += amp; amp *= 0.55
    return out / tot
q1, q2 = fbm(H, W, 256), fbm(H, W, 256)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
mx = (xx + (q1 - 0.5) * 260).astype(np.float32); my = (yy + (q2 - 0.5) * 200).astype(np.float32)
n = cv2.remap(fbm(H, W, 320), mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
n = np.clip((n - 0.42) / 0.30, 0, 1) ** 1.8
# wispy streaks
s2 = cv2.remap(fbm(H, W, 128, 5), mx * 1.0, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
n = n * (0.6 + 0.8 * s2)
Image.fromarray((np.clip(n, 0, 1) * 255).astype(np.uint8), 'L').save('smoke.png')
print('ok')
