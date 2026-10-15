#!/usr/bin/env bash
# Scaffold a new kinetic-motion video project from the skill's template.
#   bash new_project.sh <target-dir> [project-name]
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:?usage: new_project.sh <target-dir> [project-name]}"
NAME="${2:-$(basename "$TARGET")}"
if [ -e "$TARGET" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null)" ]; then
  echo "Refusing to overwrite non-empty $TARGET" >&2
  exit 1
fi
mkdir -p "$TARGET"
cp -R "$SKILL_DIR/assets/template/." "$TARGET/"
mkdir -p "$TARGET/public/audio" "$TARGET/assets/vo" "$TARGET/out"
# Name the package and the output file after the project.
python3 - "$TARGET" "$NAME" <<'PY'
import json, sys, pathlib, re
target, name = pathlib.Path(sys.argv[1]), sys.argv[2]
slug = re.sub(r"[^a-z0-9-]+", "-", name.lower()).strip("-") or "kinetic-video"
pkg = target / "package.json"; p = json.loads(pkg.read_text()); p["name"] = slug; pkg.write_text(json.dumps(p, indent=2) + "\n")
scr = target / "script.json"; s = json.loads(scr.read_text()); s["title"] = name; s["output"] = slug; scr.write_text(json.dumps(s, indent=2) + "\n")
PY
cat <<MSG
Scaffolded $TARGET
Next:
  cd $TARGET && npm install && pip install numpy scipy   # + piper-tts for the offline voice
  1. art-direct: set src/theme.ts (look) + src/fonts.ts (npm i @fontsource/<family>)   -> references/art-direction.md
  2. write script.json (segments/clauses, voice, music.mood) + src/content.ts (on-screen copy)
  3. plan scenes in src/Video.tsx (example scenes are starting points)     -> references/scene-recipes.md
  put a pre-generated take at assets/vo/voiceover.mp3 (optional), then:
  npm run voice && node scripts/stills.mjs 2 5 8 && npm run render
MSG
