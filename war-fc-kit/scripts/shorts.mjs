// WAR FC event fight shorts — round 3: "War Streaks" in two corner colourways.
// Two cuts (Fight Short: loose, side splits | Compression: tight vale-tudo), front and back.
//  - Black Corner: black ground with tonal claw streaks, red + white brushed accents, black sash
//  - Red Corner (inverted): red ground with tonal deep-red streaks, black + white accents, black sash
// Waistband: flat front panel inside the band (like Rival's) with the CAGECRAFT emblem; crown/spear
// band either side; CAGECRAFT wordmark large on the back waistband. No external drawstring.
// Front: big WAR FC crest across the upper front, AX Carpentry on the lower leg opposite the sash.
// Back: WAR FC and AX as a matched pair on the hips.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { W, H, f, frame, shadingPass, stitch, flatlock, fold, crease, glow, symOutline, mirrorD, both } from './kit.mjs';
import { warLogo, axLogo, cagecraftLogo, emblemLogo, place, heightAt, CROWN_D, CROWN_BOX, WAR_RED, WHITE } from './brand.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const SAIRA = fs.readFileSync(path.join(here, '../assets/fonts/saira-italic-latin.woff2')).toString('base64');
const FONT_CSS = `<style>@font-face{font-family:'Saira WAR';font-style:italic;font-weight:100 900;src:url(data:font/woff2;base64,${SAIRA}) format('woff2');}</style>`;

export const CONCEPTS = {
  black: {
    key: 'black', label: 'Black Corner', name: 'War Streaks', sub: 'Black ground, tonal claw streaks, red and white brushed accents',
    base: '#121212', tones: ['#1b1b1b', '#202020', '#262626', '#2c2c2c'], accent: WAR_RED, accent2: WHITE,
    sash: '#0b0b0b', keyline: WAR_RED, spear: WAR_RED, logo: { red: WAR_RED, white: WHITE },
  },
  red: {
    key: 'red', label: 'Red Corner', name: 'War Streaks (inverted)', sub: 'WAR Red ground, tonal deep-red streaks, black and white brushed accents',
    base: '#D3141C', tones: ['#c51219', '#b90f17', '#ca161e', '#ad0d15'], accent: '#111111', accent2: WHITE,
    sash: '#0d0d0d', keyline: '#0d0d0d', spear: WAR_RED, logo: { red: '#121212', white: WHITE },
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

// logo marks per cut and view: [logo, cx, cy, width]
const MARKS = {
  'fight-short': {
    front: [['crest', 1000, 985, 600], ['ax', 720, 1560, 205]],
    back: [['crest', 750, 1000, 320], ['ax', 1262, 1000, 150]],
  },
  compression: {
    front: [['crest', 1000, 980, 470], ['ax', 790, 1540, 160]],
    back: [['crest', 850, 1010, 240], ['ax', 1172, 1010, 100]],
  },
};
const ART = {
  'fight-short': { hipL: [500, 1200], hipR: [1440, 1000] },
  compression: { hipL: [612, 1160], hipR: [1330, 1020] },
};
function logoOf(c, k) {
  return k === 'crest' ? warLogo(c.logo, ['Crown', 'WAR', 'FIGHTING_CHAMPIONSHIPS']) : axLogo(WHITE);
}
function marks(c, cut, view) {
  return MARKS[cut][view].map(([k, x, y, w]) => place(logoOf(c, k), x, y, w)).join('');
}
function avoidBoxes(c, cut, view, m = 34) {
  return MARKS[cut][view].map(([k, x, y, w]) => {
    const h = heightAt(logoOf(c, k), w);
    return [x - w / 2 - m, y - h / 2 - m, x + w / 2 + m, y + h / 2 + m];
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
  const { hipL, hipR } = ART[cut];
  const boxes = avoidBoxes(c, cut, view);
  // brushed accent at the outer hip (red on black / black on red), kept clear of the logos
  let accent = '';
  const ay = hipR[1] + (mir ? 110 : 0);
  for (let i = 0; i < 9; i++) accent += brush(X(hipR[0] - r() * 110), ay + i * 30 + r() * 24, A(-30 + (r() - 0.5) * 6), 200 + r() * 260, 20 + r() * 30, c.accent, 3000 + i, 0.95);
  // clean white accents: slim tapered streaks off the other hip, stopping short of every logo
  let lines = '';
  for (let i = 0; i < 6; i++) {
    const x = X(hipL[0] + r() * 40 - 20), y = hipL[1] + i * 32 + r() * 12, ang = A(-30 + (r() - 0.5) * 4);
    const L = clearLen(x, y, ang, 240 + r() * 260, boxes);
    if (L > 120) lines += slim(x, y, ang, L, 3 + r() * 5, c.accent2, 0.55 + r() * 0.3);
  }
  return `<rect width="${W}" height="${H}" fill="${c.base}"/>${ground}${accent}${lines}`;
}

// diagonal PROVE YOU BELONG sash across the lower outer leg; text sized to the visible stretch
const SASH = {
  'fight-short': { x0: 1080, y0: 1960, ang: -58, w: 112, mid: 525, font: 0.42, spear: 110 },
  compression: { x0: 1072, y0: 1850, ang: -72, w: 90, mid: 345, font: 0.42, spear: 96 },
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
  const back = view === 'back';
  const sil = FS_SIL;

  const gathers = Array.from({ length: 26 }, (_, i) => {
    const x = 540 + i * 36 + ((i * 37) % 11);
    const len = 36 + ((i * 53) % 5) * 12;
    return fold(`M${x},806 L${x + (i % 2 ? 5 : -5)},${806 + len}`, { color: i % 2 ? '#000' : '#fff', op: i % 2 ? 0.4 : 0.05, w: 9, blur: 6 });
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
    ? `${crownBand(536, 712, 716, 34)}${crownBand(1288, 1464, 716, 34)}${place(cagecraftLogo(WHITE), 1000, 716, 540)}`
    : `${crownBand(536, 830, 716, 34)}${crownBand(1170, 1464, 716, 34)}${flatPanel(846, 1154, 632, 800, 236)}`;

  const inner = `
  <g clip-path="url(#sil)">
    ${art(c, 'fight-short', view)}${sash(c, 'fight-short', view)}
    <path d="${split}" fill="#050505"/><path d="${mirrorD(split)}" fill="#050505"/>
    ${marks(c, 'fight-short', view)}
    <g clip-path="url(#wb)">
      <path d="${FS_WB}" fill="#0f0f0f"/>
      ${band}
      <path d="M522,794 Q760,804 1000,804 Q1240,804 1478,794" fill="none" stroke="#000" stroke-width="18" opacity="0.5" filter="url(#b6)"/>
    </g>
  </g>
  ${shadingPass(sil, { folds })}
  <g clip-path="url(#sil)">
    <path d="M522,796 Q760,806 1000,806 Q1240,806 1478,796" fill="none" stroke="#060606" stroke-width="4"/>
    ${stitch('M524,652 Q760,660 1000,658 Q1240,660 1476,652', { color: '#3a3a3a' })}
    ${stitch('M524,782 Q760,790 1000,790 Q1240,790 1476,782', { color: '#3a3a3a' })}
    <path d="M1000,808 L1000,1432" stroke="#000" stroke-width="3.5" opacity="0.6"/>
    ${stitch('M990,812 L990,1420', { color: '#2e2e2e', op: 0.6 })}
    <path d="${frontEdge}" stroke="#000" stroke-width="14" opacity="0.5" filter="url(#b6)" transform="translate(4 0)"/>
    <path d="${frontEdge}" stroke="#000" stroke-width="3"/><path d="${mirrorD(frontEdge)}" stroke="#000" stroke-width="3"/>
    <path d="${mirrorD(frontEdge)}" stroke="#000" stroke-width="14" opacity="0.5" filter="url(#b6)" transform="translate(-4 0)"/>
    <rect x="420" y="1592" width="26" height="10" rx="3" fill="#2e2e2e" transform="rotate(10 433 1597)"/>
    <rect x="1554" y="1592" width="26" height="10" rx="3" fill="#2e2e2e" transform="rotate(-10 1567 1597)"/>
    ${both(stitch, hemStitch, { color: '#3a3a3a' })}
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
    ? `${crownBand(622, 774, 754, 28)}${crownBand(1226, 1378, 754, 28)}${place(cagecraftLogo(WHITE), 1000, 754, 440)}`
    : `${crownBand(622, 866, 754, 28)}${crownBand(1134, 1378, 754, 28)}${flatPanel(880, 1120, 698, 810, 184)}`;

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
  ${shadingPass(sil, { folds })}
  <g clip-path="url(#sil)">
    <path d="M613,810 Q800,818 1000,818 Q1200,818 1387,810" fill="none" stroke="#060606" stroke-width="4"/>
    ${stitch('M615,714 Q800,722 1000,720 Q1200,722 1385,714', { color: '#3a3a3a' })}
    ${stitch('M615,798 Q800,806 1000,806 Q1200,806 1385,798', { color: '#3a3a3a' })}
    ${flatlock('M1000,822 L1000,1290', 6)}
    ${flatlock(CP_SIDE, 6)}${flatlock(mirrorD(CP_SIDE), 6)}
    ${flatlock(hemBand, 5)}${flatlock(mirrorD(hemBand), 5)}
  </g>`;
  return frame(inner, sil, `${FONT_CSS}<clipPath id="wb"><path d="${CP_WB}"/></clipPath>`);
}

export const PRODUCTS = {
  'fight-short': { key: 'fight-short', label: 'Fight Short', sub: 'Loose fit · side splits', fn: fightShort },
  compression: { key: 'compression', label: 'Compression Short', sub: 'Tight fit · vale-tudo cut', fn: compression },
};
