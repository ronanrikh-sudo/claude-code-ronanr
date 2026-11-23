import sys, numpy as np
from PIL import Image
from rembg import remove, new_session
model = sys.argv[1]
s = new_session(model)
im = Image.open('src.jpg').convert('RGB')
# per-fighter crops so the model focuses on one person
boxes = {'L': (0, 90, 600, 1100), 'R': (500, 90, 1080, 1100)}
for k, b in [(k, boxes[k]) for k in sys.argv[2:]]:
    c = im.crop(b)
    m = remove(c, session=s, only_mask=True, post_process_mask=False)
    full = Image.new('L', im.size, 0); full.paste(m, b[:2])
    full.save(f'mask_{model}_{k}.png')
    # preview on grey
    a = np.asarray(full, dtype=np.float32)[..., None] / 255
    arr = np.asarray(im, dtype=np.float32)
    prev = arr * a + np.array([0, 160, 60], np.float32) * (1 - a)
    Image.fromarray(prev.astype(np.uint8)).crop(b).save(f'prev_{model}_{k}.png')
print('done')
