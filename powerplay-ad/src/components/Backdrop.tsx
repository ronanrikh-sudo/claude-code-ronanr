// Black world with a slow teal glow and a faint chain-link "cage" mesh drifting in parallax.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { alpha, THEME } from "../theme";

export const Backdrop: React.FC<{ glow?: number }> = ({ glow = 1 }) => {
  const f = useCurrentFrame();
  const gx = 50 + 9 * Math.sin(f / 95), gy = 42 + 7 * Math.cos(f / 120);
  const drift = (f * 0.35) % 64;
  return (
    <AbsoluteFill style={{ background: THEME.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 42% at ${gx}% ${gy}%, ${alpha(THEME.teal, 0.2 * glow)}, transparent 70%)` }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.07 }}>
        <defs>
          <pattern id="mesh" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform={`translate(${drift} ${drift * 0.6}) rotate(45)`}>
            <path d="M0 0 L64 0 M0 0 L0 64" stroke="#fff" strokeWidth="1.2" />
          </pattern>
          <radialGradient id="meshFade" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#000" /></radialGradient>
          <mask id="meshMask"><rect width="100%" height="100%" fill="url(#meshFade)" /></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#mesh)" mask="url(#meshMask)" />
      </svg>
    </AbsoluteFill>
  );
};
