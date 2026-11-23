import subprocess, sys, numpy as np
path=sys.argv[1]
raw=subprocess.run(['ffmpeg','-v','error','-i',path,'-vf','scale=135:240,format=gray','-f','rawvideo','-'],capture_output=True).stdout
fr=np.frombuffer(raw,np.uint8).reshape(-1,240,135).astype(float)
d=[np.abs(fr[i]-fr[i-1]).mean() for i in range(1,len(fr))]
med=np.median(d)
out=[]
for i,v in enumerate(d,1):
    flag=' <<< JUMP' if v>max(4*med,6) else ''
    out.append(f"{i/24:.2f}:{v:.1f}{flag}")
print(path.split('/')[-1],'frames',len(fr),'median diff',round(med,2))
print('  '.join(o for o in out if 'JUMP' in o) or 'no jumps')
