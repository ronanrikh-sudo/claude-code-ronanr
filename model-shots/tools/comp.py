import cv2, numpy as np, json, sys
def lum(im): return cv2.cvtColor(im.astype(np.uint8),cv2.COLOR_BGR2GRAY).astype(np.float32)
def sift_H(crop, gen, ratio=0.8):
    sift=cv2.SIFT_create(nfeatures=8000)
    pre=lambda im: cv2.createCLAHE(2.0,(8,8)).apply(cv2.cvtColor(im,cv2.COLOR_BGR2GRAY))
    k1,d1=sift.detectAndCompute(pre(crop),None); k2,d2=sift.detectAndCompute(pre(gen),None)
    m=cv2.BFMatcher().knnMatch(d1,d2,k=2); good=[a for a,b in m if a.distance<ratio*b.distance]
    src=np.float32([k1[g.queryIdx].pt for g in good]); dst=np.float32([k2[g.trainIdx].pt for g in good])
    H,inl=cv2.findHomography(src,dst,cv2.RANSAC,6.0); print('  sift inliers',int(inl.sum()),'/',len(good)); return H
def run(cfg):
    gen=cv2.imread(cfg['gen']); out=gen.copy().astype(np.float32); Hh,Wh=gen.shape[:2]
    gl=lum(gen)
    # shirt mask: dark garment area with graphics enclosed
    dark=(gl<cfg.get('dark_thr',70)).astype(np.uint8)*255
    dark=cv2.morphologyEx(dark,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(61,61)))
    ff=dark.copy(); m=np.zeros((Hh+2,Wh+2),np.uint8); cv2.floodFill(ff,m,(0,0),255)
    shirt=dark|(~ff)
    shirt=cv2.erode(shirt,np.ones((3,3),np.uint8),iterations=cfg.get('shirt_erode',4))
    cv2.imwrite(cfg['out'].replace('.png','_shirtmask.png'),shirt)
    for p in cfg['patches']:
        flat=cv2.imread(p['flat']); x0,y0,x1,y1=p['box']; crop=flat[y0:y1,x0:x1].copy()
        if 'quad' in p:
            h,w=crop.shape[:2]; H=cv2.getPerspectiveTransform(np.float32([[0,0],[w,0],[w,h],[0,h]]),np.float32(p['quad']))
        else: H=sift_H(crop,gen)
        if 'adjust' in p:  # [scale, dx, dy] about crop centre post-H
            s,dx,dy=p['adjust']; h,w=crop.shape[:2]
            c=cv2.perspectiveTransform(np.float32([[[w/2,h/2]]]),H)[0,0]
            A=np.float32([[s,0,(1-s)*c[0]+dx],[0,s,(1-s)*c[1]+dy],[0,0,1]]); H=A@H
        # graphic signal over fabric black
        cl=lum(crop); fab=np.percentile(cl,20)
        fabc=np.median(crop[cl<=np.percentile(cl,30)].reshape(-1,3),axis=0)
        sig=np.clip(crop.astype(np.float32)-fabc[None,None,:],0,None)
        # suppress fabric-texture noise: soft threshold on luminance of the signal
        sl=sig.max(axis=2); k=np.clip((sl-p.get('noise',6))/6.0,0,1)[...,None]; sig*=k
        ws=cv2.warpPerspective(sig,H,(Wh,Hh),flags=cv2.INTER_AREA if p.get('area') else cv2.INTER_LINEAR)
        if p.get('soften',0)>0: ws=cv2.GaussianBlur(ws,(0,0),p['soften'])
        # removal region: warped crop rect (optionally shrunk) dilated
        rect=np.full(crop.shape[:2],255,np.uint8)
        if 'remove_inset' in p:
            i=p['remove_inset']; rect[:]=0; rect[i:-i or None, i:-i or None]=255
        wr=cv2.warpPerspective(rect,H,(Wh,Hh),flags=cv2.INTER_NEAREST)
        wr=cv2.dilate(wr,np.ones((3,3),np.uint8),iterations=p.get('grow',12))
        if 'extra_remove' in p:
            for poly in p['extra_remove']: cv2.fillPoly(wr,[np.int32(poly)],255)
        # fabric level near region
        ring=cv2.dilate(wr,np.ones((3,3),np.uint8),iterations=20)&~wr
        fabg=np.median(gl[ring>0])
        bright=((gl>fabg+p.get('thr',22))&(wr>0)&(shirt>0)).astype(np.uint8)*255
        bright=cv2.dilate(bright,np.ones((3,3),np.uint8),iterations=p.get('mdil',3))
        hsv=cv2.cvtColor(gen,cv2.COLOR_BGR2HSV)
        skin=((hsv[...,0]<15)&(hsv[...,1]>40)&(hsv[...,2]>60)).astype(np.uint8)
        skin=cv2.morphologyEx(skin,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
        n_,lab_,st_,_=cv2.connectedComponentsWithStats(skin)
        big=np.zeros_like(skin)
        for i in range(1,n_):
            if st_[i,4]>4000: big[lab_==i]=1
        big=cv2.dilate(big,np.ones((3,3),np.uint8),iterations=2)
        bright[big>0]=0
        cur=out.clip(0,255).astype(np.uint8)
        inp=cv2.inpaint(cur,bright,p.get('inr',7),cv2.INPAINT_TELEA).astype(np.float32)
        # re-texture inpainted area with fabric grain from the surroundings
        noise=np.random.normal(0,p.get('grain',2.0),inp.shape[:2]).astype(np.float32)
        noise=cv2.GaussianBlur(noise,(0,0),0.7)
        bm=cv2.GaussianBlur(bright.astype(np.float32)/255,(0,0),1.5)[...,None]
        inp=inp*(1-bm)+(inp+noise[...,None])*bm
        # shading: local illumination of fabric relative to its median
        il=cv2.GaussianBlur(lum(inp.clip(0,255)),(0,0),p.get('shade_sigma',6))
        shade=np.clip((il+8)/(fabg+8),p.get('smin',0.7),p.get('smax',1.3))**p.get('shade_pow',0.8)
        gain=p.get('gain',1.0)
        res=inp+ws*shade[...,None]*gain
        if 'valid_trim_right' in p:
            vm=np.zeros(crop.shape[:2],np.float32); vm[:, :crop.shape[1]-p['valid_trim_right']]=1
            vm=cv2.warpPerspective(vm,H,(Wh,Hh)); vm=cv2.GaussianBlur(vm,(0,0),6)
            cv2.imwrite(cfg['out'].replace('.png','_valid.png'),(vm*255).astype(np.uint8))
        out=res
        print(' patch',p.get('name'),'fab_gen',fabg,'fab_flat',fabc)
    out=out.clip(0,255).astype(np.uint8)
    cv2.imwrite(cfg['out'],out)
if __name__=='__main__':
    run(json.load(open(sys.argv[1])))
