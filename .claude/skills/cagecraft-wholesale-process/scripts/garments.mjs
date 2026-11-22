// Flat-lay front mockups (2000 x 2500, 4:5 like the Shopify product shots):
// black rashguard (raglan, mesh side panels), training tee (set-in sleeve),
// mid-length MMA shorts (single layer, side slits). Print is drawn under a
// fold/shading pass so graphics sit in the fabric.
import { emblem, topsLockup, shortsLockup } from './emblem.mjs';
import { patternPath } from './pattern.mjs';

export const W = 2000, H = 2500;
export const RENDER = { transparent: false }; // true -> garment + shadow only (for boards)
const FABRIC = '#171717';

const f = (n) => (typeof n === 'number' ? n.toFixed(1) : n);

// --- shared defs -----------------------------------------------------------
const FULL = `filterUnits="userSpaceOnUse" x="-200" y="-200" width="${W + 400}" height="${H + 400}"`;
function baseDefs() {
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
function fadeMask(id, x, w, h, stops = [[0, 1], [0.3, 0.92], [0.6, 0.5], [0.84, 0.13], [1, 0]]) {
  return `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="${f(h)}" x2="0" y2="0">
    ${stops.map(([o, a]) => `<stop offset="${o}" stop-color="#fff" stop-opacity="${a}"/>`).join('')}
  </linearGradient>
  <mask id="${id}" maskUnits="userSpaceOnUse" x="${f(x)}" y="-20" width="${f(w)}" height="${f(h + 60)}">
    <rect x="${f(x)}" y="-20" width="${f(w)}" height="${f(h + 60)}" fill="url(#${id}g)"/>
  </mask>`;
}

function stitch(d, { color = '#383838', w = 2.2, dash = '7 6', op = 1 } = {}) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linecap="round" opacity="${op}"/>`;
}
// flatlock seam: dark core with zig stitching either side
function flatlock(d, gap = 7) {
  return `<path d="${d}" fill="none" stroke="#2e2e2e" stroke-width="${gap * 2 + 3}" stroke-dasharray="2.5 4.5" opacity="0.95"/>
  <path d="${d}" fill="none" stroke="#161616" stroke-width="${gap * 2 - 4}"/>
  <path d="${d}" fill="none" stroke="#060606" stroke-width="4"/>`;
}
// soft fold: broad tonal shift
function fold(d, { w = 30, color = '#fff', op = 0.05, blur = 16 } = {}) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}" filter="url(#b${blur})"/>`;
}
// crease: dark valley with a lit ridge beside it
function crease(d, { w = 14, dx = 0, dy = -9, dark = 0.55, light = 0.07, blur = 6 } = {}) {
  return `<path d="${d}" fill="none" stroke="#000" stroke-width="${w}" stroke-linecap="round" opacity="${dark}" filter="url(#b${blur})"/>
  <path d="${d}" transform="translate(${dx} ${dy})" fill="none" stroke="#fff" stroke-width="${w * 0.8}" stroke-linecap="round" opacity="${light}" filter="url(#b${blur})"/>`;
}
function glow(cx, cy, rx, ry, op = 0.06, blur = 70, rot = 0) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="#fff" opacity="${op}" filter="url(#b${blur})"/>`;
}

function frame(inner, sil, extraDefs = '') {
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
function shadingPass(sil, { folds = '', grain = 'grain', grainOp = 0.05 } = {}) {
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
function symOutline(half) {
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
function mirrorD(d) {
  return d.replace(/([MLQCA])([^MLQCAZ]*)/g, (_, c, body) => {
    const n = body.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (c === 'A') return `A${n[0]},${n[1]} ${n[2]} ${n[3]} ${1 - n[4]} ${mx(n[5])},${n[6]} `;
    const o = [];
    for (let i = 0; i < n.length; i += 2) o.push(`${mx(n[i])},${n[i + 1]}`);
    return c + o.join(' ') + ' ';
  });
}
const both = (fn, d, opts) => fn(d, opts) + fn(mirrorD(d), opts && opts.dx !== undefined ? { ...opts, dx: -opts.dx } : opts);

// lockup placement: centred on cx, top edge at y, scale s
function placeLockup(l, cx, top, s) {
  return `<g transform="translate(${f(cx)} ${f(top - l.box[1] * s)}) scale(${s})">${l.svg}</g>`;
}
// back neck band (tee rib / rash binding) between the back neckline arc and a parallel arc below it
function backNeckBand({ cx = 1000, cy, rx, ry, x0, y0, band, rib = false }) {
  const x1 = 2 * cx - x0;
  const d = `M${x0},${y0} A${rx},${ry} 0 0 1 ${x1},${y0} L${x1},${y0 + band} A${rx},${ry} 0 0 0 ${x0},${y0 + band} Z`;
  const ribs = rib ? Array.from({ length: 90 }, (_, i) => {
    const t = Math.PI + (i / 89) * Math.PI; // upper half of the ellipse
    const x = cx + rx * Math.cos(t) * 0.985, y = cy + ry * Math.sin(t);
    return `<line x1="${f(x)}" y1="${f(y + 2)}" x2="${f(x)}" y2="${f(y + band - 2)}" stroke="#0d0d0d" stroke-width="2.2" opacity="0.85"/>`;
  }).join('') : '';
  return `<path d="M${x0},${y0 + band} A${rx},${ry} 0 0 1 ${x1},${y0 + band}" fill="none" stroke="#000" stroke-width="16" opacity="0.5" filter="url(#b10)" transform="translate(0 8)"/>
    <path d="${d}" fill="${rib ? '#1a1a1a' : '#191919'}"/>
    ${rib ? `<g clip-path="url(#bandclip)">${ribs}</g>` : ''}
    ${stitch(`M${x0 + 4},${y0 + band * 0.55} A${rx},${ry} 0 0 1 ${x1 - 4},${y0 + band * 0.55}`, { color: '#333', w: 2, dash: '5 5' })}
    <path d="M${x0},${y0 + band} A${rx},${ry} 0 0 1 ${x1},${y0 + band}" fill="none" stroke="#060606" stroke-width="3"/>
    <clipPath id="bandclip"><path d="${d}"/></clipPath>`;
}

// emblem placement: emblem units -> px (oval centre at cx, cy; scale s)
function placeEmblem(idea, cx, cy, s) {
  return `<g transform="translate(${f(cx)} ${f(cy)}) scale(${s})">${emblem(idea)}</g>`;
}

// ===========================================================================
// RASHGUARD — raglan sleeves, mesh side panels, pattern at hem.
// Proportions follow the size chart (M: 45.5 cm half-chest x 69.5 cm length).
// ===========================================================================
const RASH_HALF = {
  start: [1000, 522],
  segs: [
    ['A', 170, 78, 0, 0, 0, 853, 561],        // collar
    ['C', 730, 596, 572, 660, 458, 738],      // raglan sleeve top
    ['C', 432, 850, 410, 960, 396, 1052],     // sleeve outer edge
    ['Q', 500, 1088, 604, 1112],              // sleeve hem
    ['L', 624, 1024],                         // under-sleeve to armpit
    ['C', 618, 1180, 642, 1330, 642, 1490],   // side
    ['C', 642, 1660, 638, 1780, 638, 1876],
    ['Q', 819, 1888, 1000, 1889],             // hem
  ],
};
const RASH_SIL = symOutline(RASH_HALF);

export function rashguard(idea, view = 'front') {
  const sil = RASH_SIL;
  const back = view === 'back';
  const rag = back ? 'M868,588 C800,710 690,900 624,1024' : 'M862,570 C800,710 690,900 624,1024';
  const meshSeam = 'M630,1040 C692,1110 718,1200 714,1268 C710,1316 690,1338 642,1350';
  const mesh = meshSeam + ' C642,1250 636,1140 630,1040 Z';
  const sleeve = 'M853,561 C730,596 572,660 458,738 C432,850 410,960 396,1052 Q500,1088 604,1112 L624,1024 C690,900 800,710 862,570 Z';

  const pY = 1346, pH = 1874 - pY, unit = 17;
  const pat = patternPath({ width: 780, height: pH, unit, cx: 390, vStretch: pH / (31 * unit) });

  const folds = [
    glow(860, 1010, 150, 300, 0.07, 70, -6), glow(1140, 1010, 150, 300, 0.07, 70, 6),
    glow(1000, 1620, 300, 220, 0.04, 70),
    glow(540, 830, 70, 170, 0.07, 40, 28), glow(1460, 830, 70, 170, 0.07, 40, -28),
    fold('M1000,700 L1000,1870', { color: '#000', op: 0.22, w: 60, blur: 40 }),
    both(crease, 'M664,1060 C740,1100 800,1160 836,1230', { dy: -10, dx: 6 }),
    both(crease, 'M676,1180 C730,1215 765,1260 785,1310', { w: 10, dark: 0.4 }),
    crease('M720,1550 C840,1575 980,1560 1100,1580 C1180,1594 1240,1584 1290,1572', { w: 18, dark: 0.45, light: 0.05, blur: 10 }),
    crease('M700,1770 C820,1758 960,1780 1080,1766 C1180,1756 1250,1770 1300,1764', { w: 14, dark: 0.35, light: 0.04, blur: 10 }),
    both(crease, 'M430,1036 C500,1060 560,1082 600,1094', { w: 12, dark: 0.45, light: 0.05 }),
    both(crease, 'M500,790 C520,870 528,950 530,1010', { w: 12, dark: 0.35, light: 0.05, dx: 8, dy: 0 }),
  ].join('');

  const collar = `
    <ellipse cx="1000" cy="600" rx="145" ry="55" fill="#0b0b0b"/>
    <ellipse cx="1000" cy="620" rx="134" ry="32" fill="#141414" opacity="0.7" filter="url(#b16)"/>
    <path d="M855,600 A145,55 0 0 1 1145,600" fill="none" stroke="#000" stroke-width="16" opacity="0.7" filter="url(#b10)"/>
    <path d="M1000,522 A170,78 0 1 0 1000.1,522 Z M1000,545 A145,55 0 1 1 999.9,545 Z" fill="#191919" fill-rule="evenodd"/>
    <path d="M845,628 A156,66 0 0 0 1155,628" fill="none" stroke="#fff" stroke-width="5" opacity="0.06" filter="url(#b3)"/>
    ${stitch('M1000,533 A158,67 0 1 0 1000.1,533', { color: '#333', w: 2, dash: '5 5' })}
    <path d="M1000,545 A145,55 0 1 1 999.9,545" fill="none" stroke="#050505" stroke-width="3"/>
    <text x="1000" y="580" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#4a4a4a" letter-spacing="2.5">CAGECRAFT</text>
    <text x="1000" y="597" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="8" fill="#3c3c3c" letter-spacing="1.5">85% POLY · 15% SPANDEX · M</text>`;

  const inner = `
  <g clip-path="url(#sil)">
    <rect width="${W}" height="${H}" fill="${FABRIC}"/>
    <path d="${sleeve}" fill="#151515"/><path d="${mirrorD(sleeve)}" fill="#151515"/>
    <path d="${mesh}" fill="url(#mesh)"/><path d="${mirrorD(mesh)}" fill="url(#mesh)"/>
    <g transform="translate(610 ${pY})">
      <path d="${pat}" fill="none" stroke="${idea.pattern}" stroke-width="${f(unit * 0.3)}" mask="url(#rfade)"/>
    </g>
    ${back ? placeLockup(topsLockup(idea), 1000, 612, 0.19) : placeEmblem(idea, 1010, 878, 0.47)}
  </g>
  ${shadingPass(sil, { folds })}
  <g clip-path="url(#sil)">
    ${flatlock(rag)}${flatlock(mirrorD(rag))}
    ${flatlock(meshSeam, 6)}${flatlock(mirrorD(meshSeam), 6)}
    ${both(stitch, 'M400,1030 Q500,1066 606,1090')}
    ${stitch('M640,1864 Q819,1876 1000,1877 Q1181,1876 1360,1864')}
    ${stitch('M640,1874 Q819,1886 1000,1887 Q1181,1886 1360,1874', { op: 0.7 })}
  </g>
  ${back ? backNeckBand({ cy: 600, rx: 170, ry: 78, x0: 853, y0: 561, band: 24 }) : collar}`;
  return frame(inner, sil, fadeMask('rfade', -10, 800, pH));
}

// ===========================================================================
// TRAINING TEE — athletic fit, set-in sleeves, rib crew neck, no hem pattern
// ===========================================================================
const TEE_SIL = `M1000,522 A168,80 0 0 0 855,562
    C760,584 650,610 566,636
    C480,740 390,860 322,982
    C380,1030 450,1072 522,1110
    C540,1076 560,1046 582,1022
    C588,1300 592,1600 590,1924
    Q795,1931 1000,1932
    Q1205,1931 1410,1924
    C1408,1600 1412,1300 1418,1022
    C1440,1046 1460,1076 1478,1110
    C1550,1072 1620,1030 1678,982
    C1610,860 1520,740 1434,636
    C1350,610 1240,584 1145,562
    A168,80 0 0 0 1000,522 Z`;

export function tee(idea, view = 'front') {
  const sil = TEE_SIL;
  const back = view === 'back';
  const armL = 'M566,636 C576,780 582,900 582,1022';
  const armR = 'M1434,636 C1424,780 1418,900 1418,1022';
  const folds = [
    glow(820, 1150, 170, 420, 0.06, 70, -4), glow(1180, 1150, 170, 420, 0.06, 70, 4),
    glow(1000, 1700, 330, 200, 0.035, 70),
    glow(470, 830, 70, 190, 0.07, 40, 38), glow(1530, 830, 70, 190, 0.07, 40, -38),
    fold('M1000,700 L1000,1900', { color: '#000', op: 0.22, w: 70, blur: 40 }),
    crease('M604,1080 C690,1130 760,1210 800,1320', { dx: 7, dy: -8 }),
    crease('M1396,1080 C1310,1130 1240,1210 1200,1320', { dx: -7, dy: -8 }),
    crease('M610,1200 C660,1250 690,1310 700,1370', { w: 10, dark: 0.4 }),
    crease('M1390,1200 C1340,1250 1310,1310 1300,1370', { w: 10, dark: 0.4 }),
    crease('M640,1540 C760,1575 900,1560 1020,1585 C1140,1608 1260,1590 1370,1560', { w: 20, dark: 0.45, light: 0.05, blur: 10 }),
    crease('M680,1740 C800,1720 940,1760 1060,1745 C1180,1730 1290,1752 1360,1744', { w: 14, dark: 0.35, light: 0.04, blur: 10 }),
    crease('M362,975 C420,1010 470,1040 516,1066', { w: 12, dark: 0.45, light: 0.05 }),
    crease('M1638,975 C1580,1010 1530,1040 1484,1066', { w: 12, dark: 0.45, light: 0.05 }),
    crease('M520,760 C470,820 430,880 400,930', { w: 12, dark: 0.35, light: 0.06, dx: 8, dy: 4 }),
    crease('M1480,760 C1530,820 1570,880 1600,930', { w: 12, dark: 0.35, light: 0.06, dx: -8, dy: 4 }),
  ].join('');

  const ribPath = 'M1000,522 A168,80 0 1 0 1000.1,522 Z M1000,552 A138,50 0 1 1 999.9,552 Z';
  const ribLines = Array.from({ length: 150 }, (_, i) => {
    const a = (i / 150) * Math.PI * 2;
    const x1 = 1000 + 138 * Math.cos(a), y1 = 602 + 50 * Math.sin(a);
    const x2 = 1000 + 168 * Math.cos(a), y2 = 602 + 80 * Math.sin(a);
    return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#0d0d0d" stroke-width="2.2" opacity="0.85"/>`;
  }).join('');
  const collar = `
    <ellipse cx="1000" cy="602" rx="138" ry="50" fill="#0b0b0b"/>
    <ellipse cx="1000" cy="622" rx="128" ry="28" fill="#151515" opacity="0.7" filter="url(#b16)"/>
    <path d="M862,602 A138,50 0 0 1 1138,602" fill="none" stroke="#000" stroke-width="16" opacity="0.7" filter="url(#b10)"/>
    <path d="${ribPath}" fill="#1a1a1a" fill-rule="evenodd"/>
    <g clip-path="url(#ribclip)">${ribLines}</g>
    ${stitch('M1000,518 A172,84 0 1 0 1000.1,518', { color: '#303030', w: 2, dash: '5 5' })}
    <path d="M1000,552 A138,50 0 1 1 999.9,552" fill="none" stroke="#050505" stroke-width="3"/>
    <text x="1000" y="580" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#4a4a4a" letter-spacing="2.5">CAGECRAFT</text>
    <text x="1000" y="597" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="8" fill="#3c3c3c" letter-spacing="1.5">TRAINING TEE · M</text>`;

  const inner = `
  <g clip-path="url(#sil)">
    <rect width="${W}" height="${H}" fill="#181818"/>
    ${back ? placeLockup(topsLockup(idea), 1000, 620, 0.19) : placeEmblem(idea, 1012, 930, 0.5)}
  </g>
  ${shadingPass(sil, { folds, grain: 'weave', grainOp: 0.07 })}
  <g clip-path="url(#sil)">
    <path d="${armL}" fill="none" stroke="#080808" stroke-width="4"/><path d="${armR}" fill="none" stroke="#080808" stroke-width="4"/>
    ${stitch('M577,640 C587,780 593,900 593,1020', { color: '#2e2e2e' })}${stitch('M1423,640 C1413,780 1407,900 1407,1020', { color: '#2e2e2e' })}
    ${stitch('M340,962 C400,1010 460,1046 530,1086')}${stitch('M347,951 C407,999 467,1035 537,1075', { op: 0.7 })}
    ${stitch('M1660,962 C1600,1010 1540,1046 1470,1086')}${stitch('M1653,951 C1593,999 1533,1035 1463,1075', { op: 0.7 })}
    ${stitch('M594,1898 Q795,1905 1000,1906 Q1205,1905 1406,1898')}
    ${stitch('M594,1908 Q795,1915 1000,1916 Q1205,1915 1406,1908', { op: 0.7 })}
  </g>
  ${back ? backNeckBand({ cy: 602, rx: 168, ry: 80, x0: 855, y0: 562, band: 30, rib: true }) : collar}`;
  return frame(inner, sil, `<clipPath id="ribclip"><path d="${ribPath}" clip-rule="evenodd"/></clipPath>`);
}

// ===========================================================================
// MID-LENGTH MMA SHORTS — non-velcro curved cut (7.5" inseam) template:
// wide elastic waistband with flat front panel + gathered sides, J-stitch faux
// fly, narrow crotch, curved-cut side hems with binding around the leg opening.
// ===========================================================================
const SH_HALF = {
  start: [1000, 652],
  segs: [
    ['Q', 760, 654, 526, 642],                // waistband top edge
    ['C', 524, 700, 524, 760, 526, 806],      // waistband side
    ['C', 500, 1100, 444, 1440, 416, 1672],   // outer leg, gentle flare
    ['C', 410, 1738, 444, 1790, 524, 1804],   // curved cut
    ['Q', 740, 1824, 946, 1850],              // hem
    ['C', 962, 1700, 986, 1520, 1000, 1432],  // inseam up to crotch
  ],
};
const SH_SIL = symOutline(SH_HALF);
const SH_WB = symOutline({ start: [1000, 652], segs: [['Q', 760, 654, 526, 642], ['C', 524, 700, 524, 760, 526, 806], ['Q', 760, 814, 1000, 814]] });

export function shorts(idea, view = 'front') {
  const sil = SH_SIL;
  const back = view === 'back';
  const unit = 17;
  const pivot = [524, 1774], pTop = 1170, legH = pivot[1] - pTop, lead = 220;
  const ang = (Math.atan2(1850 - 1804, 946 - 524) * 180) / Math.PI;
  const pat = patternPath({ width: 900, height: legH, unit, cx: lead + 440 - 5 * unit, vStretch: legH / (31 * unit) });
  const legL = 'M1000,812 L526,812 C500,1100 444,1440 416,1672 C410,1738 444,1790 524,1804 Q740,1824 946,1850 C962,1700 986,1520 1000,1432 Z';

  // waistband: gathered side sections, flat front panel
  const ruche = (x0, x1, seed) => Array.from({ length: Math.round((x1 - x0) / 13) }, (_, i) => {
    const x = x0 + i * 13 + ((i * 29 + seed) % 7) - 3;
    const top = 650 + ((i * 17 + seed) % 7);
    const bend = ((i * 13 + seed) % 9) - 4;
    return `<path d="M${f(x)},${top} C${f(x + bend)},700 ${f(x - bend)},750 ${f(x + bend * 0.5)},806" stroke="${i % 2 ? '#060606' : '#2c2c2c'}" stroke-width="${i % 2 ? 6 : 3.5}" fill="none" opacity="${i % 2 ? 0.8 : 0.5}" filter="url(#b3)"/>`;
  }).join('');
  const panel = 'M836,640 L1164,640 L1164,816 L836,816 Z';

  const gathers = (x0, x1, seed) => Array.from({ length: Math.round((x1 - x0) / 34) }, (_, i) => {
    const x = x0 + i * 34 + ((i * 37 + seed) % 11);
    const len = 36 + ((i * 53 + seed) % 5) * 12;
    return fold(`M${x},${818} L${x + (i % 2 ? 5 : -5)},${818 + len}`, { color: i % 2 ? '#000' : '#fff', op: i % 2 ? 0.42 : 0.05, w: 9, blur: 6 });
  }).join('');

  const folds = [
    back ? gathers(540, 1460, 2) : gathers(540, 820, 1) + gathers(1180, 1460, 5),
    glow(700, 1430, 160, 380, 0.06, 70, 6), glow(1300, 1430, 160, 380, 0.06, 70, -6),
    glow(1000, 990, 380, 120, 0.03, 70),
    fold('M1000,830 L1000,1420', { color: '#000', op: 0.22, w: 50, blur: 26 }),
    both(crease, 'M996,1440 C950,1350 900,1270 868,1180', { w: 20, dx: -8, dy: 0, dark: 0.5 }),
    both(crease, 'M770,1380 C786,1500 792,1640 784,1780', { w: 16, dx: 8, dy: 0, dark: 0.4 }),
    both(crease, 'M562,1160 C594,1360 586,1560 552,1700', { w: 12, dx: 9, dy: 0, dark: 0.3, light: 0.06 }),
    both(crease, 'M640,900 C760,925 880,922 960,895', { w: 16, dark: 0.3, light: 0.05, blur: 10 }),
    back ? both(crease, 'M1000,1300 C940,1250 880,1230 820,1236', { w: 14, dark: 0.35, light: 0.05, blur: 10 })
         : crease('M1160,822 L1160,1262 C1160,1326 1110,1360 1006,1362', { w: 8, dark: 0.4, light: 0.07, dx: -7, dy: 0, blur: 3 }),
  ].join('');

  // leg-opening edge (outer leg below the slit point, curved cut, hem, inseam)
  const edge = 'M434,1540 C426,1600 420,1640 416,1672 C410,1738 444,1790 524,1804 Q740,1824 946,1850 C962,1700 986,1520 1000,1432';
  // leg-opening binding: seam line ~24px in from the edge, stitched
  const bind = 'M458,1546 C448,1600 442,1640 440,1668 C436,1716 466,1764 532,1778 Q744,1798 922,1823 C938,1690 960,1530 978,1456';

  const inner = `
  <g clip-path="url(#sil)">
    <rect width="${W}" height="${H}" fill="${FABRIC}"/>
    <g clip-path="url(#legL)"><g transform="translate(${pivot[0] - lead} ${pivot[1] - legH}) rotate(${f(ang)} ${lead} ${legH})">
      <path d="${pat}" fill="none" stroke="${idea.pattern}" stroke-width="${f(unit * 0.3)}" mask="url(#sfade)"/></g></g>
    <g clip-path="url(#legR)"><g transform="translate(${W - pivot[0] + lead} ${pivot[1] - legH}) scale(-1 1) rotate(${f(ang)} ${lead} ${legH})">
      <path d="${pat}" fill="none" stroke="${idea.pattern}" stroke-width="${f(unit * 0.3)}" mask="url(#sfade)"/></g></g>
    <!-- solid binding strip around each leg opening -->
    <path d="${edge}" fill="none" stroke="${FABRIC}" stroke-width="50"/><path d="${mirrorD(edge)}" fill="none" stroke="${FABRIC}" stroke-width="50"/>
    ${back ? placeLockup(shortsLockup(idea, 500), 1000, 884, 1) : placeEmblem(idea, 1012, 1088, 0.72)}
    <g clip-path="url(#wb)">
      <path d="${SH_WB}" fill="#161616"/>
      ${back ? ruche(532, 1470, 4) : `${ruche(532, 830, 3)}${ruche(1170, 1470, 9)}
      <path d="${panel}" fill="#181818"/>
      <path d="M836,640 L836,816 M1164,640 L1164,816" stroke="#050505" stroke-width="4"/>
      <path d="M836,640 L836,816" stroke="#000" stroke-width="14" opacity="0.5" filter="url(#b6)" transform="translate(-6 0)"/>
      <path d="M1164,640 L1164,816" stroke="#000" stroke-width="14" opacity="0.5" filter="url(#b6)" transform="translate(6 0)"/>
      ${stitch('M846,660 L846,800 M1154,660 L1154,800', { color: '#333' })}`}
      <path d="M526,808 Q760,816 1000,816 Q1240,816 1474,808" fill="none" stroke="#000" stroke-width="18" opacity="0.5" filter="url(#b6)"/>
    </g>
  </g>
  ${shadingPass(sil, { folds })}
  <g clip-path="url(#sil)">
    <path d="M526,808 Q760,816 1000,816 Q1240,816 1474,808" fill="none" stroke="#060606" stroke-width="4"/>
    ${stitch('M528,664 Q760,672 1000,670 Q1240,672 1472,664', { color: '#363636' })}
    ${stitch('M528,796 Q760,804 1000,804 Q1240,804 1472,796', { color: '#363636' })}
    <path d="M1000,818 L1000,1432" stroke="#000" stroke-width="3.5" opacity="0.7"/>
    ${stitch('M990,822 L990,1420', { color: '#2e2e2e', op: 0.7 })}
    ${back ? stitch('M1010,822 L1010,1420', { color: '#2e2e2e', op: 0.7 }) : stitch('M1150,818 L1150,1266 C1150,1320 1104,1348 1004,1350', { color: '#3a3a3a' })}
    <path d="${bind}" fill="none" stroke="#070707" stroke-width="3.5"/><path d="${mirrorD(bind)}" fill="none" stroke="#070707" stroke-width="3.5"/>
    <path d="${bind}" transform="translate(2 -3)" fill="none" stroke="#fff" stroke-width="3" opacity="0.06"/><path d="${mirrorD(bind)}" transform="translate(-2 -3)" fill="none" stroke="#fff" stroke-width="3" opacity="0.06"/>
    ${both(stitch, 'M452,1626 C446,1702 476,1748 536,1762 Q744,1782 914,1806 C930,1680 952,1526 970,1462', { color: '#353535' })}
  </g>`;
  const defs = `${fadeMask('sfade', -10, 920, legH, [[0, 1], [0.28, 0.92], [0.56, 0.5], [0.8, 0.13], [1, 0]])}
    <clipPath id="legL"><path d="${legL}"/></clipPath><clipPath id="legR"><path d="${mirrorD(legL)}"/></clipPath>
    <clipPath id="wb"><path d="${SH_WB}"/></clipPath>`;
  return frame(inner, sil, defs);
}

export const PRODUCTS = {
  tee: { key: 'tee', label: 'Training Tee', fn: tee },
  rashguard: { key: 'rashguard', label: 'Rashguard', fn: rashguard },
  shorts: { key: 'shorts', label: 'Mid-Length MMA Shorts', fn: shorts },
  // backs: final colourways only (B.1 all-red was dropped)
  'tee-back': { key: 'tee-back', label: 'Training Tee — Back', fn: (i) => tee(i, 'back'), ideas: ['A', 'B2'] },
  'rashguard-back': { key: 'rashguard-back', label: 'Rashguard — Back', fn: (i) => rashguard(i, 'back'), ideas: ['A', 'B2'] },
  'shorts-back': { key: 'shorts-back', label: 'Mid-Length MMA Shorts — Back', fn: (i) => shorts(i, 'back'), ideas: ['A', 'B2'] },
};
