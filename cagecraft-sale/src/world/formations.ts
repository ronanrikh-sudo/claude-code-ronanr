// The sale, told in cubes. Each formation is a set of slots (local metres around the stage
// anchor) plus a function that animates them over time. Cubes fly between formations; the
// ones a formation does not need drift in the deep ambient field.
import * as THREE from "three";
import { THEME } from "../theme";
import { M, word, wordEnd } from "../timing";
import type { Grid } from "./raster";
import { rand } from "../components/motion";

export type Slot = { p: THREE.Vector3; size: number; color: string; glow: number; group: number };
export type CubeT = { pos: THREE.Vector3; quat: THREE.Quaternion; scale: number; color: THREE.Color; glow: number };
export type Formation = {
  name: string;
  start: number;     // cubes begin to leave for this formation (s)
  travel: number;    // flight time per cube (s)
  stagger: number;   // spread of departure times (s)
  arc: number;       // how far flights bow towards camera (m)
  sortAxis: THREE.Vector3;           // pairs old and new positions along this axis (fewer crossings)
  order: (s: Slot, j: number) => number; // departure order key (lower leaves first)
  slots: Slot[];
  place: (s: Slot, j: number, t: number, o: CubeT) => void;
};

/** Stage anchor: where formations sit (upper-middle of the 9:16 frame from the showcase camera). */
export const STAGE = new THREE.Vector3(0, 2.7, 0);

const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const bump = (t: number, k = 6) => (t <= 0 ? 0 : t * k * Math.exp(1 - t * k)); // 0 -> 1 -> 0 punch
const Q = new THREE.Quaternion();
const E = new THREE.Euler();
const ID = new THREE.Quaternion();

const put = (o: CubeT, local: THREE.Vector3, rot: THREE.Quaternion, scale: number, s: Slot, glow = s.glow, color = s.color) => {
  o.pos.copy(local).applyQuaternion(rot).add(STAGE);
  o.quat.copy(rot);
  o.scale = scale;
  o.color.set(color);
  o.glow = glow;
};

const grid = (g: Grid, cell: number, depth: number, color: (c: number, r: number) => string, glow: number,
  shear = 0, group = 0): Slot[] => {
  const out: Slot[] = [];
  for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) {
    if (!g.on(c, r)) continue;
    for (let d = 0; d < depth; d++) {
      const y = ((g.rows - 1) / 2 - r) * cell;
      out.push({ p: new THREE.Vector3((c - (g.cols - 1) / 2) * cell + y * shear, y, (d - (depth - 1) / 2) * cell),
        size: cell * 0.9, color: color(c, r), glow, group });
    }
  }
  return out;
};

/** ASCII voxel art -> slots. Each char maps to a colour; '.' is empty. */
const art = (rows: string[], cell: number, depth: number, palette: Record<string, [string, number]>,
  at: THREE.Vector3, group: number): Slot[] => {
  const out: Slot[] = [];
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  rows.forEach((row, r) => [...row].forEach((ch, c) => {
    if (!palette[ch]) return;
    for (let d = 0; d < depth; d++) out.push({
      p: new THREE.Vector3((c - (w - 1) / 2) * cell, ((h - 1) / 2 - r) * cell, (d - (depth - 1) / 2) * cell).add(at),
      size: cell * 0.9, color: palette[ch][0], glow: palette[ch][1], group });
  }));
  return out;
};

// ------------------------------------------------------------------ 1. THE BIGGEST SALE: monolith
const monolith = (): Formation => {
  const n = 8, cell = 0.17, slots: Slot[] = [];
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) {
    const edge = [x, y, z].filter((v) => v === 0 || v === n - 1).length;
    if (edge === 0) continue;
    const c = (v: number) => (v - (n - 1) / 2) * cell;
    slots.push({ p: new THREE.Vector3(c(x), c(y), c(z)), size: cell * 0.9,
      color: edge >= 2 ? THEME.silver : rand(x * 7 + y * 13 + z * 29) < 0.12 ? THEME.steel : THEME.graphite, glow: 0, group: 0 });
  }
  const ever = word("ever"), sale = word("sale"), leave = word("up");
  return {
    name: "monolith", start: word("the") - 0.05, travel: 0.6, stagger: 0.45, arc: 1.2,
    sortAxis: new THREE.Vector3(1, 0.3, 0), order: (s) => s.p.length(), slots,
    place: (s, j, t, o) => {
      const spin = (t - M.biggest) * 0.55 + 0.6;
      const rot = Q.setFromEuler(E.set(0.42 + 0.08 * Math.sin(t * 0.7), spin, 0.12));
      const punch = 1 + 0.2 * bump(t - ever, 7);
      const blow = smooth((t - wordEnd("ever") + 0.05) / (leave - wordEnd("ever") + 0.3)); // drifts apart in the break
      const local = s.p.clone().multiplyScalar(punch * (1 + 0.9 * blow));
      // a teal scan sweeps down through the block on "sale"
      const scan = Math.exp(-(((s.p.y - (0.75 - (t - sale) * 3)) / 0.09) ** 2)) * (t > sale - 0.05 && t < sale + 0.7 ? 1 : 0);
      const flash = 0.9 * Math.exp(-Math.max(0, t - ever) * 5) * (t >= ever ? 1 : 0);
      put(o, local, rot, s.size, s, Math.max(scan * 1.4, flash), scan > 0.25 || (t >= ever && t < ever + 0.25) ? THEME.teal : s.color);
      if (blow > 0) o.quat.multiply(Q.setFromAxisAngle(new THREE.Vector3(rand(j), rand(j + 1), rand(j + 2)).normalize(), blow * 2.4));
    },
  };
};

// ------------------------------------------------------------------ 2. UP TO 40% OFF
const forty = (g: Grid): Formation => {
  const cell = 0.052;
  const slots = grid(g, cell, 2, () => THEME.teal, 0.85, 0.0);
  const at = word("forty"), off = word("off");
  return {
    name: "forty", start: word("up") - 0.05, travel: 0.5, stagger: 0.32, arc: 0.9,
    sortAxis: new THREE.Vector3(1, 0, 0), order: (s) => (s.p.x + 1.5) / 3, slots,
    place: (s, j, t, o) => {
      const rot = Q.setFromEuler(E.set(0.05 * Math.sin(t * 1.3), -0.18 * Math.sin((t - at) * 0.9), 0));
      const pulse = 1 + 0.07 * bump(t - off, 8) + 0.05 * bump(t - at, 8);
      const local = s.p.clone().multiplyScalar(pulse);
      local.z += 0.05 * Math.sin(t * 5 + s.p.x * 4);
      put(o, local, rot, s.size, s, 0.65 + 0.35 * bump(t - off, 8));
    },
  };
};

// ------------------------------------------------------------------ 3. FREE GIFTS: kit bag + towel, socks, tee
const BAG = 0, TEE = 1, SOCKS = 2, TOWEL = 3;
export const GIFT_SPOTS = {
  [BAG]: new THREE.Vector3(0, -0.72, 0),
  [TEE]: new THREE.Vector3(-0.92, 0.42, 0.1),
  [SOCKS]: new THREE.Vector3(0.02, 0.5, 0.1),
  [TOWEL]: new THREE.Vector3(0.9, 0.36, 0.1),
};
export const GIFT_LABELS: [number, string, number][] = [[BAG, "KIT BAG", -0.42], [TEE, "TRAINING TEE", -0.5], [SOCKS, "SOCKS", -0.5], [TOWEL, "TOWEL", -0.36]];

/** Stage rotation of the gifts group (shared with the HTML labels). */
export const giftsRotation = (t: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, -0.25 + 0.12 * Math.sin(t * 0.8), 0));
export const WEEK_ROT = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.1, 0, 0));

const gifts = (): Formation => {
  const slots: Slot[] = [];
  // duffel: rounded 5x5 cross-section, 12 long, shell only; pink band + handles, white logo plate
  const L = 12, cell = 0.1;
  for (let x = 0; x < L; x++) for (let y = 0; y < 5; y++) for (let z = 0; z < 5; z++) {
    const corner = (y === 0 || y === 4) && (z === 0 || z === 4);
    if (corner) continue;
    const shell = x === 0 || x === L - 1 || y === 0 || y === 4 || z === 0 || z === 4 || ((y === 1 || y === 3) && (z === 0 || z === 4));
    if (!shell) continue;
    const front = z === 4;
    let color: string = THEME.graphite, glow = 0;
    if (front && y === 1) { color = THEME.pink; glow = 0.35; }
    if (front && y === 3 && x >= 4 && x <= 7) { color = THEME.white; }
    if (x === 0 || x === L - 1) color = THEME.steel;
    slots.push({ p: new THREE.Vector3((x - (L - 1) / 2) * cell, (y - 2) * cell, (z - 2) * cell).add(GIFT_SPOTS[BAG]),
      size: cell * 0.9, color, glow, group: BAG });
  }
  for (const [x, y] of [[3, 5], [3, 6], [4, 7], [5, 7], [6, 7], [7, 7], [8, 6], [8, 5]]) {
    slots.push({ p: new THREE.Vector3((x - (L - 1) / 2) * cell, (y - 2) * cell, 0).add(GIFT_SPOTS[BAG]),
      size: cell * 0.8, color: THEME.pink, glow: 0.45, group: BAG });
  }
  const K: [string, number] = [THEME.graphite, 0], W: [string, number] = ["#C9CDD3", 0],
    P: [string, number] = [THEME.pink, 0.5], S: [string, number] = [THEME.steel, 0];
  slots.push(...art([
    "..####.####..",
    ".###########.",
    "#############",
    "#############",
    "#############",
    "###.#####.###",
    "...#######...",
    "...##www##...",
    "...#######...",
    "...#######...",
    "...#######...",
    "...#######...",
  ], 0.058, 2, { "#": K, w: W }, GIFT_SPOTS[TEE], TEE));
  const sock = [
    "www.",
    "kkk.",
    "www.",
    "kkk.",
    "www.",
    "www.",
    "www.",
    "www.",
    "www.",
    "wwww.",
    "wwwww",
    ".wwww",
  ];
  slots.push(...art(sock.map((r) => r.padEnd(6, ".") + r), 0.052, 2, { w: W, k: K }, GIFT_SPOTS[SOCKS], SOCKS));
  slots.push(...art([
    "wwwwwwwwww",
    "wpwwwwwwpw",
    "wwwwwwwwww",
    "ssssssssss",
    "wwwwwwwwww",
    "wpwwwwwwpw",
  ], 0.068, 3, { w: W, p: P, s: S }, GIFT_SPOTS[TOWEL], TOWEL));

  const free = word("free"), giftsAt = word("gifts");
  const land = free + 0.16;
  return {
    name: "gifts", start: free - 0.28, travel: 0.32, stagger: 0.12, arc: 0.6,
    sortAxis: new THREE.Vector3(1, 0, 0), order: (s) => (s.group === BAG ? 0 : 1) + rand(s.p.x * 99) * 0.3, slots,
    place: (s, j, t, o) => {
      const rot = Q.copy(giftsRotation(t));
      const local = s.p.clone();
      // the bag drops in and lands with a squash on "free"
      const squash = 1 - 0.18 * bump(t - land, 9);
      if (s.group === BAG) {
        local.sub(GIFT_SPOTS[BAG]);
        local.y *= squash; local.x *= 1 + (1 - squash) * 0.5;
        local.add(GIFT_SPOTS[BAG]);
        if (t < land) local.y += 1.2 * ((land - t) / 0.3) ** 2;
        put(o, local, rot, s.size, s);
        return;
      }
      // gifts pop out of the bag on "gifts", one after another, then float
      const k = s.group - 1;
      const pop = t - giftsAt - k * 0.11;
      const e = pop <= 0 ? 0 : 1 - Math.exp(-pop * 9) * Math.cos(pop * 12);
      const home = GIFT_SPOTS[s.group as 1 | 2 | 3];
      const from = GIFT_SPOTS[BAG].clone().add(new THREE.Vector3(0, 0.25, 0));
      const centre = from.clone().lerp(home, e);
      local.sub(home).multiplyScalar(Math.max(0, Math.min(1.1, e))).add(centre);
      local.y += 0.04 * Math.sin(t * 2.2 + k);
      const spin = Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (1 - Math.min(1, e)) * 2.5 + 0.15 * Math.sin(t * 1.4 + k));
      const r2 = rot.clone().multiply(spin);
      const off = local.clone().sub(centre).applyQuaternion(spin).add(centre);
      put(o, off, r2, s.size * (pop <= 0 ? 0 : 1), s);
    },
  };
};

// ------------------------------------------------------------------ 4. MONTHS OF BUILDING: tower
const tower = (): Formation => {
  const n = 3, layers = 13, cell = 0.15, slots: Slot[] = [];
  for (let l = 0; l < layers; l++) for (let x = 0; x < n; x++) for (let z = 0; z < n; z++)
    slots.push({ p: new THREE.Vector3((x - 1) * cell, -1.05 + l * cell, (z - 1) * cell), size: cell * 0.9,
      color: (x + z + l) % 5 === 0 ? THEME.silver : THEME.graphite, glow: 0, group: l });
  const s0 = word("months") - 0.12;
  return {
    name: "tower", start: s0, travel: 0.3, stagger: 1.0, arc: 0.4,
    sortAxis: new THREE.Vector3(0, 1, 0), order: (s) => s.group / layers, slots,
    place: (s, j, t, o) => {
      const rot = Q.setFromEuler(E.set(0.18, 0.5 + (t - s0) * 0.35, 0));
      const landT = s0 + (s.group / layers) * 1.0 + 0.3;
      const ring = Math.exp(-Math.max(0, t - landT) * 6) * (t >= landT ? 1 : 0);
      put(o, s.p, rot, s.size, s, ring * 1.1, ring > 0.3 ? THEME.teal : s.color);
    },
  };
};

// ------------------------------------------------------------------ 5. ONE WEEK ONLY: seven day blocks
export const WEEK = { y: -0.38, pitch: 0.38 };
const week = (): Formation => {
  const slots: Slot[] = [], cell = 0.095;
  for (let d = 0; d < 7; d++) for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) for (let z = 0; z < 3; z++)
    slots.push({ p: new THREE.Vector3((d - 3) * WEEK.pitch + (x - 1) * cell, WEEK.y + (y - 1) * cell, (z - 1) * cell),
      size: cell * 0.9, color: THEME.graphite, glow: 0, group: d });
  const one = word("one"), wk = word("week"), only = word("only");
  return {
    name: "week", start: one - 0.2, travel: 0.32, stagger: 0.35, arc: 0.5,
    sortAxis: new THREE.Vector3(1, 0, 0), order: (s) => s.group / 7, slots,
    place: (s, j, t, o) => {
      const rot = Q.copy(WEEK_ROT);
      // light the days left to right on "week", all seven pulse on "only"
      const lit = t > wk + s.group * 0.045;
      const pulse = bump(t - only, 6);
      const local = s.p.clone();
      local.y += 0.06 * bump(t - (wk + s.group * 0.045), 9);
      const scale = s.size * (1 + 0.12 * pulse);
      put(o, local, rot, scale, s, lit ? 0.55 + 0.6 * pulse : 0, lit ? THEME.teal : s.color);
    },
  };
};

// ------------------------------------------------------------------ 6. THIS IS CAGECRAFT: the wordmark
export const LOGO = { width: 2.9, y: 0.25 };
const logo = (g: Grid): Formation => {
  const cell = LOGO.width / g.cols;
  const slots = grid(g, cell, 2, () => "#D5D8DD", 0.05, 0, 0).map((s) => ({ ...s, p: s.p.add(new THREE.Vector3(0, LOGO.y, 0)) }));
  const lock = word("cagecraft");
  return {
    name: "logo", start: word("this") - 0.18, travel: 0.42, stagger: 0.38, arc: 0.7,
    sortAxis: new THREE.Vector3(1, 0, 0), order: (s) => (s.p.x + LOGO.width / 2) / LOGO.width, slots,
    place: (s, j, t, o) => {
      const settle = smooth((t - lock) / 0.25);
      const rot = Q.setFromEuler(E.set(0, (1 - settle) * 0.12 * Math.sin(t * 1.7), 0));
      const flash = Math.exp(-Math.max(0, t - lock) * 4) * (t >= lock ? 1 : 0);
      // the crisp wordmark takes over: the voxel one shrinks to a sparkle underlay
      const handoff = smooth((t - lock - 0.06) / 0.2);
      put(o, s.p, rot, s.size * (1 - 0.7 * handoff), s, 0.05 + 0.5 * flash, flash > 0.3 ? THEME.teal : s.color);
    },
  };
};

// ------------------------------------------------------------------ 7. sign-off: everything to the field
const release = (): Formation => ({
  name: "release", start: word("cagecraft") + 0.55, travel: 0.9, stagger: 0.6, arc: 0.3,
  sortAxis: new THREE.Vector3(1, 0, 0), order: () => 0, slots: [], place: () => undefined,
});

export const buildFormations = (forty40: Grid, logoGrid: Grid): Formation[] =>
  [monolith(), forty(forty40), gifts(), tower(), week(), logo(logoGrid), release()];

// ------------------------------------------------------------------ the ambient field
const AX = new THREE.Vector3();
export const ambient = (i: number, t: number, o: CubeT) => {
  const r = (k: number) => rand(i * 3.17 + k * 11.3);
  // a deep shell behind and around the stage, never between camera and stage
  const ang = r(1) * Math.PI * 2, rad = 3.2 + r(2) * 7;
  const x = Math.cos(ang) * rad, z = -3.5 - r(3) * 10 + (Math.abs(x) > 3.5 ? r(4) * 5 : 0);
  const y = STAGE.y - 3 + r(5) * 7.5;
  o.pos.set(x + 0.25 * Math.sin(t * 0.3 + r(6) * 6), y + 0.3 * Math.sin(t * 0.22 + r(7) * 6), z);
  const hit = Math.max(0, t - M.finalHit);
  if (t >= M.finalHit) {
    const push = 0.9 * (1 - Math.exp(-hit * 5));
    AX.set(o.pos.x, o.pos.y - STAGE.y, o.pos.z).normalize();
    o.pos.addScaledVector(AX, push);
  }
  AX.set(r(8) - 0.5, r(9) - 0.5, r(10) - 0.5).normalize();
  o.quat.setFromAxisAngle(AX, t * (0.2 + r(11) * 0.5) + r(12) * 6);
  o.scale = 0.045 + r(13) * 0.085;
  const teal = r(14) < 0.22;
  o.color.set(r(15) < 0.12 ? THEME.steel : THEME.graphite);
  o.glow = 0;
  if (t >= M.finalHit && teal) { o.color.set(THEME.teal); o.glow = 1.2 * Math.exp(-hit * 1.6) + 0.15; }
  void ID;
};
