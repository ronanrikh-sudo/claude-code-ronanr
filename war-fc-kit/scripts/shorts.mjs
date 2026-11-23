// WAR FC event fight shorts — round 3: "War Streaks" in two corner colourways.
// Two cuts (Fight Short: loose, side splits | Compression: tight vale-tudo), front and back.
//  - Black Corner: black ground with tonal claw streaks, red + white brushed accents, black sash
//  - White Corner: white ground with soft grey streaks, dark red + black accents, dark red sash
// Waistband: flat front panel inside the band (like Rival's) with the CAGECRAFT emblem; crown/spear
// band either side; CAGECRAFT wordmark large on the back waistband. No external drawstring.
// Front: big WAR FC crest across the upper front; AX Carpentry horizontal wordmark up the outer side of
// one leg and the AX emblem beside the sash on the other. Back: wide WAR FC wordmark below the
// waistband, WAR crown emblem on the open leg.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { W, H, f, frame, shadingPass, stitch, flatlock, fold, crease, glow, symOutline, mirrorD, both } from './kit.mjs';
import { warLogo, axLogo, axWordmark, axEmblem, cagecraftLogo, emblemLogo, place, heightAt, CROWN_D, CROWN_BOX, WAR_RED, WHITE } from './brand.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const SAIRA = fs.readFileSync(path.join(here, '../assets/fonts/saira-italic-latin.woff2')).toString('base64');
const FONT_CSS = `<style>@font-face{font-family:'Saira WAR';font-style:italic;font-weight:100 900;src:url(data:font/woff2;base64,${SAIRA}) format('woff2');}</style>`;

export const CONCEPTS = {
  black: {
    key: 'black', label: 'Black Corner', name: 'War Streaks', sub: 'Black ground, tonal claw streaks, red and white brushed accents',
    base: '#121212', tones: ['#1b1b1b', '#202020', '#262626', '#2c2c2c'], accent: WAR_RED, accent2: WHITE,
    sash: '#0b0b0b', keyline: WAR_RED, spear: WAR_RED, logo: { red: WAR_RED, white: WHITE }, ax: WHITE,
    light: false, shade: 1, splitFill: '#050505', stitch: '#3a3a3a', seamOp: 0.6,
  },
  white: {
    key: 'white', label: 'White Corner', name: 'War Streaks (white)', sub: 'White ground, soft grey streaks, dark red brushed accents',
    base: '#EEEEEC', tones: ['#e2e2e0', '#dadad8', '#e7e7e5', '#d3d3d1'], accent: '#8E0B13', accent2: '#151515',
    sash: '#8E0B13', keyline: '#151515', spear: WHITE, logo: { red: WAR_RED, white: '#151515' }, ax: '#151515',
    light: true, shade: 0.42, splitFill: '#c9c9c7', stitch: '#a2a2a0', seamOp: 0.2,
  },
};

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// ---------------------------------------------------------------------------- brand band
// crest bar from the WAR FC logo: crown centred, spear bars pointing out to each end, red rules
function crownBand(x0, x1, yc, h = 30) {
  const cw = h * 1.9, s = cw / (CROWN_BOX[2] - CROWN_BOX[0]), ch = (CROWN_BOX[3] - CROWN_BOX[1]) * s;
  const cx = (x0 + x1) / 2, gap = h * 0.45, t = h * 0.14;
  const crown = `<path transform="translate(${f(cx - cw / 2)} ${f(yc - ch / 2)}) scale(${s.toFixed(4)}) translate(${-CROWN_BOX[0]} 0)" d="${CROWN_D}" fill="${WHITE}"/>`;
  // spear: blunt inner end, long taper to a point at the outer end
  const spear = (a, b) => {
    const dir = Math.sign(b - a), L = Math.abs(b - a);
    return `<path d="M${f(a)},${f(yc - t)} L${f(a + dir * L * 0.55)},${f(yc - t)} L${f(b)},${f(yc)} L${f(a + dir * L * 0.55)},${f(yc + t)} L${f(a)},${f(yc + t)} Z" fill="${WAR_RED}"/>`;
  };
  const rule = (y) => `<rect x="${x0}" y="${f(y)}" width="${x1 - x0}" height="${f(h * 0.12)}" fill="${WAR_RED}"/>`;
  return rule(yc - h * 1.05) + rule(yc + h * 0.93) + crown + spear(cx - cw / 2 - gap, x0 + 6) + spear(cx + cw / 2 + gap, x1 - 6);
}

// flat waistband panel (inside the band, like the Rival shorts) carrying the CAGECRAFT emblem
function flatPanel(x0, x1, y0, y1, emblemW) {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return `<rect x="${x0}" y="${y0 - 20}" width="${x1 - x0}" height="${y1 - y0 + 40}" fill="#141414"/>
    <path d="M${x0},${y0 - 20} L${x0},${y1 + 20} M${x1},${y0 - 20} L${x1},${y1 + 20}" stroke="#050505" stroke-width="4"/>
    <path d="M${x0},${y0} L${x0},${y1}" stroke="#000" stroke-width="14" opacity="0.5" filter="url(#b6)" transform="translate(-6 0)"/>
    <path d="M${x1},${y0} L${x1},${y1}" stroke="#000" stroke-width="14" opacity="0.5" filter="url(#b6)" transform="translate(6 0)"/>
    ${stitch(`M${x0 + 10},${y0 + 4} L${x0 + 10},${y1 - 4} M${x1 - 10},${y0 + 4} L${x1 - 10},${y1 - 4}`, { color: '#333' })}
    ${place(emblemLogo(WHITE), cx, cy, emblemW)}`;
}

// ---------------------------------------------------------------------------- streak artwork
// dry-brush streak: a bundle of bristle marks along an angled axis (echoes the WAR logo streaks)
function brush(x, y, angle, len, width, color, seed, op = 1) {
  const r = rng(seed);
  const n = Math.max(3, Math.round(width / 5));
  const ca = Math.cos((angle * Math.PI) / 180), sa = Math.sin((angle * Math.PI) / 180);
  let d = '';
  for (let i = 0; i < n; i++) {
    const off = (i / (n - 1) - 0.5) * width;
    const bx = x - sa * off, by = y + ca * off;
    const edge = 1 - Math.abs(i / (n - 1) - 0.5) * 2;
    let s = r() * len * 0.25 * (1 - edge * 0.6);
    const end = len * (0.55 + 0.45 * edge) - r() * len * 0.2;
    while (s < end) {
      const seg = Math.min(end - s, len * (0.15 + r() * 0.6));
      const t = (width / n) * (0.45 + r() * 0.6);
      const x1 = bx + ca * s, y1 = by + sa * s, x2 = bx + ca * (s + seg), y2 = by + sa * (s + seg);
      d += `M${f(x1 - sa * t * 0.15)},${f(y1 + ca * t * 0.15)} L${f(x1 + ca * seg * 0.12 - sa * t * 0.5)},${f(y1 + sa * seg * 0.12 + ca * t * 0.5)} L${f(x2)},${f(y2)} L${f(x1 + ca * seg * 0.12 + sa * t * 0.5)},${f(y1 + sa * seg * 0.12 - ca * t * 0.5)} Z `;
      s += seg + r() * len * 0.08;
    }
  }
  return `<path d="${d}" fill="${color}" opacity="${op}"/>`;
}
// slim streak: a single long tapered hairline stroke (clean accent)
function slim(x, y, angle, len, t, color, op) {
  const ca = Math.cos((angle * Math.PI) / 180), sa = Math.sin((angle * Math.PI) / 180);
  const x2 = x + ca * len, y2 = y + sa * len;
  return `<path d="M${f(x)},${f(y)} L${f(x + ca * len * 0.3 - sa * t)},${f(y + sa * len * 0.3 + ca * t)} L${f(x2)},${f(y2)} L${f(x + ca * len * 0.3 + sa * t)},${f(y + sa * len * 0.3 - ca * t)} Z" fill="${color}" opacity="${op}"/>`;
}

// logo marks per cut and view: [logo, cx, cy, width, rotation]
//  crest   WAR FC full crest            | warWide  WAR + FIGHTING CHAMPIONSHIPS (wide, no crown)
//  crown   WAR crown emblem             | ax       AX Carpentry stacked logo
//  axWord  AX Carpentry horizontal wordmark (AX monogram + CARPENTRY), run up the outer side of the leg
const MARKS = {
  'fight-short': {
    front: [['crest', 1000, 1000, 800]],
    back: [['warWide', 1000, 905, 560], ['crown', 1272, 1250, 230]],
  },
  compression: {
    front: [['crest', 1000, 990, 560]],
    back: [['warWide', 1000, 885, 420], ['crown', 1172, 1180, 180]],
  },
};
const ART = {
  'fight-short': { sideL: [452, 1560], hipR: [1455, 1185] },
  compression: { sideL: [676, 1500], hipR: [1336, 1110] },
};
function logoOf(c, k) {
  switch (k) {
    case 'crest': return warLogo(c.logo, ['Crown', 'WAR', 'FIGHTING_CHAMPIONSHIPS']);
    case 'warWide': return warLogo(c.logo, ['WAR', 'FIGHTING_CHAMPIONSHIPS']);
    case 'crown': return warLogo(c.logo, ['Crown']);
    case 'axWord': return axWordmark(c.ax);
    case 'axEmblem': return axEmblem(c.ax);
    default: return axLogo(c.ax);
  }
}
function marks(c, cut, view) {
  return MARKS[cut][view].map(([k, x, y, w, rot = 0]) => place(logoOf(c, k), x, y, w, rot)).join('');
}
function avoidBoxes(c, cut, view, m = 34) {
  return MARKS[cut][view].map(([k, x, y, w, rot = 0]) => {
    const h = heightAt(logoOf(c, k), w), a = (rot * Math.PI) / 180;
    const bw = Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a)), bh = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
    return [x - bw / 2 - m, y - bh / 2 - m, x + bw / 2 + m, y + bh / 2 + m];
  });
}
// longest length (<= len) a straight streak can run before entering any box
function clearLen(x, y, angle, len, boxes) {
  const ca = Math.cos((angle * Math.PI) / 180), sa = Math.sin((angle * Math.PI) / 180);
  for (let s = 0; s <= len; s += 4) {
    const px = x + ca * s, py = y + sa * s;
    if (boxes.some(([a, b, c2, d]) => px > a && px < c2 && py > b && py < d)) return Math.max(0, s - 8);
  }
  return len;
}
function art(c, cut, view) {
  const r = rng(view === 'back' ? 77 : 41);
  let ground = '';
  for (let i = 0; i < 150; i++) {
    const x = 300 + r() * 1500, y = 560 + r() * 1400;
    ground += brush(x, y, -28 + (r() - 0.5) * 10, 180 + r() * 420, 26 + r() * 60, c.tones[i % 4], 1000 + i);
  }
  const mir = view === 'back';
  const X = (x) => (mir ? W - x : x);
  const A = (a) => (mir ? 180 - a : a);
  const { sideL, hipR } = ART[cut];
  const boxes = avoidBoxes(c, cut, view);
  // brushed accent at the outer hip (red on black / black on red), kept clear of the logos
  let accent = '';
  const ay = hipR[1] + (mir ? 100 : 0);
  // front only: on the back the sash already carries the red, and a swipe there crosses the sash
  for (let i = 0; i < 9; i++) { const b = brush(X(hipR[0] - r() * 110), ay + i * 30 + r() * 24, A(-30 + (r() - 0.5) * 6), 200 + r() * 260, 20 + r() * 30, c.accent, 3000 + i, 0.95); if (!mir) accent += b; }
  // clean white accents: slim tapered streaks coming off the outer side of the lower leg opposite the
  // sash (one diagonal gesture with the hip swipe), stopping short of every logo
  let lines = '';
  for (let i = 0; i < 6; i++) {
    const x = X(sideL[0] + r() * 16 - 8), y = sideL[1] + i * 30 + r() * 10, ang = A(-30 + (r() - 0.5) * 4);
    const L = clearLen(x, y, ang, 240 + r() * 260, boxes);
    if (L > 120) lines += slim(x, y, ang, L, 3 + r() * 5, c.accent2, 0.55 + r() * 0.3);
  }
  return `<rect width="${W}" height="${H}" fill="${c.base}"/>${ground}${accent}${lines}`;
}

// diagonal PROVE YOU BELONG sash across the lower outer leg; text sized to the visible stretch
const SASH = {
  'fight-short': { x0: 1080, y0: 1960, ang: -58, w: 112, mid: 525, font: 0.42, spear: 110 },
  compression: { x0: 1090, y0: 1850, ang: -72, w: 90, mid: 345, font: 0.42, spear: 96 },
};
function sash(c, cut, view) {
  const s = SASH[cut];
  const mir = view === 'back';
  const len = 1100, w = s.w, fs_ = w * s.font, textW = fs_ * 11.4; // measured in Chromium: Saira 900 italic, 0.12em tracking
  const sp = (x, dir) => `<path d="M${f(x)},0 L${f(x + dir * s.spear * 0.12)},${f(-w * 0.07)} L${f(x + dir * s.spear)},0 L${f(x + dir * s.spear * 0.12)},${f(w * 0.07)} Z" fill="${c.spear}"/>`;
  const inner = `<text x="${s.mid}" y="${f(fs_ * 0.36)}" text-anchor="middle" font-family="'Saira WAR'" font-style="italic" font-weight="900" font-size="${f(fs_)}" letter-spacing="${f(fs_ * 0.12)}" fill="${WHITE}">PROVE YOU BELONG</text>
      ${sp(s.mid - textW / 2 - 18, -1)}${sp(s.mid + textW / 2 + 18, 1)}`;
  return `<g transform="translate(${mir ? W - s.x0 : s.x0} ${s.y0}) rotate(${mir ? -180 - s.ang : s.ang})">
      <rect x="0" y="${-w / 2}" width="${len}" height="${w}" fill="${c.sash}"/>
      <rect x="0" y="${-w / 2 - 13}" width="${len}" height="6" fill="${c.keyline}"/>
      <rect x="0" y="${w / 2 + 7}" width="${len}" height="6" fill="${c.keyline}"/>
      <g transform="${mir ? `translate(${s.mid} 0) rotate(180) translate(${-s.mid} 0)` : ''}">${inner}</g>
    </g>`;
}

// ---------------------------------------------------------------------------- FIGHT SHORT
const FS_HALF = {
  start: [1000, 640],
  segs: [
    ['Q', 760, 644, 520, 632],
    ['C', 519, 690, 519, 750, 522, 792],
    ['C', 500, 1050, 452, 1360, 432, 1604],
    ['L', 394, 1818],
    ['L', 472, 1832],
    ['Q', 708, 1846, 944, 1860],
    ['C', 962, 1700, 986, 1520, 1000, 1432],
  ],
};
const FS_SIL = symOutline(FS_HALF);
const FS_WB = symOutline({ start: [1000, 640], segs: [['Q', 760, 644, 520, 632], ['C', 519, 690, 519, 750, 522, 792], ['Q', 760, 802, 1000, 802]] });

export function fightShort(c, view = 'front') {
  if (view.startsWith('side')) return sideView(c, 'fight-short', view);
  const back = view === 'back';
  const sil = FS_SIL;

  const gathers = Array.from({ length: 26 }, (_, i) => {
    const x = 540 + i * 36 + ((i * 37) % 11);
    const len = 36 + ((i * 53) % 5) * 12;
    return fold(`M${x},806 L${x + (i % 2 ? 5 : -5)},${806 + len}`, { color: i % 2 ? '#000' : '#fff', op: i % 2 ? (c.light ? 0.16 : 0.4) : 0.05, w: 9, blur: 6 });
  }).join('');
  const folds = [
    gathers,
    glow(720, 1400, 170, 400, 0.07, 70, 6), glow(1280, 1400, 170, 400, 0.07, 70, -6),
    glow(1000, 980, 380, 120, 0.035, 70),
    fold('M1000,820 L1000,1420', { color: '#000', op: 0.22, w: 50, blur: 26 }),
    both(crease, 'M996,1440 C950,1350 900,1270 868,1180', { w: 20, dx: -8, dy: 0, dark: 0.5 }),
    both(crease, 'M770,1380 C786,1500 792,1650 784,1800', { w: 16, dx: 8, dy: 0, dark: 0.4 }),
    both(crease, 'M560,1150 C592,1350 584,1560 552,1720', { w: 12, dx: 9, dy: 0, dark: 0.3, light: 0.06 }),
    both(crease, 'M640,890 C760,915 880,912 960,885', { w: 16, dark: 0.3, light: 0.05, blur: 10 }),
  ].join('');

  const split = 'M432,1604 L394,1818 L472,1832 Z';
  const frontEdge = 'M432,1604 L472,1832';
  const hemStitch = 'M478,1808 Q708,1822 936,1836';

  const band = back
    ? `${crownBand(536, 820, 716, 34)}${crownBand(1180, 1464, 716, 34)}${place(cagecraftLogo(WHITE), 1000, 716, 320)}`
    : `${crownBand(536, 846, 716, 34)}${crownBand(1154, 1464, 716, 34)}${flatPanel(862, 1138, 632, 800, 172)}`;

  const inner = `
  <g clip-path="url(#sil)">
    ${art(c, 'fight-short', view)}${sash(c, 'fight-short', view)}
    <path d="${split}" fill="${c.splitFill}"/><path d="${mirrorD(split)}" fill="${c.splitFill}"/>
    ${marks(c, 'fight-short', view)}
    <g clip-path="url(#wb)">
      <path d="${FS_WB}" fill="#0f0f0f"/>
      ${band}
      <path d="M522,794 Q760,804 1000,804 Q1240,804 1478,794" fill="none" stroke="#000" stroke-width="18" opacity="0.5" filter="url(#b6)"/>
    </g>
  </g>
  ${shadingPass(sil, { folds: `<g opacity="${c.shade}">${folds}</g>`, light: c.light })}
  <g clip-path="url(#sil)">
    <path d="M522,796 Q760,806 1000,806 Q1240,806 1478,796" fill="none" stroke="#060606" stroke-width="4"/>
    ${stitch('M524,652 Q760,660 1000,658 Q1240,660 1476,652', { color: '#3a3a3a' })}
    ${stitch('M524,782 Q760,790 1000,790 Q1240,790 1476,782', { color: '#3a3a3a' })}
    <path d="M1000,808 L1000,1432" stroke="#000" stroke-width="3.5" opacity="${c.seamOp}"/>
    ${stitch('M990,812 L990,1420', { color: c.stitch, op: 0.6 })}
    <path d="${frontEdge}" stroke="#000" stroke-width="14" opacity="${c.light ? 0.18 : 0.5}" filter="url(#b6)" transform="translate(4 0)"/>
    <path d="${frontEdge}" stroke="${c.light ? '#8c8c8a' : '#000'}" stroke-width="3"/><path d="${mirrorD(frontEdge)}" stroke="${c.light ? '#8c8c8a' : '#000'}" stroke-width="3"/>
    <path d="${mirrorD(frontEdge)}" stroke="#000" stroke-width="14" opacity="${c.light ? 0.18 : 0.5}" filter="url(#b6)" transform="translate(-4 0)"/>
    <rect x="420" y="1592" width="26" height="10" rx="3" fill="#2e2e2e" transform="rotate(10 433 1597)"/>
    <rect x="1554" y="1592" width="26" height="10" rx="3" fill="#2e2e2e" transform="rotate(-10 1567 1597)"/>
    ${both(stitch, hemStitch, { color: c.stitch })}
  </g>`;
  return frame(inner, sil, `${FONT_CSS}<clipPath id="wb"><path d="${FS_WB}"/></clipPath>`);
}

// ---------------------------------------------------------------------------- COMPRESSION
const CP_HALF = {
  start: [1000, 700],
  segs: [
    ['Q', 800, 704, 612, 694],
    ['C', 611, 740, 611, 780, 613, 806],
    ['C', 594, 940, 570, 1100, 564, 1290],
    ['C', 560, 1480, 566, 1660, 574, 1800],
    ['Q', 760, 1816, 946, 1830],
    ['C', 958, 1640, 980, 1420, 1000, 1290],
  ],
};
const CP_SIL = symOutline(CP_HALF);
const CP_WB = symOutline({ start: [1000, 700], segs: [['Q', 800, 704, 612, 694], ['C', 611, 740, 611, 780, 613, 806], ['Q', 800, 814, 1000, 814]] });
const CP_SIDE = 'M700,812 L686,1000 L672,1250 L664,1500 L666,1830';

export function compression(c, view = 'front') {
  if (view.startsWith('side')) return sideView(c, 'compression', view);
  const back = view === 'back';
  const sil = CP_SIL;

  const folds = [
    glow(780, 1200, 120, 330, 0.09, 70, 4), glow(1220, 1200, 120, 330, 0.09, 70, -4),
    glow(700, 1000, 60, 200, 0.07, 40, 10), glow(1300, 1000, 60, 200, 0.07, 40, -10),
    fold('M1000,830 L1000,1280', { color: '#000', op: 0.25, w: 50, blur: 26 }),
    glow(770, 1560, 110, 220, 0.07, 70, 2), glow(1230, 1560, 110, 220, 0.07, 70, -2),
    both(crease, 'M992,1300 C950,1220 900,1160 860,1090', { w: 16, dx: -6, dy: 0, dark: 0.45 }),
    both(crease, 'M640,880 C740,900 860,900 950,880', { w: 12, dark: 0.3, light: 0.05, blur: 10 }),
    both(crease, 'M600,1660 C700,1680 800,1688 900,1700', { w: 12, dark: 0.3, light: 0.06, blur: 10 }),
    both(crease, 'M640,1380 C720,1392 800,1394 900,1404', { w: 10, dark: 0.25, light: 0.05, blur: 10 }),
  ].join('');
  const hemBand = 'M572,1764 Q760,1780 950,1794';

  const band = back
    ? `${crownBand(622, 858, 754, 28)}${crownBand(1142, 1378, 754, 28)}${place(cagecraftLogo(WHITE), 1000, 754, 262)}`
    : `${crownBand(622, 878, 754, 28)}${crownBand(1122, 1378, 754, 28)}${flatPanel(892, 1108, 698, 810, 122)}`;

  const inner = `
  <g clip-path="url(#sil)">
    ${art(c, 'compression', view)}${sash(c, 'compression', view)}
    ${marks(c, 'compression', view)}
    <g clip-path="url(#wb)">
      <path d="${CP_WB}" fill="#0f0f0f"/>
      ${band}
      <path d="M613,808 Q800,816 1000,816 Q1200,816 1387,808" fill="none" stroke="#000" stroke-width="18" opacity="0.5" filter="url(#b6)"/>
    </g>
  </g>
  ${shadingPass(sil, { folds: `<g opacity="${c.shade}">${folds}</g>`, light: c.light })}
  <g clip-path="url(#sil)">
    <path d="M613,810 Q800,818 1000,818 Q1200,818 1387,810" fill="none" stroke="#060606" stroke-width="4"/>
    ${stitch('M615,714 Q800,722 1000,720 Q1200,722 1385,714', { color: '#3a3a3a' })}
    ${stitch('M615,798 Q800,806 1000,806 Q1200,806 1385,798', { color: '#3a3a3a' })}
    ${flatlock('M1000,822 L1000,1290', 6, c.light)}
    ${flatlock(CP_SIDE, 6, c.light)}${flatlock(mirrorD(CP_SIDE), 6, c.light)}
    ${flatlock(hemBand, 5, c.light)}${flatlock(mirrorD(hemBand), 5, c.light)}
  </g>`;
  return frame(inner, sil, `${FONT_CSS}<clipPath id="wb"><path d="${CP_WB}"/></clipPath>`);
}


// ===========================================================================================
// SIDE VIEWS (turned 90°): show the side panels.
//  'side-wordmark' = wearer's right side: AX Carpentry horizontal wordmark runs the full side.
//  'side-sash'     = wearer's left side: the PROVE YOU BELONG sash wraps round, the AX emblem sits
//                    on the side panel below it (outside the sash), the red hip swipe continues.
// Base geometry has the front of the body facing LEFT (the sash side); the wordmark side mirrors it.
// ===========================================================================================
const SIDE = {
  'fight-short': {
    sil: 'M741,646 A262,24 0 0 1 1265,646 C1270,700 1274,740 1278,778 C1352,850 1418,960 1414,1110 C1410,1220 1392,1300 1384,1370 C1380,1520 1396,1680 1408,1830 Q1036,1868 662,1848 C686,1660 712,1500 722,1380 C726,1340 716,1310 712,1270 C704,1120 720,930 742,800 C742,740 741,690 741,646 Z',
    wb: 'M741,646 A262,24 0 0 0 1265,646 C1270,700 1274,740 1278,778 Q1010,832 742,800 C742,740 741,690 741,646 Z',
    opening: [1003, 646, 262, 24],
    wbBottom: 'M742,800 Q1010,832 1278,778',
    rules: ['M743,690 Q1003,716 1270,682', 'M744,752 Q1005,780 1276,742'],
    crown: [1008, 734, 62],
    seam: 'M1012,812 C1022,1000 1030,1300 1035,1640',
    split: 'M1035,1640 L980,1854 L1092,1850 Z',
    hemStitch: 'M676,1826 Q1036,1846 1396,1810',
    word: [1030, 1230, 730],
    emblem: [1050, 1470, 210],
    sash: { x: 700, y: 1300, ang: -19, len: 1040, w: 112 },
    swipe: { x: 724, y: 1000, n: 7, len: [200, 300] },
    streaks: { x: 900, y: 1480, n: 6, len: [170, 250] },
    folds: (M, X, s) => [
      glow(X(860), 1320, 130, 460, 0.07, 70, s * 3), glow(X(1300), 1000, 110, 220, 0.07, 70, s * -18),
      fold(M('M1360,1060 C1300,1180 1230,1260 1140,1300'), { color: '#000', op: 0.35, w: 40, blur: 26 }),
      fold(M('M760,830 C900,846 1100,836 1280,808'), { color: '#000', op: 0.3, w: 26, blur: 16 }),
      crease(M('M1380,1150 C1300,1260 1220,1330 1120,1380'), { w: 14, dx: 0, dy: -9, dark: 0.35 }),
      crease(M('M730,1420 C780,1520 806,1630 820,1770'), { w: 14, dx: 8 * s, dy: 0, dark: 0.32 }),
      crease(M('M1200,1420 C1215,1560 1215,1680 1205,1800'), { w: 12, dx: 8 * s, dy: 0, dark: 0.25, light: 0.05 }),
    ].join(''),
  },
  compression: {
    sil: 'M782,706 A219,20 0 0 1 1220,706 C1222,740 1224,770 1226,798 C1300,860 1338,980 1326,1120 C1318,1190 1300,1240 1290,1280 C1284,1450 1272,1620 1264,1792 Q1008,1818 752,1802 C744,1640 742,1470 744,1330 C746,1300 738,1280 736,1250 C734,1100 752,930 782,814 C782,770 782,740 782,706 Z',
    wb: 'M782,706 A219,20 0 0 0 1220,706 C1222,740 1224,770 1226,798 Q1004,834 782,814 C782,770 782,740 782,706 Z',
    opening: [1001, 706, 219, 20],
    wbBottom: 'M782,814 Q1004,834 1226,798',
    rules: ['M784,742 Q1003,764 1222,736', 'M784,792 Q1004,812 1224,782'],
    crown: [1003, 768, 50],
    seams: ['M912,826 C906,1100 900,1450 898,1806', 'M1118,812 C1140,1050 1132,1450 1118,1798'],
    hemBand: 'M752,1764 Q1008,1780 1264,1756',
    word: [1012, 1285, 690],
    emblem: [1012, 1370, 165],
    sash: { x: 745, y: 1028, ang: -5, len: 620, w: 90 },
    swipe: { x: 790, y: 905, n: 5, len: [130, 200] },
    streaks: { x: 892, y: 1430, n: 4, len: [110, 150] },
    folds: (M, X, s) => [
      glow(X(1010), 1300, 95, 430, 0.08, 70, 0), glow(X(1250), 980, 70, 200, 0.07, 40, s * -14),
      fold(M('M1300,1060 C1250,1150 1200,1210 1130,1240'), { color: '#000', op: 0.3, w: 34, blur: 26 }),
      fold(M('M790,838 C900,848 1100,842 1222,822'), { color: '#000', op: 0.3, w: 22, blur: 16 }),
      crease(M('M752,1350 C796,1420 816,1520 824,1640'), { w: 12, dx: 7 * s, dy: 0, dark: 0.3 }),
    ].join(''),
  },
};

function sideView(c, cut, view) {
  const g = SIDE[cut], mir = view === 'side-wordmark';
  const X = (x) => (mir ? W - x : x), A = (a) => (mir ? 180 - a : a), M = (d) => (mir ? mirrorD(d) : d), s = mir ? -1 : 1;
  const sil = M(g.sil);
  const r = rng(mir ? 913 : 517);
  // tonal streak ground (same language as the front and back)
  let ground = '';
  for (let i = 0; i < 70; i++) {
    const x = 620 + r() * 760, y = 600 + r() * 1300;
    ground += brush(X(x), y, A(-28 + (r() - 0.5) * 10), 160 + r() * 340, 24 + r() * 50, c.tones[i % 4], 5000 + i);
  }
  let prints = '';
  if (mir) {
    // white streaks continue from the front, flowing toward the front edge; wordmark runs the full side
    for (let i = 0; i < g.streaks.n; i++) {
      const L = g.streaks.len[0] + r() * (g.streaks.len[1] - g.streaks.len[0]);
      prints += slim(X(g.streaks.x + r() * 10), g.streaks.y + i * 30 + r() * 10, A(210 + (r() - 0.5) * 4), L, 3 + r() * 4, c.accent2, 0.55 + r() * 0.3);
    }
    const [wx, wy, ww] = g.word;
    prints += place(axWordmark(c.ax), X(wx), wy, ww, -90);
  } else {
    // red hip swipe continues from the front, the sash wraps round, emblem sits outside (below) the sash
    for (let i = 0; i < g.swipe.n; i++) {
      const L = g.swipe.len[0] + r() * (g.swipe.len[1] - g.swipe.len[0]);
      prints += brush(g.swipe.x + r() * 60, g.swipe.y + i * 22 + r() * 16, -30 + (r() - 0.5) * 6, L, 18 + r() * 26, c.accent, 6000 + i, 0.95);
    }
    const b = g.sash;
    prints += `<g transform="translate(${b.x} ${b.y}) rotate(${b.ang})">
        <rect x="-140" y="${-b.w / 2}" width="${b.len + 140}" height="${b.w}" fill="${c.sash}"/>
        <rect x="-140" y="${-b.w / 2 - 13}" width="${b.len + 140}" height="6" fill="${c.keyline}"/>
        <rect x="-140" y="${b.w / 2 + 7}" width="${b.len + 140}" height="6" fill="${c.keyline}"/></g>`;
    const [ex, ey, ew] = g.emblem;
    prints += place(axEmblem(c.ax), ex, ey, ew);
  }
  const [kx, ky, kw] = g.crown;
  const band = `<path d="${M(g.wb)}" fill="#0f0f0f"/>
    ${g.rules.map((d) => `<path d="${M(d)}" fill="none" stroke="${WAR_RED}" stroke-width="4.5"/>`).join('')}
    ${place(warLogo({ red: WHITE, white: WHITE }, ['Crown']), X(kx), ky, kw)}
    <path d="${M(g.wbBottom)}" fill="none" stroke="#000" stroke-width="18" opacity="0.5" filter="url(#b6)"/>`;
  const [ox, oy, orx, ory] = g.opening;
  const opening = `<ellipse cx="${X(ox)}" cy="${oy}" rx="${orx}" ry="${ory}" fill="#090909"/>
    <ellipse cx="${X(ox)}" cy="${oy - ory * 0.35}" rx="${orx * 0.94}" ry="${ory * 0.55}" fill="#1c1c1c"/>
    <ellipse cx="${X(ox)}" cy="${oy}" rx="${orx}" ry="${ory}" fill="none" stroke="#2b2b2b" stroke-width="3"/>`;

  const seams = cut === 'compression'
    ? `${g.seams.map((d) => flatlock(M(d), 6, c.light)).join('')}${flatlock(M(g.hemBand), 5, c.light)}`
    : `<path d="${M(g.seam)}" fill="none" stroke="#000" stroke-width="3.5" opacity="${c.seamOp}"/>
       ${stitch(M(g.seam), { color: c.stitch, op: 0.6 })}
       <path d="${M(g.split)}" fill="${c.splitFill}"/>
       <path d="${M(g.split)}" fill="none" stroke="${c.light ? '#8c8c8a' : '#000'}" stroke-width="3"/>
       ${stitch(M(g.hemStitch), { color: c.stitch })}`;

  const inner = `
  <g clip-path="url(#sil)">
    <rect width="${W}" height="${H}" fill="${c.base}"/>${ground}${prints}
    <g clip-path="url(#wb)">${band}</g>
    ${opening}
  </g>
  ${shadingPass(sil, { folds: `<g opacity="${c.shade}">${g.folds(M, X, s)}</g>`, light: c.light })}
  <g clip-path="url(#sil)">
    <path d="${M(g.wbBottom)}" fill="none" stroke="#060606" stroke-width="4"/>
    ${seams}
  </g>`;
  return frame(inner, sil, `${FONT_CSS}<clipPath id="wb"><path d="${M(g.wb)}"/></clipPath>`);
}

export const PRODUCTS = {
  'fight-short': { key: 'fight-short', label: 'Fight Short', sub: 'Loose fit · side splits', fn: fightShort },
  compression: { key: 'compression', label: 'Compression Short', sub: 'Tight fit · vale-tudo cut', fn: compression },
};
