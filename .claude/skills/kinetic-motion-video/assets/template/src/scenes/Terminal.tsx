// ONE PROMPT: clean cut to a dark terminal. A welcome box draws on, the prompt types
// itself, tool calls land as the VO describes them, and corner chips name the
// capabilities involved. Exits with a zoom-through into the next scene.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { accent, ACCENT, C, FONT, MONO } from "../config";
import { TERMINAL } from "../content";
import { sec } from "../timing";
import type { SceneProps } from "../Video";
import { Spark } from "../components/Icons";
import { AppTile } from "../components/ui";
import { clamp, easeInOut, ramp, SNAPPY, SOFT, sp } from "../components/motion";

const TERM_BG = "#1C1B1A";
const DIM = "#8F8B85";
const TEXT = "#E8E4DC";
const PROMPT_LEN = TERMINAL.prompt.reduce((n, s) => n + s.text.length, 0);

export const Terminal: React.FC<SceneProps> = ({ from, to }) => {
  const offset = sec(from);
  const frame = useCurrentFrame() + offset; // absolute frame, so VO times can be used directly
  const end = sec(to);
  const span = end - offset;

  const typeStart = offset + 4;
  const enter = offset + Math.round(span * 0.45);
  const typed = Math.floor(interpolate(frame, [typeStart, enter - 3], [0, PROMPT_LEN], clamp));
  const callAt = (i: number) => enter + 3 + Math.round(((end - enter) * i) / (TERMINAL.calls.length + 0.5));

  const win = sp(frame, offset, SOFT);
  const box = ramp(frame, offset + 2, offset + 14);
  const exit = easeInOut(ramp(frame, end - 9, end));

  let left = typed;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(2,4,9,0.6)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 60, opacity: 1 - 0.9 * exit,
        transform: `scale(${interpolate(frame, [offset, end], [1, 1.06], clamp) + 0.5 * exit})`, transformOrigin: "50% 60%" }}>
        <div style={{ width: 1540, borderRadius: 20, overflow: "hidden", background: TERM_BG, fontFamily: MONO, opacity: win,
          border: "1px solid rgba(255,255,255,0.12)", transform: `translateY(${(1 - win) * 40}px) scale(${0.96 + 0.04 * win})`,
          boxShadow: `0 50px 140px rgba(0,0,0,0.7), 0 0 160px ${accent(0.16)}` }}>
          <div style={{ height: 50, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", background: "#252422" }}>
            {[0, 1, 2].map((k) => <div key={k} style={{ width: 13, height: 13, borderRadius: 7, background: "rgba(255,255,255,0.22)" }} />)}
            <div style={{ flex: 1, textAlign: "center", color: DIM, fontFamily: FONT, fontSize: 18, marginRight: 60 }}>{TERMINAL.title}</div>
          </div>
          <div style={{ padding: "30px 44px 36px", fontSize: 26, lineHeight: "40px", color: TEXT, minHeight: 520 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 14, border: `2px solid ${ACCENT}`, borderRadius: 12,
              padding: "14px 26px", clipPath: `inset(0 ${100 - 100 * box}% 0 0)` }}>
              <Spark size={30} color={ACCENT} rotate={frame * 2} /> {TERMINAL.welcome}
            </div>
            <div style={{ marginTop: 22, border: `1px solid ${frame < enter ? "rgba(255,255,255,0.28)" : "transparent"}`, borderRadius: 10,
              padding: "10px 18px", display: "flex", gap: 16, color: frame < enter ? TEXT : DIM }}>
              <span>&gt;</span>
              <div>
                {TERMINAL.prompt.map((s, i) => {
                  const shown = s.text.slice(0, Math.max(0, left));
                  left -= s.text.length;
                  return <span key={i} style={{ color: s.accent ? ACCENT : s.strong ? "#fff" : undefined,
                    fontWeight: s.accent || s.strong ? 700 : 400, whiteSpace: s.accent ? "nowrap" : undefined }}>{shown}</span>;
                })}
                {frame < enter && <span style={{ display: "inline-block", width: 14, height: 30, background: TEXT, verticalAlign: "-5px" }} />}
              </div>
            </div>
            {TERMINAL.calls.map((c, i) => {
              const at = callAt(i);
              const p = sp(frame, at, SNAPPY);
              if (p <= 0.001) return null;
              const done = frame >= at + 12;
              return (
                <div key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 10}px)`, marginTop: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, fontWeight: 600 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 7, background: done ? "#5DBB7A" : ACCENT,
                      opacity: done ? 1 : 0.35 + 0.65 * Math.abs(Math.sin(frame / 5)) }} />
                    {c.title} <span style={{ color: DIM, fontWeight: 400 }}>{c.note}</span>
                  </div>
                  {done && (
                    <div style={{ display: "flex", gap: 14, marginLeft: 30, marginTop: 6, color: DIM }}>
                      <div style={{ width: 14, height: 18, borderLeft: `2px solid ${DIM}`, borderBottom: `2px solid ${DIM}`, marginTop: -4 }} />
                      {c.result}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", right: 48, top: 40, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, opacity: 1 - exit }}>
        {TERMINAL.chips.map((c, i) => {
          const p = sp(frame, callAt(i) - 4, SNAPPY);
          return (
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 22px 12px 14px", borderRadius: 16,
              fontFamily: FONT, opacity: p, transform: `translateX(${(1 - p) * 40}px)`, background: "rgba(14,18,28,0.96)",
              border: `1px solid ${C.lineHi}`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              <AppTile color={c.color} size={40}>{c.glyph}</AppTile>
              <div>
                <div style={{ color: C.text, fontSize: 22, fontWeight: 650 }}>{c.label}</div>
                <div style={{ color: C.muted, fontSize: 17 }}>{c.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
