import sys, numpy as np
from PIL import Image
for p in sys.argv[1:]:
    im=Image.open(p).convert('RGB'); im.thumbnail((800,800))
    a=np.asarray(im).astype(float)
    mx=a.max(-1); mn=a.min(-1); lum=a.mean(-1)
    m=(lum>35)&(lum<140)&((mx-mn)<35)   # dark-mid, low-chroma = concrete/shadow
    px=a[m]; med=np.median(px,0)
    print(f"{p.split('/')[-1]:18s} n={m.sum():6d} concrete_med RGB={med.round(1).tolist()}  R-G={med[0]-med[1]:+.1f} B-G={med[2]-med[1]:+.1f}")
