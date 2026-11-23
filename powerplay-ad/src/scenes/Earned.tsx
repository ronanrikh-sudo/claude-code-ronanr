// S3 "Free tee, unlocked. You earned it." The camera has just dived into the free tee in the cart; here the
// Essentials Training Tee 2.0 materialises as a 3D ghost-mannequin packshot (real chest print and neck label,
// see README): teal shockwave + cube shards burst, a scan line reveals the tee top to bottom, it swings in
// perspective with a moving sheen, and EARNED IT. stamps on "earned".
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "../config";
import { alpha, display, label, THEME } from "../theme";
import { BOUNCY, clamp, rand, sp, SNAPPY, SOFT } from "../components/motion";
import { Headline } from "../components/Headline";
import { sec, word } from "../timing";
import type { SceneProps } from "../Video";

const CX = 540, CY = 860;              // tee centre (inside Meta's safe band)
const TEE_H = 640, TEE_W = Math.round(TEE_H * 1472 / 1796);

export const Earned: React.FC<SceneProps> = ({ from, to }) => {
  const frame = useCurrentFrame() + sec(from);
  const t = frame / FPS;
  const t0 = from + 0.05;                                    // the "unlocked" slam
  const fadeIn = interpolate(t, [from, t0 + 0.08], [0, 1], clamp);
  const pop = sp(frame, sec(t0), BOUNCY);
  const settle = sp(frame, sec(t0), SOFT);
  const reveal = interpolate(t, [t0, t0 + 0.5], [0, 1], clamp);
  const rotY = interpolate(settle, [0, 1], [70, 0]) + 9 * Math.sin((t - t0) * 1.4) * Math.min(1, settle);
  const rotX = 4 + 2 * Math.sin((t - t0) * 0.9);
  const float = Math.sin((t - t0) * 2.0) * 8;
  const ring = (k: number) => interpolate(t, [t0 + k * 0.12, t0 + 0.9 + k * 0.12], [0, 1], clamp);
  const tEarned = word("S3.1", "earned");
  const stamp = sp(frame, sec(tEarned - 0.04), BOUNCY);
  const tag = interpolate(t, [t0 + 0.4, t0 + 0.8], [0, 1], clamp);
  const exit = sp(frame, sec(to - 0.25), SOFT);
  const sheenX = 50 - rotY * 1.6;                            // highlight slides as the tee turns
  return (
    <AbsoluteFill style={{ opacity: fadeIn * (1 - exit), transform: `scale(${1 + 0.25 * exit})`, filter: exit > 0.02 ? `blur(${exit * 8}px)` : undefined }}>
      {/* light rays + glow */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${CX}px ${CY}px, ${alpha(THEME.teal, 0.42 * Math.min(1, pop))}, transparent 46%)` }} />
      <div style={{ position: "absolute", left: CX - 900, top: CY - 900, width: 1800, height: 1800, borderRadius: "50%", opacity: 0.22 * Math.min(1, pop),
        background: `repeating-conic-gradient(from ${(t - t0) * 14}deg, ${alpha(THEME.ui, 0.5)} 0deg 3deg, transparent 3deg 18deg)`,
        WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 60%)" }} />
      {/* shockwaves */}
      {[0, 1].map((k) => ring(k) > 0 && ring(k) < 1 && (
        <div key={k} style={{ position: "absolute", left: CX, top: CY, width: 10, height: 10, borderRadius: "50%",
          transform: `translate(-50%, -50%) scale(${1 + ring(k) * 140})`, border: `0.25px solid ${alpha(THEME.ui, 0.9 * (1 - ring(k)))}`,
          boxShadow: `0 0 ${2 * (1 - ring(k))}px ${alpha(THEME.teal, 1 - ring(k))}` }} />
      ))}
      {/* cube shards (the brand's cube motif) */}
      {Array.from({ length: 28 }).map((_, i) => {
        const ang = rand(i * 3.1) * Math.PI * 2, dist = 260 + rand(i * 7.7) * 520;
        const k = interpolate(t, [t0, t0 + 1.1], [0, 1], clamp), e = 1 - Math.pow(1 - k, 3);
        if (k <= 0 || k >= 1) return null;
        const size = 10 + rand(i * 5.3) * 22;
        return <div key={i} style={{ position: "absolute", left: CX + Math.cos(ang) * dist * e, top: CY + Math.sin(ang) * dist * e, width: size, height: size,
          transform: `translate(-50%, -50%) rotate(${rand(i) * 360 + k * 240}deg)`, background: i % 3 ? THEME.ui : "#fff", opacity: (1 - k) * 0.9,
          boxShadow: `0 0 14px ${alpha(THEME.teal, 0.8)}` }} />;
      })}
      {/* floor shadow */}
      <div style={{ position: "absolute", left: CX - 230, top: CY + TEE_H / 2 + 10, width: 460, height: 46, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(0,0,0,0.85), transparent 70%)", opacity: Math.min(1, settle), transform: `scaleX(${1 - Math.abs(rotY) / 140})` }} />
      {/* the tee */}
      <div style={{ position: "absolute", left: CX - TEE_W / 2, top: CY - TEE_H / 2 + float, width: TEE_W, height: TEE_H, perspective: 1300 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", transform: `scale(${interpolate(pop, [0, 1], [0.35, 1])}) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
          transformStyle: "preserve-3d", clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)` }}>
          <Img src={staticFile("img/ghost-essentials-2.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
            filter: `drop-shadow(0 0 28px ${alpha(THEME.teal, 0.55)}) drop-shadow(0 30px 40px rgba(0,0,0,0.7))` }} />
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${staticFile("img/ghost-essentials-2.png")})`, WebkitMaskSize: "100% 100%",
            background: `linear-gradient(100deg, transparent ${sheenX - 18}%, rgba(255,255,255,0.13) ${sheenX}%, transparent ${sheenX + 18}%)` }} />
          {reveal < 1 && <div style={{ position: "absolute", left: -20, right: -20, top: `${reveal * 100}%`, height: 6, marginTop: -3, background: THEME.ui,
            boxShadow: `0 0 30px 8px ${alpha(THEME.teal, 0.9)}` }} />}
        </div>
      </div>
      {/* FREE TEE / UNLOCKED. (FREE TEE carries over from the cart scene) */}
      <Headline from={from} y={360} size={116}
        lines={[[{ text: "FREE", at: from - 1, accent: true }, { text: "TEE", at: from - 1, accent: true }], [{ text: "UNLOCKED.", at: word("S3.0", "unlocked"), size: 104 }]]} />
      {/* EARNED IT. stamp */}
      <div style={{ position: "absolute", left: CX - 10, top: CY + 160, opacity: Math.min(1, stamp * 1.6), whiteSpace: "nowrap",
        transform: `rotate(-8deg) scale(${interpolate(stamp, [0, 1], [1.8, 1])})`, transformOrigin: "30% 50%", filter: `blur(${(1 - Math.min(1, stamp)) * 8}px)` }}>
        <div style={{ ...display(56), color: "#061412", background: THEME.ui, padding: "16px 26px 12px", borderRadius: 14, whiteSpace: "nowrap",
          boxShadow: `0 0 40px ${alpha(THEME.teal, 0.75)}, 0 18px 40px rgba(0,0,0,0.6)` }}>EARNED IT.</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: CY + TEE_H / 2 + 62, textAlign: "center", opacity: tag, transform: `translateY(${(1 - tag) * 16}px)` }}>
        <span style={{ ...label(24), color: THEME.text, letterSpacing: "0.28em" }}>ESSENTIALS TRAINING TEE 2.0</span>
      </div>
    </AbsoluteFill>
  );
};
