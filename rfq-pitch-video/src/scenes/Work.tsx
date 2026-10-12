import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { accent, ACCENT, C, FONT, MONO } from "../config";
import { CHECKS, MATCHES, SHEET_COLUMNS, SHEET_ROWS } from "../data";
import { S3, SCENES, sec, T } from "../timing";
import { CheckIcon, Envelope, SheetIcon } from "../components/Icons";
import { BOUNCY, clamp, easeInOut, ramp, SNAPPY, SOFT, sp } from "../components/motion";

const CARD_W = 540;
const CARD_H = 136;
const ROW_Y = [250, 452, 654];
const LEFT_X = 170;
const RIGHT_X = 1210;
// Template order on the right differs from reply order on the left, so matching is visible.
const TEMPLATE_ORDER = ["53140", "53082", "53117"];

const RefChip: React.FC<{ code: string; glow: number }> = ({ code, glow }) => (
  <span style={{ fontFamily: MONO, fontSize: 19, fontWeight: 600, padding: "5px 11px", borderRadius: 8,
    color: glow > 0.05 ? C.text : C.muted, whiteSpace: "nowrap",
    background: glow > 0.05 ? accent(0.18 + 0.3 * glow) : "rgba(255,255,255,0.06)",
    border: `1px solid ${glow > 0.05 ? accent(0.5 + 0.5 * glow) : C.line}`,
    boxShadow: glow > 0.05 ? `0 0 ${28 * glow}px ${accent(0.6 * glow)}` : "none" }}>
    [ref:{code}:ref]
  </span>
);

const Tile: React.FC<{ kind: "reply" | "template"; title: string; sub: string; code: string; glow: number;
  matched?: number; style?: React.CSSProperties }> = ({ kind, title, sub, code, glow, matched = 0, style }) => (
  <div style={{ position: "absolute", width: CARD_W, height: CARD_H, borderRadius: 18, padding: "20px 24px",
    display: "flex", gap: 18, alignItems: "flex-start", fontFamily: FONT,
    background: kind === "reply" ? "linear-gradient(180deg,#18223A,#121A2D)" : "linear-gradient(180deg,#101A2C,#0C1424)",
    border: `1px solid ${matched > 0.01 ? accent(0.4 + 0.5 * matched) : kind === "reply" ? C.lineHi : C.line}`,
    boxShadow: `0 24px 60px rgba(0,0,0,0.5)${matched > 0.01 ? `, 0 0 ${50 * matched}px ${accent(0.3 * matched)}` : ""}`,
    ...style }}>
    <div style={{ width: 52, height: 52, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center",
      background: kind === "reply" ? "rgba(255,255,255,0.07)" : "rgba(61,214,140,0.12)", color: kind === "reply" ? C.muted : C.ok }}>
      {kind === "reply" ? <Envelope size={28} /> : <SheetIcon size={28} />}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ color: C.text, fontSize: 26, fontWeight: 650, letterSpacing: -0.3 }}>{title}</div>
      <div style={{ color: C.muted, fontSize: 19, marginTop: 2 }}>{sub}</div>
      <div style={{ marginTop: 12 }}><RefChip code={code} glow={glow} /></div>
    </div>
  </div>
);

const Steps: React.FC<{ active: number; opacity: number }> = ({ active, opacity }) => (
  <div style={{ position: "absolute", top: 64, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14,
    opacity, fontFamily: FONT }}>
    {["Match", "Fill", "Check"].map((s, i) => (
      <div key={s} style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ padding: "9px 22px", borderRadius: 999, fontSize: 24, fontWeight: 600,
          color: i === active ? C.text : C.dim,
          background: i === active ? accent(0.22) : "rgba(255,255,255,0.03)",
          border: `1px solid ${i === active ? accent(0.7) : C.line}` }}>
          <span style={{ color: i === active ? ACCENT : C.dim, marginRight: 10, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>{s}
        </div>
        {i < 2 && <div style={{ width: 40, height: 2, background: i < active ? accent(0.7) : C.line }} />}
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------- spreadsheet

const ROW_H = 62;
const SHEET_W = 50 + SHEET_COLUMNS.reduce((n, c) => n + c.w, 0) + 2;

const Sheet: React.FC<{ frame: number; fillStart: number; highlight: Record<string, number>; saved: number }> = ({
  frame, fillStart, highlight, saved,
}) => (
  <div style={{ width: SHEET_W + 48, borderRadius: 22, overflow: "hidden", fontFamily: FONT,
    background: "linear-gradient(180deg,#0F1729,#0B1220)", border: `1px solid ${C.lineHi}`,
    boxShadow: `0 40px 120px rgba(0,0,0,0.65), 0 0 120px ${accent(0.1)}` }}>
    <div style={{ height: 76, display: "flex", alignItems: "center", gap: 16, padding: "0 26px",
      borderBottom: `1px solid ${C.line}` }}>
      <SheetIcon size={30} color={C.ok} />
      <div style={{ color: C.text, fontSize: 26, fontWeight: 650 }}>RFQ 53082 · Northline Electrical</div>
      <div style={{ color: C.dim, fontSize: 20 }}>Customer Reprice template</div>
      <div style={{ flex: 1 }} />
      {saved > 0.01 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px 7px 12px", borderRadius: 999,
          background: "rgba(61,214,140,0.16)", border: "1px solid rgba(61,214,140,0.6)", color: C.ok,
          fontSize: 21, fontWeight: 650, opacity: saved, transform: `scale(${0.8 + 0.2 * saved})` }}>
          <CheckIcon size={22} color={C.ok} stroke={2.6} progress={saved} /> Saved
        </div>
      )}
    </div>
    <div style={{ padding: "18px 24px 0" }}>
      <div style={{ position: "relative" }}>
        {/* header */}
        <div style={{ display: "flex", height: 52, alignItems: "center", color: C.muted, fontSize: 19, fontWeight: 600,
          borderBottom: `1px solid ${C.lineHi}` }}>
          <div style={{ width: 50 }} />
          {SHEET_COLUMNS.map((c) => (
            <div key={c.key} style={{ width: c.w, padding: "0 14px", color: c.input ? "#9FE3C1" : C.muted }}>{c.label}</div>
          ))}
        </div>
        {SHEET_ROWS.map((row, r) => (
          <div key={r} style={{ display: "flex", height: ROW_H, alignItems: "center", borderBottom: `1px solid ${C.line}` }}>
            <div style={{ width: 50, color: C.dim, fontSize: 18, fontVariantNumeric: "tabular-nums" }}>{r + 2}</div>
            {SHEET_COLUMNS.map((c, ci) => {
              if (!c.input) {
                return (
                  <div key={c.key} style={{ width: c.w, padding: "0 14px", color: c.key === "code" ? C.text : C.muted,
                    fontSize: 20, fontFamily: c.key === "code" ? MONO : FONT, whiteSpace: "nowrap", overflow: "hidden" }}>
                    {row[c.key]}
                  </div>
                );
              }
              const inputIdx = ci - 2;
              const start = fillStart + r * 7 + inputIdx * 2;
              const v = row[c.key];
              const n = Math.floor(interpolate(frame, [start, start + 5], [0, v.length], clamp));
              const flash = Math.max(0, 1 - Math.abs(frame - (start + 5)) / 7);
              const typing = frame >= start && frame < start + 5;
              return (
                <div key={c.key} style={{ width: c.w - 6, margin: "0 3px", height: ROW_H - 12, borderRadius: 8,
                  display: "flex", alignItems: "center", padding: "0 11px",
                  background: `rgba(61,214,140,${0.1 + 0.22 * flash})`,
                  border: `1px solid ${typing ? C.ok : C.inputCellLine}`,
                  color: C.text, fontSize: 20, fontWeight: 550, fontVariantNumeric: "tabular-nums",
                  fontFamily: c.key === "quote" ? MONO : FONT, whiteSpace: "nowrap" }}>
                  {v.slice(0, n)}
                  {typing && <span style={{ width: 2, height: 24, background: C.ok, marginLeft: 2 }} />}
                </div>
              );
            })}
          </div>
        ))}
        {/* column highlights during checks */}
        {SHEET_COLUMNS.map((c, ci) => {
          const h = highlight[c.key] ?? 0;
          if (h < 0.01) return null;
          const x = 50 + SHEET_COLUMNS.slice(0, ci).reduce((n, cc) => n + cc.w, 0);
          return (
            <div key={c.key} style={{ position: "absolute", left: x - 2, top: -4, width: c.w + 4, height: 52 + ROW_H * 5 + 8,
              borderRadius: 12, border: `3px solid ${accent(h)}`, boxShadow: `0 0 40px ${accent(0.45 * h)}`,
              background: accent(0.06 * h) }} />
          );
        })}
      </div>
      {/* sheet tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 64 }}>
        <div style={{ padding: "8px 18px", borderRadius: "0 0 10px 10px", fontSize: 18, fontWeight: 600, color: C.text,
          background: "rgba(255,255,255,0.06)",
          border: `${highlight.tabs > 0.01 ? 3 : 1}px solid ${highlight.tabs > 0.01 ? accent(highlight.tabs) : C.line}`,
          boxShadow: highlight.tabs > 0.01 ? `0 0 30px ${accent(0.5 * highlight.tabs)}` : "none" }}>
          RFQ Template
        </div>
      </div>
    </div>
  </div>
);

const Checklist: React.FC<{ frame: number; enter: number }> = ({ frame, enter }) => (
  <div style={{ width: 600, padding: "34px 38px 30px", borderRadius: 24, fontFamily: FONT,
    background: "linear-gradient(180deg,#121B2F,#0D1424)", border: `1px solid ${C.lineHi}`,
    boxShadow: "0 40px 100px rgba(0,0,0,0.6)", opacity: enter, transform: `translateX(${(1 - enter) * 80}px)` }}>
    <div style={{ color: C.muted, fontSize: 21, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 18 }}>
      Pre-save checks
    </div>
    {CHECKS.map((c, i) => {
      const tickF = sec(T.checkTicks[i]);
      const p = sp(frame, tickF, BOUNCY);
      const lit = frame >= tickF;
      return (
        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 20, height: 74,
          borderTop: i ? `1px solid ${C.line}` : "none" }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${lit ? ACCENT : C.lineHi}`, background: lit ? accent(0.25 + 0.6 * p) : "transparent",
            transform: `scale(${lit ? 0.85 + 0.15 * p : 1})`, boxShadow: lit ? `0 0 ${24 * p}px ${accent(0.6)}` : "none" }}>
            {lit && <CheckIcon size={28} color="#fff" stroke={3} progress={Math.min(1, p * 1.3)} />}
          </div>
          <div style={{ fontSize: 31, fontWeight: 600, letterSpacing: -0.4, color: lit ? C.text : C.muted }}>{c.label}</div>
        </div>
      );
    })}
  </div>
);

export const Work: React.FC = () => {
  const offset = sec(SCENES.work.from);
  const frame = useCurrentFrame() + offset;
  const A = sec(S3.clauses[1].start);
  const B = sec(S3.clauses[2].start);
  const Cc = sec(S3.clauses[3].start);
  const end = sec(SCENES.work.to);

  const step = frame < B - 4 ? 0 : frame < Cc - 4 ? 1 : 2;
  const stepsIn = sp(frame, offset, SNAPPY);

  // ---- beat (a): match
  const aOut = easeInOut(ramp(frame, B - 6, B + 6));
  const pairs = MATCHES.map((m, k) => {
    const glowAt = A + 1 + k * 9;
    const moveAt = A + 8 + k * 9;
    const glow = ramp(frame, glowAt, glowAt + 5) * (1 - 0.5 * ramp(frame, moveAt + 14, moveAt + 24));
    const move = sp(frame, moveAt, SNAPPY);
    const fromY = ROW_Y[k];
    const toY = ROW_Y[TEMPLATE_ORDER.indexOf(m.ref)];
    const dock = ramp(frame, moveAt + 10, moveAt + 16);
    return { m, k, glow, move, fromY, toY, dock };
  });
  const enterA = (k: number) => sp(frame, offset + k * 3, SNAPPY);

  // ---- beat (b): fill; the Northline template grows into the full sheet
  const grow = sp(frame, B - 4, { damping: 22, stiffness: 140, mass: 0.8 });
  const toCheck = sp(frame, Cc - 2, SOFT);
  const nlRow = ROW_Y[TEMPLATE_ORDER.indexOf("53082")];
  const sheetScaleFrom = CARD_W / (SHEET_W + 48);
  const fromCx = RIGHT_X + CARD_W / 2 + 14;
  const fromCy = nlRow + CARD_H / 2 + 14;
  const sheetScale = interpolate(grow, [0, 1], [sheetScaleFrom, 1]) * interpolate(toCheck, [0, 1], [1, 0.68]);
  const cx = interpolate(grow, [0, 1], [fromCx, 960]) + interpolate(toCheck, [0, 1], [0, -380]);
  const cy = interpolate(grow, [0, 1], [fromCy, 535]);
  const exit = easeInOut(ramp(frame, end - 8, end));

  const highlight: Record<string, number> = {};
  CHECKS.forEach((c, i) => {
    const t = sec(T.checkTicks[i]);
    highlight[c.col] = Math.max(highlight[c.col] ?? 0, ramp(frame, t - 5, t) * (1 - ramp(frame, t + 8, t + 16)));
  });
  const lastTick = sec(T.checkTicks[T.checkTicks.length - 1]);
  const saved = sp(frame, lastTick + 7, SNAPPY);

  const camera = interpolate(frame, [offset, end], [1.0, 1.035], clamp);

  return (
    <AbsoluteFill style={{ transform: `scale(${camera})` }}>
      <Steps active={step} opacity={stepsIn * (1 - exit)} />

      {/* (a) beams between matching ref codes */}
      {aOut < 1 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - aOut }}>
          <defs>
            <linearGradient id="beam" x1="0" x2="1">
              <stop offset="0" stopColor={ACCENT} stopOpacity="0.1" />
              <stop offset="0.5" stopColor={ACCENT} stopOpacity="0.9" />
              <stop offset="1" stopColor={ACCENT} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {pairs.map(({ k, glow, move, fromY, toY }) => {
            const vis = glow * (1 - move);
            if (vis < 0.02) return null;
            const x1 = LEFT_X + 96 + 90, y1 = fromY + 104;
            const x2 = RIGHT_X + 96 + 90, y2 = toY + 104;
            return (
              <path key={k} d={`M ${x1} ${y1} C ${x1 + 420} ${y1}, ${x2 - 420} ${y2}, ${x2} ${y2}`}
                stroke="url(#beam)" strokeWidth={4} fill="none" opacity={vis}
                strokeDasharray="1400" strokeDashoffset={1400 * (1 - glow)} />
            );
          })}
        </svg>
      )}
      {aOut < 1 && (
        <AbsoluteFill style={{ opacity: 1 - aOut }}>
          {TEMPLATE_ORDER.map((ref, i) => {
            const pair = pairs.find((p) => p.m.ref === ref)!;
            const e = enterA(i);
            return (
              <Tile key={ref} kind="template" title={`RFQ ${ref}`} sub="Reprice template" code={ref}
                glow={pair.glow} matched={pair.dock}
                style={{ left: RIGHT_X + (1 - e) * 60, top: ROW_Y[i], opacity: e }} />
            );
          })}
          {pairs.map(({ m, k, glow, move, fromY, toY }) => {
            const e = enterA(k);
            const x = interpolate(move, [0, 1], [LEFT_X - (1 - e) * 60, RIGHT_X + 14]);
            const y = interpolate(move, [0, 1], [fromY, toY + 14]);
            return (
              <Tile key={m.ref} kind="reply" title={m.supplier} sub={`RE: RFQ ${m.ref}`} code={m.ref} glow={glow}
                style={{ left: x, top: y, opacity: e, zIndex: 10,
                  transform: `rotate(${Math.sin(move * Math.PI) * -3}deg) scale(${1 - 0.04 * move})` }} />
            );
          })}
        </AbsoluteFill>
      )}

      {/* (b)+(c) spreadsheet */}
      {frame >= B - 4 && (
        <div style={{ position: "absolute", left: cx, top: cy, opacity: Math.min(1, grow * 3) * (1 - exit),
          transform: `translate(-50%,-50%) scale(${sheetScale * (1 - 0.6 * exit)})` }}>
          <Sheet frame={frame} fillStart={B + 6} highlight={highlight} saved={saved} />
        </div>
      )}
      {frame >= Cc - 2 && (
        <div style={{ position: "absolute", left: 1150, top: 535, transform: "translateY(-50%)", opacity: 1 - exit }}>
          <Checklist frame={frame} enter={toCheck} />
        </div>
      )}
    </AbsoluteFill>
  );
};
