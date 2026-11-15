// THE LOOK: CAGECRAFT "Cube Noir" (shared with cagecraft-sale): black / white world, extended heavy
// italic caps that echo the wordmark, punchy springs, film grain. For this edit the two accents are
// sampled from the jerseys in the footage (Diamond's cyan print, Cotton Candy's pink) and lifted so
// they glow on black. Signature device: the split hairline, half Diamond / half Cotton Candy.
import type { CSSProperties } from "react";

export const THEME = {
  bg: "#050506",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.72)",
  dim: "rgba(255,255,255,0.5)",
  diamond: "#35C6F2", // Fight Jersey 2.0 Diamond print in the footage (#10B0E8), lifted
  candy: "#F49AD8",   // Fight Jersey 2.0 Cotton Candy print, between footage and brand pink
  families: { display: "Archivo Variable", body: "Inter Tight" },
  grain: 0.07,
  vignette: 0.55,
  motion: "punchy" as "calm" | "balanced" | "punchy",
};

export const BRAND = {
  url: "CAGECRAFTCO.COM",
  offer: "FREE KIT BAG",
  offerSub: "WITH ANY ORDER",
  offerFine: "One kit bag per customer.",
};

const stack = (f: string) => `'${f}', system-ui, sans-serif`;
export const FONTS = { display: stack(THEME.families.display), body: stack(THEME.families.body) };

/** Display type: extended heavy italic caps (the wordmark's voice). */
export const display = (size: number): CSSProperties => ({
  fontFamily: FONTS.display,
  fontWeight: 900,
  fontStretch: "125%",
  fontStyle: "italic",
  fontSize: size,
  letterSpacing: "-0.012em",
  textTransform: "uppercase",
  lineHeight: 1,
  whiteSpace: "nowrap",
});

/** Small tracked labels. */
export const label = (size: number, weight = 700): CSSProperties => ({
  fontFamily: FONTS.body,
  fontWeight: weight,
  fontSize: size,
  letterSpacing: "0.26em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

export const SHADOW = "0 6px 36px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.35)";

// Size-to-fit for display lines: measured with the real font (loaded before the first frame),
// so long words never overflow the safe width.
const fitCache = new Map<string, number>();
export const fit = (text: string, maxWidth: number, maxSize: number): number => {
  const key = `${text}|${maxWidth}|${maxSize}`;
  const hit = fitCache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return maxSize;
  const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D & { fontStretch: string; letterSpacing: string };
  ctx.font = `italic 900 100px '${THEME.families.display}'`;
  ctx.fontStretch = "expanded"; // = 125% on the wdth axis, as in display()
  ctx.letterSpacing = "-1.2px";
  const w = ctx.measureText(text.toUpperCase()).width * 1.04; // italic overhang
  const size = Math.min(maxSize, Math.floor((100 * maxWidth) / w));
  fitCache.set(key, size);
  return size;
};
