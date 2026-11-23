#!/usr/bin/env bash
# Rebuild library/ (git-ignored): real CAGECRAFT product photography from the store CDN + alpha-only cutouts.
#   bash scripts/build-library.sh        (needs: curl, python3 with pillow numpy scipy rembg onnxruntime)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p library/photo library/cut library/video library/logo
while IFS=$'\t' read -r slug name url; do
  case "$name" in
    *.mp4) dst="library/video/$slug.mp4" ;;
    *) mkdir -p "library/photo/$slug"; dst="library/photo/$slug/$name" ;;
  esac
  [ -s "$dst" ] || echo "$url"$'\t'"$dst"
done < scripts/library-urls.tsv | xargs -r -P 8 -L 1 bash -c 'curl -sSL --retry 3 -o "$1" "$0" || echo "FAIL $1"'
cp -n ../cagecraft-sale/public/img/logo-white.png library/logo/logo-white.png
python3 -I scripts/build_cutouts.py library/photo library/cut scripts/library-cutouts.tsv
