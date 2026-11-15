#!/usr/bin/env bash
# Audio for the re-edit: the original ad's music from its bar downbeat at 1.445 s (so every picture
# cut lands on a bar line), plus light brand SFX, mastered to -14 LUFS / -1 dBTP.
# usage: scripts/mix.sh <original_ad.mp4> <sfx_dir> <out.wav>
set -euo pipefail
SRC=$1; X=$2; OUT=$3
ffmpeg -v error -y -ss 1.445 -i "$SRC" -i "$X/slam-89Gjyv7ZWHt2cs5IFSxM.mp3" -i "$X/whoosh-dz6EyD6c0E8E3UPAmFL8.mp3" \
  -i "$X/logo-8akkxMReMBQSRxTsERPN.mp3" -i "$X/button-Ry72jq7sFN1yuPfpcNHY.mp3" -filter_complex "
  [0:a]aresample=48000,pan=stereo|c0=c0|c1=c1,afade=t=in:d=0.015,apad=whole_dur=10,atrim=0:10,afade=t=out:st=9.35:d=0.65[m];
  [1:a]aresample=48000,volume=-15dB,adelay=0|0[s1];
  [2:a]aresample=48000,volume=-17dB,adelay=7280|7280[s2];
  [3:a]aresample=48000,volume=-11dB,adelay=7860|7860[s3];
  [4:a]aresample=48000,volume=-6dB,adelay=8550|8550[s4];
  [m][s1][s2][s3][s4]amix=inputs=5:normalize=0:duration=first,atrim=0:10[mix];
  [mix]loudnorm=I=-14:TP=-1.5:LRA=11:linear=true,aresample=48000[out]" -map "[out]" -c:a pcm_s16le "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tr -s ' '
