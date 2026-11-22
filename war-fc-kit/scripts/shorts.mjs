// WAR FC event fight shorts — round 2 (after client references: Eternal MMA, Venum UFC).
// Two cuts (Fight Short: loose, side splits | Compression: tight vale-tudo) x two concepts:
//   A  Smoke & Stone : stone-flake ground, red + white smoke plumes, key-pattern waistband band
//   B  War Streaks   : tonal claw-streak ground, white/red dry-brush sweeps, PROVE YOU BELONG sash
// Both: no external drawstring; raised waistband logo rectangle carrying the CAGECRAFT emblem.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { W, H, f, frame, shadingPass, stitch, flatlock, fold, crease, glow, symOutline, mirrorD, both } from './kit.mjs';
import { warLogo, axLogo, cagecraftLogo, emblemLogo, place, WAR_RED, WHITE } from './brand.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const TEX = path.join(here, '../out/tex');
const texURI = (name) => `data:image/png;base64,${fs.readFileSync(path.join(TEX, name)).toString('base64')}`;

export const CONCEPTS = {
  A: { key: 'A', label: 'Concept A', name: 'Smoke & Stone', sub: 'Stone-flake black, red and white smoke, key-pattern waistband' },
  B: { key: 'B', label: 'Concept B', name: 'War Streaks', sub: 'Claw-streak black, brushed white and red sweeps, PROVE YOU BELONG sash' },
};
const BASE = '#121212';
const LOGO = { red: WAR_RED, white: WHITE };

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// ---------------------------------------------------------------------------- shared pieces
// Greek-key band (white on black), drawn into a strip [x0,x1] x [y, y+h]
function keyBand(id, x0, x1, y, h, color = WHITE) {
  const u = h / 8; // cell = 8u x 8u
  const cell = `M0,${7 * u} L0,${u} L${6 * u},${u} L${6 * u},${5.5 * u} L${2.5 * u},${5.5 * u} L${2.5 * u},${3.2 * u} L${4.2 * u},${3.2 * u}`;
  const sw = u * 0.95;
  return `<defs><pattern id="${id}" x="${x0}" y="${y}" width="${f(8 * u)}" height="${f(h)}" patternUnits="userSpaceOnUse">
      <path d="${cell}" fill="none" stroke="${color}" stroke-width="${f(sw)}" stroke-linecap="square" stroke-linejoin="miter"/>
      <path d="M${6 * u},${7 * u} L${8 * u},${7 * u}" stroke="${color}" stroke-width="${f(sw)}"/></pattern></defs>
    <rect x="${x0}" y="${y}" width="${x1 - x0}" height="${h}" fill="url(#${id})"/>
    <rect x="${x0}" y="${f(y - u * 1.3)}" width="${x1 - x0}" height="${f(sw * 0.8)}" fill="${color}"/>
    <rect x="${x0}" y="${f(y + h + u * 0.5)}" width="${x1 - x0}" height="${f(sw * 0.8)}" fill="${color}"/>`;
}

// raised waistband logo rectangle with the CAGECRAFT emblem
function logoRect(x0, y0, w, h, emblemW) {
  return `<path d="M${x0 + 8},${y0 + h + 6} L${x0 + w - 8},${y0 + h + 6}" stroke="#000" stroke-width="22" opacity="0.55" filter="url(#b10)"/>
    <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6" fill="#0b0b0b"/>
    <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6" fill="none" stroke="#000" stroke-width="4"/>
    ${stitch(`M${x0 + 10},${y0 + 10} L${x0 + w - 10},${y0 + 10} L${x0 + w - 10},${y0 + h - 10} L${x0 + 10},${y0 + h - 10} Z`, { color: '#3c3c3c', w: 2.2, dash: '6 5' })}
    ${place(emblemLogo(WHITE), x0 + w / 2, y0 + h / 2 + 2, emblemW)}
    <path d="M${x0 + 6},${y0 + 3} L${x0 + w - 6},${y0 + 3}" stroke="#fff" stroke-width="2" opacity="0.08"/>`;
}

// dry-brush streak: a bundle of bristle marks along an angled axis (echoes the WAR logo streaks)
function brush(x, y, angle, len, width, color, seed, op = 1) {
  const r = rng(seed);
  const n = Math.max(3, Math.round(width / 5));
  const ca = Math.cos((angle * Math.PI) / 180), sa = Math.sin((angle * Math.PI) / 180);
  let d = '';
  for (let i = 0; i < n; i++) {
    const off = (i / (n - 1) - 0.5) * width;
    const bx = x - sa * off, by = y + ca * off;
    const edge = 1 - Math.abs(i / (n - 1) - 0.5) * 2; // bristles shorter at the edges of the stroke
    let s = r() * len * 0.25 * (1 - edge * 0.6);
    const end = len * (0.55 + 0.45 * edge) - r() * len * 0.2;
    while (s < end) {
      const seg = Math.min(end - s, len * (0.15 + r() * 0.6));
      const t = width / n * (0.45 + r() * 0.6);
      const x1 = bx + ca * s, y1 = by + sa * s, x2 = bx + ca * (s + seg), y2 = by + sa * (s + seg);
      // tapered sliver
      d += `M${f(x1 - sa * t * 0.15)},${f(y1 + ca * t * 0.15)} L${f(x1 + ca * seg * 0.12 - sa * t * 0.5)},${f(y1 + sa * seg * 0.12 + ca * t * 0.5)} L${f(x2)},${f(y2)} L${f(x1 + ca * seg * 0.12 + sa * t * 0.5)},${f(y1 + sa * seg * 0.12 - ca * t * 0.5)} Z `;
      s += seg + r() * len * 0.08;
    }
  }
  return `<path d="${d}" fill="${color}" opacity="${op}"/>`;
}

// ---------------------------------------------------------------------------- concept artwork
// art(concept, cut, view) -> SVG drawn under the logos (clipped by the garment outside)
function artA(cut, view) {
  return `<image href="${texURI('stone.png')}" x="0" y="0" width="${W}" height="${H}"/>
    <image href="${texURI(`smoke_${cut}_${view}.png`)}" x="0" y="0" width="${W}" height="${H}"/>`;
}

function artB(cut, view) {
  const r = rng(view === 'back' ? 77 : 41);
  const tones = ['#1b1b1b', '#202020', '#262626', '#2c2c2c'];
  let ground = '';
  for (let i = 0; i < 150; i++) {
    const x = 300 + r() * 1500, y = 560 + r() * 1400;
    ground += brush(x, y, -28 + (r() - 0.5) * 10, 180 + r() * 420, 26 + r() * 60, tones[i % 4], 1000 + i);
  }
  const mir = view === 'back';
  const X = (x) => (mir ? W - x : x);
  const A = (a) => (mir ? 180 - a : a);
  // white sweep up the left leg, red sweep down the right hip
  let white = '', red = '';
  const wx = cut === 'compression' ? 600 : 470;
  for (let i = 0; i < 11; i++) white += brush(X(wx + r() * 160), 1500 + i * 32 + r() * 30, A(-30 + (r() - 0.5) * 6), 300 + r() * 380, 24 + r() * 34, WHITE, 2000 + i, 0.9);
  const rx = cut === 'compression' ? 1300 : 1350;
  for (let i = 0; i < 10; i++) red += brush(X(rx + r() * 120), 1040 + i * 30 + r() * 26, A(-30 + (r() - 0.5) * 6), 220 + r() * 300, 22 + r() * 32, WAR_RED, 3000 + i, 0.95);
  return `<rect width="${W}" height="${H}" fill="${BASE}"/>${ground}${white}${red}`;
}

// diagonal PROVE YOU BELONG sash across the lower outer leg (concept B).
// Per cut: origin below the hem, angle, band width, and the centre (distance along the band) of
// the stretch that is actually visible on the leg, so the text always sits fully on the garment.
const SASH = {
  'fight-short': { x0: 1080, y0: 1960, ang: -58, w: 110, mid: 545, font: 0.48 },
  compression: { x0: 1110, y0: 1890, ang: -66, w: 88, mid: 440, font: 0.5 },
};
function sash(cut, view) {
  const s = SASH[cut];
  const mir = view === 'back';
  const len = 1100, w = s.w;
  return `<g transform="translate(${mir ? W - s.x0 : s.x0} ${s.y0}) rotate(${mir ? -180 - s.ang : s.ang})">
      <rect x="0" y="${-w / 2}" width="${len}" height="${w}" fill="#0b0b0b"/>
      <rect x="0" y="${-w / 2 - 12}" width="${len}" height="6" fill="${WAR_RED}"/>
      <rect x="0" y="${w / 2 + 6}" width="${len}" height="6" fill="${WAR_RED}"/>
      <g transform="${mir ? `translate(${s.mid} 0) rotate(180) translate(${-s.mid} 0)` : ''}">
        <text x="${s.mid}" y="${f(w * s.font * 0.36)}" text-anchor="middle" font-family="'Inter Display', Inter" font-weight="900" font-size="${f(w * s.font)}" letter-spacing="${f(w * 0.05)}" fill="${WHITE}" transform="skewX(-12)">PROVE YOU BELONG</text>
      </g>
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

export function fightShort(concept, view = 'front') {
  const back = view === 'back';
  const sil = FS_SIL;
  const war = warLogo(LOGO, ['Crown', 'WAR', 'FIGHTING_CHAMPIONSHIPS']);
  const warBack = warLogo(LOGO);
  const ax = axLogo(WHITE);
  const art = concept.key === 'A' ? artA('fight-short', view) : artB('fight-short', view) + sash('fight-short', view);

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

  const marks = back
    ? `${place(warBack, 1000, 1030, 560)}${concept.key === 'A' ? place(ax, 720, 1600, 170) : place(ax, 1250, 1300, 170)}`
    : concept.key === 'A'
      ? `${place(war, 770, 1010, 340)}${place(ax, 1290, 1590, 190)}`
      : `${place(war, 770, 1000, 340)}${place(ax, 1235, 990, 190)}`;
  const band = concept.key === 'A'
    ? `${keyBand('kb', 532, back ? 1468 : 842, 700, 34)}${back ? '' : keyBand('kb2', 1158, 1468, 700, 34)}`
    : `<rect x="522" y="688" width="956" height="6" fill="${WAR_RED}"/><rect x="522" y="742" width="956" height="6" fill="${WAR_RED}"/>`;
  const wbCentre = back ? `<rect x="855" y="690" width="290" height="62" fill="#101010"/>${place(cagecraftLogo(WHITE), 1000, 721, 230)}` : '';

  const inner = `
  <g clip-path="url(#sil)">
    <rect width="${W}" height="${H}" fill="${BASE}"/>
    ${art}
    <path d="${split}" fill="#050505"/><path d="${mirrorD(split)}" fill="#050505"/>
    ${marks}
    <g clip-path="url(#wb)">
      <path d="${FS_WB}" fill="#0f0f0f"/>
      ${band}${wbCentre}
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
  </g>
  ${back ? '' : logoRect(850, 632, 300, 206, 230)}`;
  return frame(inner, sil, `<clipPath id="wb"><path d="${FS_WB}"/></clipPath>`);
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

export function compression(concept, view = 'front') {
  const back = view === 'back';
  const sil = CP_SIL;
  const war = warLogo(LOGO, ['Crown', 'WAR', 'FIGHTING_CHAMPIONSHIPS']);
  const warBack = warLogo(LOGO, ['Crown', 'WAR', 'FIGHTING_CHAMPIONSHIPS']);
  const ax = axLogo(WHITE);
  const art = concept.key === 'A' ? artA('compression', view) : artB('compression', view) + sash('compression', view);

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

  const marks = back
    ? `${place(warBack, 1000, 990, 440)}${concept.key === 'A' ? place(ax, 780, 1560, 140) : place(ax, 1210, 1260, 140)}`
    : concept.key === 'A'
      ? `${place(war, 820, 1010, 270)}${place(ax, 1205, 1560, 150)}`
      : `${place(war, 820, 1010, 270)}${place(ax, 1185, 1000, 150)}`;
  const band = concept.key === 'A'
    ? `${keyBand('kb', 616, back ? 1384 : 862, 740, 30)}${back ? '' : keyBand('kb2', 1138, 1384, 740, 30)}`
    : `<rect x="612" y="730" width="776" height="6" fill="${WAR_RED}"/><rect x="612" y="778" width="776" height="6" fill="${WAR_RED}"/>`;
  const wbCentre = back ? `<rect x="870" y="728" width="260" height="58" fill="#101010"/>${place(cagecraftLogo(WHITE), 1000, 757, 200)}` : '';

  const inner = `
  <g clip-path="url(#sil)">
    <rect width="${W}" height="${H}" fill="${BASE}"/>
    ${art}
    ${marks}
    <g clip-path="url(#wb)">
      <path d="${CP_WB}" fill="#0f0f0f"/>
      ${band}${wbCentre}
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
  </g>
  ${back ? '' : logoRect(872, 692, 256, 184, 196)}`;
  return frame(inner, sil, `<clipPath id="wb"><path d="${CP_WB}"/></clipPath>`);
}

export const PRODUCTS = {
  'fight-short': { key: 'fight-short', label: 'Fight Short', sub: 'Loose fit · side splits', fn: fightShort },
  compression: { key: 'compression', label: 'Compression Short', sub: 'Tight fit · vale-tudo cut', fn: compression },
};
