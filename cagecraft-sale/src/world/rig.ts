// Voxel fighters: every body part is a block of small cubes parented to a bone, so the same
// cubes that make the fighters can later shatter, freeze and fly into the sale formations.
// Fighter-local space: Y up, +Z forward (towards the opponent), +X = fighter's left.
import * as THREE from "three";
import { THEME } from "../theme";

export type Voxel = {
  fighter: 0 | 1;      // 0 = red corner (kicker), 1 = blue corner
  bone: number;        // index into the fighter's bone list
  local: THREE.Vector3;
  size: number;
  color: string;
  part: string;
};

export const BONES = [
  "root", "spine", "head", "shoulderL", "elbowL", "shoulderR", "elbowR",
  "hipL", "kneeL", "footL", "hipR", "kneeR", "footR",
] as const;
export type BoneName = (typeof BONES)[number];
const PARENT: Record<BoneName, BoneName | null> = {
  root: null, spine: "root", head: "spine",
  shoulderL: "spine", elbowL: "shoulderL", shoulderR: "spine", elbowR: "shoulderR",
  hipL: "root", kneeL: "hipL", footL: "kneeL", hipR: "root", kneeR: "hipR", footR: "kneeR",
};
// Bone origins relative to their parent (rest pose).
const OFFSET: Record<BoneName, [number, number, number]> = {
  root: [0, 0.98, 0], spine: [0, 0.07, 0], head: [0, 0.56, 0.01],
  shoulderL: [0.235, 0.49, 0], elbowL: [0, -0.28, 0], shoulderR: [-0.235, 0.49, 0], elbowR: [0, -0.28, 0],
  hipL: [0.1, -0.06, 0], kneeL: [0, -0.47, 0], footL: [0, -0.46, 0],
  hipR: [-0.1, -0.06, 0], kneeR: [0, -0.47, 0], footR: [0, -0.46, 0],
};

const V = 0.052; // body voxel
const VH = 0.04; // head voxel: smaller, so the head shatters into "little cubes"

/** Fill an axis-aligned box (centre, size, metres) with voxels of edge v. */
const block = (out: Voxel[], fighter: 0 | 1, bone: BoneName, c: [number, number, number],
  s: [number, number, number], v: number, color: (p: THREE.Vector3) => string, part: string) => {
  const n = s.map((x) => Math.max(1, Math.round(x / v)));
  for (let i = 0; i < n[0]; i++) for (let j = 0; j < n[1]; j++) for (let k = 0; k < n[2]; k++) {
    const p = new THREE.Vector3(
      c[0] + (i - (n[0] - 1) / 2) * v, c[1] + (j - (n[1] - 1) / 2) * v, c[2] + (k - (n[2] - 1) / 2) * v);
    out.push({ fighter, bone: BONES.indexOf(bone), local: p, size: v * 0.9, color: color(p), part });
  }
};

export const buildFighter = (fighter: 0 | 1): Voxel[] => {
  const kit = fighter === 0 ? THEME.corner.red : THEME.corner.blue;
  const skin = THEME.graphite;
  const out: Voxel[] = [];
  const solid = (col: string) => () => col;
  block(out, fighter, "root", [0, 0, 0], [0.34, 0.2, 0.22], V, solid(kit), "shorts");
  block(out, fighter, "spine", [0, 0.27, 0], [0.37, 0.5, 0.21], V, solid(skin), "torso");
  // head: silver so the shatter reads against the graphite body; a dark visor band for a face
  block(out, fighter, "head", [0, 0.15, 0], [0.24, 0.28, 0.24], VH,
    (p) => (p.z > 0.07 && p.y > 0.12 && p.y < 0.2 ? THEME.steel : THEME.silver), "head");
  block(out, fighter, "head", [0, 0.0, 0], [0.1, 0.06, 0.1], V, solid(skin), "neck");
  for (const side of ["L", "R"] as const) {
    block(out, fighter, `shoulder${side}`, [0, -0.135, 0], [0.105, 0.27, 0.105], V, solid(skin), "upperArm");
    block(out, fighter, `elbow${side}`, [0, -0.12, 0], [0.09, 0.22, 0.09], V, solid(skin), "forearm");
    block(out, fighter, `elbow${side}`, [0, -0.29, 0.01], [0.14, 0.15, 0.15], V, solid(kit), "glove");
    block(out, fighter, `hip${side}`, [0, -0.235, 0], [0.16, 0.47, 0.16], V,
      (p) => (p.y > -0.16 ? kit : skin), "thigh");
    block(out, fighter, `knee${side}`, [0, -0.225, 0], [0.12, 0.45, 0.12], V, solid(skin), "shin");
    block(out, fighter, `foot${side}`, [0, -0.03, 0.05], [0.1, 0.06, 0.24], V, solid(skin), "foot");
  }
  return out;
};

// ------------------------------------------------------------------ posing
export type Pose = Partial<Record<BoneName, [number, number, number]>> & { lift?: number; fwd?: number };
const D = Math.PI / 180;

/** Orthodox guard. */
export const STANCE: Pose = {
  root: [0, -28, 0], spine: [6, 14, 0], head: [-6, 10, 0],
  shoulderL: [-62, 0, 18], elbowL: [-118, 0, 0],
  shoulderR: [-48, 0, -22], elbowR: [-128, 0, 0],
  hipL: [-22, 6, 4], kneeL: [28, 0, 0], footL: [-6, 10, 0],
  hipR: [16, -8, -6], kneeR: [24, 0, 0], footR: [-10, -30, 0],
  lift: -0.05,
};

/** Rear-leg roundhouse (right leg). k: 0 stance -> 1 contact -> 1.5 follow-through.
 *  `fwd` steps the hips in towards the target; the support (left) foot stays planted. */
const KICK: [number, Pose][] = [
  [0, STANCE],
  [0.3, { root: [0, 12, -6], spine: [8, 4, -2], head: [-6, 0, 4], shoulderL: [-68, 0, 22], elbowL: [-122, 0, 0],
    shoulderR: [-30, 0, -34], elbowR: [-90, 0, 0], hipL: [-10, 0, 4], kneeL: [26, 0, 0], footL: [0, 0, 0],
    hipR: [-62, 0, -22], kneeR: [108, 0, 0], footR: [30, 0, 0], lift: -0.03, fwd: 0.12 }],
  [0.6, { root: [0, 52, -20], spine: [10, -6, -6], head: [-6, -10, 8], shoulderL: [-72, 0, 28], elbowL: [-122, 0, 0],
    shoulderR: [10, 0, -40], elbowR: [-60, 0, 0], hipL: [-4, 0, 6], kneeL: [20, 0, 0], footL: [0, 0, 0],
    hipR: [-40, 0, -82], kneeR: [118, 0, 0], footR: [36, 0, 0], lift: 0.0, fwd: 0.22 }],
  [0.88, { root: [0, 84, -28], spine: [8, -10, -8], head: [-6, -16, 10], shoulderL: [-74, 0, 30], elbowL: [-120, 0, 0],
    shoulderR: [34, 0, -36], elbowR: [-30, 0, 0], hipL: [-2, 0, 6], kneeL: [16, 0, 0], footL: [0, 0, 0],
    hipR: [-16, 0, -108], kneeR: [52, 0, 0], footR: [36, 0, 0], lift: 0.02, fwd: 0.28 }],
  [1.0, { root: [0, 95, -30], spine: [8, -10, -8], head: [-6, -18, 10], shoulderL: [-74, 0, 30], elbowL: [-118, 0, 0],
    shoulderR: [42, 0, -32], elbowR: [-22, 0, 0], hipL: [-2, 0, 6], kneeL: [14, 0, 0], footL: [0, 0, 0],
    hipR: [-10, 0, -105], kneeR: [6, 0, 0], footR: [32, 0, 0], lift: 0.02, fwd: 0.3 }],
  [1.5, { root: [0, 150, -14], spine: [8, -6, -6], head: [-6, -12, 6], shoulderL: [-70, 0, 26], elbowL: [-118, 0, 0],
    shoulderR: [30, 0, -30], elbowR: [-40, 0, 0], hipL: [-6, 0, 6], kneeL: [18, 0, 0], footL: [0, 0, 0],
    hipR: [-8, 0, -88], kneeR: [30, 0, 0], footR: [30, 0, 0], lift: 0.0, fwd: 0.3 }],
];

const smooth = (x: number) => x * x * (3 - 2 * x);
export const kickPose = (k: number): Pose => {
  const kk = Math.max(0, Math.min(1.5, k));
  let i = 0;
  while (i < KICK.length - 2 && kk > KICK[i + 1][0]) i++;
  const [k0, a] = KICK[i], [k1, b] = KICK[i + 1];
  const u = smooth(Math.max(0, Math.min(1, (kk - k0) / (k1 - k0))));
  return mixPose(a, b, u);
};

export const mixPose = (a: Pose, b: Pose, u: number): Pose => {
  const out: Pose = { lift: (a.lift ?? 0) + ((b.lift ?? 0) - (a.lift ?? 0)) * u, fwd: (a.fwd ?? 0) + ((b.fwd ?? 0) - (a.fwd ?? 0)) * u };
  for (const n of BONES) {
    const p = a[n] ?? [0, 0, 0], q = b[n] ?? [0, 0, 0];
    out[n] = [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u];
  }
  return out;
};

/** Forward kinematics: bone world matrices for a fighter placed at `origin` facing `yaw`. */
export class Skeleton {
  bones: THREE.Object3D[];
  root = new THREE.Object3D();
  constructor() {
    this.bones = BONES.map(() => new THREE.Object3D());
    BONES.forEach((n, i) => {
      const p = PARENT[n];
      (p ? this.bones[BONES.indexOf(p)] : this.root).add(this.bones[i]);
      this.bones[i].position.set(...OFFSET[n]);
    });
    this.bones.forEach((b) => (b.rotation.order = "YXZ"));
  }
  /** Pose the skeleton. With `plant`, the root slides so that bone `plant.bone` stays at its
   *  rest-stance world position (+ `fwd` along the facing): the support foot pivots, not skates. */
  pose(pose: Pose, origin: THREE.Vector3, yaw: number,
    extra?: { tilt?: number; recoil?: number; plant?: { bone: number; at: THREE.Vector3 } }) {
    this.root.position.copy(origin);
    this.root.rotation.set(0, yaw, 0);
    BONES.forEach((n, i) => {
      const r = pose[n] ?? [0, 0, 0];
      this.bones[i].rotation.set(r[0] * D, r[1] * D, r[2] * D);
    });
    this.bones[0].position.set(OFFSET.root[0], OFFSET.root[1] + (pose.lift ?? 0), OFFSET.root[2] - (extra?.recoil ?? 0));
    if (extra?.tilt) this.bones[0].rotation.x += extra.tilt;
    this.root.updateMatrixWorld(true);
    if (extra?.plant) {
      const f = this.bones[extra.plant.bone].getWorldPosition(new THREE.Vector3());
      const want = extra.plant.at.clone().add(new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).multiplyScalar(pose.fwd ?? 0));
      this.root.position.x += want.x - f.x;
      this.root.position.z += want.z - f.z;
      this.root.updateMatrixWorld(true);
    }
  }
  /** World position of a point in a bone's local space. */
  world(bone: number, local: THREE.Vector3, out = new THREE.Vector3()) {
    return out.copy(local).applyMatrix4(this.bones[bone].matrixWorld);
  }
}
