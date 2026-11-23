// S5 "Ends Sunday. Shop now at CAGECRAFT." Urgency line, a SHOP NOW button that presses on "Shop" with a teal
// shockwave (matching Meta's Shop Now button), the wordmark on "CAGECRAFT", the music's final hit on the end card.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "../config";
import { alpha, BRAND, display, label, THEME } from "../theme";
import { BOUNCY, clamp, push, sp, SNAPPY } from "../components/motion";
import { Bolt } from "../components/Shapes";
import { sec, T, word } from "../timing";
import type { SceneProps } from "../Video";

export const CTA: React.FC<SceneProps> = ({ from, to }) => {
  const frame = useCurrentFrame() + sec(from);
  const t = frame / FPS;
  const ends = sp(frame, sec(word("S5.0", "Ends") - 0.04), SNAPPY), sunday = sp(frame, sec(word("S5.0", "Sunday") - 0.04), BOUNCY);
  const btnIn = sp(frame, sec(word("S5.0", "Sunday") + 0.25), BOUNCY);
  const tShop = word("S5.1", "Shop");
  const press = interpolate(t, [tShop - 0.05, tShop + 0.03, tShop + 0.22], [1, 0.9, 1], clamp);
  const ring = interpolate(t, [tShop, tShop + 0.7], [0, 1], clamp);
  const logo = sp(frame, sec(word("S5.1", "CAGECRAFT") - 0.08), BOUNCY);
  const hit = T.marks.hit;
  const glint = interpolate(t, [hit, hit + 0.7], [-0.3, 1.3], clamp);
  const cam = push(frame, sec(from), sec(to), 0.05);
  const breathe = 0.5 + 0.5 * Math.sin(t * 2.6);
  return (
    <AbsoluteFill style={{ transform: `scale(${cam})` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center", opacity: 0.12 + 0.06 * breathe }}>
        <Bolt size={900} color={THEME.teal} glow={alpha(THEME.teal, 0.8)} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", whiteSpace: "nowrap" }}>
        <span style={{ ...display(100), color: THEME.text, display: "inline-block", marginRight: 30, opacity: Math.min(1, ends * 1.7), transform: `translateY(${(1 - ends) * 50}px)` }}>ENDS</span>
        <span style={{ ...display(100), color: THEME.ui, display: "inline-block", opacity: Math.min(1, sunday * 1.8), transform: `scale(${interpolate(sunday, [0, 1], [1.5, 1])})`,
          filter: `blur(${(1 - Math.min(1, sunday)) * 12}px)`, textShadow: `0 0 50px ${alpha(THEME.teal, 0.75)}` }}>SUNDAY</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 488, textAlign: "center", opacity: Math.min(1, sunday) * 0.9 }}>
        <span style={{ ...label(26), color: THEME.muted, letterSpacing: "0.3em" }}>UP TO 40% OFF · FREE GIFTS · POWERPLAY</span>
      </div>
      {/* SHOP NOW */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", justifyContent: "center", opacity: Math.min(1, btnIn * 1.7),
        transform: `translateY(${(1 - btnIn) * 60}px) scale(${press})` }}>
        {ring > 0 && ring < 1 && (
          <div style={{ position: "absolute", top: -10, width: 640 + ring * 260, height: 150 + ring * 260, marginTop: -ring * 130, borderRadius: 999,
            border: `4px solid ${alpha(THEME.ui, 1 - ring)}`, boxShadow: `0 0 40px ${alpha(THEME.teal, 0.6 * (1 - ring))}` }} />
        )}
        <div style={{ width: 640, height: 150, borderRadius: 999, background: THEME.ui, display: "flex", alignItems: "center", justifyContent: "center", gap: 22,
          boxShadow: `0 0 ${50 + 20 * breathe}px ${alpha(THEME.teal, 0.6)}, 0 20px 50px rgba(0,0,0,0.6)` }}>
          <Bolt size={58} color="#061412" />
          <span style={{ ...display(76), color: "#061412" }}>SHOP NOW</span>
        </div>
      </div>
      {/* wordmark */}
      <div style={{ position: "absolute", left: 170, right: 170, top: 860, opacity: Math.min(1, logo * 1.6), transform: `scale(${interpolate(logo, [0, 1], [1.35, 1])})`,
        filter: `blur(${(1 - Math.min(1, logo)) * 10}px)` }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "1200 / 116" }}>
          <Img src={staticFile("logo-white.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: `drop-shadow(0 0 26px ${alpha(THEME.teal, 0.5)})` }} />
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${staticFile("logo-white.png")})`, WebkitMaskSize: "100% 100%",
            background: `linear-gradient(105deg, transparent ${glint * 100 - 12}%, rgba(255,255,255,0.95) ${glint * 100}%, transparent ${glint * 100 + 12}%)` }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 985, textAlign: "center", opacity: Math.min(1, logo) }}>
        <span style={{ ...label(32), color: THEME.text, letterSpacing: "0.3em" }}>{BRAND.url.toUpperCase()}</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", opacity: Math.min(1, logo) * 0.8 }}>
        <div style={{ ...label(19), color: THEME.dim }}>Sale ends Sun 29 Nov, 11:59pm AEDT</div>
        <div style={{ ...label(19), color: THEME.dim, marginTop: 8 }}>Free shipping on AU orders · T&amp;Cs apply</div>
      </div>
    </AbsoluteFill>
  );
};
