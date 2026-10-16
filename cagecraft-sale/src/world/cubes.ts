// One pool of cubes for the whole film. A cube's state at time t is the hook (fighters,
// shatter, freeze) blended, formation by formation, towards wherever it is needed next.
import * as THREE from "three";
import { buildCubes, Cube, flight, poseBlue, poseRed } from "./fight";
import { ambient, CubeT, Formation, STAGE } from "./formations";
import { Skeleton } from "./rig";
import { tau } from "./time";
import { rand } from "../components/motion";

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const newT = (): CubeT => ({ pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: 0, color: new THREE.Color(), glow: 0 });

export class CubeSystem {
  cubes: Cube[];
  forms: Formation[];
  slotOf: Int32Array[] = [];   // per formation: cube -> slot index (-1 = ambient)
  delay: Float32Array[] = [];  // per formation: cube -> departure delay (s)
  private sk = [new Skeleton(), new Skeleton()];
  private skTau = NaN;
  private stack: { base: CubeT; target: CubeT }[] = [];
  private arcDir: THREE.Vector3[];
  private tumbleAxis: THREE.Vector3[];

  constructor(forms: Formation[]) {
    this.cubes = buildCubes();
    this.forms = forms;
    const N = this.cubes.length;
    for (let d = 0; d < forms.length + 2; d++) this.stack.push({ base: newT(), target: newT() });
    this.arcDir = this.cubes.map((_, i) =>
      new THREE.Vector3(rand(i * 1.3) - 0.5, 0.35 + rand(i * 2.1) * 0.6, 0.5 + rand(i * 3.7) * 0.8).normalize());
    this.tumbleAxis = this.cubes.map((_, i) =>
      new THREE.Vector3(rand(i * 5.1) - 0.5, rand(i * 6.3) - 0.5, rand(i * 7.9) - 0.5).normalize());

    // Assign cubes to each formation in turn, from where they actually are when it starts.
    const tmp = newT();
    forms.forEach((F, f) => {
      const at = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { this.state(i, F.start, tmp, f - 1); at.set([tmp.pos.x, tmp.pos.y, tmp.pos.z], i * 3); }
      const pos = (i: number) => new THREE.Vector3(at[i * 3], at[i * 3 + 1], at[i * 3 + 2]);
      const prev = f > 0 ? this.slotOf[f - 1] : null;
      const K = Math.min(F.slots.length, N);
      const pick = [...Array(N).keys()]
        .map((i) => ({ i, key: (prev && prev[i] >= 0 ? 0 : 1000) + pos(i).distanceTo(STAGE) + rand(i * 9.7) * 0.5 }))
        .sort((a, b) => a.key - b.key).slice(0, K).map((x) => x.i);
      const ax = F.sortAxis;
      const slotsAt = F.slots.map((s, j) => { F.place(s, j, F.start + F.travel + F.stagger, tmp); return { j, k: tmp.pos.dot(ax) }; });
      const cubesAt = pick.map((i) => ({ i, k: pos(i).dot(ax) }));
      slotsAt.sort((a, b) => a.k - b.k);
      cubesAt.sort((a, b) => a.k - b.k);
      const slotOf = new Int32Array(N).fill(-1);
      cubesAt.forEach((c, n) => (slotOf[c.i] = slotsAt[Math.floor((n * slotsAt.length) / cubesAt.length)].j));
      // departure order: formation's own key for arriving cubes, random for leaving ones
      const keys = F.slots.map((s, j) => F.order(s, j));
      const lo = Math.min(...keys, 0), hi = Math.max(...keys, 1e-6);
      const delay = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const k = slotOf[i] >= 0 ? (keys[slotOf[i]] - lo) / (hi - lo || 1) : rand(i * 4.4 + f);
        delay[i] = k * F.stagger;
      }
      this.slotOf.push(slotOf);
      this.delay.push(delay);
    });
  }

  private poseFighters(tauNow: number) {
    if (tauNow === this.skTau) return;
    poseRed(this.sk[0], tauNow);
    poseBlue(this.sk[1], tauNow);
    this.skTau = tauNow;
  }

  /** The hook: attached to a fighter, or flying free after the hit. */
  hook(i: number, t: number, o: CubeT) {
    const c = this.cubes[i];
    const s = tau(t);
    if (s >= c.detach) flight(c, s, o.pos, o.quat);
    else {
      this.poseFighters(s);
      const sk = this.sk[c.fighter];
      sk.world(c.bone, c.local, o.pos);
      sk.bones[c.bone].getWorldQuaternion(o.quat);
    }
    o.scale = c.size;
    o.color.set(c.color);
    o.glow = 0;
  }

  private target(f: number, i: number, t: number, o: CubeT) {
    const j = this.slotOf[f][i];
    if (j >= 0) this.forms[f].place(this.forms[f].slots[j], j, t, o);
    else ambient(i, t, o);
  }

  /** State of cube i at time t, considering formations 0..upto. */
  state(i: number, t: number, o: CubeT, upto = this.forms.length - 1): void {
    let f = upto;
    while (f >= 0 && t < this.forms[f].start) f--;
    if (f < 0) return this.hook(i, t, o);
    const F = this.forms[f];
    const p = (t - F.start - this.delay[f][i]) / F.travel;
    if (p >= 1) return this.target(f, i, t, o);
    if (p <= 0) return this.state(i, t, o, f - 1);
    const { base, target } = this.stack[f];
    this.state(i, t, base, f - 1);
    this.target(f, i, t, target);
    const e = easeInOut(p);
    o.pos.lerpVectors(base.pos, target.pos, e).addScaledVector(this.arcDir[i], Math.sin(Math.PI * e) * F.arc * (0.5 + rand(i * 8.8)));
    o.quat.slerpQuaternions(base.quat, target.quat, e);
    o.quat.premultiply(new THREE.Quaternion().setFromAxisAngle(this.tumbleAxis[i], Math.sin(Math.PI * e) * 2.2));
    o.scale = base.scale + (target.scale - base.scale) * e;
    o.color.lerpColors(base.color, target.color, e);
    o.glow = base.glow + (target.glow - base.glow) * e;
  }
}
