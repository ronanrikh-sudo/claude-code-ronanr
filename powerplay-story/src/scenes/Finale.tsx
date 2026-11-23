// S7 "PowerPlay your cart. Only at CAGECRAFT." Two-line payoff, then the wordmark lands and the music's
// final hit flashes it. Ambient: the bolt breathes behind, the camera keeps drifting in.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "../config";
import { alpha, BRAND, display, label, THEME } from "../theme";
import { BOUNCY, clamp, push, sp, SNAPPY, SOFT } from "../components/motion";
import { Bolt } from "../components/Shapes";
import { cue, sec, T, word } from "../timing";
import type { SceneProps } from "../Video";

export const Finale: React.FC<SceneProps> = ({ from, to }) => {
  const frame = useCurrentFrame() + sec(from);
  const t = frame / FPS;
  const w = (x: string, n = 0) => word("S7.0", x, n);
  const p1 = sp(frame, sec(w("PowerPlay") - 0.04), BOUNCY), p2 = sp(frame, sec(w("your") - 0.04), SNAPPY), p3 = sp(frame, sec(w("cart") - 0.04), BOUNCY);
  const lift = sp(frame, sec(cue("S7.1") - 0.1), SOFT);
  const logo = sp(frame, sec(word("S7.1", "CAGECRAFT") - 0.08), BOUNCY);
  const hit = T.marks.hit;
  const glint = interpolate(t, [hit, hit + 0.7], [-0.3, 1.3], clamp);
  const urlIn = interpolate(t, [hit - 0.05, hit + 0.3], [0, 1], clamp);
  const cam = push(frame, sec(from), sec(to), 0.06);
  const breathe = 0.5 + 0.5 * Math.sin(t * 2.4);
  const only = sp(frame, sec(word("S7.1", "only") - 0.04), SNAPPY);
  return (
    <AbsoluteFill style={{ transform: `scale(${cam})` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center", opacity: 0.16 + 0.08 * breathe,
        transform: `translateY(${-lift * 60}px) scale(${1 + 0.04 * breathe})` }}>
        <Bolt size={760} color={THEME.teal} glow={alpha(THEME.teal, 0.8)} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center", transform: `translateY(${-lift * 190}px) scale(${1 - 0.22 * lift})` }}>
        <div style={{ ...display(112), color: THEME.text, opacity: Math.min(1, p1 * 1.8) * (1 - 0.35 * lift), transform: `scale(${interpolate(p1, [0, 1], [1.5, 1])})`,
          filter: `blur(${(1 - Math.min(1, p1)) * 12}px)`, textShadow: "0 8px 40px rgba(0,0,0,0.8)" }}>POWERPLAY</div>
        <div style={{ marginTop: 14, whiteSpace: "nowrap" }}>
          <span style={{ ...display(112), color: THEME.text, display: "inline-block", marginRight: 34, opacity: Math.min(1, p2 * 1.8), transform: `translateY(${(1 - p2) * 50}px)` }}>YOUR</span>
          <span style={{ ...display(112), color: THEME.ui, display: "inline-block", opacity: Math.min(1, p3 * 1.8), transform: `scale(${interpolate(p3, [0, 1], [1.5, 1])})`,
            filter: `blur(${(1 - Math.min(1, p3)) * 12}px)`, textShadow: `0 0 50px ${alpha(THEME.teal, 0.75)}` }}>CART.</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", opacity: Math.min(1, only * 1.6) * (1 - logo * 0.0),
        transform: `translateY(${(1 - only) * 30}px)` }}>
        <span style={{ ...label(30), color: THEME.muted, letterSpacing: "0.4em" }}>ONLY AT</span>
      </div>
      <div style={{ position: "absolute", left: 140, right: 140, top: 1070, opacity: Math.min(1, logo * 1.6), transform: `scale(${interpolate(logo, [0, 1], [1.35, 1])})`,
        filter: `blur(${(1 - Math.min(1, logo)) * 10}px)` }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "1200 / 116" }}>
          <Img src={staticFile("logo-white.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: `drop-shadow(0 0 28px ${alpha(THEME.teal, 0.5)})` }} />
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${staticFile("logo-white.png")})`, WebkitMaskSize: "100% 100%",
            background: `linear-gradient(105deg, transparent ${glint * 100 - 12}%, rgba(255,255,255,0.95) ${glint * 100}%, transparent ${glint * 100 + 12}%)` }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", opacity: urlIn, transform: `translateY(${(1 - urlIn) * 16}px)` }}>
        <span style={{ ...label(34), color: THEME.text, letterSpacing: "0.3em" }}>{BRAND.url.toUpperCase()}</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1540, textAlign: "center", opacity: urlIn * 0.8 }}>
        <span style={{ ...label(20), color: THEME.dim }}>Not affiliated with Sportsbet · T&amp;Cs apply</span>
      </div>
    </AbsoluteFill>
  );
};
