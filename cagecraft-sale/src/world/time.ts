// Hook time-warp. Real time t (s) -> story time tau (s). Speed 1 until the kick is under way,
// eases into ultra slow motion (6%) through contact and shatter, accelerates back to full
// speed on the snap, runs full speed while the blocks fly, then tape-stops to a dead freeze
// on "Stop scrolling". Everything physical in the hook is a function of tau.
import { M } from "../timing";

export const SLOW = 0.06;
const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
export const FREEZE_RAMP = 0.16;

export const speed = (t: number) => {
  if (t < M.slow_in) return 1;
  if (t < M.slow_full) return 1 + (SLOW - 1) * smooth((t - M.slow_in) / (M.slow_full - M.slow_in));
  if (t < M.ramp_up) return SLOW;
  if (t < M.snap) { const u = (t - M.ramp_up) / (M.snap - M.ramp_up); return SLOW + (1 - SLOW) * u * u * u; }
  if (t < M.freeze) return 1;
  if (t < M.freeze + FREEZE_RAMP) return 1 - smooth((t - M.freeze) / FREEZE_RAMP);
  return 0;
};

const STEP = 1 / 600;
const N = Math.ceil(12 / STEP);
const TABLE = new Float64Array(N + 1);
for (let i = 1; i <= N; i++) TABLE[i] = TABLE[i - 1] + speed((i - 0.5) * STEP) * STEP;

export const tau = (t: number) => {
  if (t <= 0) return t;
  const x = Math.min(t / STEP, N);
  const i = Math.floor(x), f = x - i;
  return i >= N ? TABLE[N] : TABLE[i] + (TABLE[i + 1] - TABLE[i]) * f;
};

export const TAU = {
  kick: tau(M.kick),
  contact: tau(M.contact),
  snap: tau(M.snap),
  frozen: tau(M.freeze + FREEZE_RAMP),
};
