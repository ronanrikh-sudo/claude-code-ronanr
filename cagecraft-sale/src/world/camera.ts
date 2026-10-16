// The camera never sits still: wide on the fighters, a slow-motion push onto the blue head,
// a whip back on the snap, a bullet-time orbit around the frozen debris, then a sweeping
// dolly round to the showcase stage. Shared by the 3D scene and the HTML overlays (projection).
import * as THREE from "three";
import { M, word } from "../timing";
import { BLUE_HEAD } from "./fight";
import { STAGE } from "./formations";
import { rand } from "../components/motion";

export const FOV = 40;
type Key = { t: number; pos: THREE.Vector3; look: THREE.Vector3 };
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const H = BLUE_HEAD;
const rel = (x: number, y: number, z: number) => H.clone().add(v(x, y, z));

// Hook keys. All from the -z side, square to the plane the kicking leg lies in: a wide profile,
// a slow-motion push to a medium close-up where the shin drives diagonally into blue's head,
// the blocks burst straight at the lens, then a whip back on the snap.
const HOOK: Key[] = [
  { t: 0, pos: v(-0.2, 1.25, -5.0), look: v(-0.12, 1.05, -0.15) },
  { t: M.slow_in, pos: v(-0.15, 1.3, -4.3), look: v(-0.05, 1.12, -0.15) },
  { t: M.contact - 0.1, pos: v(0.16, 1.6, -2.05), look: v(0.17, 1.47, -0.2) },
  { t: M.contact, pos: v(0.17, 1.61, -1.98), look: v(0.18, 1.48, -0.2) },
  { t: M.ramp_up, pos: v(0.12, 1.68, -2.35), look: v(0.12, 1.52, -0.3) },
  { t: M.snap - 0.08, pos: v(0.15, 1.62, -1.9), look: v(0.12, 1.5, -0.3) },
  { t: M.snap + 0.3, pos: v(-0.1, 1.6, -3.5), look: v(0.2, 1.35, -1.0) },
  { t: M.freeze, pos: v(-0.2, 1.65, -3.9), look: v(0.2, 1.35, -1.1) },
];
const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

const keyed = (keys: Key[], t: number, pos: THREE.Vector3, look: THREE.Vector3) => {
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1];
  const u = smooth((t - a.t) / (b.t - a.t));
  pos.lerpVectors(a.pos, b.pos, u);
  look.lerpVectors(a.look, b.look, u);
};

// Orbit: freeze -> showcase. Polar around a moving pivot.
const PIVOT_A = v(0.2, 1.35, -1.1);
const SHOW_POS = v(0, 1.9, 7.5);
const SHOW_LOOK = v(0, 1.9, 0);
const ORBIT_END = word("the") + 0.75;
const a0 = Math.atan2(HOOK[HOOK.length - 1].pos.x - PIVOT_A.x, HOOK[HOOK.length - 1].pos.z - PIVOT_A.z);
const r0 = Math.hypot(HOOK[HOOK.length - 1].pos.x - PIVOT_A.x, HOOK[HOOK.length - 1].pos.z - PIVOT_A.z);
// ...then round to the front (camera on +z), whichever way is shorter
const aEnd = [0, Math.PI * 2, -Math.PI * 2].reduce((b, x) => (Math.abs(x - a0) < Math.abs(b - a0) ? x : b));
const aMid = a0 + Math.sign(aEnd - a0) * 0.75; // bullet-time sweep while frozen

const SHAKES: [number, number][] = [
  [M.contact, 0.035], [M.snap, 0.09], [word("ever"), 0.05], [word("free") + 0.16, 0.03],
  [word("cagecraft"), 0.04], [M.finalHit, 0.07],
];

export const cameraAt = (t: number) => {
  const pos = new THREE.Vector3(), look = new THREE.Vector3();
  if (t <= M.freeze) keyed(HOOK, t, pos, look);
  else if (t <= word("the")) {
    const u = (t - M.freeze) / (word("the") - M.freeze);
    const a = a0 + (aMid - a0) * u;
    pos.set(PIVOT_A.x + Math.sin(a) * r0, 1.5 + 0.15 * u, PIVOT_A.z + Math.cos(a) * r0);
    look.copy(PIVOT_A);
  } else {
    const u = easeOut((t - word("the")) / (ORBIT_END - word("the")));
    const a = aMid + (aEnd - aMid) * u;
    const pivot = PIVOT_A.clone().lerp(SHOW_LOOK, u);
    const r = r0 + (SHOW_POS.z - r0) * u;
    pos.set(pivot.x + Math.sin(a) * r, 1.65 + 0.25 * u, pivot.z + Math.cos(a) * r);
    look.copy(pivot);
    if (t > ORBIT_END) {
      pos.copy(SHOW_POS);
      look.copy(SHOW_LOOK);
    }
    // ambient life on the stage
    const w = smooth((t - ORBIT_END + 0.3) / 0.6);
    pos.x += w * 0.18 * Math.sin(t * 0.33);
    pos.y += w * 0.08 * Math.sin(t * 0.41);
    pos.z -= w * Math.min(0.6, Math.max(0, t - ORBIT_END) * 0.035);
  }
  // impact shake (deterministic)
  for (const [at, amp] of SHAKES) {
    const d = t - at;
    if (d < 0 || d > 0.45) continue;
    const k = amp * Math.exp(-d * 9);
    pos.x += k * (rand(Math.floor(t * 60) * 1.7) - 0.5) * 2;
    pos.y += k * (rand(Math.floor(t * 60) * 2.3) - 0.5) * 2;
  }
  return { pos, look, fov: FOV };
};

/** Project a world point to pixel coordinates for the HTML overlays. */
const projCam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.05, 200);
export const project = (t: number, p: THREE.Vector3) => {
  const c = cameraAt(t);
  projCam.position.copy(c.pos);
  projCam.lookAt(c.look);
  projCam.updateMatrixWorld();
  const n = p.clone().project(projCam);
  return { x: (n.x + 1) / 2 * 1080, y: (1 - n.y) / 2 * 1920, z: n.z };
};

export { STAGE };
