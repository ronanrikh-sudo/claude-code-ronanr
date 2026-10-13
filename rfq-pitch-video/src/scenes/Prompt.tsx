import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { accent, ACCENT, C, FONT, MONO } from "../config";
import { FOLIO } from "../data";
import { S2, S3, SCENES, sec, wordTime } from "../timing";
import { AppTile, BranchIcon, LockIcon, Spark } from "../components/Icons";
import { clamp, easeInOut, ramp, SNAPPY, SOFT, sp } from "../components/motion";

const TERM_BG = "#1C1B1A";
const DIM = "#8F8B85";
const TEXT = "#E8E4DC";

type Span = { text: string; color?: string; weight?: number };
const PROMPT: Span[] = [
  { text: "Find all replies since 01/10 for Customer Reprice, Folio " },
  { text: FOLIO, color: "#fff", weight: 700 },
  { text: ". Run " },
  { text: "/rfq-integration-skill", color: ACCENT, weight: 700 },
  { text: " and save completed RFQs to \"RFQ Replies\"." },
];
const PROMPT_LEN = PROMPT.reduce((n, s) => n + s.text.length, 0);

const Typed: React.FC<{ chars: number; cursor: boolean }> = ({ chars, cursor }) => {
  let left = chars;
  return (
    <>
      {PROMPT.map((s, i) => {
        const shown = s.text.slice(0, Math.max(0, left));
        left -= s.text.length;
        return <span key={i} style={{ color: s.color ?? TEXT, fontWeight: s.weight ?? 400, whiteSpace: s.color ? "nowrap" : undefined }}>{shown}</span>;
      })}
      {cursor && <span style={{ display: "inline-block", width: 14, height: 30, background: TEXT, verticalAlign: "-5px", marginLeft: 1 }} />}
    </>
  );
};

/** Claude Code style tool call: ⏺ title, then an indented ⎿ result. */
const ToolCall: React.FC<{ frame: number; at: number; doneAt: number; title: React.ReactNode; result: React.ReactNode }> = ({
  frame, at, doneAt, title, result,
}) => {
  const p = sp(frame, at, SNAPPY);
  if (p <= 0.001) return null;
  const done = frame >= doneAt;
  const r = sp(frame, doneAt, SNAPPY);
  const blink = done ? 1 : 0.35 + 0.65 * Math.abs(Math.sin(frame / 5));
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 10}px)`, marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: done ? "#5DBB7A" : ACCENT, opacity: blink, flexShrink: 0 }} />
        <div style={{ color: TEXT, fontWeight: 600 }}>{title}</div>
      </div>
      {r > 0.001 && (
        <div style={{ display: "flex", gap: 14, marginLeft: 30, marginTop: 6, opacity: r, color: DIM }}>
          <div style={{ width: 14, height: 18, borderLeft: `2px solid ${DIM}`, borderBottom: `2px solid ${DIM}`, marginTop: -4 }} />
          <div>{result}</div>
        </div>
      )}
    </div>
  );
};

const Chip: React.FC<{ icon: React.ReactNode; label: string; sub: string; p: number; pulse: number }> = ({ icon, label, sub, p, pulse }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 22px 12px 14px", borderRadius: 16, fontFamily: FONT,
    opacity: p, transform: `translateX(${(1 - p) * 40}px) scale(${1 + 0.05 * pulse})`, transformOrigin: "100% 50%",
    background: `linear-gradient(180deg, rgba(20,24,36,0.96), rgba(12,15,24,0.96))`,
    border: `1px solid ${pulse > 0.05 ? accent(0.5 + 0.5 * pulse) : C.lineHi}`,
    boxShadow: `0 20px 50px rgba(0,0,0,0.5)${pulse > 0.05 ? `, 0 0 ${50 * pulse}px ${accent(0.45 * pulse)}` : ""}` }}>
    {icon}
    <div>
      <div style={{ color: C.text, fontSize: 22, fontWeight: 650 }}>{label}</div>
      <div style={{ color: C.muted, fontSize: 17, marginTop: 1 }}>{sub}</div>
    </div>
  </div>
);

export const Prompt: React.FC = () => {
  const offset = sec(SCENES.prompt.from);
  const frame = useCurrentFrame() + offset;
  const end = sec(SCENES.prompt.to);
  const c1 = S3.clauses[0];

  const typeStart = sec(S2.start) + 4;
  const enter = sec(S3.start) - 2;
  const typed = Math.floor(interpolate(frame, [typeStart, enter - 4], [0, PROMPT_LEN], clamp));

  const outlookAt = sec(wordTime(c1, "Outlook"));
  const readOnlyAt = sec(wordTime(c1, "read-only"));
  const skillAt = readOnlyAt + 10;
  const matched = Math.round(200 * ramp(frame, skillAt + 8, end - 4));

  const win = sp(frame, offset, SOFT);
  const box = ramp(frame, offset + 2, offset + 14);
  const camera = interpolate(frame, [offset, end], [1.0, 1.06], clamp);
  const exit = easeInOut(ramp(frame, end - 9, end));
  const pulse = Math.max(0, 1 - Math.abs(frame - readOnlyAt - 4) / 16);
  const working = frame >= enter && frame < end;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(2,4,9,0.6)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 60,
        transform: `scale(${camera + 0.5 * exit})`, opacity: 1 - 0.9 * exit, transformOrigin: "50% 60%" }}>
        <div style={{ width: 1540, borderRadius: 20, overflow: "hidden", background: TERM_BG, fontFamily: MONO,
          border: "1px solid rgba(255,255,255,0.12)", opacity: win,
          transform: `translateY(${(1 - win) * 40}px) scale(${0.96 + 0.04 * win})`,
          boxShadow: `0 50px 140px rgba(0,0,0,0.7), 0 0 160px ${accent(0.16)}` }}>
          <div style={{ height: 50, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", background: "#252422",
            borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c, opacity: 0.85 }} />)}
            <div style={{ flex: 1, textAlign: "center", color: DIM, fontFamily: FONT, fontSize: 18, marginRight: 60 }}>claude — ~/mmem/rfq</div>
          </div>
          <div style={{ padding: "30px 44px 36px", fontSize: 26, lineHeight: "40px", color: TEXT, minHeight: 600 }}>
            {/* welcome box */}
            <div style={{ display: "inline-block", border: `2px solid ${ACCENT}`, borderRadius: 12, padding: "14px 26px 16px",
              clipPath: `inset(0 ${100 - 100 * box}% 0 0)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Spark size={30} color={ACCENT} rotate={frame * 2} />
                <span>Welcome to <b style={{ color: "#fff" }}>Claude Code</b>!</span>
              </div>
              <div style={{ color: DIM, fontSize: 22, marginTop: 8, marginLeft: 44 }}>/help for help, /status for your current setup</div>
              <div style={{ color: DIM, fontSize: 22, marginLeft: 44 }}>cwd: ~/mmem/rfq</div>
            </div>
            {/* prompt input */}
            <div style={{ marginTop: 22, border: `1px solid ${frame < enter ? "rgba(255,255,255,0.28)" : "transparent"}`, borderRadius: 10,
              padding: "10px 18px", display: "flex", gap: 16, background: frame < enter ? "rgba(255,255,255,0.02)" : "transparent" }}>
              <span style={{ color: frame < enter ? TEXT : DIM }}>&gt;</span>
              <div style={{ color: frame < enter ? TEXT : DIM }}>
                <Typed chars={typed} cursor={frame < enter && typed < PROMPT_LEN + 1} />
              </div>
            </div>
            <ToolCall frame={frame} at={enter + 2} doneAt={outlookAt + 4}
              title={<span>outlook · search_messages <span style={{ color: DIM, fontWeight: 400 }}>(MCP, read-only)</span></span>}
              result={<span><span style={{ color: TEXT }}>200 replies</span> found since 01/10</span>} />
            <ToolCall frame={frame} at={skillAt} doneAt={end + 60}
              title={<span>Skill(<span style={{ color: ACCENT }}>rfq-integration-skill</span>)</span>}
              result={null} />
            {frame >= skillAt + 6 && (
              <div style={{ display: "flex", gap: 14, marginLeft: 30, marginTop: 6, color: DIM }}>
                <div style={{ width: 14, height: 18, borderLeft: `2px solid ${DIM}`, borderBottom: `2px solid ${DIM}`, marginTop: -4 }} />
                <div>Matching replies to RFQs… <span style={{ color: TEXT, fontVariantNumeric: "tabular-nums" }}>{matched}/200</span></div>
              </div>
            )}
            {working && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, color: ACCENT }}>
                <Spark size={24} color={ACCENT} rotate={frame * 9} />
                <span>Reading replies…</span>
                <span style={{ color: DIM, fontSize: 21 }}>(esc to interrupt)</span>
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>

      {/* What IT would enable: connector + skill */}
      <div style={{ position: "absolute", right: 48, top: 40, display: "flex", flexDirection: "column", alignItems: "flex-end",
        gap: 12, opacity: 1 - exit }}>
        <Chip p={sp(frame, outlookAt - 4, SNAPPY)} pulse={pulse}
          icon={<div style={{ position: "relative" }}><AppTile app="outlook" size={40} />
            <div style={{ position: "absolute", right: -6, bottom: -6, width: 22, height: 22, borderRadius: 11, background: ACCENT,
              display: "flex", alignItems: "center", justifyContent: "center" }}><LockIcon size={13} color="#fff" stroke={2.6} /></div></div>}
          label="Outlook connector" sub="Read-only access" />
        <Chip p={sp(frame, skillAt - 2, SNAPPY)} pulse={0}
          icon={<div style={{ width: 40, height: 40, borderRadius: 9, background: accent(0.2), display: "flex", alignItems: "center",
            justifyContent: "center" }}><BranchIcon size={24} color={ACCENT} stroke={2.2} /></div>}
          label="Shared skill" sub="rfq-integration-skill" />
      </div>
    </AbsoluteFill>
  );
};
