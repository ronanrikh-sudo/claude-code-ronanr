// Finish: flashes on the big beats, film grain and vignette over everything.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FPS } from "../config";
import { THEME } from "../theme";
import { T, word } from "../timing";

const FLASHES = (): [number, number][] => [
  [0.02, 0.35], [word("S2.1", "tap") + 0.05, 0.16], [word("S3.0", "unlocked") - 0.05, 0.42], [word("S3.1", "earned") - 0.02, 0.18],
  [word("S4.0", "forty"), 0.18], [word("S5.1", "Shop") + 0.02, 0.2], [T.marks.hit, 0.4],
];
export const flashAt = (t: number) => FLASHES().reduce((a, [at, k]) => a + (t >= at ? k * Math.exp(-(t - at) * 13) : 0), 0);

export const FX: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = Math.min(0.8, flashAt(frame / FPS));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {flash > 0.005 && <AbsoluteFill style={{ background: "#fff", opacity: flash, mixBlendMode: "screen" }} />}
      <svg width="100%" height="100%" viewBox="0 0 540 960" preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, opacity: THEME.grain, mixBlendMode: "overlay" }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 9} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="540" height="960" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 92% 78% at 50% 46%, transparent 52%, rgba(0,0,0,${THEME.vignette}) 100%)` }} />
    </AbsoluteFill>
  );
};
