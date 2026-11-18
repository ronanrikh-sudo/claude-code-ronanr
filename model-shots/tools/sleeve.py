import cv2,numpy as np,json,sys
def yellow(im):
    b,g,r=[im[...,i].astype(int) for i in range(3)]
    return ((r>110)&(g>90)&(b<0.75*g)&(r-b>45)).astype(np.uint8)*255
def pca(mask,off):
    ys,xs=np.nonzero(mask); P=np.stack([xs+off[0],ys+off[1]],1).astype(np.float64)
    c=P.mean(0); U,s,Vt=np.linalg.svd(P-c,full_matrices=False); d=Vt[0]
    if d[0]<0: d=-d
    n=np.array([-d[1],d[0]]); 
    proj_d=(P-c)@d; proj_n=(P-c)@n
    return c,d,n,proj_d.min(),proj_d.max(),proj_n.min(),proj_n.max()
def real_word(flat,box):
    """extract word as horizontal signal patch (text reading left->right, upright)"""
    im=cv2.imread(flat); x0,y0,x1,y1=box; reg=im[y0:y1,x0:x1]
    m=yellow(reg); c,d,n,a0,a1,b0,b1=pca(m,(0,0))
    pad=4; W=int(a1-a0+2*pad); H=int(b1-b0+2*pad)
    src=np.float32([c+d*(a0-pad)+n*(b0-pad), c+d*(a1+pad)+n*(b0-pad), c+d*(a1+pad)+n*(b1+pad)])
    dst=np.float32([[0,0],[W,0],[W,H]])
    A=cv2.getAffineTransform(src,dst); patch=cv2.warpAffine(reg,A,(W,H),flags=cv2.INTER_CUBIC)
    return patch, (b1-b0)
def signal(patch,noise=8):
    pl=cv2.cvtColor(patch,cv2.COLOR_BGR2GRAY)
    fabc=np.median(patch[pl<=np.percentile(pl,40)].reshape(-1,3),axis=0)
    sig=np.clip(patch.astype(np.float32)-fabc,0,None)
    k=np.clip((sig.max(2)-noise)/8,0,1)[...,None]
    ym=cv2.dilate(yellow(patch),np.ones((3,3),np.uint8),iterations=2).astype(np.float32)/255
    ym=cv2.GaussianBlur(ym,(0,0),0.8)[...,None]
    return sig*k*ym
if __name__=='__main__':
    cfg=json.load(open(sys.argv[1])); img=cv2.imread(cfg['in']).astype(np.float32); Hh,Wh=img.shape[:2]
    gl=cv2.cvtColor(img.astype(np.uint8),cv2.COLOR_BGR2GRAY)
    words={}
    for s in cfg['sleeves']:
        if s['word'] not in words:
            wb=cfg['words'][s['word']]; p,th=real_word(wb['flat'],wb['box'])
            if wb.get('flip'): p=cv2.rotate(p,cv2.ROTATE_180)
            if 'trim' in wb:
                l,r=wb['trim']; w0=p.shape[1]; p=p[:,int(w0*l):w0-int(w0*r)]
            words[s['word']]=(p,th); pass
        x0,y0,x1,y1=s['box']; m=yellow(img[y0:y1,x0:x1].astype(np.uint8))
        c,d,n,a0,a1,b0,b1=pca(m,(x0,y0)); h=(b1-b0)*s.get('hscale',1.0)
        # remove AI text
        rm=np.zeros(gl.shape,np.uint8); rm[y0:y1,x0:x1]=cv2.dilate(m,np.ones((3,3),np.uint8),iterations=3)
        ii=img.astype(np.int32); bg=(np.abs(ii[...,2]-ii[...,1])<14)&(np.abs(ii[...,1]-ii[...,0])<14)&(gl>110)
        rm[bg]=0
        glc=cv2.cvtColor(img.clip(0,255).astype(np.uint8),cv2.COLOR_BGR2GRAY)
        src=((glc<60)&(rm==0)).astype(np.float32)
        num=cv2.GaussianBlur(img*src[...,None],(0,0),6); den=cv2.GaussianBlur(src,(0,0),6)[...,None]
        fill=num/np.maximum(den,1e-3)
        rmf=cv2.GaussianBlur(rm.astype(np.float32)/255,(0,0),1.2)[...,None]
        img=img*(1-rmf)+fill*rmf
        nz=cv2.GaussianBlur(np.random.normal(0,2.0,gl.shape).astype(np.float32),(0,0),0.7)
        img+= (nz*(rm>0))[...,None]
        # lateral edge along text line
        gl2=cv2.cvtColor(img.clip(0,255).astype(np.uint8),cv2.COLOR_BGR2GRAY)
        dark=cv2.morphologyEx((gl2<s.get('dark_thr',75)).astype(np.uint8),cv2.MORPH_OPEN,np.ones((3,3),np.uint8))>0
        step=-1 if s['side']=='left' else 1
        t=0.0
        while True:
            p=c+d*t*step; xi,yi=int(round(p[0])),int(round(p[1]))
            if not (0<=xi<Wh and 0<=yi<Hh) or not dark[yi,xi]: break
            t+=1
        E=c+d*t*step
        patch,th=words[s['word']]; sig=signal(patch); ph,pw=sig.shape[:2]
        scale=h/th*s.get('size',1.0); W=pw*scale*s.get('wscale',0.92); Hp=ph*scale
        margin=s.get('margin',0.35)*h
        if s.get('anchor')=='ai':
            E=c+d*(a0 if s['side']=='left' else a1)
            if s['side']=='left': start=E
            else: start=E-d*W
        elif s['side']=='left': start=E+d*margin
        else: start=E-d*margin-d*W
        start=start+n*s.get('nshift',0.0)*h
        q=np.float32([start-n*Hp/2, start+d*W-n*Hp/2, start+d*W+n*Hp/2, start+n*Hp/2])
        M=cv2.getPerspectiveTransform(np.float32([[0,0],[pw,0],[pw,ph],[0,ph]]),q)
        ws=cv2.warpPerspective(sig,M,(Wh,Hh),flags=cv2.INTER_AREA)
        il=cv2.GaussianBlur(cv2.cvtColor(img.clip(0,255).astype(np.uint8),cv2.COLOR_BGR2GRAY).astype(np.float32),(0,0),5)
        fab=np.median(il[(rm>0)]) if (rm>0).any() else 20
        shade=np.clip((il+8)/(fab+8),0.75,1.25)**0.8
        img=img+ws*shade[...,None]*s.get('gain',1.0)
        print(s['word'],s['side'],'h',round(h,1),'edge',E.round(1),'d',d.round(3))
    cv2.imwrite(cfg['out'],img.clip(0,255).astype(np.uint8))
