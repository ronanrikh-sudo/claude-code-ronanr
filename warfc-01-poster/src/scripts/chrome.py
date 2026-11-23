import numpy as np, cv2
from PIL import Image
m = np.asarray(Image.open('num_mask.png').convert('L'), np.float32) / 255
ys, xs = np.where(m > 0.05); pad = 60
m = m[ys.min() - pad:ys.max() + pad, xs.min() - pad:xs.max() + pad]
m = cv2.resize(m, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC).clip(0, 1); pad *= 2
H, W = m.shape
inside = (m > 0.5).astype(np.uint8)
d = cv2.distanceTransform(inside, cv2.DIST_L2, cv2.DIST_MASK_PRECISE)
bw = 30.0
h = np.clip(d / bw, 0, 1)   # machined chamfer
h -= 0.16 * np.exp(-((d - (bw + 16)) / 3.6) ** 2)          # engraved inline
h = cv2.GaussianBlur(h.astype(np.float32), (0, 0), 2.0)
gy, gx = np.gradient(h)
k = bw * 0.85
n = np.dstack([-gx * k, -gy * k, np.ones_like(h)])
n /= np.linalg.norm(n, axis=2, keepdims=True)
# reflection of view vector (0,0,1)
ry = 2 * n[..., 2] * n[..., 1]
yy = (np.mgrid[0:H, 0:W][0].astype(np.float32) - pad) / (H - 2 * pad)
t = np.clip(yy * 0.85 + 0.08 + 0.42 * ry, 0, 1)
stops = [(0.00, (1.00, 1.00, 1.00)), (0.28, (0.88, 0.89, 0.91)), (0.47, (0.46, 0.47, 0.50)),
         (0.505, (0.07, 0.07, 0.08)), (0.55, (0.22, 0.04, 0.05)), (0.74, (0.66, 0.07, 0.09)),
         (0.92, (0.90, 0.32, 0.30)), (1.00, (0.98, 0.70, 0.66))]
env = np.zeros((H, W, 3), np.float32)
for c in range(3):
    env[..., c] = np.interp(t, [s[0] for s in stops], [s[1][c] for s in stops])
L = np.array([-0.45, -0.70, 0.55]); L /= np.linalg.norm(L)
diff = np.clip((n * L).sum(2), 0, 1)
r = np.dstack([2 * n[..., 2] * n[..., 0], ry, 2 * n[..., 2] ** 2 - 1])
spec = np.clip((r * L).sum(2), 0, 1) ** 60
col = env * (0.62 + 0.38 * diff[..., None]) + spec[..., None] * 1.1
# brushed metal + light wear
rng = np.random.default_rng(11)
br = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), sigmaX=80, sigmaY=1.2)
col *= (1 + 0.012 * br / (br.std() + 1e-6))[..., None]
wear = cv2.GaussianBlur((rng.random((H, W)) > 0.9992).astype(np.float32), (0, 0), 2.4)
col *= (1 - np.clip(wear * 2.0, 0, 0.35))[..., None]
col = np.clip(col, 0, 1)
# extrusion (depth) below/right of the face
face_a = m
D = 52
ext = np.zeros((H, W), np.float32); extc = np.zeros((H, W, 3), np.float32)
for i in range(D, 0, -1):
    M2 = np.float32([[1, 0, i * 0.25], [0, 1, i]])
    sh = cv2.warpAffine(face_a, M2, (W, H))
    f = i / D
    c = np.array([0.42, 0.05, 0.06]) * (1 - f) + np.array([0.05, 0.01, 0.015]) * f
    newa = np.clip(sh - ext, 0, 1)
    extc += newa[..., None] * c; ext = np.clip(ext + newa, 0, 1)
extc = extc / np.maximum(ext, 1e-4)[..., None]
out = col * face_a[..., None] + extc * (1 - face_a[..., None])
a = np.clip(face_a + ext * (1 - face_a), 0, 1)
rgba = cv2.resize(np.dstack([out * a[..., None], a]).astype(np.float32), (W // 2, H // 2), interpolation=cv2.INTER_AREA)
rgba[..., :3] /= np.maximum(rgba[..., 3:], 1e-4); W, H = W // 2, H // 2
Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8), 'RGBA').save('numeral.png')
p = Image.new('RGBA', (W, H), (12, 12, 14, 255)); p.alpha_composite(Image.open('numeral.png'))
p.convert('RGB').resize((W // 2, H // 2), Image.LANCZOS).save('numeral_prev.png')
print(W, H)
