#!/usr/bin/env bash
# scripts/sheet.sh out.jpg img1 img2 ...  -> one row, each scaled to 360 wide
set -euo pipefail
out=$1; shift; n=$#; inputs=(); filters=""; i=0
for f in "$@"; do inputs+=(-i "$f"); filters+="[$i]scale=360:-1[v$i];"; i=$((i+1)); done
for j in $(seq 0 $((n-1))); do filters+="[v$j]"; done
ffmpeg -v error -y "${inputs[@]}" -filter_complex "${filters}hstack=$n" -q:v 3 "$out"
