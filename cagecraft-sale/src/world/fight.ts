// The hook: red corner throws a rear-leg roundhouse; it lands flush in ultra slow motion, the
// blue fighter's head shatters into little cubes, and on the snap back to speed the rest of
// him blows apart. Everything here is a pure function of story time tau (see time.ts).
import * as THREE from "three";
import { buildFighter, kickPose, mixPose, Pose, Skeleton, STANCE, Voxel, BONES } from "./rig";
import { TAU } from "./time";
import { rand } from "../components/motion";

export const RED_POS = new THREE.Vector3(-0.62, 0, 0);
export const RED_YAW = Math.PI / 2;
const FOOT_L = BONES.indexOf("footL");
const FOOT_R = BONES.indexOf("footR");
const HEAD = BONES.indexOf("head");
const SPINE = BONES.indexOf("spine");

const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const KICK_SPAN = TAU.contact - TAU.kick; // story seconds from chamber to contact

// ---------------------------------------------------------------- red: plant, kick, spin back to guard
const scratch = new Skeleton();
scratch.pose(STANCE, RED_POS, RED_YAW);
const RED_PLANT = scratch.bones[FOOT_L].getWorldPosition(new THREE.Vector3());
const SPUN: Pose = { ...STANCE, root: [0, 332, 0] }; // finish the rotation back into guard
const K_RELEASE = 1.5;
const TAU_RELEASE = TAU.kick + K_RELEASE * KICK_SPAN;

export const redPose = (tau: number): Pose => {
  if (tau < TAU.kick) {
    const p = { ...STANCE };
    p.lift = (STANCE.lift ?? 0) + 0.012 * Math.sin(tau * Math.PI * 2 * 1.7);
    return p;
  }
  const k = (tau - TAU.kick) / KICK_SPAN;
  if (k <= K_RELEASE) return kickPose(k);
  return mixPose(kickPose(K_RELEASE), SPUN, smooth((tau - TAU_RELEASE) / 0.55));
};

export const poseRed = (sk: Skeleton, tau: number) =>
  sk.pose(redPose(tau), RED_POS, RED_YAW, { plant: { bone: FOOT_L, at: RED_PLANT } });

// ---------------------------------------------------------------- contact point -> where blue stands
const ANKLE = new THREE.Vector3(0, -0.01, 0.05); // instep, in footR space
poseRed(scratch, TAU.contact);
export const CONTACT = scratch.world(FOOT_R, ANKLE, new THREE.Vector3());
poseRed(scratch, TAU.contact - 0.02);
const before = scratch.world(FOOT_R, ANKLE, new THREE.Vector3());
/** Direction the shin is travelling at impact (horizontal-ish). */
export const KICK_DIR = CONTACT.clone().sub(before).normalize();

const HEAD_CENTRE = new THREE.Vector3(0, 0.15, 0);
// Blue is caught with his hands low, so the shin lands clean on the head.
const BLUE_POSE: Pose = { ...STANCE, shoulderL: [-22, 0, 22], elbowL: [-92, 0, 0], shoulderR: [-20, 0, -24], elbowR: [-100, 0, 0], head: [-2, 4, 0] };
let bluePos = new THREE.Vector3(0.62, 0, 0);
let blueYaw = -Math.PI / 2;
for (let it = 0; it < 4; it++) {
  blueYaw = Math.atan2(RED_POS.x - bluePos.x, RED_POS.z - bluePos.z);
  scratch.pose(BLUE_POSE, bluePos, blueYaw);
  const head = scratch.world(HEAD, HEAD_CENTRE, new THREE.Vector3());
  const want = CONTACT.clone().addScaledVector(KICK_DIR, 0.11);
  bluePos = bluePos.clone().add(want.sub(head));
  bluePos.y = 0;
}
export const BLUE_POS = bluePos;
export const BLUE_YAW = blueYaw;
export const BLUE_HEAD = (() => { scratch.pose(BLUE_POSE, BLUE_POS, BLUE_YAW); return scratch.world(HEAD, HEAD_CENTRE, new THREE.Vector3()); })();

/** Blue: light bounce, then the hit knocks him sideways along the kick until he comes apart. */
export const poseBlue = (sk: Skeleton, tau: number) => {
  const p = { ...BLUE_POSE };
  if (tau < TAU.contact) p.lift = (BLUE_POSE.lift ?? 0) + 0.01 * Math.sin(tau * Math.PI * 2 * 1.9 + 1.2);
  sk.pose(p, BLUE_POS, BLUE_YAW);
  const d = Math.max(0, tau - TAU.contact);
  if (d > 0) {
    const axis = new THREE.Vector3(0, 1, 0).cross(KICK_DIR).normalize();
    sk.root.position.addScaledVector(KICK_DIR, 0.35 * d + 0.25 * d * d);
    sk.root.rotateOnWorldAxis(axis, -Math.min(1.2, 0.9 * d + 0.4 * d * d));
    sk.root.updateMatrixWorld(true);
  }
};

// ---------------------------------------------------------------- the cubes
export type Cube = Voxel & {
  detach: number;          // story time it breaks free (Infinity = never in the hook)
  vel: THREE.Vector3; spinAxis: THREE.Vector3; spin: number;
  p0: THREE.Vector3; q0: THREE.Quaternion; // world transform at the moment it breaks free
};

const G = 0.9; // m/s^2: floaty cinematic gravity
const UP = new THREE.Vector3(0, 1, 0);
const TO_CAM = new THREE.Vector3(0.1, 0.05, 1).normalize();

export const buildCubes = (): Cube[] => {
  const vox = [...buildFighter(0), ...buildFighter(1)];
  const red = new Skeleton(), blue = new Skeleton();
  poseBlue(blue, TAU.snap);
  const neck = blue.bones[SPINE].getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.45, 0));
  blue.pose(BLUE_POSE, BLUE_POS, BLUE_YAW);
  return vox.map((v, i) => {
    const r = (k: number) => rand(i * 13.37 + k * 7.1);
    const c: Cube = { ...v, detach: Infinity, vel: new THREE.Vector3(), spinAxis: new THREE.Vector3(), spin: 0,
      p0: new THREE.Vector3(), q0: new THREE.Quaternion() };
    if (v.fighter === 1) {
      const sk = blue;
      if (v.part === "head") {
        poseBlue(sk, TAU.contact);
        const p = sk.world(v.bone, v.local, new THREE.Vector3());
        c.detach = TAU.contact + p.distanceTo(CONTACT) * 0.035; // shock wave through the head
        const radial = p.clone().sub(BLUE_HEAD).normalize();
        c.vel.copy(KICK_DIR).multiplyScalar(0.9 + 1.4 * r(1))
          .addScaledVector(radial, 0.6 + 1.3 * r(2)).addScaledVector(UP, 0.2 + 0.6 * r(3));
        if (r(4) < 0.4) c.vel.addScaledVector(TO_CAM, 0.3 + 0.8 * r(5));
      } else {
        poseBlue(sk, TAU.snap);
        const p = sk.world(v.bone, v.local, new THREE.Vector3());
        c.detach = TAU.snap + p.distanceTo(neck) * 0.05; // ripples down the body from the neck
        const radial = p.clone().sub(neck).normalize();
        c.vel.copy(radial).multiplyScalar(0.8 + 1.9 * r(1))
          .addScaledVector(KICK_DIR, 0.5 + 0.9 * r(2)).addScaledVector(UP, 0.5 + 0.9 * r(3));
        if (r(4) < 0.45) c.vel.addScaledVector(TO_CAM, 0.4 + 1.1 * r(5));
      }
      poseBlue(sk, c.detach);
      sk.world(v.bone, v.local, c.p0);
      sk.bones[v.bone].getWorldQuaternion(c.q0);
      c.spinAxis.set(r(6) - 0.5, r(7) - 0.5, r(8) - 0.5).normalize();
      c.spin = 3 + 10 * r(9);
    }
    void red;
    return c;
  });
};

const tmpQ = new THREE.Quaternion();
/** Free-flight transform of a detached cube at story time tau. */
export const flight = (c: Cube, tau: number, pos: THREE.Vector3, quat: THREE.Quaternion) => {
  const d = tau - c.detach;
  pos.copy(c.p0).addScaledVector(c.vel, d);
  pos.y -= 0.5 * G * d * d;
  const floor = c.size / 2;
  if (pos.y < floor) pos.y = floor;
  quat.copy(c.q0).premultiply(tmpQ.setFromAxisAngle(c.spinAxis, c.spin * d));
};
