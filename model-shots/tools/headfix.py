import cv2,numpy as np,sys
orig_p,cur_p,out_p,x0,x1,y1=sys.argv[1],sys.argv[2],sys.argv[3],*map(int,sys.argv[4:7])
orig=cv2.imread(orig_p); cur=cv2.imread(cur_p); H,W=cur.shape[:2]
# 1) align original head onto current head (similarity transform from SIFT in head box)
sift=cv2.SIFT_create(4000)
def kp(im):
    g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY); m=np.zeros_like(g); m[0:y1,x0:x1]=255
    return sift.detectAndCompute(g,m)
k1,d1=kp(orig); k2,d2=kp(cur)
mm=cv2.BFMatcher().knnMatch(d1,d2,k=2); good=[a for a,b in mm if a.distance<0.75*b.distance]
src=np.float32([k1[g.queryIdx].pt for g in good]); dst=np.float32([k2[g.trainIdx].pt for g in good])
A,inl=cv2.estimateAffinePartial2D(src,dst,method=cv2.RANSAC,ransacReprojThreshold=3)
print('matches',len(good),'inliers',int(inl.sum()),'A',A.round(3).tolist())
ow=cv2.warpAffine(orig,A,(W,H),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT)
# 2) head/neck mask: non-background, non-shirt pixels inside head box, above collar
g=cv2.cvtColor(cur,cv2.COLOR_BGR2GRAY).astype(int)
b,gg,r=[cur[...,i].astype(int) for i in range(3)]
bg=(np.abs(r-gg)<12)&(np.abs(gg-b)<12)&(g>150)
shirt=g<40
m=np.zeros((H,W),np.uint8); m[0:y1,x0:x1]=255
m[bg]=0; m[shirt & (np.arange(H)[:,None]>y1-120)]=0
m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
n,lab,st,_=cv2.connectedComponentsWithStats(m); keep=1+np.argmax(st[1:,4]); m=((lab==keep)*255).astype(np.uint8)
m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(25,25)))
m=cv2.dilate(m,np.ones((3,3),np.uint8),iterations=2)
# keep only pixels that are head/neck in BOTH images, and never the current shirt
og=cv2.cvtColor(ow,cv2.COLOR_BGR2GRAY).astype(int); ob,ogg,orr=[ow[...,i].astype(int) for i in range(3)]
obg=(np.abs(orr-ogg)<12)&(np.abs(ogg-ob)<12)&(og>150)
m[obg]=0
sh=cv2.dilate((g<45).astype(np.uint8),np.ones((3,3),np.uint8),iterations=3)>0
m[sh & (np.arange(H)[:,None]>y1-200)]=0
m=cv2.erode(m,np.ones((3,3),np.uint8),iterations=1)
mf=cv2.GaussianBlur(m.astype(np.float32)/255,(0,0),2.5)[...,None]
# fade the blend out toward the collar so the neck joins smoothly
fade=np.clip((y1-np.arange(H))/60.0,0,1)[:,None,None]; mf=mf*fade
# 3) skin tone of everything else (arms/hands/legs) back to the original's
def skinmask(im):
    hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
    s=((hsv[...,0]<25)&(hsv[...,1]>50)&(hsv[...,2]>40)).astype(np.float32)
    return cv2.GaussianBlur(s,(0,0),3)
so=skinmask(orig)>0.5; sc=skinmask(cur)
gain=orig[so].reshape(-1,3).mean(0)/cur[sc>0.5].reshape(-1,3).mean(0)
print('skin gain',gain.round(3))
cf=cur.astype(np.float32); cf=cf*(1-sc[...,None])+cf*gain*sc[...,None]
out=cf*(1-mf)+ow.astype(np.float32)*mf
cv2.imwrite(out_p,out.clip(0,255).astype(np.uint8)); cv2.imwrite(out_p.replace('.png','_mask.png'),(mf[...,0]*255).astype(np.uint8))
