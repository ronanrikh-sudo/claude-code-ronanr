# WAR FC 01 — Issa vs White poster

Rebuilt fight poster, 3:4, rendered at 2160 × 2880.

- `out/WARFC01_Issa-vs-White_poster.png` — master (lossless)
- `out/WARFC01_Issa-vs-White_poster.jpg` — for socials / sharing

## How it's made

The original photos are used, not regenerated, so the fighters' likeness is exact.

1. `scripts/seg.py` — cuts each fighter out with the BiRefNet-portrait matting model (`rembg`).
2. `scripts/fighters.py` — removes the old lettering from the bodies, upscales 2×, and grades:
   per-fighter skin/exposure match, sculpted key light on the faces, clarity, filmic S-curve,
   semi bleach-bypass saturation, graphite/bronze split-tone, crimson centre rim light + cool hair rim.
3. `scripts/logos.py` — keys the WAR FC mark off the old background (brand red `#D61921` kept) and
   turns every partner logo into a single-colour white mark.
4. `scripts/tex.py` — film grain and smoke textures.
5. `poster.html` — layout and typography; `scripts/shot.js` renders it with Playwright at 2× DPR.

Type system (all SIL Open Font License):
Archivo Extra Condensed Black (surnames, event numeral), Mona Sans Expanded (information),
Instrument Serif Italic (first names, "vs", "presented by").

Re-render after editing `poster.html`:

```
cd src && node scripts/shot.js poster.html ../out/WARFC01_Issa-vs-White_poster.png 1080 1440 2
```
