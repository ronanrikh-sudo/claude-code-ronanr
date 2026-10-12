import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, accent } from "../config";

/** Navy depth gradient, a slow accent glow, film grain and a vignette. */
export const Backdrop: React.FC<{ glow?: number }> = ({ glow = 1 }) => {
  const frame = useCurrentFrame();
  const gx = 50 + Math.sin(frame / 140) * 12;
  const gy = 38 + Math.cos(frame / 170) * 8;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 65% at 50% 42%, ${C.navy} 0%, ${C.bg} 62%, ${C.bgDeep} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.55 * glow,
          background: `radial-gradient(circle 620px at ${gx}% ${gy}%, ${accent(0.16)} 0%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox="0 0 960 540" preserveAspectRatio="none"
        style={{ opacity: 0.075, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="960" height="540" filter="url(#grain)" />
      </svg>
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }}
      />
    </AbsoluteFill>
  );
};
