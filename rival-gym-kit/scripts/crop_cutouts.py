"""Crop transparent garment cut-outs to their bounds (+ shadow margin) for the deck."""
import json, os
from PIL import Image

src, dst = 'out/products/cutouts', 'out/products/cutouts_cropped'
os.makedirs(dst, exist_ok=True)
meta = {}
for fn in sorted(os.listdir(src)):
    im = Image.open(os.path.join(src, fn)).convert('RGBA')
    x0, y0, x1, y1 = im.split()[3].point(lambda v: 255 if v > 10 else 0).getbbox()
    m = 12
    box = (max(0, x0 - m), max(0, y0 - m), min(im.width, x1 + m), min(im.height, y1 + m))
    im.crop(box).save(os.path.join(dst, fn), optimize=True)
    meta[fn[:-4]] = {'w': box[2] - box[0], 'h': box[3] - box[1], 'box': box}
json.dump(meta, open(os.path.join(dst, 'meta.json'), 'w'), indent=1)
print('cropped', len(meta))
