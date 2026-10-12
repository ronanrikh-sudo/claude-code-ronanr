import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { accent, ACCENT, C, FONT } from "../config";
import { S5, SCENES, sec, wordTime } from "../timing";
import { BranchIcon, LockIcon, PersonIcon } from "../components/Icons";
import { clamp, easeInOut, ramp, SNAPPY, SOFT, sp } from "../components/motion";

const Word: React.FC<{ text: string; at: number; frame: number; color?: string }> = ({ text, at, frame, color }) => {
  const p = sp(frame, at, SNAPPY);
  return (
    <span style={{ display: "inline-block", opacity: Math.min(1, p * 1.6), color,
      transform: `translateY(${(1 - p) * 46}px)`, filter: `blur(${(1 - Math.min(1, p * 1.3)) * 8}px)`, marginRight: "0.26em" }}>
      {text}
    </span>
  );
};

export const Close: React.FC = () => {
  const offset = sec(SCENES.close.from);
  const frame = useCurrentFrame() + offset;
  const c1 = S5.clauses[0];
  const c2 = S5.clauses[1];
  const w = (word: string) => sec(wordTime(c1, word)) - 3;

  const becomeAt = w("become");
  const minutesAt = w("minutes");
  const arrow = easeInOut(ramp(frame, becomeAt, minutesAt + 2));
  const dimLine1 = ramp(frame, minutesAt, minutesAt + 10);

  // Let "minutes of review." land and breathe; the end card arrives on "pilot".
  const cardAt = sec(wordTime(c2, "pilot")) - 4;
  const out = easeInOut(ramp(frame, cardAt - 5, cardAt + 5));
  const card = sp(frame, cardAt, SOFT);
  const tag = sp(frame, cardAt + 10, SNAPPY);
  const foot = sp(frame, cardAt + 18, SOFT);
  const camera = interpolate(frame, [offset, cardAt], [1.04, 1], clamp);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <AbsoluteFill style={{ opacity: 0.6 + 0.4 * card,
        background: `radial-gradient(circle 760px at 50% 48%, ${accent(0.14 * (0.5 + card))} 0%, transparent 70%)` }} />

      {/* Kinetic headline */}
      {out < 1 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - out,
          transform: `scale(${camera * (1 - 0.08 * out)}) translateY(${-40 * out}px)`, filter: `blur(${out * 10}px)` }}>
          <div style={{ fontSize: 124, fontWeight: 760, letterSpacing: -4.5, lineHeight: 1.12, textAlign: "center", color: C.text }}>
            <div style={{ opacity: 1 - 0.55 * dimLine1 }}>
              <Word text="Hours" at={w("Hours")} frame={frame} />
              <Word text="of" at={w("of data")} frame={frame} />
              <Word text="data" at={w("data")} frame={frame} />
              <Word text="entry" at={w("entry")} frame={frame} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 34, marginTop: 6 }}>
              <svg width={130} height={70} viewBox="0 0 130 70" style={{ opacity: arrow > 0 ? 1 : 0 }}>
                <path d="M6 35 H118" stroke={ACCENT} strokeWidth={10} strokeLinecap="round" strokeDasharray={112}
                  strokeDashoffset={112 * (1 - arrow)} />
                <path d="M92 12 L120 35 L92 58" stroke={ACCENT} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round"
                  fill="none" opacity={ramp(arrow, 0.6, 1)} />
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

      {/* End card */}
      {card > 0.001 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 30 }}>
          <div style={{ textAlign: "center", opacity: card, transform: `translateY(${(1 - card) * 40}px)` }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 24px", borderRadius: 999,
              fontSize: 26, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: ACCENT,
              background: accent(0.12), border: `1px solid ${accent(0.5)}`, opacity: tag, transform: `scale(${0.9 + 0.1 * tag})` }}>
              Next step
            </div>
            <div style={{ marginTop: 34, fontSize: 104, fontWeight: 760, letterSpacing: -4, color: C.text, lineHeight: 1.05 }}>
              20-supplier pilot
              <br />
              <span style={{ color: "#C8D2E4" }}>on one folio</span>
            </div>
            <div style={{ margin: "56px auto 0", width: 820 * foot, height: 1, background: C.lineHi }} />
            <div style={{ marginTop: 34, display: "flex", justifyContent: "center", alignItems: "center", gap: 22,
              fontSize: 29, fontWeight: 500, color: C.muted, opacity: foot }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><LockIcon size={28} color={ACCENT} />Read-only access</span>
              <span style={{ color: C.dim }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><PersonIcon size={28} color={ACCENT} />human sign-off</span>
              <span style={{ color: C.dim }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><BranchIcon size={28} color={ACCENT} />shared, version-controlled skill</span>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
