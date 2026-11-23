import numpy as np, cv2, sys, json
from PIL import Image
S = 2
P = dict(sat=0.80, contrast=1.22, clarity=0.48, rim=0.70, rim_cool=0.35, fade0=700, fade1=1000)
if len(sys.argv) > 1: P.update(json.loads(sys.argv[1]))

src = np.asarray(Image.open('src.jpg').convert('RGB'), np.float32) / 255
H, W = src.shape[:2]
mL = np.asarray(Image.open('mask_birefnet-portrait_L.png'), np.float32) / 255
mR = np.asarray(Image.open('mask_birefnet-portrait_R.png'), np.float32) / 255
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)

# ---------- 1. remove the old typography from the bodies ----------
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
body = np.clip(mL + mR, 0, 1)
w = body * (1 - tm)
fill = np.zeros_like(src); have = np.zeros((H, W), np.float32)
for sig in (5, 12, 30, 70):
    num = cv2.GaussianBlur(src * w[..., None], (0, 0), sig)
    den = cv2.GaussianBlur(w, (0, 0), sig)
    f = num / np.maximum(den, 1e-4)[..., None]
    take = (den > 0.15) & (have < 0.5)
    fill[take] = f[take]; have[take] = 1
rng = np.random.default_rng(7)
fill = fill + rng.normal(0, 0.012, fill.shape).astype(np.float32)
tmf = cv2.GaussianBlur(tm, (0, 0), 1.5)[..., None]
clean = src * (1 - tmf) + fill * tmf

# split the two masks where they meet in the middle (old "VS" sat there)
low = ss(760, 800, yy)
mL = mL * (1 - low * ss(500, 530, xx))
mR = mR * (1 - low * (1 - ss(568, 598, xx)))
fade = 1 - ss(P['fade0'], P['fade1'], yy)
aL, aR = mL * fade, mR * fade

# ---------- 2. upscale to 2x ----------
up = lambda a: cv2.resize(a, (W * S, H * S), interpolation=cv2.INTER_LANCZOS4)
img = np.clip(up(clean), 0, 1)
aL2, aR2 = np.clip(up(aL), 0, 1), np.clip(up(aR), 0, 1)
mL2, mR2 = np.clip(up(mL), 0, 1), np.clip(up(mR), 0, 1)
Y2, X2 = np.mgrid[0:H * S, 0:W * S].astype(np.float32) / S  # 1x coords

# ---------- 3. grade ----------
lin = np.clip(img, 0, 1) ** 2.2
# per-fighter balance (face means sampled from source): pull both toward one shared skin target
tgt = np.array([150, 114, 96], np.float32) / 255
faceL = np.array([156.3, 108.8, 87.1]) / 255; faceR = np.array([152.4, 120.2, 105.0]) / 255
gL = ((tgt ** 2.2) / (faceL ** 2.2)) ** 0.55; gR = ((tgt ** 2.2) / (faceR ** 2.2)) ** 0.55
side = ss(520, 560, X2)[..., None]
lin = lin * (gL * (1 - side) + gR * side)

# sculpted light: key on faces, fall-off down the bodies and to the outer frame edges
def blob(cx, cy, sx, sy): return np.exp(-(((X2 - cx) / sx) ** 2 + ((Y2 - cy) / sy) ** 2) / 2)
light = 0.80 + 0.47 * blob(212, 330, 150, 175) + 0.30 * blob(888, 345, 150, 175)
light += 0.12 * blob(215, 640, 210, 120) + 0.10 * blob(800, 660, 230, 120)  # fists
light *= 1 - 0.50 * ss(620, 960, Y2)
light *= 1 - 0.40 * (1 - ss(0, 170, X2)) - 0.40 * ss(930, 1080, X2)
light *= 1 - 0.20 * side[..., 0] * ss(470, 640, Y2)  # White's pale torso down to match Issa
light *= 1 - 0.10 * side[..., 0] * blob(888, 250, 120, 60)  # tame forehead hot-spot
lin = lin * light[..., None]

g = lin ** (1 / 2.2)
Y = (g * np.array([0.2126, 0.7152, 0.0722], np.float32)).sum(2)
# clarity (local contrast) on luminance
base = cv2.GaussianBlur(Y, (0, 0), 14 * S)
mid = 4 * Y * (1 - Y)
Yc = np.clip(Y + P['clarity'] * (Y - base) * mid, 0, 1)
# filmic S-curve with rich blacks and soft highlight roll-off
def curve(x, c=P['contrast'], piv=0.42):
    x = np.clip(x, 0, 1)
    lo = piv * (x / piv) ** c
    hi = 1 - (1 - piv) * ((1 - x) / (1 - piv)) ** (c * 0.85)
    return np.where(x < piv, lo, hi)
Yt = curve(Yc)
ratio = (Yt / np.maximum(Y, 1e-4))[..., None]
g = np.clip(g * ratio, 0, 1)
# semi bleach-bypass: pull saturation, keep skin warmth
Yn = (g * np.array([0.2126, 0.7152, 0.0722], np.float32)).sum(2)[..., None]
g = Yn + (g - Yn) * P['sat']
# split tone: graphite shadows, warm bronze highlights
Yn = np.clip(Yn, 0, 1); sh = (1 - Yn) ** 2.2; hl = Yn ** 2
g = g + sh * np.array([-0.010, 0.000, 0.012]) + hl * np.array([0.030, 0.012, -0.018])
# toe: deepen the very bottom end
g = np.clip(g, 0, 1)
g = np.where(g < 0.06, g * (0.5 + 0.5 * g / 0.06), g)

# fine sharpen at output scale
bl = cv2.GaussianBlur(g, (0, 0), 1.1)
g = np.clip(g + 0.55 * (g - bl), 0, 1)

# ---------- 4. rim light ----------
def shift(a, dx, dy):
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(a, M, (a.shape[1], a.shape[0]), borderMode=cv2.BORDER_REPLICATE)
def rim(m, dx, dy, blur):
    e = m * (1 - shift(m, -dx, -dy))
    return cv2.GaussianBlur(e, (0, 0), blur)
crimson = np.array([1.0, 0.16, 0.12], np.float32)
cool = np.array([0.80, 0.86, 1.0], np.float32)
vert = (1 - ss(250, 900, Y2))  # strongest on heads & shoulders
# left fighter is lit from the centre (his left side of frame = viewer right)
rL = rim(mL2, 3.5 * S, 0.5 * S, 1.0 * S) * 0.9 + rim(mL2, 12 * S, 0, 6 * S) * 0.30
rR = rim(mR2, -3.5 * S, 0.5 * S, 1.0 * S) * 0.9 + rim(mR2, -12 * S, 0, 6 * S) * 0.30
cL = rim(mL2, -3 * S, 3 * S, 1.2 * S) + rim(mL2, 0, 3.5 * S, 1.2 * S) * 0.8   # cool top/back rim
cR = rim(mR2, 3 * S, 3 * S, 1.2 * S) + rim(mR2, 0, 3.5 * S, 1.2 * S) * 0.8
rimc = (rL + rR) * vert * P['rim']
rimk = (cL + cR) * (1 - ss(150, 700, Y2)) * P['rim_cool']
g = 1 - (1 - g) * (1 - np.clip(rimc[..., None] * crimson, 0, 1))
g = 1 - (1 - g) * (1 - np.clip(rimk[..., None] * cool * 0.8, 0, 1))
g = np.clip(g, 0, 1)

def save(a, name, crop):
    rgba = np.dstack([g, a]); x0, y0, x1, y1 = [c * S for c in crop]
    Image.fromarray((rgba[y0:y1, x0:x1] * 255 + 0.5).astype(np.uint8), 'RGBA').save(name)
save(aL2, 'fighter_L.png', (0, 80, 600, 1080))
save(aR2, 'fighter_R.png', (480, 80, 1080, 1080))

# quick preview on near-black
a = np.clip(aL2 + aR2, 0, 1)[..., None]
bg = np.array([0.03, 0.03, 0.035], np.float32)
prev = g * a + bg * (1 - a)
Image.fromarray((prev * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS).save('fighters_preview.png')
Image.fromarray((prev * 255).astype(np.uint8)).crop((200 * S // 1, 200, 1300, 1100)).save('fighters_zoom.png')
print('ok')
