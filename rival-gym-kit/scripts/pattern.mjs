// Legacy-style hem pattern, rebuilt on a lane grid: thin parallel traces that
// step together at 45°, merge at motif edges, converge into nested chevrons
// at the centre, over an even short-dash fringe at the hem. Mirrored per motif.
// Units: 1 = lane spacing. Motif centre x=0, period 10 lanes. Heights h measured
// up from the hem (y = -h).

// turtle: [x0, h0, 'u3 r l u2 g1.5 u4 ...']  u=up, r/l=45° step out/in one lane, g=gap
function turtle(x0, h0, prog) {
  const lines = [];
  let x = x0, h = h0, cur = [[x, h]];
  for (const tok of prog.trim().split(/\s+/)) {
    const c = tok[0], n = tok.length > 1 ? parseFloat(tok.slice(1)) : 1;
    if (c === 'u') { h += n; cur.push([x, h]); }
    else if (c === 'r') { x += n; h += n; cur.push([x, h]); }
    else if (c === 'l') { x -= n; h += n; cur.push([x, h]); }
    else if (c === 'g') { if (cur.length > 1) lines.push(cur); h += n; cur = [[x, h]]; }
  }
  if (cur.length > 1) lines.push(cur);
  return lines;
}

const HALF = [
  // centre spine, then arrow shaft above the nested chevrons
  ...turtle(0, 3.2, 'u14.6 g7.4 u5.6'),
  // parallel bus of three: step out together, run up, step back in, converge to nested V's
  ...turtle(1, 3.2, 'u5.8 r u5 l u3 l'),
  ...turtle(2, 3.2, 'u4.8 r u3 g0.9 u3.1 l u3 l2'),
  ...turtle(3, 3.2, 'u3.8 r u9 l u3 l3'),
  // edge trace: merges with neighbour's mirror into a shared stem, then splits again
  ...turtle(4, 3.2, 'u2.8 r u5 g0.9 u5.1 l u4 l u5.4'),
  // Y-chevron at the motif edge, above the split
  ...turtle(5, 20.6, 'u2.6'),
  ...turtle(5, 24.4, 'l u3.4'),
  // upper verticals fading out
  ...turtle(2, 25.6, 'u4.6'),
  ...turtle(1, 25.0, 'u1.8'),
  // short ticks in the open pockets
  ...turtle(5, 3.2, 'u1.6'),
  ...turtle(1, 11.6, 'u2.2'),
];

// hem fringe: even short dashes on half-lanes
const FRINGE_LEN = [2.3, 1.1, 1.7, 0.8, 2.0, 1.2, 1.5, 0.9, 2.1, 1.0];
const FRINGE = [];
for (let i = 1; i <= 10; i++) {
  const x = i * 0.5;
  if (x === 5) continue; // shared edge handled once below
  FRINGE.push([[x, 0.25], [x, 0.25 + FRINGE_LEN[(i - 1) % FRINGE_LEN.length]]]);
}
FRINGE.push([[0, 0.25], [0, 1.6]]);
FRINGE.push([[5, 0.25], [5, 1.3]]);

function mirrored(lines) {
  const out = [];
  for (const l of lines) {
    out.push(l);
    if (l.some(([x]) => Math.abs(x) > 1e-6)) out.push(l.map(([x, h]) => [-x, h]));
  }
  return out;
}

const MOTIF = mirrored([...HALF, ...FRINGE]);
export const MOTIF_TOP = 31;

/**
 * Pattern as one SVG path string (stroke it).
 * width/height: area in px; hem at y=height. unit: px per lane.
 * cx: x of a motif centre. vStretch: vertical stretch of the motif.
 */
export function patternPath({ width, height, unit, cx = width / 2, vStretch = 1 }) {
  const period = 10 * unit;
  const parts = [];
  const nL = Math.ceil(cx / period) + 1, nR = Math.ceil((width - cx) / period) + 1;
  const f = (n) => n.toFixed(1);
  for (let i = -nL; i <= nR; i++) {
    const ox = cx + i * period;
    for (const line of MOTIF) {
      parts.push('M' + line.map(([x, h]) => `${f(ox + x * unit)},${f(height - h * unit * vStretch)}`).join(' L'));
    }
  }
  return parts.join(' ');
}
