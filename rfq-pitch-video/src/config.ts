import timing from "./timing.json";

// Single place to re-brand the video. Claude coral by default.
export const ACCENT = "#D97757";

// App colours used for the Outlook / Excel styled UI.
export const OUTLOOK_BLUE = "#0F6CBD";
export const EXCEL_GREEN = "#107C41";
export const CLAUDE_IVORY = "#F0EEE6";
export const CLAUDE_INK = "#141413";

export const SHOW_CAPTIONS = true;
// The close scene's kinetic type already says the VO line, so captions step aside there.
export const CAPTIONS_IN_CLOSE = false;

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
export const DURATION_FRAMES = Math.round(timing.totalSeconds * FPS);

export const C = {
  bg: "#060A14",
  bgDeep: "#03050B",
  navy: "#0D1830",
  panel: "#0E1526",
  panelHi: "#131C31",
  line: "rgba(255,255,255,0.09)",
  lineHi: "rgba(255,255,255,0.16)",
  text: "#F3F6FB",
  muted: "#93A0B8",
  dim: "#5D6A82",
  ok: "#3DD68C",
  warn: "#FFA53D",
  bad: "#FF5A5F",
  inputCell: "rgba(61,214,140,0.12)", // the template's green input cells
  inputCellLine: "rgba(61,214,140,0.45)",
};

export const FONT = "'Inter', system-ui, sans-serif";
export const MONO = "'JetBrains Mono', ui-monospace, monospace";

/** Accent with alpha, e.g. accent(0.3) */
export const accent = (a: number) => {
  const n = parseInt(ACCENT.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
