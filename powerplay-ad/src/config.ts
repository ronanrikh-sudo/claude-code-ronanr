import timing from "./timing.json";

// 9:16 Meta ad (Reels/Stories). Keep text and key UI between SAFE.top (14%) and HEIGHT - SAFE.bottom (35%).
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION_FRAMES = Math.round(timing.totalSeconds * FPS);
export const SAFE = { top: 269, bottom: 672 };
