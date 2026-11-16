// Flat-lay front mockups (2000 x 2500, 4:5 like the Shopify product shots):
// black rashguard (raglan, mesh side panels), training tee (set-in sleeve),
// mid-length MMA shorts (single layer, side slits). Print is drawn under a
// fold/shading pass so graphics sit in the fabric.
import { emblem } from './emblem.mjs';
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

// emblem placement: emblem units -> px (oval centre at cx, cy; scale s)
function placeEmblem(idea, cx, cy, s) {
  return `<g transform="translate(${f(cx)} ${f(cy)}) scale(${s})">${emblem(idea)}</g>`;
}

// ===========================================================================
// RASHGUARD — raglan sleeves, mesh side panels, pattern at hem
// ===========================================================================
const RASH_SIL = `M1000,448 A178,82 0 0 0 846,489
    C700,532 566,578 466,626
    C446,760 436,900 430,1004
    C500,1014 580,1020 638,1022
    L652,938
    C646,1100 668,1300 672,1500
    C676,1700 670,1950 668,2128
    Q834,2140 1000,2141
    Q1166,2140 1332,2128
    C1330,1950 1324,1700 1328,1500
    C1332,1300 1354,1100 1348,938
    L1362,1022
    C1420,1020 1500,1014 1570,1004
    C1564,900 1554,760 1534,626
    C1434,578 1300,532 1154,489
    A178,82 0 0 0 1000,448 Z`;

export function rashguard(idea) {
  const sil = RASH_SIL;
  const ragL = 'M862,500 C800,640 700,820 652,938';
  const ragR = 'M1138,500 C1200,640 1300,820 1348,938';
  const meshL = 'M658,955 C716,1060 752,1200 746,1330 C742,1410 716,1458 674,1478 C674,1300 664,1100 658,955 Z';
  const meshR = 'M1342,955 C1284,1060 1248,1200 1254,1330 C1258,1410 1284,1458 1326,1478 C1326,1300 1336,1100 1342,955 Z';
  const meshSeamL = 'M658,955 C716,1060 752,1200 746,1330 C742,1410 716,1458 674,1478';
  const meshSeamR = 'M1342,955 C1284,1060 1248,1200 1254,1330 C1258,1410 1284,1458 1326,1478';

  const pY = 1470, pH = 2126 - pY, unit = 18.5;
  const pat = patternPath({ width: 760, height: pH, unit, cx: 380, vStretch: pH / (31 * unit) });

  const folds = [
    glow(860, 1080, 150, 380, 0.07, 70, -6), glow(1140, 1080, 150, 380, 0.07, 70, 6),
    glow(1000, 1750, 300, 260, 0.04, 70),
    glow(560, 760, 70, 200, 0.07, 40, 25), glow(1440, 760, 70, 200, 0.07, 40, -25),
    fold('M1000,620 L1000,2100', { color: '#000', op: 0.25, w: 60, blur: 40 }),
    crease('M676,1040 C760,1080 820,1150 858,1230', { dy: -10, dx: 6 }),
    crease('M1324,1040 C1240,1080 1180,1150 1142,1230', { dy: -10, dx: -6 }),
    crease('M690,1180 C750,1220 790,1270 812,1330', { w: 10, dark: 0.4 }),
    crease('M1310,1180 C1250,1220 1210,1270 1188,1330', { w: 10, dark: 0.4 }),
    crease('M740,1640 C860,1665 1000,1650 1120,1672 C1200,1686 1260,1676 1300,1664', { w: 18, dark: 0.45, light: 0.05, blur: 10 }),
    crease('M700,1905 C820,1890 960,1915 1080,1900 C1180,1890 1260,1905 1316,1898', { w: 14, dark: 0.35, light: 0.04, blur: 10 }),
    crease('M470,985 C540,994 600,998 636,1000', { w: 12, dark: 0.45, light: 0.05 }),
    crease('M1530,985 C1460,994 1400,998 1364,1000', { w: 12, dark: 0.45, light: 0.05 }),
    crease('M510,700 C540,790 560,880 566,960', { w: 12, dark: 0.35, light: 0.05, dx: 8, dy: 0 }),
    crease('M1490,700 C1460,790 1440,880 1434,960', { w: 12, dark: 0.35, light: 0.05, dx: -8, dy: 0 }),
  ].join('');

  const collar = `
    <ellipse cx="1000" cy="530" rx="152" ry="58" fill="#0b0b0b"/>
    <ellipse cx="1000" cy="552" rx="140" ry="34" fill="#141414" opacity="0.7" filter="url(#b16)"/>
    <path d="M848,530 A152,58 0 0 1 1152,530" fill="none" stroke="#000" stroke-width="16" opacity="0.7" filter="url(#b10)"/>
    <path d="M1000,448 A178,82 0 1 0 1000.1,448 Z M1000,472 A152,58 0 1 1 999.9,472 Z" fill="#191919" fill-rule="evenodd"/>
    <path d="M840,560 A160,70 0 0 0 1160,560" fill="none" stroke="#fff" stroke-width="5" opacity="0.06" filter="url(#b3)"/>
    ${stitch('M1000,459 A165,70 0 1 0 1000.1,459', { color: '#333', w: 2, dash: '5 5' })}
    <path d="M1000,472 A152,58 0 1 1 999.9,472" fill="none" stroke="#050505" stroke-width="3"/>
    <text x="1000" y="507" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#4a4a4a" letter-spacing="2.5">CAGECRAFT</text>
    <text x="1000" y="524" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="8" fill="#3c3c3c" letter-spacing="1.5">85% POLY · 15% SPANDEX · M</text>`;

  const inner = `
  <g clip-path="url(#sil)">
    <rect width="${W}" height="${H}" fill="${FABRIC}"/>
    <path d="M846,489 C700,532 566,578 466,626 C446,760 436,900 430,1004 C500,1014 580,1020 638,1022 L652,938 C700,820 800,640 862,500 Z" fill="#151515"/>
    <path d="M1154,489 C1300,532 1434,578 1534,626 C1554,760 1564,900 1570,1004 C1500,1014 1420,1020 1362,1022 L1348,938 C1300,820 1200,640 1138,500 Z" fill="#151515"/>
    <path d="${meshL}" fill="url(#mesh)"/><path d="${meshR}" fill="url(#mesh)"/>
    <g transform="translate(620 ${pY})">
      <path d="${pat}" fill="none" stroke="${idea.pattern}" stroke-width="${f(unit * 0.3)}" mask="url(#rfade)"/>
    </g>
    ${placeEmblem(idea, 1012, 930, 0.43)}
  </g>
  ${shadingPass(sil, { folds })}
  <g clip-path="url(#sil)">
    ${flatlock(ragL)}${flatlock(ragR)}
    ${flatlock(meshSeamL, 6)}${flatlock(meshSeamR, 6)}
    ${stitch('M440,982 C510,992 580,998 640,1000')}${stitch('M1560,982 C1490,992 1420,998 1360,1000')}
    ${stitch('M672,2104 Q834,2116 1000,2117 Q1166,2116 1328,2104')}
    ${stitch('M672,2114 Q834,2126 1000,2127 Q1166,2126 1328,2114', { op: 0.7 })}
  </g>
  ${collar}`;
  return frame(inner, sil, fadeMask('rfade', -10, 780, pH));
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

export function tee(idea) {
  const sil = TEE_SIL;
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
    ${placeEmblem(idea, 1012, 930, 0.5)}
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
  ${collar}`;
  return frame(inner, sil, `<clipPath id="ribclip"><path d="${ribPath}" clip-rule="evenodd"/></clipPath>`);
}

// ===========================================================================
// MID-LENGTH MMA SHORTS — single layer, elastic waistband, side slits
// ===========================================================================
const SH_SIL = `M1000,712 Q740,716 480,702
    C481,740 482,776 484,806
    C470,1000 434,1300 398,1600
    Q644,1632 890,1664
    C930,1560 976,1410 1000,1340
    C1024,1410 1070,1560 1110,1664
    Q1356,1632 1602,1600
    C1566,1300 1530,1000 1516,806
    C1518,776 1519,740 1520,702
    Q1260,716 1000,712 Z`;

export function shorts(idea) {
  const sil = SH_SIL;
  const unit = 17.5;
  const pTop = 1080, hemPivot = [398, 1593];
  const legH = hemPivot[1] - pTop;
  const ang = (Math.atan2(1664 - 1600, 890 - 398) * 180) / Math.PI;
  const pat = patternPath({ width: 700, height: legH, unit, cx: 582, vStretch: legH / (31 * unit) });
  const legL = 'M1000,800 L484,800 C470,1000 434,1300 398,1600 Q644,1632 890,1664 C930,1560 976,1410 1000,1340 Z';
  const legR = 'M1000,800 L1516,800 C1530,1000 1566,1300 1602,1600 Q1356,1632 1110,1664 C1070,1560 1024,1410 1000,1340 Z';

  const gathers = Array.from({ length: 26 }, (_, i) => {
    const x = 506 + i * 38 + ((i * 37) % 11);
    const len = 34 + ((i * 53) % 5) * 12;
    return fold(`M${x},${822} L${x + (i % 2 ? 5 : -5)},${822 + len}`, { color: i % 2 ? '#000' : '#fff', op: i % 2 ? 0.4 : 0.045, w: 9, blur: 6 });
  }).join('');
  const folds = [
    gathers,
    glow(700, 1250, 160, 330, 0.06, 70, 8), glow(1300, 1250, 160, 330, 0.06, 70, -8),
    glow(1000, 960, 380, 120, 0.035, 70),
    crease('M1000,1360 C940,1270 880,1180 840,1080', { w: 20, dx: -8, dy: 0, dark: 0.5 }),
    crease('M1000,1360 C1060,1270 1120,1180 1160,1080', { w: 20, dx: 8, dy: 0, dark: 0.5 }),
    crease('M740,1320 C770,1400 780,1480 770,1570', { w: 16, dx: 8, dy: 0, dark: 0.4 }),
    crease('M1260,1320 C1230,1400 1220,1480 1230,1570', { w: 16, dx: -8, dy: 0, dark: 0.4 }),
    crease('M560,1100 C600,1250 590,1420 560,1560', { w: 12, dx: 9, dy: 0, dark: 0.3, light: 0.06 }),
    crease('M1440,1100 C1400,1250 1410,1420 1440,1560', { w: 12, dx: -9, dy: 0, dark: 0.3, light: 0.06 }),
    crease('M640,880 C760,905 880,900 960,872', { w: 16, dark: 0.3, light: 0.05, blur: 10 }),
    crease('M1360,880 C1240,905 1120,900 1040,872', { w: 16, dark: 0.3, light: 0.05, blur: 10 }),
  ].join('');

  // elastic waistband ruching (irregular)
  const ruche = Array.from({ length: 64 }, (_, i) => {
    const x = 492 + i * 16.2 + ((i * 29) % 7) - 3;
    const top = 712 + ((i * 17) % 9);
    const bend = ((i * 13) % 9) - 4;
    return `<path d="M${f(x)},${top} C${f(x + bend)},748 ${f(x - bend)},772 ${f(x + bend * 0.5)},798" stroke="${i % 2 ? '#060606' : '#2b2b2b'}" stroke-width="${i % 2 ? 6 : 3.5}" fill="none" opacity="${i % 2 ? 0.8 : 0.55}" filter="url(#b3)"/>`;
  }).join('');

  const inner = `
  <g clip-path="url(#sil)">
    <rect width="${W}" height="${H}" fill="${FABRIC}"/>
    <g clip-path="url(#legL)"><g transform="translate(${hemPivot[0]} ${hemPivot[1] - legH}) rotate(${f(ang)} 0 ${legH})">
      <path d="${pat}" fill="none" stroke="${idea.pattern}" stroke-width="${f(unit * 0.3)}" mask="url(#sfade)"/></g></g>
    <g clip-path="url(#legR)"><g transform="translate(${W - hemPivot[0]} ${hemPivot[1] - legH}) scale(-1 1) rotate(${f(ang)} 0 ${legH})">
      <path d="${pat}" fill="none" stroke="${idea.pattern}" stroke-width="${f(unit * 0.3)}" mask="url(#sfade)"/></g></g>
    ${placeEmblem(idea, 1014, 1055, 0.72)}
    <path d="M1000,712 Q740,716 480,702 C481,740 482,776 484,806 Q742,812 1000,812 Q1258,812 1516,806 C1518,776 1519,740 1520,702 Q1260,716 1000,712 Z" fill="#161616"/>
    ${ruche}
    <path d="M484,806 Q742,812 1000,812 Q1258,812 1516,806" fill="none" stroke="#000" stroke-width="18" opacity="0.5" filter="url(#b6)"/>
  </g>
  ${shadingPass(sil, { folds })}
  <g clip-path="url(#sil)">
    <path d="M484,808 Q742,814 1000,814 Q1258,814 1516,808" fill="none" stroke="#060606" stroke-width="4"/>
    ${stitch('M484,724 Q742,730 1000,728 Q1258,730 1516,724', { color: '#353535' })}
    ${stitch('M484,794 Q742,800 1000,800 Q1258,800 1516,794', { color: '#353535' })}
    <path d="M1000,814 L1000,1340" stroke="#000" stroke-width="3.5" opacity="0.65"/>
    ${stitch('M990,818 L990,1330', { color: '#2e2e2e', op: 0.65 })}
    ${stitch('M407,1574 Q644,1606 884,1638')}${stitch('M1593,1574 Q1356,1606 1116,1638')}
    <!-- side slits: split edge lifts slightly, back panel in shadow, bar tack at top -->
    <path d="M419,1420 L398,1602 L436,1607 Z" fill="#030303"/>
    <path d="M419,1420 L436,1607" stroke="#000" stroke-width="16" opacity="0.6" filter="url(#b6)"/>
    <path d="M420,1424 L437,1606" stroke="#3a3a3a" stroke-width="3"/>
    <path d="M1581,1420 L1602,1602 L1564,1607 Z" fill="#030303"/>
    <path d="M1581,1420 L1564,1607" stroke="#000" stroke-width="16" opacity="0.6" filter="url(#b6)"/>
    <path d="M1580,1424 L1563,1606" stroke="#3a3a3a" stroke-width="3"/>
    <rect x="408" y="1408" width="24" height="10" rx="3" fill="#353535" transform="rotate(6 420 1413)"/>
    <rect x="1568" y="1408" width="24" height="10" rx="3" fill="#353535" transform="rotate(-6 1580 1413)"/>
  </g>`;
  const defs = `${fadeMask('sfade', -10, 720, legH, [[0, 1], [0.28, 0.92], [0.56, 0.5], [0.8, 0.13], [1, 0]])}
    <clipPath id="legL"><path d="${legL}"/></clipPath><clipPath id="legR"><path d="${legR}"/></clipPath>`;
  return frame(inner, sil, defs);
}

export const PRODUCTS = {
  tee: { key: 'tee', label: 'Training Tee', fn: tee },
  rashguard: { key: 'rashguard', label: 'Rashguard', fn: rashguard },
  shorts: { key: 'shorts', label: 'Mid-Length MMA Shorts', fn: shorts },
};
