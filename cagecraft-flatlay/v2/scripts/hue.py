import sys, colorsys, numpy as np
from PIL import Image
for p in sys.argv[1:]:
    im=Image.open(p).convert('RGB'); im.thumbnail((1200,1200))
    a=np.asarray(im).astype(float)/255
    r,g,b=a[...,0],a[...,1],a[...,2]
    mx=a.max(-1); mn=a.min(-1); sat=(mx-mn)/(mx+1e-6)
    m=(g>0.3)&(b>0.25)&(r<0.55)&(sat>0.35)&(g>r+0.15)&(abs(g-b)<0.3)
    px=a[m]
    if len(px)==0: print(p,'no teal'); continue
    hs=np.array([colorsys.rgb_to_hls(*q)[0]*360 for q in px[::max(1,len(px)//3000)]])
    print(f"{p.split('/')[-1]:22s} n={len(px):6d} hue_med={np.median(hs):.1f} rgb_med={(np.median(px,0)*255).round().astype(int).tolist()}")
