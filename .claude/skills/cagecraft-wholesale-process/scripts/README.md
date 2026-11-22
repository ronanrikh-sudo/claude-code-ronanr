# Pipeline — reference implementation (Rival Gym)

The exact scripts that produced the Rival Gym deck. They run in place inside the skill (they read `../assets/`), and `new_project.sh` copies them plus the house assets into a fresh project folder:

```bash
bash <skill-dir>/scripts/new_project.sh <repo>/<client>-kit
```

Requirements already present in this environment: Node 22 with a global Playwright + Chromium (loaded via `pw.mjs` / `createRequire`, because ESM can't import the global package), Python 3 with PIL + numpy, `pdftocairo` / `pdftoppm`, and the Inter / Inter Display fonts. Don't install anything else — package installs are blocked.

## Files
| File | Role |
| --- | --- |
| `trace_logo.py` | Raster logo → vector glyph paths (`assets/<client>_paths.json`). Un-skews italics (`K`), traces at 8×, simplifies, straightens, snaps, smooths. Importable (`import trace_logo as T`). |
| `trace_cagecraft.py` | Example of reusing the tracer for another mark (the CAGECRAFT wordmark; drops the ®). |
| `emblem.mjs` | The centrepiece (Legacy oval + client wordmark), colourways (`IDEAS`), and the back lockups (`topsLockup`, `shortsLockup`, `cagecraft`, `cross`, `rivalGymLine`). |
| `pattern.mjs` | The Legacy circuit hem pattern (`patternPath`). |
| `garments.mjs` | Garment templates (rashguard, tee, curved-cut shorts; front and back), shading recipe, symmetry helpers, `PRODUCTS` map. |
| `build.mjs` | Renders every product × idea to `out/products/*.png` + SVG, and transparent cut-outs. |
| `crop_cutouts.py` | Crops cut-outs to alpha bbox for the boards (`meta.json`). |
| `boards.mjs` | Builds the deck slides (4K PNG) and the PDF. |
| `artwork.mjs` | Exports vector emblem + lockups to `out/artwork/`. |
| `pw.mjs` | Loads the global Playwright from ESM. |

## Run order (from the project root)
```bash
python3 scripts/trace_logo.py assets/<client-logo>.png assets/rival_paths.json   # or bring vector paths
(cd scripts && python3 trace_cagecraft.py ../assets/cagecraft-wordmark-source.png ../assets/cagecraft_paths.json 0.36)  # only if re-tracing
node scripts/build.mjs out/products        # optional 2nd arg filters names, e.g. "shorts_A"
python3 scripts/crop_cutouts.py
node scripts/boards.mjs
node scripts/artwork.mjs
```

## Adapting for a new client
1. **Logo**: prefer the client's vector. If you trace, set the italic slant `K` and baselines in `trace_logo.py` for their mark and output glyph paths; if you have an SVG, extract its paths (group by the SVG's ids) instead of tracing. Update the glyph JSON name and the `RIVAL_BOX` / `GYM_BOX` constants in `emblem.mjs` (bounding boxes in source units).
2. **Colours and ideas**: edit `IDEAS` in `emblem.mjs` (ring / word / secondary / pattern colours, labels, one-line subs).
3. **Centrepiece**: keep the Legacy oval if it suits the brand; otherwise build the client's device in `emblem.mjs` with the same discipline (preview all colourways large on black before garments).
4. **Lockups**: rename `rivalGymLine` for the client and adjust `topsLockup` / `shortsLockup` text.
5. **Garments**: reuse the templates or add new ones in `garments.mjs` (half outline → `symOutline`, mirror details with `mirrorD`/`both`), then register them in `PRODUCTS` (use `ideas: [...]` to limit which colourways render, and a `-back` key for back views).
6. **Deck copy**: `boards.mjs` holds the slide texts (centrepiece notes, product notes, spec chips, next-step line) and the PDF filename — rewrite them for the client.
7. Run the QA loop from `SKILL.md` after every render.

`assets/rival-logo-source.png` and `assets/rival_paths.json` are kept as example data so the pipeline renders the Rival kit out of the box; replace them for a new client.


## Added from WAR FC
- `textures.py`: procedural smoke plumes and stone flakes as RGBA PNGs on the 2000×2500 canvas (spec JSON: plumes with source polylines, reach, ramp and clear ellipses). Embed them as `<image>` under the logos and the shading pass.
- `trace_emblem.py`: traces a white-on-black photographed print (used for the CAGECRAFT emblem, `assets/cagecraft_emblem.json`).
- The WAR FC project (`war-fc-kit/`) is the reference for event shorts: two cuts (fight short, compression), the waistband logo rectangle, the sash and dry-brush streaks.
