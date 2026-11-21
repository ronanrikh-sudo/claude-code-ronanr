// Rival Gym oval emblem, built on the Legacy oval geometry:
// crescent ring (hairline at top-left, heavy on the right), inner comet swoosh
// peeling off the ring on the right, wordmark breaking out left, GYM beneath.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const GLYPHS = JSON.parse(fs.readFileSync(path.join(here, '../assets/rival_paths.json'), 'utf8'));

export const RED = '#C10212';
export const WHITE = '#F4F4F2';

const RX = 500, RY = 205;
const deg = (d) => (d * Math.PI) / 180;
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const f2 = (n) => n.toFixed(2);

function ellipsePt(t) {
  return [RX * Math.cos(t), RY * Math.sin(t)];
}
function normal(t) {
  const nx = Math.cos(t) / RX, ny = Math.sin(t) / RY;
  const l = Math.hypot(nx, ny);
  return [nx / l, ny / l];
}

// ring thickness profile
const T0 = deg(-149), T1 = deg(142);
const WMAX = 54, WMIN = 5;
function ringW(t) {
  const f = Math.pow((1 + Math.cos(t)) / 2, 1.7);
  const taper = smooth(0, deg(38), t - T0) * smooth(0, deg(30), T1 - t);
  return (WMIN + (WMAX - WMIN) * f) * (0.15 + 0.85 * taper) * smooth(0, deg(6), Math.min(t - T0, T1 - t)) + 0.0;
}
function ringInner(t) {
  const [x, y] = ellipsePt(t), [nx, ny] = normal(t), w = ringW(t);
  return [x - w * nx, y - w * ny];
}

function ringPath() {
  const N = 240, outer = [], inner = [];
  for (let i = 0; i <= N; i++) {
    const t = T0 + ((T1 - T0) * i) / N;
    outer.push(ellipsePt(t));
    inner.push(ringInner(t));
  }
  const pts = outer.concat(inner.reverse());
  return 'M' + pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L') + 'Z';
}

// comet swoosh peeling off the inside of the ring on the right
const C0 = deg(66), C1 = deg(-50);
function cometPath() {
  const N = 160, a = [], b = [];
  for (let i = 0; i <= N; i++) {
    const t = C0 + ((C1 - C0) * i) / N;
    const u = i / N; // 0 at bottom start, 1 at top tip
    const [ix, iy] = ringInner(t), [nx, ny] = normal(t);
    const gap = 15 * smooth(0, 0.3, u) + 20 * smooth(0.55, 1, u);
    const w2 = 31 * Math.pow(Math.sin(Math.PI * u), 0.7) * (1 - 0.3 * u);
    a.push([ix - gap * nx, iy - gap * ny]);
    b.push([ix - (gap + w2) * nx, iy - (gap + w2) * ny]);
  }
  const pts = a.concat(b.reverse());
  return { d: 'M' + pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L') + 'Z', tip: a[a.length - 1] };
}

export function sparkle(cx, cy, r, waist = 0.16, squash = 0.78) {
  const rx = r * squash, w = r * waist;
  return `M${f2(cx)},${f2(cy - r)} Q${f2(cx + w)},${f2(cy - w)} ${f2(cx + rx)},${f2(cy)} Q${f2(cx + w)},${f2(cy + w)} ${f2(cx)},${f2(cy + r)} Q${f2(cx - w)},${f2(cy + w)} ${f2(cx - rx)},${f2(cy)} Q${f2(cx - w)},${f2(cy - w)} ${f2(cx)},${f2(cy - r)}Z`;
}

// wordmark placement (logo px -> emblem units)
const RIVAL_BOX = [24.7, 163.0, 431.9, 232.1];
const GYM_BOX = [228.2, 242.8, 421.2, 283.9];
const RIVAL_W = 860;
const S_R = RIVAL_W / (RIVAL_BOX[2] - RIVAL_BOX[0]);
const RIVAL_H = (RIVAL_BOX[3] - RIVAL_BOX[1]) * S_R;
const RIVAL_LEFT = -548;
const RIVAL_TOP = -112;

function rivalGroup(fill) {
  const tx = RIVAL_LEFT - RIVAL_BOX[0] * S_R, ty = RIVAL_TOP - RIVAL_BOX[1] * S_R;
  const d = GLYPHS.RIVAL.map((g) => g.d).join(' ');
  return `<path transform="translate(${f2(tx)} ${f2(ty)}) scale(${f2(S_R)})" d="${d}" fill="${fill}" fill-rule="evenodd"/>`;
}

// GYM: same italic, smaller, tracked out; optional rule (their logo's line) to the left
function gymGroup(fill, { layout = 'plain', scaleRel = 0.44, tracking = 10, shift = -78 } = {}) {
  const gh = RIVAL_H * scaleRel;
  const s = gh / (GYM_BOX[3] - GYM_BOX[1]);
  const glyphs = GLYPHS.GYM;
  // natural width incl tracking
  const natW = (GYM_BOX[2] - GYM_BOX[0]) * s + tracking * (glyphs.length - 1);
  const top = RIVAL_TOP + RIVAL_H + 22;
  const rivalRightBottom = RIVAL_LEFT + RIVAL_W - 0; // right edge at baseline
  let left;
  if (layout === 'center') left = RIVAL_LEFT + (RIVAL_W - natW) / 2 + 10;
  else left = rivalRightBottom - natW - 34 + shift; // under the right of the wordmark, nudged left
  let out = '';
  glyphs.forEach((g, i) => {
    const tx = left - GYM_BOX[0] * s + i * tracking, ty = top - GYM_BOX[1] * s;
    out += `<path transform="translate(${f2(tx)} ${f2(ty)}) scale(${f2(s)})" d="${g.d}" fill="${fill}" fill-rule="evenodd"/>`;
  });
  if (layout === 'rule' || layout === 'rules') {
    // slanted-end rule like the source logo, sitting on GYM's x-height middle
    const ry = top + gh * 0.5, rh = Math.max(5, gh * 0.11), k = 0.353;
    const rr = left - 18, rl = left - 250;
    out += `<path d="M${f2(rl + k * rh)},${f2(ry - rh / 2)} L${f2(rr + k * rh)},${f2(ry - rh / 2)} L${f2(rr)},${f2(ry + rh / 2)} L${f2(rl)},${f2(ry + rh / 2)}Z" fill="${fill}"/>`;
    if (layout === 'rules') {
      const r2l = left + natW + 14, r2r = r2l + 90;
      out += `<path d="M${f2(r2l + k * rh)},${f2(ry - rh / 2)} L${f2(r2r + k * rh)},${f2(ry - rh / 2)} L${f2(r2r)},${f2(ry + rh / 2)} L${f2(r2l)},${f2(ry + rh / 2)}Z" fill="${fill}"/>`;
    }
  }
  return out;
}

/**
 * colours: { ring, word, gym }
 * returns an SVG <g> in emblem units (approx x -600..520, y -230..230), centred on the oval
 */
export function emblem(colours, opts = {}) {
  const { ring, word, gym } = colours;
  const comet = cometPath();
  const [tx, ty] = comet.tip;
  // sparkles removed at Rival's request; set opts.sparkles = true to bring them back
  const sp = opts.sparkles ? [
    sparkle(-487, -150, 27),           // above-left of the R, beside the ring tip
    sparkle(-598, -40, 19),            // left of the R
    sparkle(tx - 2, ty - 4, 24),       // on the comet tip
    sparkle(318, -44, 15),             // inside, right of the L
  ] : [];
  return `<g>
    <path d="${ringPath()}" fill="${ring}"/>
    <path d="${comet.d}" fill="${ring}"/>
    ${sp.map((d) => `<path d="${d}" fill="${ring}"/>`).join('')}
    ${rivalGroup(word)}
    ${gymGroup(gym, opts.gym)}
  </g>`;
}

export const EMBLEM_BOX = { x: -630, y: -232, w: 1160, h: 464 }; // generous bounds for placement

export const IDEAS = {
  A: { key: 'A', label: 'Idea A', sub: 'White oval · Red wordmark', ring: WHITE, word: RED, gym: WHITE, pattern: RED },
  B1: { key: 'B1', label: 'Idea B.1', sub: 'All red', ring: RED, word: RED, gym: RED, pattern: RED },
  B2: { key: 'B2', label: 'Idea B.2', sub: 'All white', ring: WHITE, word: WHITE, gym: WHITE, pattern: WHITE },
};

// ---------------------------------------------------------------------------
// Co-branded back lockups
// ---------------------------------------------------------------------------
const CC = JSON.parse(fs.readFileSync(path.join(here, '../assets/cagecraft_paths.json'), 'utf8')).CAGECRAFT;
const CC_BOX = CC.bbox; // [x0,y0,x1,y1] in source px
const CC_AR = (CC_BOX[2] - CC_BOX[0]) / (CC_BOX[3] - CC_BOX[1]);

// CAGECRAFT wordmark with its top-left at (x, y), given width
export function cagecraft(fill, x, y, width) {
  const s = width / (CC_BOX[2] - CC_BOX[0]);
  return { svg: `<path transform="translate(${f2(x - CC_BOX[0] * s)} ${f2(y - CC_BOX[1] * s)}) scale(${f2(s)})" d="${CC.d}" fill="${fill}" fill-rule="evenodd"/>`, h: width / CC_AR };
}
// a clean multiplication cross, centred at (cx, cy)
export function cross(fill, cx, cy, size) {
  const r = size / 2, w = size * 0.15;
  const bar = (a) => `<rect x="${f2(cx - r)}" y="${f2(cy - w / 2)}" width="${f2(size)}" height="${f2(w)}" transform="rotate(${a} ${f2(cx)} ${f2(cy)})" fill="${fill}"/>`;
  return bar(45) + bar(-45);
}
// "RIVAL GYM" on one line in the Rival italic, cap height h, top-left (x, y); returns svg + width
export function rivalGymLine(colours, x, y, h) {
  const sr = h / (RIVAL_BOX[3] - RIVAL_BOX[1]);
  const sg = h / (GYM_BOX[3] - GYM_BOX[1]);
  const rw = (RIVAL_BOX[2] - RIVAL_BOX[0]) * sr, gap = h * 0.42;
  const r = `<path transform="translate(${f2(x - RIVAL_BOX[0] * sr)} ${f2(y - RIVAL_BOX[1] * sr)}) scale(${f2(sr)})" d="${GLYPHS.RIVAL.map((g) => g.d).join(' ')}" fill="${colours.word}" fill-rule="evenodd"/>`;
  const gx = x + rw + gap;
  const g = `<path transform="translate(${f2(gx - GYM_BOX[0] * sg)} ${f2(y - GYM_BOX[1] * sg)}) scale(${f2(sg)})" d="${GLYPHS.GYM.map((q) => q.d).join(' ')}" fill="${colours.gym}" fill-rule="evenodd"/>`;
  return { svg: r + g, w: rw + gap + (GYM_BOX[2] - GYM_BOX[0]) * sg };
}

// colour of the "× CAGECRAFT" partner line for an idea (white on the black kit)
const partner = (idea) => idea.ring;

/** Tops (tee + rashguard) back-neck lockup: Rival oval, then × and the CAGECRAFT wordmark.
 *  Units: oval emblem units; returns { svg, box:[x0,y0,x1,y1] } with x centred on 0. */
export function topsLockup(idea, layout = 'stack') {
  const cx = -24; // visual centre of the oval + breakout wordmark
  const ovalSvg = `<g transform="translate(${-cx} 0)">${emblem(idea)}</g>`;
  const ccW = 760;
  if (layout === 'stack') {
    const xY = 205 + 78, xS = 62;
    const ccTop = xY + 66;
    const cc = cagecraft(partner(idea), -ccW / 2, ccTop, ccW);
    return { svg: ovalSvg + cross(partner(idea), 0, xY, xS) + cc.svg, box: [-560, -210, 560, ccTop + cc.h] };
  }
  // one line: × CAGECRAFT
  const lineTop = 205 + 70, ccW2 = 700, xS = 58;
  const cc = cagecraft(partner(idea), -ccW2 / 2 + 50, lineTop, ccW2);
  return { svg: ovalSvg + cross(partner(idea), -ccW2 / 2 - 30, lineTop + cc.h / 2, xS) + cc.svg, box: [-560, -210, 560, lineTop + cc.h] };
}

/** Shorts back lockup: CAGECRAFT wordmark, "× RIVAL GYM" beneath (Legacy "FIGHTWEAR CO." slot).
 *  Units: px of the wordmark width W; returns { svg, box } centred on x=0, top at y=0. */
export function shortsLockup(idea, Wd = 1000) {
  const cc = cagecraft(partner(idea), -Wd / 2, 0, Wd);
  const h2 = cc.h * 0.5, y2 = cc.h + cc.h * 0.42, xS = h2 * 0.78, gap = h2 * 0.55;
  const probe = rivalGymLine({ word: idea.word, gym: idea.gym }, 0, 0, h2);
  const total = xS + gap + probe.w;
  const x0 = -total / 2;
  const line = rivalGymLine({ word: idea.word, gym: idea.gym }, x0 + xS + gap, y2, h2);
  return { svg: cc.svg + cross(partner(idea), x0 + xS / 2, y2 + h2 / 2, xS) + line.svg, box: [-Wd / 2, 0, Wd / 2, y2 + h2] };
}
