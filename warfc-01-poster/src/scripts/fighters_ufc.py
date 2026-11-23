import numpy as np, cv2, sys, json
from PIL import Image
S = 3
P = dict(sat=0.92, contrast=1.42, rim=1.0, rim_cool=0.55, kick=0.35, sheen=0.16, fade0=690, fade1=940)
if len(sys.argv) > 1: P.update(json.loads(sys.argv[1]))
def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
def f32(p): return np.asarray(Image.open(p).convert('RGB'), np.float32) / 255

src = f32('src.jpg')[:1100]
H, W = src.shape[:2]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
mL = (np.asarray(Image.open('mask_birefnet-portrait_L.png'), np.float32) / 255)[:H]
mR = (np.asarray(Image.open('mask_birefnet-portrait_R.png'), np.float32) / 255)[:H]

# ---- old typography out (computed at 1x, applied to the 3x super-res plate) ----
r, g, b = src[..., 0], src[..., 1], src[..., 2]
mx, mn = src.max(2), src.min(2)
red = ((r - np.maximum(g, b)) > 0.30) & (r > 0.45)
wht = (mn > 0.60) & ((mx - mn) < 0.16)
tm = np.zeros((H, W), bool)
for (x0, y0, x1, y1) in [(66, 732, 204, 802), (476, 790, 616, 975), (928, 732, 1018, 802)]:
    tm[y0:y1, x0:x1] |= red[y0:y1, x0:x1]
for (x0, y0, x1, y1) in [(66, 792, 268, 975), (716, 792, 1018, 975)]:
    tm[y0:y1, x0:x1] |= wht[y0:y1, x0:x1]
tm = cv2.morphologyEx(tm.astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
tm = cv2.dilate(tm, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))).astype(np.float32)
body = np.clip(mL + mR, 0, 1); w = body * (1 - tm)
fill = np.zeros_like(src); have = np.zeros((H, W), np.float32)
for sig in (5, 12, 30, 70):
    num = cv2.GaussianBlur(src * w[..., None], (0, 0), sig); den = cv2.GaussianBlur(w, (0, 0), sig)
    f = num / np.maximum(den, 1e-4)[..., None]; take = (den > 0.15) & (have < 0.5)
    fill[take] = f[take]; have[take] = 1
low = ss(760, 800, yy)
mL = mL * (1 - low * ss(500, 530, xx)); mR = mR * (1 - low * (1 - ss(568, 598, xx)))
fade = 1 - ss(P['fade0'], P['fade1'], yy)

up = lambda a: cv2.resize(a, (W * S, H * S), interpolation=cv2.INTER_CUBIC)
img = f32('src_x3.png')
tm3 = np.clip(cv2.GaussianBlur(up(tm), (0, 0), 4), 0, 1)[..., None]
rng = np.random.default_rng(7)
fill3 = np.clip(up(fill), 0, 1) + rng.normal(0, 0.010, img.shape).astype(np.float32)
img = np.clip(img * (1 - tm3) + fill3 * tm3, 0, 1)
tmk = 1 - np.clip(cv2.GaussianBlur(tm3[..., 0], (0, 0), 12), 0, 1) ** 0.5
del fill3, tm3
mL3, mR3 = np.clip(up(mL), 0, 1), np.clip(up(mR), 0, 1)
aL3, aR3 = mL3 * up(fade), mR3 * up(fade)
Y1, X1 = np.mgrid[0:H * S, 0:W * S].astype(np.float32) / S

# ---- grade ----
lin = img ** 2.2
tgt = np.array([150, 114, 96], np.float32) / 255
faceL = np.array([156.3, 108.8, 87.1]) / 255; faceR = np.array([152.4, 120.2, 105.0]) / 255
gL = ((tgt ** 2.2) / (faceL ** 2.2)) ** 0.55; gR = ((tgt ** 2.2) / (faceR ** 2.2)) ** 0.55
side = ss(520, 560, X1)[..., None]
lin *= (gL * (1 - side) + gR * side)
def blob(cx, cy, sx, sy): return np.exp(-(((X1 - cx) / sx) ** 2 + ((Y1 - cy) / sy) ** 2) / 2)
light = 0.74 + 0.55 * blob(212, 330, 140, 170) + 0.36 * blob(888, 345, 140, 170)
light += 0.16 * blob(215, 640, 200, 110) + 0.12 * blob(790, 670, 220, 110)
light *= 1 - 0.58 * ss(640, 990, Y1)
light *= 1 - 0.50 * (1 - ss(0, 190, X1)) - 0.50 * ss(910, 1080, X1)
light *= 1 - 0.32 * side[..., 0] * ss(470, 640, Y1)
light *= 1 - 0.12 * side[..., 0] * blob(888, 250, 120, 60)
lin *= light[..., None]; del light
g = np.clip(lin, 0, 1) ** (1 / 2.2); del lin

lum = lambda a: (a * np.array([0.2126, 0.7152, 0.0722], np.float32)).sum(2)
Y = lum(g)
M = np.clip(mL3 + mR3, 0, 1)
def mblur(a, sg):   # mask-aware blur: background never leaks into the subject (no halos)
    return cv2.GaussianBlur(a * M, (0, 0), sg) / np.maximum(cv2.GaussianBlur(M, (0, 0), sg), 1e-3)
d1 = Y - cv2.GaussianBlur(Y, (0, 0), 2.5 * S)
d2 = (Y - mblur(Y, 9 * S)) * tmk
d3 = (Y - mblur(Y, 28 * S)) * tmk
mid = 4 * Y * (1 - Y)
Yc = np.clip(Y + mid * (0.20 * d1 + 0.72 * d2 + 0.38 * d3), 0, 1)
def curve(x, c=P['contrast'], piv=0.40):
    x = np.clip(x, 0, 1)
    return np.where(x < piv, piv * (x / piv) ** c, 1 - (1 - piv) * ((1 - x) / (1 - piv)) ** (c * 0.8))
Yt = curve(Yc)
g = np.clip(g * (Yt / np.maximum(Y, 1e-4))[..., None], 0, 1)
Yn = np.clip(lum(g), 0, 1)[..., None]
g = Yn + (g - Yn) * P['sat']
g += (1 - Yn) ** 2.2 * np.array([-0.012, -0.004, 0.010]) + Yn ** 2 * np.array([0.040, 0.016, -0.026])
# sweat sheen on the high points of the musculature
spec = np.clip(d2 * 5, 0, 1) * ss(0.45, 0.80, Yt)
g += (spec * P['sheen'])[..., None] * np.array([1.0, 0.95, 0.88])
g = np.clip(g, 0, 1)
g = np.where(g < 0.05, g * (0.45 + 0.55 * g / 0.05), g)
bl = cv2.GaussianBlur(g, (0, 0), 1.4)
g = np.clip(g + 0.40 * (g - bl), 0, 1)
del d1, d2, d3, Y, Yc, Yt, Yn, bl

# ---- light rig: red kicker + rim from centre, cool rim from behind/above ----
def shift(a, dx, dy):
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(a, M, (a.shape[1], a.shape[0]), borderMode=cv2.BORDER_REPLICATE)
def rim(m, dx, dy, blur):
    return cv2.GaussianBlur(m * (1 - shift(m, -dx * S, -dy * S)), (0, 0), blur * S)
RED = np.array([1.0, 0.13, 0.10], np.float32); COOL = np.array([0.82, 0.88, 1.0], np.float32)
vert = 1 - ss(260, 950, Y1)
rL = rim(mL3, 3, 0, 0.9) * 0.9 + rim(mL3, 12, 0, 6) * 0.28
rR = rim(mR3, -3, 0, 0.9) * 0.9 + rim(mR3, -12, 0, 6) * 0.28
kL = rim(mL3, 60, 10, 22); kR = rim(mR3, -60, 10, 22)          # broad coloured side light
cL = rim(mL3, -2.5, 2.5, 0.8) + 0.8 * rim(mL3, 0, 3, 0.8)
cR = rim(mR3, 2.5, 2.5, 0.8) + 0.8 * rim(mR3, 0, 3, 0.8)
Yg = lum(g)[..., None]
g = g + ((kL + kR) * vert * P['kick'])[..., None] * RED * (0.25 + 0.75 * Yg)
g = 1 - (1 - np.clip(g, 0, 1)) * (1 - np.clip(((rL + rR) * vert * P['rim'])[..., None] * RED, 0, 1))
g = 1 - (1 - g) * (1 - np.clip(((cL + cR) * (1 - ss(160, 720, Y1)) * P['rim_cool'])[..., None] * COOL * 0.85, 0, 1))
g = np.clip(g, 0, 1)

def save(a, name, crop):
    x0, y0, x1, y1 = [c * S for c in crop]
    rgba = np.dstack([g[y0:y1, x0:x1], a[y0:y1, x0:x1]])
    Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), 'RGBA').save(name, compress_level=3)
save(aL3, 'ufc_fighter_L.png', (0, 80, 620, 1100))
save(aR3, 'ufc_fighter_R.png', (460, 80, 1080, 1100))
a = np.clip(aL3 + aR3, 0, 1)[..., None]
prev = g * a + np.array([0.03, 0.03, 0.035], np.float32) * (1 - a)
Image.fromarray((prev * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS).save('ufc_fighters_preview.png')
Image.fromarray((prev * 255).astype(np.uint8)).crop((2160, 420, 3180, 1560)).save('ufc_face_R.png')
print('ok')
