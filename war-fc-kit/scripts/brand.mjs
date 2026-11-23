// WAR FC brand assets: the client's own vector logo groups (recolourable),
// AX Carpentry (presenting sponsor) and the CAGECRAFT wordmark, plus the
// crown motif used to build the background pattern.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const A = (p) => path.join(here, '../assets', p);
const f2 = (n) => n.toFixed(2);

export const WAR_RED = '#ED1C24'; // from the logo's own SVG (.st0)
export const WHITE = '#F4F4F2';
export const BLACK = '#121212';

const BOX = JSON.parse(fs.readFileSync(A('logo_boxes.json'), 'utf8'));

// --- WAR FC logo: pull named top-level groups out of the supplied SVG ----------
const WAR_SVG = fs.readFileSync(A('src/WarFC-Logo.svg'), 'utf8');
function groupMarkup(src, id) {
  const start = src.indexOf(`<g id="${id}"`);
  if (start < 0) throw new Error('missing group ' + id);
  let depth = 0;
  const re = /<\/?g\b[^>]*>/g;
  re.lastIndex = start;
  let m;
  while ((m = re.exec(src))) {
    if (m[0].startsWith('</')) depth--;
    else if (!m[0].endsWith('/>')) depth++;
    if (depth === 0) return src.slice(start, re.lastIndex);
  }
  throw new Error('unbalanced group ' + id);
}
const WAR_PARTS = Object.fromEntries(['WAR', 'Crown', 'FIGHTING_CHAMPIONSHIPS', 'PYB_BANNER'].map((id) => [id, groupMarkup(WAR_SVG, id)]));

/** WAR FC logo in its own units. colours: { red, white } replace the logo's red and white.
 *  parts: subset of WAR | Crown | FIGHTING_CHAMPIONSHIPS | PYB_BANNER. */
export function warLogo({ red = WAR_RED, white = WHITE } = {}, parts = ['Crown', 'WAR', 'FIGHTING_CHAMPIONSHIPS', 'PYB_BANNER']) {
  const svg = parts
    .map((p) => WAR_PARTS[p].replace(/class="st0"/g, `fill="${red}"`).replace(/class="st1"/g, `fill="${white}"`).replace(/\sid="[^"]*"/g, ''))
    .join('');
  const bs = parts.map((p) => BOX.war[p]);
  const box = [Math.min(...bs.map((b) => b[0])), Math.min(...bs.map((b) => b[1])), Math.max(...bs.map((b) => b[2])), Math.max(...bs.map((b) => b[3]))];
  return { svg, box };
}

// --- AX Carpentry ----------------------------------------------------------------
const AX_PATHS = [...fs.readFileSync(A('src/ax-orange-over-black.svg'), 'utf8').matchAll(/<path\b[^>]*\sd="([^"]+)"[^>]*\/>/g)]
  .slice(1) // drop the black background box
  .map((m) => m[1]);
export function axLogo(fill = WHITE) {
  return { svg: AX_PATHS.map((d) => `<path d="${d}" fill="${fill}"/>`).join(''), box: BOX.ax };
}

// --- CAGECRAFT wordmark (traced from our own logo file) -----------------------------
const CC = JSON.parse(fs.readFileSync(A('cagecraft_paths.json'), 'utf8')).CAGECRAFT;
export function cagecraftLogo(fill = WHITE) {
  return { svg: `<path d="${CC.d}" fill="${fill}" fill-rule="evenodd"/>`, box: CC.bbox };
}

/** Place a {svg, box} logo: scaled to `width`, anchored by its centre (cx, cy). Optional rotation. */
export function place(logo, cx, cy, width, rot = 0) {
  const [x0, y0, x1, y1] = logo.box;
  const s = width / (x1 - x0);
  const tx = cx - ((x0 + x1) / 2) * s, ty = cy - ((y0 + y1) / 2) * s;
  const r = rot ? `rotate(${rot} ${f2(cx)} ${f2(cy)}) ` : '';
  return `<g transform="${r}translate(${f2(tx)} ${f2(ty)}) scale(${s.toFixed(4)})">${logo.svg}</g>`;
}
export const heightAt = (logo, width) => ((logo.box[3] - logo.box[1]) * width) / (logo.box[2] - logo.box[0]);

// --- crown motif (clean geometric version of the logo crown, for the pattern) -----------
// drawn in a 0..940 x 0..452 box, traced by eye from the logo crown
export const CROWN_D = [
  'M468,0 L646,288 L566,288 L468,170 L370,288 L290,288 Z', // centre chevron
  'M186,288 L754,288 L744,340 L196,340 Z',                    // middle bar
  'M28,138 L246,264 L206,340 L122,340 Z',                     // left wing
  'M912,138 L694,264 L734,340 L818,340 Z',                    // right wing
  'M148,400 L412,400 L470,326 L528,400 L792,400 L782,452 L522,452 L470,392 L418,452 L158,452 Z', // base bar with raised peak
].join(' ');
export const CROWN_BOX = [28, 0, 912, 452];
// spear bar from the logo's FIGHTING CHAMPIONSHIPS flanks: long tapered point
export const SPEAR_D = 'M0,0 L220,-9 L232,0 L220,9 Z';

// --- CAGECRAFT emblem (oval, CAGE over CRAFT, sparkles), traced from the store's back-neck print --
const EMB = JSON.parse(fs.readFileSync(A('cagecraft_emblem.json'), 'utf8')).EMBLEM;
export function emblemLogo(fill = WHITE) {
  return { svg: `<path d="${EMB.d}" fill="${fill}" fill-rule="evenodd"/>`, box: EMB.bbox };
}

// --- logo variations ----------------------------------------------------------------------
// AX Carpentry horizontal wordmark: their AX monogram + their CARPENTRY lettering, set to the right
// and sitting on the monogram's baseline (built only from the supplied vector paths).
// AX_PATHS: [0] AX monogram, [1] house roofline, [2..10] C A R P E N T R Y
export function axWordmark(fill = WHITE, { k = 3.3, gap = 24 } = {}) {
  const mono = [16.9, 27.8, 137, 110.2], letters = [30.4, 115.6, 146.9, 124.5];
  const x0 = mono[2] + gap, tx = x0 - letters[0] * k, ty = mono[3] - letters[3] * k;
  const svg = `<path d="${AX_PATHS[0]}" fill="${fill}"/>
    <g transform="translate(${f2(tx)} ${f2(ty)}) scale(${k})">${AX_PATHS.slice(2).map((d) => `<path d="${d}" fill="${fill}"/>`).join('')}</g>`;
  return { svg, box: [mono[0], mono[1], x0 + (letters[2] - letters[0]) * k, mono[3]] };
}
// AX emblem only: house roofline + AX monogram (no lettering)
export function axEmblem(fill = WHITE) {
  return { svg: AX_PATHS.slice(0, 2).map((d) => `<path d="${d}" fill="${fill}"/>`).join(''), box: [4.4, 2.9, 137, 110.2] };
}
