import { interpolate, spring, SpringConfig } from "remotion";
import { FPS } from "../config";

export const SOFT: Partial<SpringConfig> = { damping: 200, mass: 0.9, stiffness: 120 };
export const SNAPPY: Partial<SpringConfig> = { damping: 16, mass: 0.6, stiffness: 170 };
export const BOUNCY: Partial<SpringConfig> = { damping: 11, mass: 0.7, stiffness: 160 };

/** Spring that starts at `start` (frames), 0 -> 1. */
export const sp = (frame: number, start: number, config: Partial<SpringConfig> = SOFT, durationInFrames?: number) =>
  spring({ frame: frame - start, fps: FPS, config, durationInFrames });

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Linear 0 -> 1 between two frames, clamped. */
export const ramp = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp);

export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Deterministic pseudo-random in [0,1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
