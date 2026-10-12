import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { accent, ACCENT, C, FONT, MONO } from "../config";
import { FOLIO } from "../data";
import { S2, S3, SCENES, sec, wordTime } from "../timing";
import { CheckIcon, LockIcon } from "../components/Icons";
import { clamp, easeInOut, ramp, SNAPPY, SOFT, sp } from "../components/motion";

type Span = { text: string; color?: string; weight?: number };
const LINE1: Span[] = [
  { text: "Find all replies since 01/10 for Customer Reprice, Folio " },
  { text: FOLIO, color: C.text, weight: 600 },
  { text: "." },
];
const LINE2: Span[] = [
  { text: "Run " },
  { text: "/rfq-integration-skill", color: ACCENT, weight: 600 },
  { text: " and save completed RFQs to " },
  { text: "\"RFQ Replies\"", color: "#9FE3C1" },
  { text: "." },
];
const len = (l: Span[]) => l.reduce((n, s) => n + s.text.length, 0);

const Typed: React.FC<{ spans: Span[]; chars: number; cursor: boolean }> = ({ spans, chars, cursor }) => {
  let left = chars;
  return (
    <>
      {spans.map((s, i) => {
        const shown = s.text.slice(0, Math.max(0, left));
        left -= s.text.length;
        return (
          <span key={i} style={{ color: s.color ?? "#C9D3E6", fontWeight: s.weight ?? 400 }}>{shown}</span>
        );
      })}
      {cursor && <span style={{ display: "inline-block", width: 16, height: 34, marginLeft: 2, background: ACCENT,
        verticalAlign: "-6px", borderRadius: 2 }} />}
    </>
  );
};

const OutputLine: React.FC<{ at: number; frame: number; done?: number; children: React.ReactNode }> = ({ at, frame, done, children }) => {
  const p = sp(frame, at, SNAPPY);
  if (p <= 0.001) return null;
  const isDone = done === undefined || frame >= done;
  const spin = (frame * 18) % 360;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: p, transform: `translateX(${(1 - p) * -16}px)`,
      color: "#C9D3E6", fontSize: 28, height: 48 }}>
      <div style={{ width: 30, display: "flex", justifyContent: "center" }}>
        {isDone ? (
          <CheckIcon size={28} color={C.ok} stroke={2.6} progress={ramp(frame, done ?? at, (done ?? at) + 6)} />
        ) : (
          <svg width={24} height={24} viewBox="0 0 24 24" style={{ transform: `rotate(${spin}deg)` }}>
            <circle cx={12} cy={12} r={9} stroke={accent(0.25)} strokeWidth={3} fill="none" />
            <path d="M12 3a9 9 0 019 9" stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>
      {children}
    </div>
  );
};

export const Prompt: React.FC = () => {
  const offset = sec(SCENES.prompt.from);
  const frame = useCurrentFrame() + offset; // absolute frame
  const end = sec(SCENES.prompt.to);

  // Typing: starts on "Now", finishes as the VO reaches "Claude reads".
  const typeStart = sec(S2.start) + 2;
  const typeEnd = sec(S3.start) - 3;
  const total = len(LINE1) + len(LINE2);
  const typed = Math.floor(interpolate(frame, [typeStart, typeEnd], [0, total], { ...clamp, easing: (x) => x }));
  const c1 = Math.min(typed, len(LINE1));
  const c2 = Math.max(0, typed - len(LINE1));
  const enter = sec(S3.start) + 2;

  const clause = S3.clauses[0];
  const outA = enter + 3;
  const outB = sec(wordTime(clause, "replies")) ;
  const readOnlyAt = sec(wordTime(clause, "read-only"));
  const outC = readOnlyAt + 6;

  const win = sp(frame, offset, SOFT);
  const camera = interpolate(frame, [offset, end], [1, 1.06], clamp);
  const exit = easeInOut(ramp(frame, end - 9, end));
  const badgeIn = sp(frame, offset + 4, SNAPPY);
  const pulse = Math.max(0, 1 - Math.abs(frame - readOnlyAt - 4) / 14);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(2,4,9,0.55)" }} />
      <AbsoluteFill style={{ transform: `scale(${camera + exit * 0.5})`, transformOrigin: "50% 62%", opacity: 1 - exit * 0.9,
        justifyContent: "center", alignItems: "center", paddingBottom: 70 }}>
        <div style={{ width: 1500, borderRadius: 22, overflow: "hidden", fontFamily: MONO,
          background: "linear-gradient(180deg, #0B101C 0%, #080C16 100%)",
          border: `1px solid ${C.lineHi}`,
          boxShadow: `0 40px 120px rgba(0,0,0,0.7), 0 0 140px ${accent(0.14)}`,
          opacity: win, transform: `translateY(${(1 - win) * 30}px) scale(${0.97 + 0.03 * win})` }}>
          <div style={{ height: 56, display: "flex", alignItems: "center", padding: "0 24px", gap: 10,
            borderBottom: `1px solid ${C.line}`, background: "rgba(255,255,255,0.025)" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.16)" }} />
            ))}
            <div style={{ flex: 1, textAlign: "center", color: C.dim, fontFamily: FONT, fontSize: 19, fontWeight: 500, marginRight: 60 }}>
              terminal
            </div>
          </div>
          <div style={{ padding: "40px 52px 44px", fontSize: 31, lineHeight: "50px", minHeight: 420 }}>
            <div style={{ display: "flex", gap: 18 }}>
              <span style={{ color: ACCENT, fontWeight: 700 }}>&gt;</span>
              <div><Typed spans={LINE1} chars={c1} cursor={typed < len(LINE1)} /></div>
            </div>
            {typed >= len(LINE1) && (
              <div style={{ display: "flex", gap: 18 }}>
                <span style={{ color: ACCENT, fontWeight: 700 }}>&gt;</span>
                <div><Typed spans={LINE2} chars={c2} cursor={frame < enter} /></div>
              </div>
            )}
            <div style={{ marginTop: 26, fontFamily: FONT }}>
              <OutputLine at={outA} frame={frame}>Mailbox connected <span style={{ color: C.muted }}>· read-only</span></OutputLine>
              <OutputLine at={outB} frame={frame}>200 replies found since 01/10</OutputLine>
              <OutputLine at={outC} frame={frame} done={end + 30}>Matching replies to RFQs…</OutputLine>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Corner badge: read-only mailbox access */}
      <div style={{ position: "absolute", right: 64, top: 56, opacity: badgeIn * (1 - exit),
        transform: `translateY(${(1 - badgeIn) * -16}px) scale(${1 + 0.06 * pulse})`, transformOrigin: "100% 0%",
        display: "flex", alignItems: "center", gap: 12, padding: "13px 22px", borderRadius: 999,
        fontFamily: FONT, fontSize: 24, fontWeight: 600, color: C.text,
        background: `linear-gradient(180deg, ${accent(0.2 + 0.15 * pulse)}, ${accent(0.1)})`,
        border: `1px solid ${accent(0.55 + 0.4 * pulse)}`,
        boxShadow: `0 0 ${30 + 50 * pulse}px ${accent(0.25 + 0.35 * pulse)}` }}>
        <LockIcon size={24} color={ACCENT} stroke={2.2} />
        Read-only mailbox access
      </div>
    </AbsoluteFill>
  );
};
