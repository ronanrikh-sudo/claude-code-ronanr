#!/usr/bin/env bash
# Contact sheet of QC stills: scripts/sheet.sh out.jpg t1 t2 ... (seconds, as rendered by stills.mjs)
out=$1; shift; n=$#; cols=${COLS:-6}; w=${W:-270}; h=$((w*16/9))
args=(); filt=""; i=0; layout=""
for t in "$@"; do f=$(printf "out/frames/t%.2f.jpg" $t); args+=(-i "$f")
  filt+="[$i]scale=$w:$h,drawtext=text='$t':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.5[v$i];"
  layout+="$(( (i%cols)*w ))_$(( (i/cols)*h ))|"; i=$((i+1)); done
inputs=""; for j in $(seq 0 $((n-1))); do inputs+="[v$j]"; done
ffmpeg -v error -y "${args[@]}" -filter_complex "${filt}${inputs}xstack=inputs=$n:layout=${layout%|}:fill=black" "$out"
