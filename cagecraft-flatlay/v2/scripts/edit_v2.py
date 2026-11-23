#!/usr/bin/env python3
"""Assemble the v2 jersey flat-lay ad from Kling 4K clips.

Usage: python3 edit_v2.py <clips_dir> <out.mp4> <shotlist.json>
Env:   RES=1080 (1080x1920, default) or RES=2160 (2160x3840 master)
       CRF=16   x264 quality
       HUE=0    optional global hue nudge for cyans only (degrees, negative = greener)

shotlist.json: [{"clip": "s01.mp4", "in": 0.2, "dur": 2.6, "xfade": 0.3}, ...]
"xfade" is a cross-dissolve INTO that shot (ignored for the first shot); 0/absent = hard cut.
No speed ramps: every frame is a real 24 fps source frame, so motion stays natural.
"""
import json
import os
import subprocess
import sys

FPS = 24
RES = int(os.environ.get("RES", "1080"))
W, H = (2160, 3840) if RES == 2160 else (1080, 1920)
HUE = float(os.environ.get("HUE", "0"))

clips_dir, out, shot_path = sys.argv[1], sys.argv[2], sys.argv[3]
shots = json.load(open(shot_path))

inputs, chains = [], []
for i, s in enumerate(shots):
    inputs += ["-ss", f"{s['in']:.3f}", "-t", f"{s['dur'] + 0.1:.3f}", "-i", f"{clips_dir}/{s['clip']}"]
    chains.append(
        f"[{i}:v]setpts=PTS-STARTPTS,fps={FPS},"
        f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},"
        f"setsar=1,format=yuv420p,trim=duration={s['dur']:.3f},setpts=PTS-STARTPTS,settb=AVTB[v{i}]"
    )

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

# Finish: keep it photographic. Optional cyan-only hue nudge, a whisper of grain so the
# AI-clean surfaces read like a real sensor, and a short fade out on the final frame.
post = [f"[{cur}]"]
if HUE:
    post.append(f"huesaturation=hue={HUE}:colors=c:strength=1,")
grain = 3 if RES == 2160 else 2
post.append(f"noise=alls={grain}:allf=t,fade=t=out:st={t - 0.5:.3f}:d=0.5,format=yuv420p[out]")
chains.append("".join(post))

cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *inputs,
       "-filter_complex", ";".join(chains), "-map", "[out]",
       "-c:v", "libx264", "-preset", "slow", "-crf", os.environ.get("CRF", "16"),
       "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-r", str(FPS), out]
print(f"{W}x{H}, total ≈ {t:.2f}s")
subprocess.run(cmd, check=True)
