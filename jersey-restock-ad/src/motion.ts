import { interpolate, spring, SpringConfig } from "remotion";
import { FPS } from "./config";
import { THEME } from "./theme";

// Same spring grammar as cagecraft-sale (kinetic-motion-video toolkit), punchy temperament.
const TEMPERAMENTS = {
  calm: { SOFT: { damping: 200, mass: 1.2, stiffness: 70 }, SNAPPY: { damping: 26, mass: 0.9, stiffness: 110 }, BOUNCY: { damping: 18, mass: 0.8, stiffness: 120 } },
  balanced: { SOFT: { damping: 200, mass: 0.9, stiffness: 120 }, SNAPPY: { damping: 16, mass: 0.6, stiffness: 170 }, BOUNCY: { damping: 11, mass: 0.7, stiffness: 160 } },
  punchy: { SOFT: { damping: 120, mass: 0.7, stiffness: 180 }, SNAPPY: { damping: 14, mass: 0.5, stiffness: 240 }, BOUNCY: { damping: 9, mass: 0.6, stiffness: 220 } },
} satisfies Record<string, { SOFT: Partial<SpringConfig>; SNAPPY: Partial<SpringConfig>; BOUNCY: Partial<SpringConfig> }>;

const T = TEMPERAMENTS[THEME.motion];
export const SOFT = T.SOFT;
export const SNAPPY = T.SNAPPY;
export const BOUNCY = T.BOUNCY;
/** Fast, overshoot-free exit. */
export const EXIT: Partial<SpringConfig> = { damping: 200, mass: 0.4, stiffness: 300 };

/** Spring 0 -> 1 starting at frame `start`. */
export const sp = (frame: number, start: number, config: Partial<SpringConfig> = SOFT) =>
  spring({ frame: frame - start, fps: FPS, config });

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ramp = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
