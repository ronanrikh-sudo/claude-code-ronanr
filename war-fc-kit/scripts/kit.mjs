// Shared flat-lay rendering kit (from the Rival Gym pipeline): 2000x2500 canvas,
// studio background, drop shadows, fabric shading, stitches, creases, symmetric
// outlines. Print is drawn under the shading pass so graphics sit in the fabric.

export const W = 2000, H = 2500;
export const RENDER = { transparent: false }; // true -> garment + shadow only (for boards)
export const FABRIC = '#171717';

export const f = (n) => (typeof n === 'number' ? n.toFixed(1) : n);

// --- shared defs -----------------------------------------------------------
const FULL = `filterUnits="userSpaceOnUse" x="-200" y="-200" width="${W + 400}" height="${H + 400}"`;
export function baseDefs() {
  return `
  <radialGradient id="bg" cx="50%" cy="46%" r="80%">
    <stop offset="0" stop-color="#dcdcda"/><stop offset="0.6" stop-color="#cdcdcb"/><stop offset="1" stop-color="#b3b3b1"/>
  </radialGradient>
  ${[3, 6, 10, 16, 26, 40, 70].map((s) => `<filter id="b${s}" ${FULL}><feGaussianBlur stdDeviation="${s}"/></filter>`).join('')}
  <filter id="grain" ${FULL}>
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <filter id="weave" ${FULL}>
    <feTurbulence type="fractalNoise" baseFrequency="1.4 0.6" numOctaves="2" seed="11"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <pattern id="mesh" width="10" height="8.66" patternUnits="userSpaceOnUse">
    <rect width="10" height="8.66" fill="#1c1c1c"/>
    <circle cx="2.5" cy="2.17" r="1.9" fill="#080808"/><circle cx="7.5" cy="6.5" r="1.9" fill="#080808"/>
  </pattern>`;
}

// fade mask in the pattern's local coordinates (hem at y = h)
export function fadeMask(id, x, w, h, stops = [[0, 1], [0.3, 0.92], [0.6, 0.5], [0.84, 0.13], [1, 0]]) {
  return `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="${f(h)}" x2="0" y2="0">
    ${stops.map(([o, a]) => `<stop offset="${o}" stop-color="#fff" stop-opacity="${a}"/>`).join('')}
  </linearGradient>
  <mask id="${id}" maskUnits="userSpaceOnUse" x="${f(x)}" y="-20" width="${f(w)}" height="${f(h + 60)}">
    <rect x="${f(x)}" y="-20" width="${f(w)}" height="${f(h + 60)}" fill="url(#${id}g)"/>
  </mask>`;
}

export function stitch(d, { color = '#383838', w = 2.2, dash = '7 6', op = 1 } = {}) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linecap="round" opacity="${op}"/>`;
}
// flatlock seam: dark core with zig stitching either side
export function flatlock(d, gap = 7) {
  return `<path d="${d}" fill="none" stroke="#2e2e2e" stroke-width="${gap * 2 + 3}" stroke-dasharray="2.5 4.5" opacity="0.95"/>
  <path d="${d}" fill="none" stroke="#161616" stroke-width="${gap * 2 - 4}"/>
  <path d="${d}" fill="none" stroke="#060606" stroke-width="4"/>`;
}
// soft fold: broad tonal shift
export function fold(d, { w = 30, color = '#fff', op = 0.05, blur = 16 } = {}) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}" filter="url(#b${blur})"/>`;
}
// crease: dark valley with a lit ridge beside it
export function crease(d, { w = 14, dx = 0, dy = -9, dark = 0.55, light = 0.07, blur = 6 } = {}) {
  return `<path d="${d}" fill="none" stroke="#000" stroke-width="${w}" stroke-linecap="round" opacity="${dark}" filter="url(#b${blur})"/>
  <path d="${d}" transform="translate(${dx} ${dy})" fill="none" stroke="#fff" stroke-width="${w * 0.8}" stroke-linecap="round" opacity="${light}" filter="url(#b${blur})"/>`;
}
export function glow(cx, cy, rx, ry, op = 0.06, blur = 70, rot = 0) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="#fff" opacity="${op}" filter="url(#b${blur})"/>`;
}

export function frame(inner, sil, extraDefs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${baseDefs()}<clipPath id="sil"><path d="${sil}"/></clipPath>${extraDefs}</defs>
  ${RENDER.transparent ? '' : `<rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.03"/>`}
  <path d="${sil}" transform="translate(12 30)" fill="#000" opacity="0.32" filter="url(#b26)"/>
  <path d="${sil}" transform="translate(3 7)" fill="#000" opacity="0.42" filter="url(#b6)"/>
  ${inner}
  </svg>`;
}

// standard fabric shading pass, clipped to the silhouette
export function shadingPass(sil, { folds = '', grain = 'grain', grainOp = 0.05 } = {}) {
  return `<g clip-path="url(#sil)">
    ${folds}
    <path d="${sil}" fill="none" stroke="#000" stroke-width="110" opacity="0.5" filter="url(#b26)"/>
    <path d="${sil}" fill="none" stroke="#000" stroke-width="18" opacity="0.55" filter="url(#b6)"/>
    <path d="${sil}" fill="none" stroke="#fff" stroke-width="3" opacity="0.07" filter="url(#b3)"/>
    <rect width="${W}" height="${H}" filter="url(#${grain})" opacity="${grainOp}"/>
  </g>
  <path d="${sil}" fill="none" stroke="#0b0b0b" stroke-width="2.5"/>`;
}


// --- symmetric geometry helpers --------------------------------------------
// A half outline is { start:[x,y], segs:[[cmd,...nums]] } running from a point on the
// centre line (x=1000) down the left side back to the centre line. Commands: L, Q, C, A.
const mx = (x) => W - x;
function segEnd(seg) { return seg.slice(-2); }
export function symOutline(half) {
  const out = [`M${half.start.join(',')}`];
  const pts = [half.start];
  for (const seg of half.segs) {
    out.push(seg[0] + seg.slice(1).join(','));
    pts.push(segEnd(seg));
  }
  // right side: reverse the left half and mirror it
  for (let i = half.segs.length - 1; i >= 0; i--) {
    const seg = half.segs[i], p0 = pts[i];
    const c = seg[0], n = seg.slice(1);
    let r;
    if (c === 'L') r = ['L', mx(p0[0]), p0[1]];
    else if (c === 'Q') r = ['Q', mx(n[0]), n[1], mx(p0[0]), p0[1]];
    else if (c === 'C') r = ['C', mx(n[2]), n[3], mx(n[0]), n[1], mx(p0[0]), p0[1]];
    else if (c === 'A') r = ['A', n[0], n[1], n[2], n[3], n[4], mx(p0[0]), p0[1]]; // reverse + mirror keeps sweep
    out.push(r[0] + r.slice(1).join(','));
  }
  return out.join(' ') + ' Z';
}
// mirror an absolute open path (M/L/Q/C/A) about the centre line
export function mirrorD(d) {
  return d.replace(/([MLQCA])([^MLQCAZ]*)/g, (_, c, body) => {
    const n = body.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (c === 'A') return `A${n[0]},${n[1]} ${n[2]} ${n[3]} ${1 - n[4]} ${mx(n[5])},${n[6]} `;
    const o = [];
    for (let i = 0; i < n.length; i += 2) o.push(`${mx(n[i])},${n[i + 1]}`);
    return c + o.join(' ') + ' ';
  });
}
export const both = (fn, d, opts) => fn(d, opts) + fn(mirrorD(d), opts && opts.dx !== undefined ? { ...opts, dx: -opts.dx } : opts);


