// THE LOOK: CAGECRAFT "Cube Noir" (shared with the sale ad): black world, one teal sampled from the
// Tiffany jersey (glow) and the PowerPlay button's own teal (type + UI accents), extended heavy italic
// caps from the wordmark, punchy springs, grain and vignette.
import type { CSSProperties } from "react";

export const THEME = {
  name: "Cube Noir",
  bg: "#050506",
  teal: "#16B3B7",      // Tiffany jersey, lifted for glow on black
  tealSoft: "#8EDFDF",
  ui: "#7FD8CC",        // the PowerPlay button teal on the site
  text: "#FFFFFF",
  muted: "#A7ABB3",
  dim: "#5E636C",
  line: "rgba(255,255,255,0.14)",
  phone: "#0C0D10",
  families: { display: "Archivo Variable", body: "Inter Tight" },
  displayWeight: 900,
  displayStretch: "125%",
  displayTracking: -0.01,
  bodyWeight: 600,
  grain: 0.06,
  vignette: 0.62,
  motion: "punchy" as "calm" | "balanced" | "punchy",
};

export const BRAND = { name: "CAGECRAFT", url: "cagecraftco.com" };

const stack = (f: string, fb: string) => `'${f}', ${fb}`;
export const FONTS = { display: stack(THEME.families.display, "system-ui, sans-serif"), body: stack(THEME.families.body, "system-ui, sans-serif") };

const rgb = (hex: string) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const alpha = (hex: string, a: number) => `rgba(${rgb(hex).join(",")},${a})`;

export const display = (size: number): CSSProperties => ({
  fontFamily: FONTS.display, fontWeight: THEME.displayWeight, fontStretch: THEME.displayStretch, fontStyle: "italic",
  fontSize: size, letterSpacing: `${THEME.displayTracking}em`, textTransform: "uppercase", lineHeight: 0.92,
});
export const label = (size: number): CSSProperties => ({
  fontFamily: FONTS.body, fontWeight: THEME.bodyWeight, fontSize: size, letterSpacing: "0.22em", textTransform: "uppercase",
});
