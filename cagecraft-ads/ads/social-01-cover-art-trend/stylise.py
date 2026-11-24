"""Turn real CAGECRAFT photos into flat, inked, cover-art style panels. Deterministic image filter only:
no generative model touches the photo, so prints, logos and colourways stay as photographed.
usage: python3 -I stylise.py <src> <dst> [crop=x0,y0,x1,y1 as fractions]"""
import sys, cv2, numpy as np
src, dst = sys.argv[1], sys.argv[2]
im = cv2.imread(src, cv2.IMREAD_COLOR)
if len(sys.argv) > 3:
    x0, y0, x1, y1 = [float(v) for v in sys.argv[3].split(',')]
    h, w = im.shape[:2]; im = im[int(y0*h):int(y1*h), int(x0*w):int(x1*w)]
h, w = im.shape[:2]; s = 1500 / max(h, w)
im = cv2.resize(im, (int(w*s), int(h*s)), interpolation=cv2.INTER_AREA)
# 1) flatten: edge-preserving smoothing, twice, keeps hard edges of prints and lettering
flat = cv2.edgePreservingFilter(im, flags=cv2.RECURS_FILTER, sigma_s=40, sigma_r=0.35)
flat = cv2.bilateralFilter(flat, 9, 60, 9)
# 2) posterise lightness into bands (painted shading), keep hue as photographed
lab = cv2.cvtColor(flat, cv2.COLOR_BGR2LAB).astype(np.float32)
L = lab[..., 0] / 255.0
L = np.clip((L - 0.5) * 1.22 + 0.5, 0, 1)                    # contrast
bands = 9
Lq = (np.floor(L * bands) + 0.5) / bands
L = 0.7 * Lq + 0.3 * L                                        # soft banding
lab[..., 0] = np.clip(L * 255, 0, 255)
lab[..., 1] = np.clip((lab[..., 1] - 128) * 1.28 + 128, 0, 255)  # richer colour
lab[..., 2] = np.clip((lab[..., 2] - 128) * 1.28 + 128 + 3, 0, 255)
out = cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2BGR).astype(np.float32)
# 3) ink lines from the smoothed image
g = cv2.cvtColor(flat, cv2.COLOR_BGR2GRAY)
g = cv2.GaussianBlur(g, (0, 0), 1.2)
dog = cv2.GaussianBlur(g, (0, 0), 1.0).astype(np.float32) - cv2.GaussianBlur(g, (0, 0), 2.6).astype(np.float32)
ink = np.clip(1.0 + dog / 7.0, 0, 1)                           # dark where a line is
ink = np.where(ink < 0.55, ink, 1.0)
ink = cv2.GaussianBlur(ink, (0, 0), 0.7)
out = out * (0.25 + 0.75 * ink[..., None])
# 4) light warm top-light / cool shadow grade
yy = np.linspace(0, 1, out.shape[0])[:, None, None]
out = out * (1.04 - 0.10 * yy)
cv2.imwrite(dst, np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 93])
