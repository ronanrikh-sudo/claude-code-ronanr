import { interpolate, spring, SpringConfig } from "remotion";
import { FPS } from "../config";
import { THEME } from "../theme";

// Spring presets per motion temperament. The grammar stays the same across projects
// (everything springs, nothing is linear); the temperament sets how hard it hits.
//   calm     - luxury, editorial, wellness: long settles, no overshoot, slower camera
//   balanced - default premium explainer feel
//   punchy   - launches, sport, social: fast attacks, visible overshoot, harder pushes
const TEMPERAMENTS = {
  calm: {
    SOFT: { damping: 200, mass: 1.2, stiffness: 70 },
    SNAPPY: { damping: 26, mass: 0.9, stiffness: 110 },
    BOUNCY: { damping: 18, mass: 0.8, stiffness: 120 },
    camera: 0.6,
  },
  balanced: {
    SOFT: { damping: 200, mass: 0.9, stiffness: 120 },
    SNAPPY: { damping: 16, mass: 0.6, stiffness: 170 },
    BOUNCY: { damping: 11, mass: 0.7, stiffness: 160 },
    camera: 1,
  },
  punchy: {
    SOFT: { damping: 120, mass: 0.7, stiffness: 180 },
    SNAPPY: { damping: 12, mass: 0.5, stiffness: 240 },
    BOUNCY: { damping: 8, mass: 0.6, stiffness: 220 },
    camera: 1.5,
  },
} satisfies Record<string, { SOFT: Partial<SpringConfig>; SNAPPY: Partial<SpringConfig>; BOUNCY: Partial<SpringConfig>; camera: number }>;

const T = TEMPERAMENTS[THEME.motion];
export const SOFT: Partial<SpringConfig> = T.SOFT;     // big layout moves, panels, camera settles
export const SNAPPY: Partial<SpringConfig> = T.SNAPPY; // UI elements, rows, chips, words
export const BOUNCY: Partial<SpringConfig> = T.BOUNCY; // ticks, drops, "landing" moments
/** Multiply camera push amounts by this (scale deltas, zoom-through strength). */
export const CAMERA = T.camera;

/** Spring that starts at `start` (frames), 0 -> 1. */
export const sp = (frame: number, start: number, config: Partial<SpringConfig> = SOFT, durationInFrames?: number) =>
  spring({ frame: frame - start, fps: FPS, config, durationInFrames });

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Linear 0 -> 1 between two frames, clamped. */
export const ramp = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp);

export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Deterministic pseudo-random in [0,1). Never use Math.random(): renders must be repeatable. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Slow scene-long camera push: scale 1 -> 1 + amount*CAMERA. */
export const push = (frame: number, a: number, b: number, amount = 0.05) =>
  interpolate(frame, [a, b], [1, 1 + amount * CAMERA], clamp);
