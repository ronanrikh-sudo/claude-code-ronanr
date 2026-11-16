#!/usr/bin/env bash
# Rebuild public/footage/footage.mp4 (the 300-frame, bar-aligned picture plate) from the ad's
# original footage. usage: scripts/build_plate.sh public/footage/source-meta-720p.mp4
#   - cuts the 3.5 s fade-in; keeps source shots A (backs), B (Diamond), C (Cotton Candy), D (fronts)
#   - re-times A/B/C by +-1-2 frames so every cut lands on the music's bar lines (frames 59/117/176/234)
#   - D gets 2x motion-compensated slow motion, then holds as the end-card plate
#   - light denoise, lanczos upscale 720p -> 1080x1920, gentle sharpen
set -euo pipefail
SRC=$(realpath "$1"); OUT=$(realpath public/footage)/footage.mp4
W=$(mktemp -d); mkdir -p "$W/src" "$W/slow" "$W/seq"
VF="hqdn3d=1.2:1.2:2.5:2.5,scale=1080:1920:flags=lanczos,unsharp=5:5:0.55:5:5:0"
ffmpeg -v error -y -i "$SRC" -vf "select='between(n\,104\,297)',$VF" -vsync 0 -q:v 2 -start_number 104 "$W/src/%04d.jpg"
ffmpeg -v error -y -i "$SRC" -vf "select='between(n\,278\,296)',setpts=N/30/TB,minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,$VF" -vsync 0 -q:v 2 "$W/slow/%04d.jpg"
python3 -I - "$W" <<'PY'
import sys, os
W=sys.argv[1]; m=[]
m += [f"src/{round(104+i*57/58):04d}.jpg" for i in range(59)]   # A backs wide    0-58
m += [f"src/{round(162+j*58/57):04d}.jpg" for j in range(58)]   # B Diamond       59-116
m += [f"src/{round(221+k*56/58):04d}.jpg" for k in range(59)]   # C Cotton Candy  117-175
d=[f"slow/{f}" for f in sorted(os.listdir(f"{W}/slow"))]; d += [d[-1]]*(58-len(d))  # D 176-233
m += d + [d[-1]]*66                                              # E plate         234-299
assert len(m)==300
for i,f in enumerate(m): os.symlink(f"{W}/{f}", f"{W}/seq/{i:04d}.jpg")
PY
ffmpeg -v error -y -framerate 30 -i "$W/seq/%04d.jpg" -c:v libx264 -preset slow -crf 12 -pix_fmt yuv420p -movflags +faststart "$OUT"
echo "$OUT"
