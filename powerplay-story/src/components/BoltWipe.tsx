// Signature transition: the PowerPlay bolt zooms through the frame in teal, then clears to the next scene.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { alpha, THEME } from "../theme";
import { clamp, easeInOut } from "./motion";
import { sec } from "../timing";
import { Bolt } from "./Shapes";

export const BoltWipe: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const a = sec(at) - 7, b = sec(at) + 6;
  if (frame < a || frame > b + 8) return null;
  const grow = easeInOut(interpolate(frame, [a, sec(at)], [0, 1], clamp));
  const clear = interpolate(frame, [sec(at), b], [1, 0], clamp);
  const scale = 0.4 + grow * 26;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", opacity: clear }}>
      <AbsoluteFill style={{ background: alpha(THEME.teal, 0.35 * grow) }} />
      <div style={{ transform: `scale(${scale}) rotate(${-8 + 8 * grow}deg)` }}>
        <Bolt size={140} color={THEME.ui} glow={alpha(THEME.teal, 0.9)} />
      </div>
    </AbsoluteFill>
  );
};
