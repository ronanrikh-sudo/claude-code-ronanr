import cv2, numpy as np, time
sr = cv2.dnn_superres.DnnSuperResImpl_create()
sr.readModel('/root/.sr/EDSR_x3.pb'); sr.setModel('edsr', 3)
img = cv2.imread('src.jpg')
img = img[0:1100]                       # fighters live above y=1100
H, W = img.shape[:2]; S = 3; T = 200; O = 12
out = np.zeros((H * S, W * S, 3), np.float32); wsum = np.zeros((H * S, W * S, 1), np.float32)
t = time.time()
for y in range(0, H, T):
    for x in range(0, W, T):
        y0, x0 = max(y - O, 0), max(x - O, 0); y1, x1 = min(y + T + O, H), min(x + T + O, W)
        r = sr.upsample(img[y0:y1, x0:x1]).astype(np.float32)
        wy = np.ones(r.shape[0], np.float32); wx = np.ones(r.shape[1], np.float32)
        ramp = np.linspace(0, 1, 2 * O * S, dtype=np.float32)
        if y0 > 0: wy[:2 * O * S] = ramp
        if y1 < H: wy[-2 * O * S:] = ramp[::-1]
        if x0 > 0: wx[:2 * O * S] = ramp
        if x1 < W: wx[-2 * O * S:] = ramp[::-1]
        wgt = (wy[:, None] * wx[None, :])[..., None]
        out[y0 * S:y1 * S, x0 * S:x1 * S] += r * wgt; wsum[y0 * S:y1 * S, x0 * S:x1 * S] += wgt
cv2.imwrite('src_x3.png', np.clip(out / np.maximum(wsum, 1e-6), 0, 255).astype(np.uint8))
print('done', round(time.time() - t), 's')
