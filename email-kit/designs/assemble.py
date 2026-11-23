"""Convert slice PNGs to JPGs and build a full-email preview (with a placeholder for the live cart block)."""
import glob, os, sys
from PIL import Image, ImageDraw

out = sys.argv[1]
fs = sorted(glob.glob(os.path.join(out, 's0*.png')))
for f in fs:
    im = Image.open(f).convert('RGB')
    j = f[:-4] + '.jpg'
    im.save(j, quality=86, optimize=True, progressive=True)
    print(os.path.basename(f), im.size, os.path.getsize(j) // 1024, 'KB jpg')

ims = [Image.open(f).convert('RGB') for f in fs]
H = sum(i.size[1] for i in ims) + 400
canvas = Image.new('RGB', (1200, H), '#080808')
y = 0
for f, im in zip(fs, ims):
    canvas.paste(im, (0, y))
    y += im.size[1]
    if f.endswith('s03.png'):
        d = ImageDraw.Draw(canvas)
        d.rectangle([48, y + 20, 1152, y + 380], outline='#7fd8cc', width=3)
        d.text((80, y + 190), '[ LIVE CART PRODUCTS: Omnisend block ]', fill='#7fd8cc')
        y += 400
canvas = canvas.crop((0, 0, 1200, y))
canvas.resize((600, y // 2)).save(os.path.join(out, '..', 'preview.jpg'), quality=88)
print('preview', 600, y // 2)
