import cv2,numpy as np,sys
# usage: merge_sources.py closeup_result valid_mask flatlay_result out
B=cv2.imread(sys.argv[1]).astype(np.float32); V=cv2.imread(sys.argv[2],0).astype(np.float32)[...,None]/255; A=cv2.imread(sys.argv[3]).astype(np.float32)
cv2.imwrite(sys.argv[4],(B*V+A*(1-V)).clip(0,255).astype(np.uint8))
