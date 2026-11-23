// S1 "We all know PowerPlay from Sportsbet." Kinetic type on black; the bolt crackles in from frame 0
// and strikes on "PowerPlay". Sportsbet is named in type only: no logo, no colours.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FPS } from "../config";
import { alpha, display, label, THEME } from "../theme";
import { push, sp, BOUNCY, SNAPPY, clamp, rand } from "../components/motion";
import { Bolt } from "../components/Shapes";
import { sec, word } from "../timing";
import type { SceneProps } from "../Video";

const W: React.FC<{ text: string; at: number; frame: number; style: React.CSSProperties; slam?: boolean }> = ({ text, at, frame, style, slam }) => {
  const p = sp(frame, sec(at - 0.04), slam ? BOUNCY : SNAPPY);
  return (
    <span style={{ display: "inline-block", ...style, opacity: Math.min(1, p * 1.8),
      transform: slam ? `scale(${interpolate(p, [0, 1], [1.6, 1])})` : `translateY(${(1 - p) * 50}px)`,
      filter: `blur(${(1 - Math.min(1, p)) * (slam ? 14 : 9)}px)` }}>{text}</span>
  );
};

export const Hook: React.FC<SceneProps> = ({ from, to }) => {
  const frame = useCurrentFrame() + sec(from);
  const t = frame / FPS;
  const tPP = word("S1.0", "PowerPlay"), tSB = word("S1.0", "Sportsbet");
  const boltIn = sp(frame, 0, SNAPPY);
  const strike = sp(frame, sec(tPP - 0.05), BOUNCY);
  const flicker = t < tPP ? 0.55 + 0.45 * (rand(Math.floor(frame / 2)) > 0.35 ? 1 : 0.2) : 1;
  const cam = push(frame, 0, sec(to), 0.07);
  return (
    <AbsoluteFill style={{ transform: `scale(${cam})` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center",
        opacity: boltIn * flicker, transform: `scale(${interpolate(boltIn, [0, 1], [0.5, 1]) * interpolate(strike, [0, 1], [1, 1.12])}) rotate(${(1 - boltIn) * -14}deg)` }}>
        <div style={{ position: "absolute", width: 420, height: 420, top: -110, borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(THEME.teal, 0.42 * strike)}, transparent 65%)` }} />
        <Bolt size={200} color={THEME.ui} glow={alpha(THEME.teal, 0.9)} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center" }}>
        {(["We", "all", "know"] as const).map((w, i) => (
          <W key={w} text={w.toUpperCase()} at={word("S1.0", w)} frame={frame} style={{ ...display(76), color: THEME.muted, marginRight: i < 2 ? 22 : 0 }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 892, textAlign: "center" }}>
        <span style={{ display: "inline-block", opacity: Math.min(1, strike * 1.8), transform: `scale(${interpolate(strike, [0, 1], [1.6, 1])})`,
          filter: `blur(${(1 - Math.min(1, strike)) * 14}px)` }}>
          <span style={{ ...display(114), color: THEME.text, textShadow: "0 8px 40px rgba(0,0,0,0.8)" }}>POWER</span>
          <span style={{ ...display(114), color: THEME.ui, textShadow: `0 0 46px ${alpha(THEME.teal, 0.7)}` }}>PLAY</span>
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1085, textAlign: "center" }}>
        <W text="FROM" at={word("S1.0", "from")} frame={frame} style={{ ...display(76), color: THEME.text, marginRight: 22 }} />
        <W text="SPORTSBET." at={tSB} frame={frame} style={{ ...display(76), color: THEME.text }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1520, textAlign: "center",
        opacity: interpolate(t, [tSB, tSB + 0.4], [0, 0.75], clamp) }}>
        <span style={{ ...label(20), color: THEME.dim }}>Not affiliated with Sportsbet</span>
      </div>
    </AbsoluteFill>
  );
};
