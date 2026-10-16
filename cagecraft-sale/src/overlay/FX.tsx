// Finish: impact flashes on the big beats, a cold frozen grade during "Stop scrolling",
// vignette and film grain over everything.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FPS } from "../config";
import { THEME } from "../theme";
import { M, word } from "../timing";

const FLASHES: [number, number][] = [
  [M.contact, 0.22], [M.snap, 0.55], [M.freeze, 0.35], [word("ever"), 0.3], [word("cagecraft"), 0.28], [M.finalHit, 0.42],
];

export const flashAt = (t: number) =>
  FLASHES.reduce((a, [at, k]) => a + (t >= at ? k * Math.exp(-(t - at) * 14) : 0), 0);

/** CSS filter for the 3D layer: frozen = cold, desaturated, a touch brighter. */
export const worldFilter = (t: number) => {
  const inF = Math.min(1, Math.max(0, (t - M.freeze) / 0.12));
  const outF = Math.min(1, Math.max(0, (t - (word("the") - 0.1)) / 0.3));
  const f = inF * (1 - outF);
  return f > 0 ? `saturate(${1 - 0.75 * f}) contrast(${1 + 0.12 * f}) brightness(${1 + 0.08 * f})` : "none";
};

export const FX: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const flash = Math.min(0.85, flashAt(t));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {flash > 0.005 && <AbsoluteFill style={{ background: "#fff", opacity: flash, mixBlendMode: "screen" }} />}
      <svg width="100%" height="100%" viewBox="0 0 540 960" preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, opacity: THEME.grain, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 9} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="540" height="960" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 75% at 50% 45%, transparent 50%, rgba(0,0,0,${THEME.vignette}) 100%)` }} />
    </AbsoluteFill>
  );
};
