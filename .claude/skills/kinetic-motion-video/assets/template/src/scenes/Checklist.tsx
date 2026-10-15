// THE WORK: a light "real UI" card on the left (stand-in for whatever app the work
// happens in) and a dark glass checklist on the right. Each item ticks on its VO
// clause (T.ticks, shared with the tick SFX) and lights the matching line.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { accent, ACCENT, C, FONT } from "../config";
import { CHECKLIST } from "../content";
import { sec, T } from "../timing";
import type { SceneProps } from "../Video";
import { CheckIcon, PersonIcon } from "../components/Icons";
import { Panel } from "../components/ui";
import { BOUNCY, clamp, easeInOut, ramp, SNAPPY, SOFT, sp } from "../components/motion";

export const Checklist: React.FC<SceneProps> = ({ from, to }) => {
  const offset = sec(from);
  const frame = useCurrentFrame() + offset;
  const end = sec(to);
  const ticks = T.ticks.map(sec);

  const card = sp(frame, offset, { damping: 20, stiffness: 110, mass: 0.9 });
  const list = sp(frame, offset + 6, SOFT);
  const exit = easeInOut(ramp(frame, end - 8, end));
  const camera = interpolate(frame, [offset, end], [1, 1.04], clamp);
  const lineGlow = (i: number) => (ticks[i] === undefined ? 0 : ramp(frame, ticks[i] - 5, ticks[i]) * (1 - 0.6 * ramp(frame, ticks[i] + 8, ticks[i] + 18)));

  return (
    <AbsoluteFill style={{ transform: `scale(${camera})`, opacity: 1 - exit, fontFamily: FONT }}>
      {/* light app card */}
      <div style={{ position: "absolute", left: 140, top: 540, width: 860, perspective: 2400, opacity: Math.min(1, card * 2),
        transform: `translateY(-50%) rotateX(${(1 - card) * 14}deg) scale(${0.9 + 0.1 * card})` }}>
        <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 50px 140px rgba(0,0,0,0.6)", color: "#242424" }}>
          <div style={{ height: 46, background: "#2B3A55", display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
            {[0, 1, 2].map((k) => <div key={k} style={{ width: 11, height: 11, borderRadius: 6, background: "rgba(255,255,255,0.35)" }} />)}
          </div>
          <div style={{ padding: "30px 34px 36px" }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{CHECKLIST.preview.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, color: "#616161", fontSize: 19 }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: "#E8EBF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PersonIcon size={20} color="#2B3A55" />
              </div>
              Draft reply
            </div>
            {CHECKLIST.preview.lines.map((l, i) => {
              const g = lineGlow(i);
              const typed = Math.floor(interpolate(frame, [offset + 8 + i * 6, offset + 20 + i * 6], [0, l.length], clamp));
              return (
                <div key={i} style={{ marginTop: 18, padding: "10px 14px", borderRadius: 8, fontSize: 24,
                  background: `rgba(217,119,87,${0.1 * g})`, outline: `${g > 0.02 ? 3 : 0}px solid ${accent(g)}` }}>
                  {l.slice(0, typed)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* checklist */}
      <div style={{ position: "absolute", left: 1100, top: 540, transform: `translate(${(1 - list) * 90}px, -50%)`, opacity: list }}>
        <Panel style={{ width: 640, padding: "30px 32px 26px" }}>
          <div style={{ color: C.muted, fontSize: 19, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 12 }}>{CHECKLIST.heading}</div>
          {CHECKLIST.items.map((label, i) => {
            const t = ticks[i] ?? end + 999;
            const p = sp(frame, t, BOUNCY);
            const lit = frame >= t;
            const enter = sp(frame, offset + 10 + i * 4, SNAPPY);
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 18, height: 72, opacity: enter,
                transform: `translateX(${(1 - enter) * 30}px)`, borderTop: i ? `1px solid ${C.line}` : "none" }}>
                <div style={{ width: 42, height: 42, borderRadius: 21, display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${lit ? ACCENT : C.lineHi}`, background: lit ? accent(0.3 + 0.6 * p) : "transparent",
                  transform: `scale(${lit ? 0.85 + 0.15 * p : 1})`, boxShadow: lit ? `0 0 ${22 * p}px ${accent(0.6)}` : "none" }}>
                  {lit && <CheckIcon size={26} color="#fff" stroke={3} progress={Math.min(1, p * 1.3)} />}
                </div>
                <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.3, color: lit ? C.text : C.muted }}>{label}</div>
              </div>
            );
          })}
        </Panel>
      </div>
    </AbsoluteFill>
  );
};
