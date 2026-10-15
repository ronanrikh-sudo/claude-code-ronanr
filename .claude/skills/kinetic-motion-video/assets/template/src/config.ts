import timing from "./timing.json";

// Canvas + toggles. The look lives in theme.ts.
export const WIDTH = 1920;   // 16:9 by default. For 9:16 (1080x1920) or 1:1, re-lay out scenes
export const HEIGHT = 1080;  // around the new safe area (see references/motion-language.md).
export const FPS = 30;
export const DURATION_FRAMES = Math.round(timing.totalSeconds * FPS);

export const SHOW_CAPTIONS = true;
