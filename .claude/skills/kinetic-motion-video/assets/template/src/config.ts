import timing from "./timing.json";

// ---------------------------------------------------------------- brand knobs
// One accent colour carries the whole film. Coral by default; swap for the brand's.
export const ACCENT = "#D97757";
// The finale's "brand world": a warm light ground the film cuts to for the sign-off.
export const BRAND = {
  name: "Northwind",          // wordmark text on the finale (fictional placeholder)
  tagline: "answer every ticket", // typed into the finale's terminal pill
  ivory: "#F0EEE6",
  ink: "#141413",
};

export const SHOW_CAPTIONS = true;

// ---------------------------------------------------------------- canvas
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
export const DURATION_FRAMES = Math.round(timing.totalSeconds * FPS);

// ---------------------------------------------------------------- dark world palette
export const C = {
  bg: "#060A14",
  bgDeep: "#03050B",
  navy: "#0D1830",
  panel: "#0E1526",
  line: "rgba(255,255,255,0.09)",
  lineHi: "rgba(255,255,255,0.16)",
  text: "#F3F6FB",
  muted: "#93A0B8",
  dim: "#5D6A82",
  ok: "#3DD68C",
  warn: "#FFA53D",
  bad: "#FF5A5F",
};

export const FONT = "'Inter', system-ui, sans-serif";
export const MONO = "'JetBrains Mono', ui-monospace, monospace";

/** Accent with alpha, e.g. accent(0.3). */
export const accent = (a: number) => {
  const n = parseInt(ACCENT.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
