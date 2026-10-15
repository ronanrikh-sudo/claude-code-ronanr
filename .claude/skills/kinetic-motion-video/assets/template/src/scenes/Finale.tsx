// BRAND FINALE ("ad" sign-off): a spark lands on the dark frame, an ivory world wipes
// out of it, the spark slides left as the wordmark wipes in, a dark terminal pill types
// the tagline, and app tiles orbit softly. Minimal copy; hold to the last frame.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ACCENT, BRAND, FONT, MONO } from "../config";
import { FINALE } from "../content";
import { sec } from "../timing";
import type { SceneProps } from "../Video";
import { Spark } from "../components/Icons";
import { AppTile } from "../components/ui";
import { clamp, easeOut, ramp, SNAPPY, SOFT, sp } from "../components/motion";

export const Finale: React.FC<SceneProps> = ({ from, to }) => {
  const A = sec(from);
  const frame = useCurrentFrame() + A;
  const end = sec(to);

  const sparkIn = sp(frame, A - 2, { damping: 13, stiffness: 120, mass: 0.8 });
  const wipe = easeOut(ramp(frame, A + 4, A + 18));
  const lock = sp(frame, A + 22, SOFT);
  const typeAt = A + 40;
  const term = sp(frame, typeAt - 6, SNAPPY);
  const typed = Math.floor(interpolate(frame, [typeAt, typeAt + 26], [0, BRAND.tagline.length], clamp));
  const sweep = ramp(frame, A + 32, A + 62);
  const camera = interpolate(frame, [A, end], [1.06, 1], clamp);

  // Lockup geometry: spark + wordmark centred as one unit.
  const wordW = BRAND.name.length * 92; // rough width at 172px; tune per wordmark
  const lockW = 185 + 65 + wordW;
  const left = 960 - lockW / 2;
  const sparkX = interpolate(lock, [0, 1], [960, left + 92]);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <AbsoluteFill style={{ background: BRAND.ivory, clipPath: `circle(${wipe * 1300}px at 50% 47%)` }}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 55% at 50% 45%, rgba(255,255,255,0.7), transparent 70%)" }} />
        <AbsoluteFill style={{ opacity: 0.5 * Math.sin(sweep * Math.PI),
          background: `linear-gradient(105deg, transparent ${sweep * 120 - 30}%, rgba(255,255,255,0.9) ${sweep * 120 - 15}%, transparent ${sweep * 120}%)` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${camera})` }}>
        {FINALE.tiles.map((o, i) => {
          const ang = ((-125 + i * 125 + (frame - A) * 0.35) * Math.PI) / 180;
          const p = sp(frame, typeAt + 8 + i * 4, SNAPPY);
          return (
            <div key={i} style={{ position: "absolute", left: 960 + Math.cos(ang) * 830, top: 480 + Math.sin(ang) * 390,
              transform: `translate(-50%,-50%) scale(${p})`, opacity: p * 0.95, filter: "drop-shadow(0 18px 30px rgba(20,20,19,0.25))" }}>
              <AppTile color={o.color} size={78}>{o.glyph}</AppTile>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: sparkX, top: 470,
          transform: `translate(-50%,-50%) scale(${sparkIn * interpolate(lock, [0, 1], [1.5, 1])})` }}>
          <Spark size={200} color={ACCENT} rotate={(frame - A) * 1.2 + 30 * (1 - sparkIn)} />
        </div>
        <div style={{ position: "absolute", left: left + 250, top: 470, transform: "translateY(-50%)", opacity: lock,
          clipPath: `inset(-20% ${100 - 100 * lock}% -20% 0)` }}>
          <div style={{ fontSize: 172, fontWeight: 760, letterSpacing: -7, color: BRAND.ink, whiteSpace: "nowrap", lineHeight: 1 }}>{BRAND.name}</div>
        </div>
        <div style={{ position: "absolute", left: 960, top: 720, transform: `translate(-50%, ${(1 - term) * 30}px)`, opacity: term,
          display: "flex", alignItems: "center", gap: 20, padding: "22px 36px", borderRadius: 18, background: BRAND.ink,
          fontFamily: MONO, fontSize: 40, color: BRAND.ivory, boxShadow: "0 30px 70px rgba(20,20,19,0.28)", minWidth: 700 }}>
          <span style={{ color: ACCENT, fontWeight: 700 }}>&gt;</span>
          <span>{BRAND.tagline.slice(0, typed)}</span>
          <span style={{ width: 20, height: 42, background: ACCENT, opacity: typed < BRAND.tagline.length || Math.floor(frame / 15) % 2 ? 1 : 0.15 }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
