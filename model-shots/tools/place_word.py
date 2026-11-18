import cv2,numpy as np,sys,json
sys.path.insert(0,'work'); import sleeve
cfg=json.load(open(sys.argv[1])); img=cv2.imread(cfg['in']).astype(np.float32); H,W=img.shape[:2]
for r in cfg.get('erase',[]):   # small leftover marks: fill from surrounding dark fabric
    x0,y0,x1,y1=r; m=np.zeros((H,W),np.uint8); g=cv2.cvtColor(img.clip(0,255).astype(np.uint8),cv2.COLOR_BGR2GRAY)
    reg=g[y0:y1,x0:x1]; cloth=cv2.morphologyEx((reg<45).astype(np.uint8),cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
    cloth=cv2.erode(cloth,np.ones((3,3),np.uint8),iterations=1)
    m[y0:y1,x0:x1]=(((reg>35)&(cloth>0))*255).astype(np.uint8); m=cv2.dilate(m,np.ones((3,3),np.uint8),iterations=1)
    m[y0:y1,x0:x1][cloth==0]=0
    src=((g<45)&(m==0)).astype(np.float32); num=cv2.GaussianBlur(img*src[...,None],(0,0),4); den=cv2.GaussianBlur(src,(0,0),4)[...,None]
    fill=num/np.maximum(den,1e-3); mf=cv2.GaussianBlur(m.astype(np.float32)/255,(0,0),1)[...,None]; img=img*(1-mf)+fill*mf
for w in cfg['words']:
    p,th=sleeve.real_word(w['flat'],w['box'])
    if 'trim' in w: l,r=w['trim']; w0=p.shape[1]; p=p[:,int(w0*l):w0-int(w0*r)]
    sig=sleeve.signal(p); ph,pw=sig.shape[:2]
    d=np.array(w['dir'],float); d/=np.linalg.norm(d); n=np.array([-d[1],d[0]])
    s=w['h']/th; Wd=pw*s; Hp=ph*s
    anchor=np.array(w['anchor'],float)   # left: start point of text; right: end point of text (on centre line)
    start=anchor if w['side']=='left' else anchor-d*Wd
    q=np.float32([start-n*Hp/2,start+d*Wd-n*Hp/2,start+d*Wd+n*Hp/2,start+n*Hp/2])
    M=cv2.getPerspectiveTransform(np.float32([[0,0],[pw,0],[pw,ph],[0,ph]]),q)
    ws=cv2.warpPerspective(sig,M,(W,H),flags=cv2.INTER_AREA)
    img=img+ws*w.get('gain',0.9)
cv2.imwrite(cfg['out'],img.clip(0,255).astype(np.uint8))
