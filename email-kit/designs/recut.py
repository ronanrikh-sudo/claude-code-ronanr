"""Download Higgsfield re-cuts, light 1px edge clean, trim, and save over the asset files. Then a check sheet on black."""
import os, subprocess
from PIL import Image, ImageFilter

V2 = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(V2, 'assets')
B = 'https://d8j0ntlcm91z4.cloudfront.net/user_38HvhYYMUsdKFU6BOiXgUtn25Qr/'
jobs = {
    'g_tee.png': 'hf_20261123_232304_56ed0865-48f1-4f10-9f62-33a4b76f137e.png',
    'p_jersey-diamond.png': 'hf_20261123_232306_9e12fc9c-ae18-4fad-96d3-0dae3f994930.png',
    'p_hoodie-diamond.png': 'hf_20261123_232307_1958e932-e759-44a6-ae71-c6188e3f3c42.png',
    'p_monarch-shorts.png': 'hf_20261123_232309_3a48bc04-232c-4643-b856-14373305cb5f.png',
    'p_boxer-diamond.png': 'hf_20261123_232310_67b920c4-58b4-42b0-bd8d-0895964dc8b1.png',
}
thumbs = []
for dst, fn in jobs.items():
    raw = os.path.join(V2, 'raw_' + dst)
    subprocess.run(['curl', '-sS', '-o', raw, B + fn], check=True)
    im = Image.open(raw).convert('RGBA'); r, g, b, a = im.split()
    a = a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.5))
    im = Image.merge('RGBA', (r, g, b, a)); im = im.crop(a.point(lambda v: 255 if v > 8 else 0).getbbox())
    im.save(os.path.join(A, dst)); print(dst, im.size)
    t = Image.new('RGBA', im.size, (5, 5, 6, 255)); t.alpha_composite(im); t = t.convert('RGB'); t.thumbnail((300, 300)); thumbs.append(t)
W = sum(t.size[0] for t in thumbs) + 10 * len(thumbs); H = max(t.size[1] for t in thumbs)
s = Image.new('RGB', (W, H), (40, 40, 40)); x = 0
for t in thumbs: s.paste(t, (x, 0)); x += t.size[0] + 10
s.save(os.path.join(V2, 'recut_check.jpg'), quality=90)
