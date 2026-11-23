import timing from "./timing.json";

// 9:16 Instagram story. Keep key content between SAFE.top and HEIGHT - SAFE.bottom (story UI).
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION_FRAMES = Math.round(timing.totalSeconds * FPS);
export const SAFE = { top: 220, bottom: 330 };
