import timing from "./timing.json";

// 9:16 social. Keep 120 px top and 300 px bottom clear of key content (platform UI).
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION_FRAMES = Math.round(timing.totalSeconds * FPS);
export const SAFE = { top: 120, bottom: 300 };
