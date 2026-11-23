#!/usr/bin/env python3
"""Assemble the jersey flat-lay ad from Kling clips.

Usage: python3 edit.py <clips_dir> <out.mp4> <shotlist.json>
shotlist.json: [{"clip": "s01.mp4", "in": 0.3, "dur": 3.0, "speed": 1.0, "xfade": 0.25}, ...]
"xfade" is the cross-dissolve INTO this shot (ignored for the first shot); 0 = hard cut.
"""
import json
import os
import subprocess
import sys

W, H, FPS = 1080, 1920, 24

clips_dir, out, shot_path = sys.argv[1], sys.argv[2], sys.argv[3]
shots = json.load(open(shot_path))

inputs, chains = [], []
for i, s in enumerate(shots):
    speed = s.get("speed", 1.0)
    src_len = s["dur"] * speed + 0.05
    inputs += ["-ss", f"{s['in']:.3f}", "-t", f"{src_len:.3f}", "-i", f"{clips_dir}/{s['clip']}"]
    chains.append(
        f"[{i}:v]setpts=(PTS-STARTPTS)/{speed},fps={FPS},"
        f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},"
        f"setsar=1,format=yuv420p,trim=duration={s['dur']:.3f},setpts=PTS-STARTPTS,settb=AVTB[v{i}]"
    )

# chain xfades / concatenations
cur, t = "v0", shots[0]["dur"]
for i in range(1, len(shots)):
    xf = shots[i].get("xfade", 0)
    nxt = f"m{i}"
    if xf > 0:
        chains.append(f"[{cur}][v{i}]xfade=transition=fade:duration={xf}:offset={t - xf:.3f},settb=AVTB[{nxt}]")
        t = t - xf + shots[i]["dur"]
    else:
        chains.append(f"[{cur}][v{i}]concat=n=2:v=1:a=0,settb=AVTB[{nxt}]")
        t = t + shots[i]["dur"]
    cur = nxt

# gentle unifying finish: tiny contrast lift, soft vignette, fine grain, short fade in/out
grade = (
    f"[{cur}]eq=contrast=1.02:saturation=1.02,"
    f"vignette=angle=PI/10:mode=forward,"
    f"noise=alls=2:allf=t,"
    f"fade=t=in:st=0:d=0.35,fade=t=out:st={t - 0.45:.3f}:d=0.45,format=yuv420p[out]"
)
chains.append(grade)

cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *inputs,
       "-filter_complex", ";".join(chains), "-map", "[out]",
       "-c:v", "libx264", "-preset", "slow", "-crf", os.environ.get("CRF", "15"), "-profile:v", "high",
       "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-r", str(FPS), out]
print(f"total ≈ {t:.2f}s")
subprocess.run(cmd, check=True)
