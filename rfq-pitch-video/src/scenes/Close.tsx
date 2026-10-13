import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ACCENT, C, CLAUDE_INK, CLAUDE_IVORY, FONT, MONO } from "../config";
import { AD_START, S5, SCENES, sec, wordTime } from "../timing";
import { AppTile, Spark } from "../components/Icons";
import { clamp, easeInOut, easeOut, ramp, SNAPPY, SOFT, sp } from "../components/motion";

const Word: React.FC<{ text: string; at: number; frame: number; color?: string }> = ({ text, at, frame, color }) => {
  const p = sp(frame, at, SNAPPY);
  return (
    <span style={{ display: "inline-block", opacity: Math.min(1, p * 1.6), color, marginRight: "0.26em",
      transform: `translateY(${(1 - p) * 46}px)`, filter: `blur(${(1 - Math.min(1, p * 1.3)) * 8}px)` }}>{text}</span>
  );
};

const AD_LINE = "automate repeat processes";

export const Close: React.FC = () => {
  const offset = sec(SCENES.close.from);
  const frame = useCurrentFrame() + offset;
  const c1 = S5.clauses[0];
  const c2 = S5.clauses[1];
  const w = (word: string) => sec(wordTime(c1, word)) - 3;

  // ---- kinetic line
  const becomeAt = w("become");
  const minutesAt = w("minutes");
  const arrow = easeInOut(ramp(frame, becomeAt, minutesAt + 2));
  const dimLine1 = ramp(frame, minutesAt, minutesAt + 10);
  const kCam = interpolate(frame, [offset, sec(AD_START)], [1.04, 1], clamp);

  // ---- Claude Code ad
  const A = sec(AD_START);
  const sparkIn = sp(frame, A - 6, { damping: 13, stiffness: 120, mass: 0.8 });
  const wipe = easeOut(ramp(frame, A, A + 14));
  const lockAt = sec(wordTime(c2, "Claude")) - 2;
  const lock = sp(frame, lockAt, SOFT);
  const typeAt = sec(wordTime(c2, "automate")) - 4;
  const termIn = sp(frame, typeAt - 6, SNAPPY);
  const typed = Math.floor(interpolate(frame, [typeAt, typeAt + 26], [0, AD_LINE.length], clamp));
  const total = sec(SCENES.close.to);
  const adCam = interpolate(frame, [A, total], [1.06, 1], clamp);
  const sweep = ramp(frame, lockAt + 10, lockAt + 40);

  // Spark: lands centre on the dark frame, then slides left to sit beside the wordmark.
  const sparkX = interpolate(lock, [0, 1], [0, -545]);
  const sparkScale = interpolate(sparkIn, [0, 1], [0, 1]) * interpolate(lock, [0, 1], [1.5, 1]);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      {/* kinetic headline on the dark world */}
      {wipe < 1 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${kCam})`,
          opacity: 1 - ramp(frame, A - 8, A + 4), filter: `blur(${ramp(frame, A - 8, A + 4) * 10}px)` }}>
          <div style={{ fontSize: 124, fontWeight: 760, letterSpacing: -4.5, lineHeight: 1.12, textAlign: "center", color: C.text }}>
            <div style={{ opacity: 1 - 0.55 * dimLine1 }}>
              <Word text="Hours" at={w("Hours")} frame={frame} />
              <Word text="of" at={w("of data")} frame={frame} />
              <Word text="data" at={w("data")} frame={frame} />
              <Word text="entry" at={w("entry")} frame={frame} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 34, marginTop: 6 }}>
              <svg width={130} height={70} viewBox="0 0 130 70" style={{ opacity: arrow > 0 ? 1 : 0 }}>
                <path d="M6 35 H118" stroke={ACCENT} strokeWidth={10} strokeLinecap="round" strokeDasharray={112} strokeDashoffset={112 * (1 - arrow)} />
                <path d="M92 12 L120 35 L92 58" stroke={ACCENT} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none"
                  opacity={ramp(arrow, 0.6, 1)} />
              </svg>
              <div>
                <Word text="minutes" at={minutesAt} frame={frame} color={ACCENT} />
                <Word text="of" at={w("of review")} frame={frame} color={ACCENT} />
                <Word text="review." at={w("review")} frame={frame} color={ACCENT} />
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ivory wipe out of the spark */}
      {frame >= A && (
        <AbsoluteFill style={{ background: CLAUDE_IVORY, clipPath: `circle(${wipe * 1300}px at 50% 50%)` }}>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 55% at 50% 45%, rgba(255,255,255,0.7), transparent 70%)` }} />
          {/* light sweep */}
          <AbsoluteFill style={{ opacity: 0.5 * Math.sin(sweep * Math.PI),
            background: `linear-gradient(105deg, transparent ${sweep * 120 - 30}%, rgba(255,255,255,0.9) ${sweep * 120 - 15}%, transparent ${sweep * 120}%)` }} />
        </AbsoluteFill>
      )}

      {frame >= A - 8 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${frame >= A ? adCam : 1})` }}>
          {/* orbiting app tiles: the tools Claude Code connects to */}
          {[{ app: "outlook" as const, a: -125, r: 1 }, { app: "excel" as const, a: -20, r: 1 }, { app: "cm" as const, a: 150, r: 1 }].map((o, i) => {
            const ang = ((o.a + (frame - A) * 0.35) * Math.PI) / 180;
            const p = sp(frame, typeAt + 8 + i * 4, SNAPPY);
            return (
              <div key={o.app} style={{ position: "absolute", left: 960 + Math.cos(ang) * 830 * o.r, top: 480 + Math.sin(ang) * 390 * o.r,
                transform: `translate(-50%,-50%) scale(${p})`, opacity: p * 0.95,
                filter: "drop-shadow(0 18px 30px rgba(20,20,19,0.25))" }}>
                <AppTile app={o.app} size={78} />
              </div>
            );
          })}

          <div style={{ position: "absolute", left: 960 + sparkX, top: 470, transform: `translate(-50%,-50%) scale(${sparkScale})` }}>
            <Spark size={200} color={ACCENT} rotate={(frame - A) * 1.2 + 30 * (1 - sparkIn)} />
          </div>
          {/* wordmark */}
          <div style={{ position: "absolute", left: 960 - 395, top: 470, transform: "translateY(-50%)",
            clipPath: `inset(-20% ${100 - 100 * lock}% -20% 0)`, opacity: lock }}>
            <div style={{ fontSize: 172, fontWeight: 760, letterSpacing: -7, color: CLAUDE_INK, whiteSpace: "nowrap", lineHeight: 1 }}>
              Claude Code
            </div>
          </div>
          {/* terminal line */}
          <div style={{ position: "absolute", left: 960, top: 720, transform: `translate(-50%, ${(1 - termIn) * 30}px)`, opacity: termIn,
            display: "flex", alignItems: "center", gap: 20, padding: "22px 36px", borderRadius: 18, background: CLAUDE_INK,
            fontFamily: MONO, fontSize: 40, color: "#F0EEE6", boxShadow: "0 30px 70px rgba(20,20,19,0.28)", minWidth: 760 }}>
            <span style={{ color: ACCENT, fontWeight: 700 }}>&gt;</span>
            <span>{AD_LINE.slice(0, typed)}</span>
            <span style={{ width: 20, height: 42, background: ACCENT, opacity: Math.floor(frame / 15) % 2 || typed < AD_LINE.length ? 1 : 0.15 }} />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
