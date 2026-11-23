import numpy as np, cv2
from PIL import Image
src = np.asarray(Image.open('src.jpg').convert('RGB'), np.float32) / 255
S = 4  # extract logos at 4x so they stay crisp at the 2x render
def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
def up(a, s=S): return cv2.resize(a, None, fx=s, fy=s, interpolation=cv2.INTER_CUBIC)

def mono(box, lo, hi, name, gamma=1.0, keep=None):
    x0, y0, x1, y1 = box
    c = src[y0:y1, x0:x1]
    v = c.max(2)
    a = up(v)
    a = ss(lo, hi, a) ** gamma          # steep curve after upscale = crisp, vector-like edges
    if keep is not None: a *= up(keep(c))
    a = np.clip(a, 0, 1)
    ys, xs = np.where(a > 0.02)
    a = a[max(ys.min() - 4, 0):ys.max() + 5, max(xs.min() - 4, 0):xs.max() + 5]
    rgba = np.dstack([np.ones_like(a)] * 3 + [a])
    Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').save(name)
    print(name, a.shape[1] // S, a.shape[0] // S)

# sponsor strip (pure black background) -> single-colour marks
mono((66, 1312, 166, 1390), 0.16, 0.42, 'sp_ax.png')
mono((176, 1312, 386, 1392), 0.16, 0.42, 'sp_yac.png')
mono((418, 1306, 500, 1392), 0.16, 0.42, 'sp_rab.png')
mono((532, 1310, 652, 1392), 0.16, 0.42, 'sp_cagecraft.png')
mono((688, 1312, 776, 1392), 0.14, 0.34, 'sp_panthers.png')
mono((806, 1310, 1014, 1392), 0.16, 0.42, 'sp_wscc.png')

# presenting sponsor (AX Carpentry, centre of poster, on smoky bg): key on orange-ness
def orange(c):
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    return ss(0.10, 0.30, r - b)
mono((458, 386, 628, 528), 0.30, 0.60, 'ax_present.png', keep=orange)

# WAR FC mark: keep brand colours (white + red), key off the smoky navy bg
x0, y0, x1, y1 = 326, 122, 752, 277
c = src[y0:y1, x0:x1]
r, g, b = c[..., 0], c[..., 1], c[..., 2]
mn = c.min(2)
redness = r - np.maximum(g, b)
a_red = ss(0.16, 0.36, redness) * ss(0.30, 0.50, r)
a_wht = ss(0.42, 0.66, mn)
a = np.clip(np.maximum(a_red, a_wht), 0, 1)
a = up(a); col = np.clip(up(c), 0, 1)
a = ss(0.25, 0.75, a)
# unpremultiply over the dark bg and push toward the two brand inks
bg = np.array([0.04, 0.05, 0.08], np.float32)
fg = np.clip((col - bg * (1 - a[..., None])) / np.maximum(a[..., None], 1e-3), 0, 1)
isred = up(ss(0.10, 0.25, redness))[..., None]
RED = np.array([0.86, 0.09, 0.11], np.float32); WHT = np.array([0.96, 0.95, 0.93], np.float32)
fg = isred * RED + (1 - isred) * WHT * np.clip(fg.mean(2, keepdims=True) / 0.85, 0.75, 1.0)
ys, xs = np.where(a > 0.03)
sl = (slice(ys.min() - 4, ys.max() + 5), slice(xs.min() - 4, xs.max() + 5))
rgba = np.dstack([fg[sl], a[sl]])
Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8), 'RGBA').save('war_logo.png')
print('war_logo', rgba.shape[1] // S, rgba.shape[0] // S)
# sample the brand red from the crown
cr = src[132:160, 500:580].reshape(-1, 3); m = (cr[:, 0] - cr[:, 1:].max(1)) > 0.4
print('brand red', (cr[m].mean(0) * 255).round())
