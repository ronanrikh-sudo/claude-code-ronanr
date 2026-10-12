import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, CAPTIONS_IN_CLOSE, FONT, FPS } from "../config";
import { SCENES, T } from "../timing";
import { clamp } from "./motion";

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (!CAPTIONS_IN_CLOSE && t >= SCENES.close.from) return null;
  const cap = T.captions.find((c) => t >= c.start - 0.05 && t < c.end + 0.12);
  if (!cap) return null;
  const a = (cap.start - 0.05) * FPS;
  const b = (cap.end + 0.12) * FPS;
  const opacity = interpolate(frame, [a, a + 4, b - 4, b], [0, 1, 1, 0], clamp);
  const y = interpolate(frame, [a, a + 6], [8, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 54 }}>
      <div
        style={{
          opacity,
          transform: `translateY(${y}px)`,
          fontFamily: FONT,
          fontSize: 36,
          fontWeight: 500,
          letterSpacing: -0.2,
          color: C.text,
          background: "rgba(4,7,14,0.78)",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "11px 26px 13px",
          borderRadius: 14,
          maxWidth: 1500,
          textAlign: "center",
        }}
      >
        {cap.text}
      </div>
    </AbsoluteFill>
  );
};
