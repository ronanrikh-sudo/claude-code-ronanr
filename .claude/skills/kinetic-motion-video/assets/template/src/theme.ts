// THE LOOK. Every colour, font, surface and texture the film uses comes from here,
// so a project's art direction is one file. Pick or blend a direction from
// references/art-direction.md, then replace these values. Scenes never hard-code colours.
//
// Fonts: add the matching @fontsource imports in src/fonts.ts.

import type { CSSProperties } from "react";

export type Theme = typeof THEME;

export const THEME = {
  name: "Midnight Signal",          // the art-direction direction this theme implements
  mode: "dark" as "dark" | "light", // drives grain blend, vignette and shadow behaviour

  // --- backdrop (the "world" scenes sit in)
  bg: "#060A14",
  bgEdge: "#03050B",                // radial gradient edge
  bgCenter: "#0D1830",              // radial gradient centre
  glow: 0.16,                       // drifting accent glow strength (0 = off)

  // --- colour
  accent: "#D97757",                // the ONE hero colour
  accentInk: "#FFFFFF",             // text/icons placed on the accent
  text: "#F3F6FB",
  muted: "#93A0B8",
  dim: "#5D6A82",
  line: "rgba(255,255,255,0.09)",
  lineStrong: "rgba(255,255,255,0.16)",
  status: { ok: "#3DD68C", warn: "#FFA53D", bad: "#FF5A5F" },

  // --- surfaces
  panel: "linear-gradient(180deg,#141C2F,#0D1424)", // glass/hero cards
  card: "linear-gradient(180deg,#161F33,#111829)",  // small repeated cards (flood, rows)
  hud: "rgba(5,8,16,0.96)",                          // near-opaque stat panels over busy layers
  chip: "#161E2F",
  chipStrong: "#1D2639",
  radius: 24,
  radiusSm: 14,
  shadow: "0 40px 100px rgba(0,0,0,0.6)",
  shadowSm: "0 18px 40px rgba(0,0,0,0.45)",

  // --- "paper": light app windows / documents shown inside the world
  paper: "#FFFFFF",
  paperText: "#242424",
  paperMuted: "#616161",
  paperChrome: "#2B3A55",           // title bar of recreated apps (or the app's own colour)

  // --- code / terminal
  code: { bg: "#1C1B1A", bar: "#252422", text: "#E8E4DC", dim: "#8F8B85" },

  // --- sign-off world (finale). Can contrast with the story world or match it.
  finale: { bg: "#F0EEE6", ink: "#141413", mode: "light" as "dark" | "light" },

  // --- type. Family names must match the @fontsource packages imported in fonts.ts.
  families: { display: "Inter", body: "Inter", mono: "JetBrains Mono" },
  displayWeight: 760,
  displayTracking: -0.036,          // em; tight for grotesks, ~0 for serifs, positive for caps
  displayCase: "none" as "none" | "uppercase",
  bodyWeight: 500,

  // --- texture
  grain: 0.075,                     // film grain opacity (0 = clean)
  vignette: 0.55,                   // edge darkening (0 = none)

  // --- motion temperament: "calm" | "balanced" | "punchy" (see components/motion.ts)
  motion: "balanced" as "calm" | "balanced" | "punchy",
};

// Brand content for the finale (fictional placeholders)
export const BRAND = { name: "Northwind", tagline: "answer every ticket" };

const stack = (f: string, fallback: string) => `'${f}', ${fallback}`;
export const FONTS = {
  display: stack(THEME.families.display, "system-ui, sans-serif"),
  body: stack(THEME.families.body, "system-ui, sans-serif"),
  mono: stack(THEME.families.mono, "ui-monospace, monospace"),
};

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};
/** Accent with alpha, e.g. accent(0.3). */
export const accent = (a: number) => `rgba(${rgb(THEME.accent)},${a})`;
/** Any hex colour with alpha. */
export const alpha = (hex: string, a: number) => `rgba(${rgb(hex)},${a})`;

/** Display-type style block: use for every headline so the direction's type voice is consistent. */
export const display = (size: number): CSSProperties => ({
  fontFamily: FONTS.display,
  fontSize: size,
  fontWeight: THEME.displayWeight,
  letterSpacing: `${THEME.displayTracking}em`,
  textTransform: THEME.displayCase,
  lineHeight: 1.08,
});
