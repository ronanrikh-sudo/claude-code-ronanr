export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION_FRAMES = 300; // 10.0 s

// Picture cuts, on the music's bar lines (123 BPM, one bar = 58.5 frames).
// The plate public/footage/footage.mp4 is pre-assembled to exactly these frames.
export const CUT = { A: 0, B: 59, C: 117, D: 176, E: 234, END: 300 } as const;

// Meta Reels covers roughly the top 14% and bottom 35% with UI; 4:5 feed crops keep y 285-1635.
// Everything that must be read lives between SAFE.top and SAFE.bottom.
export const SAFE = { top: 290, bottom: 1240, x: 84 } as const;
