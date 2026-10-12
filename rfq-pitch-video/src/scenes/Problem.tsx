import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "../config";
import { ATTACHMENTS, SUBJECTS, SUPPLIERS } from "../data";
import { S1, SCENES, sec, wordTime } from "../timing";
import { DocIcon, Envelope, Paperclip, SheetIcon } from "../components/Icons";
import { BOUNCY, clamp, easeInOut, rand, SNAPPY, sp } from "../components/motion";

const TOTAL_CARDS = 200;
const LAYERS = [
  { depth: 0.5, count: 100, blur: 2.2, dim: 0.5 },
  { depth: 0.72, count: 64, blur: 0.8, dim: 0.75 },
  { depth: 1, count: 36, blur: 0, dim: 1 },
];

type Card = { id: number; layer: number; x: number; y: number; rot: number; arrive: number };

// Arrival order: the flood accelerates, so the counter hits 200 while the VO is still on line one/two.
const FLOOD_START = S1.start - 0.1;
const FLOOD_END = S1.clauses[1].start + 1.4;
const arrival = (k: number) => FLOOD_START + (FLOOD_END - FLOOD_START) * Math.pow(k / (TOTAL_CARDS - 1), 0.72);

const CARDS: Card[] = (() => {
  const out: Card[] = [];
  let id = 0;
  LAYERS.forEach((L, li) => {
    for (let i = 0; i < L.count; i++, id++) {
      out.push({
        id,
        layer: li,
        x: -160 + rand(id * 3.1 + 1) * 2140,
        y: -60 + rand(id * 7.7 + 2) * 1120,
        rot: (rand(id * 5.3 + 3) - 0.5) * 9 * L.depth,
        arrive: 0,
      });
    }
  });
  // Shuffle arrival order across layers deterministically.
  const order = out.map((c) => c.id).sort((a, b) => rand(a * 13.7) - rand(b * 13.7));
  order.forEach((cid, k) => (out[cid].arrive = arrival(k)));
  return out;
})();

const ReplyCard: React.FC<{ c: Card; frame: number }> = ({ c, frame }) => {
  const p = sp(frame, c.arrive * FPS, SNAPPY);
  if (p <= 0.001) return null;
  const supplier = SUPPLIERS[c.id % SUPPLIERS.length];
  const subject = SUBJECTS[c.id % SUBJECTS.length];
  const att = ATTACHMENTS[c.id % ATTACHMENTS.length];
  const AttIcon = att.kind === "pdf" ? DocIcon : att.kind === "sheet" ? SheetIcon : Envelope;
  return (
    <div
      style={{
        position: "absolute",
        left: c.x,
        top: c.y,
        width: 380,
        height: 108,
        opacity: Math.min(1, p * 1.4),
        transform: `translateY(${(1 - p) * -70}px) scale(${0.88 + 0.12 * p}) rotate(${c.rot}deg)`,
        background: "linear-gradient(180deg, #161F33 0%, #111829 100%)",
        border: `1px solid ${C.lineHi}`,
        borderRadius: 14,
        boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
        padding: "14px 18px",
        fontFamily: FONT,
        display: "flex",
        gap: 14,
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>
        <Envelope size={22} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.text, fontSize: 19, fontWeight: 600, whiteSpace: "nowrap" }}>{supplier}</div>
        <div style={{ color: C.muted, fontSize: 15, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden" }}>{subject}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "3px 9px",
          borderRadius: 8, background: "rgba(255,255,255,0.06)", color: C.muted, fontSize: 13 }}>
          <AttIcon size={14} />
          {att.label}
        </div>
      </div>
    </div>
  );
};

// Attachment chips that pile up while the VO lists the formats.
const clause2 = S1.clauses[1];
const KEY_CHIPS = [
  { label: "quote.pdf", kind: "pdf", t: wordTime(clause2, "PDFs") + 0.05 },
  { label: "rfq.xlsx", kind: "sheet", t: wordTime(clause2, "spreadsheets") },
  { label: "prices in email body", kind: "mail", t: wordTime(clause2, "prices") },
] as const;
const EXTRA_CHIPS = Array.from({ length: 16 }, (_, i) => {
  const a = ATTACHMENTS[(i + 3) % ATTACHMENTS.length];
  return { label: a.label, kind: a.kind, t: KEY_CHIPS[2].t + 0.35 + i * 0.11 };
});
const CHIPS = [...KEY_CHIPS, ...EXTRA_CHIPS].map((c, i) => {
  // Pile: wide at the bottom, narrowing upward; key chips land on top, front and centre.
  const row = i < 3 ? 3 : Math.floor((i - 3) / 6);
  const col = i < 3 ? i - 1 : ((i - 3) % 6) - 2.5;
  const isKey = i < 3;
  return {
    ...c,
    isKey,
    x: 960 + col * (isKey ? 330 : 210) + (rand(i * 9.1) - 0.5) * 60,
    y: isKey ? 650 + (rand(i * 4.4) - 0.5) * 30 : 850 - row * 60 + (rand(i * 2.9) - 0.5) * 16,
    rot: (rand(i * 6.6) - 0.5) * (isKey ? 8 : 16),
    z: isKey ? 100 + i : i,
  };
});

const Chip: React.FC<{ c: (typeof CHIPS)[number]; frame: number }> = ({ c, frame }) => {
  const p = sp(frame, c.t * FPS, BOUNCY);
  if (p <= 0.001) return null;
  const Icon = c.kind === "pdf" ? DocIcon : c.kind === "sheet" ? SheetIcon : Envelope;
  const tone = c.kind === "pdf" ? "#E98A8A" : c.kind === "sheet" ? "#8FD6A8" : "#9FB3D9";
  const s = c.isKey ? 1.25 : 0.95;
  return (
    <div
      style={{
        position: "absolute",
        left: c.x,
        top: c.y,
        zIndex: c.z,
        transform: `translate(-50%, ${(1 - p) * -520}px) rotate(${c.rot * p}deg) scale(${s})`,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px 10px 14px",
        borderRadius: 999,
        background: c.isKey ? "#1B2438" : "#151D2E",
        border: `1px solid ${c.isKey ? "rgba(255,255,255,0.22)" : C.line}`,
        boxShadow: "0 14px 34px rgba(0,0,0,0.55)",
        fontFamily: FONT,
        fontSize: 24,
        fontWeight: 500,
        color: C.text,
        whiteSpace: "nowrap",
      }}
    >
      <Paperclip size={20} color={C.muted} />
      <Icon size={22} color={tone} />
      {c.label}
    </div>
  );
};

const Clock: React.FC<{ frame: number }> = ({ frame }) => {
  const t0 = S1.clauses[2].start * FPS - 4;
  const p = sp(frame, t0, SNAPPY);
  if (p <= 0.001) return null;
  const local = Math.max(0, frame - t0);
  // Hands accelerate: hours slip by.
  const minuteDeg = 0.9 * local * local + 30 * local;
  const hourDeg = minuteDeg / 12;
  return (
    <div style={{ position: "absolute", left: 1500, top: 330, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * p})`,
      opacity: p, zIndex: 300, fontFamily: FONT, textAlign: "center" }}>
      <div style={{ position: "absolute", inset: -140, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(3,5,11,0.92) 35%, rgba(3,5,11,0) 70%)" }} />
      <svg width={300} height={300} viewBox="-150 -150 300 300" style={{ position: "relative", display: "block" }}>
        <circle r={138} fill="#0D1426" stroke="rgba(255,255,255,0.22)" strokeWidth={3} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} y1={-120} x2={0} y2={i % 3 === 0 ? -100 : -110} stroke="rgba(255,255,255,0.5)"
            strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" transform={`rotate(${i * 30})`} />
        ))}
        {/* motion trail of the minute hand */}
        <path d={describeArc(Math.max(0, minuteDeg - 140), minuteDeg, 92)} stroke="rgba(255,255,255,0.12)" strokeWidth={20} fill="none" />
        <line x1={0} y1={0} x2={0} y2={-62} stroke={C.text} strokeWidth={9} strokeLinecap="round" transform={`rotate(${hourDeg})`} />
        <line x1={0} y1={14} x2={0} y2={-100} stroke={C.text} strokeWidth={5} strokeLinecap="round" transform={`rotate(${minuteDeg})`} />
        <circle r={9} fill={C.text} />
      </svg>
      <div style={{ position: "relative", marginTop: 18, fontSize: 34, fontWeight: 600, color: C.text, letterSpacing: -0.5 }}>
        Manual entry
      </div>
    </div>
  );
};

function describeArc(a0: number, a1: number, r: number) {
  const p = (a: number) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return `${(r * Math.cos(rad)).toFixed(2)} ${(r * Math.sin(rad)).toFixed(2)}`;
  };
  const sweep = Math.min(359, a1 - a0);
  return `M ${p(a1 - sweep)} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${p(a1)}`;
}

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const end = sec(SCENES.problem.to);
  const count = CARDS.filter((c) => frame >= c.arrive * FPS).length;
  const camera = interpolate(frame, [0, end - 10], [1, 1.09], clamp);
  const push = interpolate(frame, [end - 10, end], [0, 1], clamp);
  const scale = camera + 0.12 * easeInOut(push);
  const sat = interpolate(frame, [0, end], [0.65, 0.35], clamp);
  const counterIn = sp(frame, 2, SNAPPY);

  return (
    <AbsoluteFill style={{ filter: `saturate(${sat}) brightness(${1 - 0.06 * push})` }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        {LAYERS.map((L, li) => (
          <AbsoluteFill
            key={li}
            style={{
              transform: `translateX(${-frame * 0.9 * L.depth}px) translateY(${-frame * 0.25 * L.depth}px) scale(${L.depth})`,
              transformOrigin: "50% 50%",
              filter: L.blur ? `blur(${L.blur}px) brightness(${L.dim})` : undefined,
            }}
          >
            {CARDS.filter((c) => c.layer === li).map((c) => (
              <ReplyCard key={c.id} c={c} frame={frame} />
            ))}
          </AbsoluteFill>
        ))}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,5,11,0) 45%, rgba(3,5,11,0.55) 100%)" }} />
        {CHIPS.map((c, i) => (
          <Chip key={i} c={c} frame={frame} />
        ))}
      </AbsoluteFill>

      {/* HUD: reply counter */}
      <div style={{ position: "absolute", left: 90, top: 80, zIndex: 400, opacity: counterIn,
        transform: `translateY(${(1 - counterIn) * -20}px)`, fontFamily: FONT,
        padding: "26px 40px 30px", borderRadius: 24, background: "rgba(5,8,16,0.97)",
        border: `1px solid ${C.lineHi}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 22, fontWeight: 600,
          letterSpacing: 3, textTransform: "uppercase" }}>
          <Envelope size={24} /> Inbox
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 4 }}>
          <span style={{ color: C.text, fontSize: 132, fontWeight: 800, letterSpacing: -5, fontVariantNumeric: "tabular-nums",
            lineHeight: 1 }}>{count}</span>
          <span style={{ color: C.text, fontSize: 44, fontWeight: 600, letterSpacing: -1 }}>replies</span>
        </div>
      </div>

      <Clock frame={frame} />
    </AbsoluteFill>
  );
};
