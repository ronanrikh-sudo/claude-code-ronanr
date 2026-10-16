"""Key product photos off their uniform studio background (edge flood-fill) -> RGBA PNG.
usage: python3 -I scripts/cutout.py in.jpg out.png"""
import sys, subprocess, numpy as np
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]
probe = subprocess.run(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height","-of","csv=p=0",src],capture_output=True,text=True).stdout.strip().split(",")
w, h = int(probe[0]), int(probe[1])
rgb = np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",src,"-f","rawvideo","-pix_fmt","rgb24","-"],capture_output=True).stdout,np.uint8).reshape(h,w,3).astype(np.float32)
border = np.concatenate([rgb[0], rgb[-1], rgb[:,0], rgb[:,-1]])
bg = np.median(border, 0)
dist = np.sqrt(((rgb - bg) ** 2).sum(-1))
# background = low-distance pixels connected to the border; tolerance adapts to the border's own noise
tol = max(14.0, np.percentile(np.sqrt(((border - bg) ** 2).sum(-1)), 98) * 1.6)
cand = dist < tol
lab, _ = ndimage.label(cand)
edge_labels = np.unique(np.concatenate([lab[0], lab[-1], lab[:,0], lab[:,-1]]))
bgmask = np.isin(lab, edge_labels[edge_labels > 0])
fg = ~bgmask
fg = ndimage.binary_opening(fg, iterations=1)
fg = ndimage.binary_fill_holes(fg)
# keep the largest components (drop specks)
lab2, n = ndimage.label(fg)
if n > 1:
    sizes = ndimage.sum(fg, lab2, range(1, n + 1)); keep = sizes >= sizes.max() * 0.02
    fg = np.isin(lab2, np.nonzero(keep)[0] + 1)
fg = ndimage.binary_erosion(fg, iterations=4)
alpha = ndimage.gaussian_filter(fg.astype(np.float32), 0.8)
alpha = np.clip((alpha - 0.1) / 0.8, 0, 1)
# colour decontamination: remove the studio grey that edge pixels were blended with
a3 = np.maximum(alpha, 0.05)[..., None]
edge = (alpha > 0) & (alpha < 1)
dec = np.clip((rgb - (1 - a3) * bg) / a3, 0, 255)
rgb = np.where(edge[..., None], dec, rgb)
# crop to content with a margin
ys, xs = np.nonzero(alpha > 0.05); m = 12
y0, y1, x0, x1 = max(0, ys.min() - m), min(h, ys.max() + m), max(0, xs.min() - m), min(w, xs.max() + m)
out = np.dstack([rgb, alpha * 255]).astype(np.uint8)[y0:y1, x0:x1]
subprocess.run(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgba","-s",f"{x1-x0}x{y1-y0}","-i","-",dst],input=out.tobytes(),check=True)
print(dst, f"{x1-x0}x{y1-y0}", "bg", bg.astype(int), "tol %.1f" % tol)
