#!/usr/bin/env bash
# Scaffold a new CAGECRAFT wholesale kit project from the skill's reference pipeline.
#   bash new_project.sh <target-dir>
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:?usage: new_project.sh <target-dir>}"
if [ -e "$TARGET" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null)" ]; then
  echo "Refusing to overwrite non-empty $TARGET" >&2
  exit 1
fi
mkdir -p "$TARGET/scripts" "$TARGET/assets" "$TARGET/out"
# pipeline scripts (not the skill's own README / scaffolder)
for f in "$SKILL_DIR"/scripts/*.mjs "$SKILL_DIR"/scripts/*.py; do cp "$f" "$TARGET/scripts/"; done
# house + example assets (not the finish-reference examples)
find "$SKILL_DIR/assets" -maxdepth 1 -type f -exec cp {} "$TARGET/assets/" \;
cat > "$TARGET/.gitignore" <<'EOF'
# regenerable intermediates (node scripts/build.mjs && python3 scripts/crop_cutouts.py)
out/products/cutouts/
out/products/cutouts_cropped/
scripts/__pycache__/
out/catalog/details/
out/catalog/img/
out/catalog/preview/
# invoices carry bank details: keep them out of git
invoice/private.json
out/invoice/
EOF
cat <<MSG
Scaffolded $TARGET
Next (see the skill's scripts/README.md "Adapting for a new client"):
  1. put the client's logo(s) in $TARGET/assets/ (vector preferred) and build their glyph paths
  2. edit IDEAS + centrepiece in scripts/emblem.mjs, templates in scripts/garments.mjs, copy in scripts/boards.mjs
  3. cd $TARGET && node scripts/build.mjs out/products && python3 scripts/crop_cutouts.py && node scripts/boards.mjs && node scripts/artwork.mjs
MSG
