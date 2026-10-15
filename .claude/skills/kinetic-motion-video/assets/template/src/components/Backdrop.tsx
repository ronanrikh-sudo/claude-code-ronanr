import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { accent, THEME } from "../theme";
import { sec } from "../timing";

/** The world: radial depth gradient plus a slow-drifting accent glow. */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const gx = 50 + Math.sin(frame / 140) * 12;
  const gy = 38 + Math.cos(frame / 170) * 8;
  return (
    <AbsoluteFill style={{ background: THEME.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 65% at 50% 42%, ${THEME.bgCenter} 0%, ${THEME.bg} 62%, ${THEME.bgEdge} 100%)` }} />
      {THEME.glow > 0 && (
        <AbsoluteFill style={{ opacity: 0.55,
          background: `radial-gradient(circle 620px at ${gx}% ${gy}%, ${accent(THEME.glow)} 0%, transparent 70%)` }} />
      )}
    </AbsoluteFill>
  );
};

/** Film grain + vignette over everything. On light grounds grain multiplies (subtler) and
 *  the vignette lifts. `finaleFrom` switches to the finale world's mode. */
export const Grain: React.FC<{ finaleFrom: number | null }> = ({ finaleFrom }) => {
  const frame = useCurrentFrame();
  const inFinale = finaleFrom !== null && frame >= sec(finaleFrom);
  const mode = inFinale ? THEME.finale.mode : THEME.mode;
  const light = mode === "light";
  if (THEME.grain <= 0 && THEME.vignette <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {THEME.grain > 0 && (
        <svg width="100%" height="100%" viewBox="0 0 960 540" preserveAspectRatio="none"
          style={{ opacity: light ? THEME.grain * 0.55 : THEME.grain, mixBlendMode: light ? "multiply" : "overlay" }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 12} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="960" height="540" filter="url(#grain)" />
        </svg>
      )}
      <AbsoluteFill style={{ opacity: light ? 0.2 : 1,
        background: `radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,${THEME.vignette}) 100%)` }} />
    </AbsoluteFill>
  );
};
