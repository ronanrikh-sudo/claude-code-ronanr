"""Prepare v2 email assets: clean cutout edges (1px alpha erode, light feather), crop, copy fonts."""
import shutil, os
from PIL import Image, ImageFilter

V2 = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(V2, 'assets'); os.makedirs(A, exist_ok=True)
AD = '/home/user/claude-code-ronanr/powerplay-ad'


def clean(src, dst, crop=None, erode=1):
    im = Image.open(src).convert('RGBA')
    if crop:
        im = im.crop(crop)
    r, g, b, a = im.split()
    for _ in range(erode):
        a = a.filter(ImageFilter.MinFilter(3))
    a = a.filter(ImageFilter.GaussianBlur(0.6))
    im = Image.merge('RGBA', (r, g, b, a))
    bbox = a.point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(bbox)
    im.save(os.path.join(A, dst))
    print(dst, im.size)


# Hero: fighters cutout + matching full photo (same framing, resized to the cutout's size)
hero = Image.open(os.path.join(V2, 'hero_full.jpg')).convert('RGB').resize((1638, 2048), Image.LANCZOS)
hero.save(os.path.join(A, 'hero_bg.jpg'), quality=92)
cut = Image.open(os.path.join(V2, 'hero_cut.png')).convert('RGBA')
r, g, b, a = cut.split(); a = a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.5))
Image.merge('RGBA', (r, g, b, a)).save(os.path.join(A, 'hero_cut.png'))
print('hero_bg/hero_cut', hero.size)

clean(os.path.join(V2, 'kitbag_cut.png'), 'g_kitbag.png')
t = Image.open(os.path.join(V2, 'towel_cut.png'))
clean(os.path.join(V2, 'towel_cut.png'), 'g_towel.png', crop=(0, 0, t.size[0], t.size[1] // 2))
clean(f'{AD}/public/img/cut-socks.png', 'g_socks.png')
clean(f'{AD}/public/img/cut-essentials-2.png', 'g_tee.png')
for n in ['hoodie-diamond', 'jersey-diamond', 'monarch-shorts', 'boxer-diamond']:
    clean(f'{AD}/public/img/cut-{n}.png', f'p_{n}.png')

for f in ['haze.png', 'smoke.png']:
    shutil.copy(os.path.join(V2, f), os.path.join(A, f))
shutil.copy(f'{AD}/public/logo-white.png', os.path.join(A, 'logo-white.png'))
fa = f'{AD}/node_modules/@fontsource-variable/archivo/files/'
fi = f'{AD}/node_modules/@fontsource/inter-tight/files/'
for f in ['archivo-latin-wdth-italic.woff2', 'archivo-latin-wdth-normal.woff2']:
    shutil.copy(fa + f, os.path.join(A, f))
for w in (500, 600, 700, 800):
    shutil.copy(fi + f'inter-tight-latin-{w}-normal.woff2', os.path.join(A, f'inter-tight-{w}.woff2'))
print('done')
