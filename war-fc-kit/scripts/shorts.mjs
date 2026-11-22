// WAR FC event fight shorts: two cuts x two corner colourways, front and back.
//  - Fight Short (loose): wide waistband, velcro closure + lace, side panels split at the hem
//  - Compression (tight): fitted vale-tudo cut, wide branded waistband, outer-thigh panels, flatlock
// One design system: tonal crown-monogram background, distressed-edge side panels (brush streaks
// like the logo), fixed logo slots for WAR FC, AX Carpentry (presenting) and CAGECRAFT.
import { W, H, f, frame, shadingPass, stitch, flatlock, fold, crease, glow, symOutline, mirrorD, both } from './kit.mjs';
import { warLogo, axLogo, cagecraftLogo, place, heightAt, CROWN_D, CROWN_BOX, SPEAR_D, WAR_RED, WHITE } from './brand.mjs';

export const CORNERS = {
  black: {
    key: 'black', label: 'Black Corner', sub: 'Black base · red panels · white marks',
    base: '#141414', tone: '#272727', panel: WAR_RED, panelInside: '#7a1015', band: '#0f0f0f',
    logo: { red: WAR_RED, white: WHITE }, ax: WHITE, cc: WHITE, panelMark: WHITE, cord: WHITE,
  },
  red: {
    key: 'red', label: 'Red Corner', sub: 'Red base · black panels · white marks',
    base: '#D9161E', tone: '#BA0F17', panel: '#141414', panelInside: '#0a0a0a', band: '#0f0f0f',
    logo: { red: '#141414', white: WHITE }, ax: WHITE, cc: WHITE, panelMark: WHITE, cord: WHITE,
  },
};

// --- small deterministic PRNG so renders are repeatable ---------------------------------
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// --- background: tonal crown monogram (half-drop) with spear marks between ------------------
function monogramDefs(id, tone, scale = 1) {
  const cw = 66 * scale, ch = (cw * (CROWN_BOX[3] - CROWN_BOX[1])) / (CROWN_BOX[2] - CROWN_BOX[0]);
  const s = cw / (CROWN_BOX[2] - CROWN_BOX[0]);
  const tw = 230 * scale, th = 190 * scale;
  const crown = (x, y) => `<path transform="translate(${f(x - cw / 2)} ${f(y - ch / 2)}) scale(${s.toFixed(4)}) translate(${-CROWN_BOX[0]} 0)" d="${CROWN_D}" fill="${tone}"/>`;
  const spear = (x, y, dir) => `<path transform="translate(${f(x)} ${f(y)}) scale(${(0.16 * scale * dir).toFixed(3)} ${(0.16 * scale).toFixed(3)})" d="${SPEAR_D}" fill="${tone}"/>`;
  return `<pattern id="${id}" width="${f(tw)}" height="${f(th)}" patternUnits="userSpaceOnUse">
    ${crown(0, 0)}${crown(tw, 0)}${crown(0, th)}${crown(tw, th)}${crown(tw / 2, th / 2)}
    ${spear(tw / 2 + 10, 0, 1)}${spear(tw / 2 - 10, 0, -1)}${spear(tw / 2 + 10, th, 1)}${spear(tw / 2 - 10, th, -1)}
    ${spear(10, th / 2, 1)}${spear(-10, th / 2, -1)}${spear(tw + 10, th / 2, 1)}${spear(tw - 10, th / 2, -1)}
  </pattern>`;
}

// --- side panel with a distressed, brush-streaked inner edge ----------------------------------
// edge: [[x, y], ...] top->bottom (the panel's inner boundary on the LEFT side); outer side is x=0.
function streakPanel(edge, fill, seed, dir = 1, quiet = []) {
  const pts = edge.map(([x, y]) => `${f(x)},${f(y)}`).join(' L');
  const y0 = edge[0][1], y1 = edge[edge.length - 1][1];
  let d = `M${dir > 0 ? 0 : W},${f(y0)} L${pts} L${dir > 0 ? 0 : W},${f(y1)} Z`;
  const r = rng(seed);
  const xAt = (y) => {
    for (let i = 1; i < edge.length; i++) if (y <= edge[i][1]) {
      const [xa, ya] = edge[i - 1], [xb, yb] = edge[i];
      return xa + ((xb - xa) * (y - ya)) / (yb - ya);
    }
    return edge[edge.length - 1][0];
  };
  const streaks = [];
  for (let y = y0 + 18; y < y1 - 10; y += 9 + r() * 18) {
    if (r() < 0.3) continue;
    // quiet zones keep logos clear: streaks fade back to short stubs around them
    const q = quiet.reduce((m, [a, b]) => Math.min(m, y < a ? (a - y) / 60 : y > b ? (y - b) / 60 : 0), 1);
    const L = (12 + Math.pow(r(), 2.4) * 125) * (0.18 + 0.82 * Math.min(1, q)), t = 3 + r() * 8, ex = xAt(y) - dir * 4;
    streaks.push(`M${f(ex)},${f(y - t / 2)} L${f(ex + dir * L)},${f(y + (r() - 0.5) * 2)} L${f(ex)},${f(y + t / 2)} Z`);
  }
  return `<path d="${d} ${streaks.join(' ')}" fill="${fill}"/>`;
}
const mirrorPts = (pts) => pts.map(([x, y]) => [W - x, y]);

// ===========================================================================================
// FIGHT SHORT (loose) — velcro + lace waistband, side panels split at the hem
// ===========================================================================================
const FS_HALF = {
  start: [1000, 640],
  segs: [
    ['Q', 760, 644, 520, 632],               // waistband top
    ['C', 519, 690, 519, 750, 522, 792],     // waistband side
    ['C', 500, 1050, 452, 1360, 432, 1604],  // outer leg down to the split
    ['L', 394, 1818],                        // back panel flares out through the split
    ['L', 472, 1832],                        // back panel hem (tucks under the front panel)
    ['Q', 708, 1846, 944, 1860],             // front hem
    ['C', 962, 1700, 986, 1520, 1000, 1432], // inseam up to crotch
  ],
};
const FS_SIL = symOutline(FS_HALF);
const FS_WB = symOutline({ start: [1000, 640], segs: [['Q', 760, 644, 520, 632], ['C', 519, 690, 519, 750, 522, 792], ['Q', 760, 802, 1000, 802]] });
const FS_EDGE = [[612, 798], [606, 1000], [598, 1250], [590, 1500], [586, 1700], [590, 1870]];

function lace(c) {
  // cord out of two grommets at centre front, tied in a bow, ends with aglets
  const cord = (d, w = 9) => `<path d="${d}" fill="none" stroke="#000" stroke-width="${w + 4}" stroke-linecap="round" opacity="0.35" filter="url(#b3)" transform="translate(2 4)"/>
    <path d="${d}" fill="none" stroke="${c.cord}" stroke-width="${w}" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="#000" stroke-width="${w * 0.35}" stroke-linecap="round" opacity="0.18" transform="translate(1 2)"/>`;
  const grom = (x) => `<circle cx="${x}" cy="712" r="15" fill="#2a2a2a"/><circle cx="${x}" cy="712" r="9" fill="#050505"/>`;
  return `${grom(968)}${grom(1032)}
    ${cord('M968,712 C978,740 990,752 1000,760')}${cord('M1032,712 C1022,740 1010,752 1000,760')}
    ${cord('M1000,760 C960,742 912,742 916,772 C920,800 970,786 1000,762')}
    ${cord('M1000,760 C1040,742 1088,742 1084,772 C1080,800 1030,786 1000,762')}
    ${cord('M998,764 C986,820 972,880 958,930')}${cord('M1002,764 C1016,822 1034,884 1052,936')}
    <rect x="950" y="924" width="14" height="34" rx="4" transform="rotate(16 957 941)" fill="#3a3a3a"/>
    <rect x="1046" y="930" width="14" height="34" rx="4" transform="rotate(-18 1053 947)" fill="#3a3a3a"/>
    <circle cx="1000" cy="762" r="13" fill="${c.cord}"/><circle cx="1000" cy="762" r="13" fill="#000" opacity="0.2"/>`;
}

export function fightShort(c, view = 'front') {
  const back = view === 'back';
  const sil = FS_SIL;
  const ccw = cagecraftLogo(c.cc);
  const war = warLogo(c.logo, ['Crown', 'WAR', 'FIGHTING_CHAMPIONSHIPS']);
  const warBack = warLogo(c.logo, ['Crown', 'WAR', 'FIGHTING_CHAMPIONSHIPS', 'PYB_BANNER']);
  const warWord = warLogo({ red: c.panelMark, white: c.panelMark }, ['WAR']);
  const ax = axLogo(c.ax);

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

  // the split: inside of the back side-panel shows between the back and front panel edges
  const split = 'M432,1604 L394,1818 L472,1832 Z';
  const frontEdge = 'M432,1604 L472,1832';
  const hemStitch = 'M478,1808 Q708,1822 936,1836';

  const panelMarkL = place(warWord, 528, 1240, 300, -90);
  const panelMarkR = place(warWord, W - 528, 1240, 300, 90);

  const chest = back
    ? `${place(warBack, 1000, 1010, 620)}
       ${place(ax, 1262, 1530, 170)}`
    : `${place(war, 792, 1130, 372)}
       ${place(ax, 1250, 1112, 215)}`;
  const band = back
    ? `${place(ccw, 1000, 716, 300)}`
    : `${place(ccw, 1255, 716, 230)}${place(warLogo(c.logo, ['Crown']), 745, 716, 92)}`;

  const inner = `
  <g clip-path="url(#sil)">
    <rect width="${W}" height="${H}" fill="${c.base}"/>
    <rect width="${W}" height="${H}" fill="url(#mono)"/>
    ${streakPanel(FS_EDGE, c.panel, back ? 21 : 7, 1, back ? [[870, 1150]] : [[1010, 1250]])}${streakPanel(mirrorPts(FS_EDGE), c.panel, back ? 23 : 9, -1, back ? [[870, 1150], [1430, 1630]] : [[1000, 1230]])}
    ${panelMarkL}${panelMarkR}
    <path d="${split}" fill="${c.panelInside}"/><path d="${mirrorD(split)}" fill="${c.panelInside}"/>
    ${chest}
    <g clip-path="url(#wb)">
      <path d="${FS_WB}" fill="${c.band}"/>
      ${band}
      <path d="M522,794 Q760,804 1000,804 Q1240,804 1478,794" fill="none" stroke="#000" stroke-width="18" opacity="0.5" filter="url(#b6)"/>
    </g>
  </g>
  ${shadingPass(sil, { folds })}
  <g clip-path="url(#sil)">
    <path d="M522,796 Q760,806 1000,806 Q1240,806 1478,796" fill="none" stroke="#060606" stroke-width="4"/>
    ${stitch('M524,652 Q760,660 1000,658 Q1240,660 1476,652', { color: '#3a3a3a' })}
    ${stitch('M524,782 Q760,790 1000,790 Q1240,790 1476,782', { color: '#3a3a3a' })}
    ${back ? '' : `<path d="M1000,642 L1000,804" stroke="#000" stroke-width="5"/><path d="M1004,642 L1004,804" stroke="#fff" stroke-width="2" opacity="0.08"/>`}
    <path d="M1000,808 L1000,1432" stroke="#000" stroke-width="3.5" opacity="0.6"/>
    ${stitch('M990,812 L990,1420', { color: '#2e2e2e', op: 0.6 })}
    <path d="${frontEdge}" stroke="#000" stroke-width="14" opacity="0.5" filter="url(#b6)" transform="translate(4 0)"/>
    <path d="${frontEdge}" stroke="#000" stroke-width="3"/><path d="${mirrorD(frontEdge)}" stroke="#000" stroke-width="3"/>
    <path d="${mirrorD(frontEdge)}" stroke="#000" stroke-width="14" opacity="0.5" filter="url(#b6)" transform="translate(-4 0)"/>
    <rect x="420" y="1592" width="26" height="10" rx="3" fill="#2e2e2e" transform="rotate(10 433 1597)"/>
    <rect x="1554" y="1592" width="26" height="10" rx="3" fill="#2e2e2e" transform="rotate(-10 1567 1597)"/>
    ${both(stitch, hemStitch, { color: '#3a3a3a' })}
    ${stitch('M452,1604 C470,1360 512,1060 530,800', { color: '#000', op: 0.0 })}
  </g>
  ${back ? '' : lace(c)}`;
  const defs = `${monogramDefs('mono', c.tone, 1.25)}<clipPath id="wb"><path d="${FS_WB}"/></clipPath>`;
  return frame(inner, sil, defs);
}

// ===========================================================================================
// COMPRESSION (tight) — vale-tudo cut, wide branded waistband, outer-thigh panels, flatlock
// ===========================================================================================
const CP_HALF = {
  start: [1000, 700],
  segs: [
    ['Q', 800, 704, 612, 694],               // waistband top
    ['C', 611, 740, 611, 780, 613, 806],     // waistband side
    ['C', 594, 940, 570, 1100, 564, 1290],   // hip / outer thigh
    ['C', 560, 1480, 566, 1660, 574, 1800],  // outer leg to hem
    ['Q', 760, 1816, 946, 1830],             // hem
    ['C', 958, 1640, 980, 1420, 1000, 1290], // inseam to crotch
  ],
};
const CP_SIL = symOutline(CP_HALF);
const CP_WB = symOutline({ start: [1000, 700], segs: [['Q', 800, 704, 612, 694], ['C', 611, 740, 611, 780, 613, 806], ['Q', 800, 814, 1000, 814]] });
const CP_EDGE = [[700, 812], [686, 1000], [672, 1250], [664, 1500], [666, 1830]];

export function compression(c, view = 'front') {
  const back = view === 'back';
  const sil = CP_SIL;
  const ccw = cagecraftLogo(c.cc);
  const war = warLogo(c.logo, ['Crown', 'WAR', 'FIGHTING_CHAMPIONSHIPS']);
  const warBack = warLogo(c.logo, ['Crown', 'WAR']);
  const warWord = warLogo({ red: c.panelMark, white: c.panelMark }, ['WAR']);
  const ax = axLogo(c.ax);

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
  const panelMarkL = place(warWord, 630, 1330, 290, -90);
  const panelMarkR = place(warWord, W - 630, 1330, 290, 90);
  const chest = back
    ? `${place(warBack, 1000, 990, 450)}${place(ax, 1224, 1470, 140)}`
    : `${place(war, 830, 1070, 266)}${place(ax, 1196, 1062, 165)}`;
  // waistband: repeated CAGECRAFT wordmark, like a jacquard band
  const bandMarks = [-1, 0, 1].map((k) => place(ccw, 1000 + k * 280, 757, 210)).join('');

  const inner = `
  <g clip-path="url(#sil)">
    <rect width="${W}" height="${H}" fill="${c.base}"/>
    <rect width="${W}" height="${H}" fill="url(#mono)"/>
    ${streakPanel(CP_EDGE, c.panel, back ? 31 : 13, 1, back ? [[900, 1080]] : [[990, 1150]])}${streakPanel(mirrorPts(CP_EDGE), c.panel, back ? 33 : 17, -1, back ? [[900, 1080], [1390, 1550]] : [[970, 1150]])}
    ${panelMarkL}${panelMarkR}
    ${chest}
    <g clip-path="url(#wb)">
      <path d="${CP_WB}" fill="${c.band}"/>
      ${bandMarks}
      <path d="M613,808 Q800,816 1000,816 Q1200,816 1387,808" fill="none" stroke="#000" stroke-width="18" opacity="0.5" filter="url(#b6)"/>
    </g>
  </g>
  ${shadingPass(sil, { folds })}
  <g clip-path="url(#sil)">
    <path d="M613,810 Q800,818 1000,818 Q1200,818 1387,810" fill="none" stroke="#060606" stroke-width="4"/>
    ${stitch('M615,714 Q800,722 1000,720 Q1200,722 1385,714', { color: '#3a3a3a' })}
    ${stitch('M615,798 Q800,806 1000,806 Q1200,806 1385,798', { color: '#3a3a3a' })}
    ${flatlock('M1000,822 L1000,1290', 6)}
    ${flatlock('M700,812 L686,1000 L672,1250 L664,1500 L666,1830', 6)}${flatlock(mirrorD('M700,812 L686,1000 L672,1250 L664,1500 L666,1830'), 6)}
    ${flatlock(hemBand, 5)}${flatlock(mirrorD(hemBand), 5)}
  </g>`;
  const defs = `${monogramDefs('mono', c.tone, 1.1)}<clipPath id="wb"><path d="${CP_WB}"/></clipPath>`;
  return frame(inner, sil, defs);
}

export const PRODUCTS = {
  'fight-short': { key: 'fight-short', label: 'Fight Short', sub: 'Loose fit · side splits', fn: fightShort },
  compression: { key: 'compression', label: 'Compression Short', sub: 'Tight fit · vale-tudo cut', fn: compression },
};
