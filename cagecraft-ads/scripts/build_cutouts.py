"""Cut product / model photos off their backdrop. The matting model only supplies ALPHA;
RGB is always the original photograph (edge band is decontaminated against the backdrop colour).
usage: python3 -I build_cutouts.py <src_root> <dst_root> <list.tsv>   (tsv: slug<TAB>file<TAB>kind)"""
import sys, os, numpy as np
from PIL import Image
from scipy import ndimage
from rembg import new_session, remove
src_root, dst_root, lst = sys.argv[1:4]
sess = new_session('isnet-general-use')
for line in open(lst):
    line = line.strip()
    if not line: continue
    slug, fn, kind = line.split('\t')
    src = os.path.join(src_root, slug, fn)
    im = Image.open(src).convert('RGB')
    rgb = np.asarray(im).astype(np.float32)
    h, w = rgb.shape[:2]
    m = np.asarray(remove(im, session=sess, only_mask=True).convert('L')).astype(np.float32) / 255
    fg = m > 0.5
    lab, n = ndimage.label(fg)
    if n > 1:  # drop specks, keep real pieces
        sizes = ndimage.sum(fg, lab, range(1, n + 1)); keep = sizes >= sizes.max() * 0.01
        fg = np.isin(lab, np.nonzero(keep)[0] + 1)
    if kind == 'flat': fg = ndimage.binary_fill_holes(fg)
    fg = ndimage.binary_erosion(fg, iterations=2)          # pull in 2px: no backdrop halo
    alpha = np.clip((ndimage.gaussian_filter(fg.astype(np.float32), 1.0) - 0.1) / 0.8, 0, 1)
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]]); bg = np.median(border, 0)
    a3 = np.maximum(alpha, 0.05)[..., None]; edge = (alpha > 0) & (alpha < 1)
    out_rgb = np.where(edge[..., None], np.clip((rgb - (1 - a3) * bg) / a3, 0, 255), rgb)
    ys, xs = np.nonzero(alpha > 0.05); pad = 16
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(h, ys.max() + pad), max(0, xs.min() - pad), min(w, xs.max() + pad)
    out = np.dstack([out_rgb, alpha * 255]).round().astype(np.uint8)[y0:y1, x0:x1]
    # proof: every fully-opaque pixel is byte-identical to the source photograph
    solid = out[..., 3] == 255
    assert np.array_equal(out[..., :3][solid], np.asarray(im)[y0:y1, x0:x1][solid]), 'interior pixels changed!'
    os.makedirs(os.path.join(dst_root, slug), exist_ok=True)
    dst = os.path.join(dst_root, slug, os.path.splitext(fn)[0] + '.png')
    Image.fromarray(out, 'RGBA').save(dst, optimize=True)
    print(f"{slug}/{os.path.basename(dst)} {x1-x0}x{y1-y0} opaque={solid.mean():.2f} src_crop=({x0},{y0})", flush=True)
