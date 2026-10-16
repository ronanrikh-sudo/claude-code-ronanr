// THE LOOK: CAGECRAFT "Cube Noir". Derived from the brand rather than the library:
// black / white / grey world, one Tiffany teal and one Cotton Candy pink sampled from the
// hero products, an extended heavy italic that echoes the CAGECRAFT wordmark, punchy motion.
// Red and blue exist only as fight-corner colours on the fighters, never as brand colours.
import type { CSSProperties } from "react";

export type Theme = typeof THEME;

export const THEME = {
  name: "Cube Noir",
  mode: "dark" as "dark" | "light",

  // --- world
  bg: "#050506",
  fog: "#050506",
  floor: "#030303",
  cageLine: "#3A3D44",

  // --- brand colour
  teal: "#16B3B7",       // Fight Jersey 2.0 Tiffany print (sampled #13ACB1, lifted for glow on black)
  tealSoft: "#8EDFDF",
  pink: "#F09EC0",       // Fight Jersey 2.0 Cotton Candy print (sampled #ED9EBE)
  pinkSoft: "#F8CFE0",
  text: "#FFFFFF",
  muted: "#A7ABB3",
  dim: "#5E636C",
  line: "rgba(255,255,255,0.14)",

  // --- cube materials
  graphite: "#33363C",   // fighter bodies, monolith
  steel: "#6E737C",
  silver: "#A3A8B0",     // heads (so the shatter reads), highlights
  white: "#F2F3F5",
  corner: { red: "#D3242C", blue: "#1E63E6" }, // fighters' gloves + shorts only

  // --- type (Archivo variable: italic, width 125, weight 900 = the wordmark's voice)
  families: { display: "Archivo Variable", body: "Inter Tight" },
  displayWeight: 900,
  displayStretch: "125%",
  displayTracking: -0.01,
  bodyWeight: 600,

  // --- texture
  grain: 0.06,
  vignette: 0.6,

  motion: "punchy" as "calm" | "balanced" | "punchy",
};

export const BRAND = {
  name: "CAGECRAFT",
  url: "cagecraftco.com",
  offer: "UP TO 40% OFF",
  gifts: ["KIT BAG", "TOWEL", "SOCKS", "TRAINING TEE"],
};

const stack = (f: string, fallback: string) => `'${f}', ${fallback}`;
export const FONTS = {
  display: stack(THEME.families.display, "system-ui, sans-serif"),
  body: stack(THEME.families.body, "system-ui, sans-serif"),
};

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const alpha = (hex: string, a: number) => `rgba(${rgb(hex).join(",")},${a})`;

/** Display type: extended heavy italic caps. */
export const display = (size: number): CSSProperties => ({
  fontFamily: FONTS.display,
  fontWeight: THEME.displayWeight,
  fontStretch: THEME.displayStretch,
  fontStyle: "italic",
  fontSize: size,
  letterSpacing: `${THEME.displayTracking}em`,
  textTransform: "uppercase",
  lineHeight: 0.92,
});

/** Small tracked labels. */
export const label = (size: number): CSSProperties => ({
  fontFamily: FONTS.body,
  fontWeight: THEME.bodyWeight,
  fontSize: size,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
});
