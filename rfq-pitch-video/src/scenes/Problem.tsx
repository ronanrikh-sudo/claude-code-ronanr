import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, FPS, OUTLOOK_BLUE } from "../config";
import { ATTACHMENTS, PREVIEWS, SUBJECTS, SUPPLIERS } from "../data";
import { S1, SCENES, sec, wordTime } from "../timing";
import { AppTile, DocIcon, Envelope, Paperclip, SearchIcon, SheetIcon } from "../components/Icons";
import { BOUNCY, clamp, easeInOut, ramp, rand, SNAPPY, sp } from "../components/motion";

const TOTAL = 200;
// The flood accelerates, so the inbox hits 200 while the VO is still on the second line.
const FLOOD_START = S1.start - 0.15;
const FLOOD_END = S1.clauses[1].start + 1.6;
const ARRIVALS = Array.from({ length: TOTAL }, (_, k) =>
  FLOOD_START + (FLOOD_END - FLOOD_START) * Math.pow(k / (TOTAL - 1), 0.62));

// ------------------------------------------------------------ background field
const BG_CARDS = Array.from({ length: 90 }, (_, id) => ({
  id,
  depth: id % 3 === 0 ? 0.55 : 0.4,
  x: -200 + rand(id * 3.1 + 1) * 2300,
  y: -80 + rand(id * 7.7 + 2) * 1200,
  rot: (rand(id * 5.3 + 3) - 0.5) * 8,
  arrive: ARRIVALS[Math.floor(rand(id * 9.9) * TOTAL)],
}));

const BgCard: React.FC<{ c: (typeof BG_CARDS)[number]; frame: number }> = ({ c, frame }) => {
  const p = sp(frame, c.arrive * FPS, SNAPPY);
  if (p <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: c.x, top: c.y, width: 380, height: 100, borderRadius: 14,
      opacity: Math.min(1, p * 1.4) * 0.8, transform: `translateY(${(1 - p) * -60}px) rotate(${c.rot}deg)`,
      background: "#151D30", border: `1px solid ${C.line}`, padding: "14px 18px", fontFamily: FONT, display: "flex", gap: 12 }}>
      <Envelope size={22} color={C.muted} />
      <div>
        <div style={{ color: C.text, fontSize: 18, fontWeight: 600 }}>{SUPPLIERS[c.id % SUPPLIERS.length]}</div>
        <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>{SUBJECTS[c.id % SUBJECTS.length]}</div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------- Outlook window
const WIN = { x: 410, y: 70, w: 1420, h: 860 };
const RAIL = 58;
const FOLDERS = 240;
const LIST = 520;
const ROW_H = 86;
const LIST_TOP = 48 + 96; // title bar + list header

const AVATAR_COLOURS = ["#C239B3", "#0078D4", "#CA5010", "#038387", "#8764B8", "#498205", "#DA3B01", "#005B70"];
const initials = (name: string) => name.split(" ").slice(0, 2).map((w) => w[0]).join("");

const MessageRow: React.FC<{ i: number; y: number; p: number }> = ({ i, y, p }) => {
  const supplier = SUPPLIERS[(i * 7) % SUPPLIERS.length];
  const hasAtt = i % 3 !== 2;
  const mins = 59 - (i % 60);
  return (
    <div style={{ position: "absolute", left: 0, top: y - (1 - Math.min(1, p)) * ROW_H, width: LIST, height: ROW_H,
      display: "flex", gap: 12, padding: "12px 16px 0 14px", borderBottom: "1px solid #EDEBE9", boxSizing: "border-box",
      background: `rgb(${Math.round(232 + 23 * Math.min(1, p))},${Math.round(241 + 14 * Math.min(1, p))},255)` }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: OUTLOOK_BLUE }} />
      <div style={{ width: 36, height: 36, borderRadius: 18, background: AVATAR_COLOURS[i % AVATAR_COLOURS.length],
        color: "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {initials(supplier)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#242424", whiteSpace: "nowrap" }}>{supplier}</div>
          <div style={{ flex: 1 }} />
          {hasAtt && <Paperclip size={15} color="#616161" />}
          <div style={{ fontSize: 13, color: "#616161" }}>9:{String(mins).padStart(2, "0")} am</div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: OUTLOOK_BLUE, whiteSpace: "nowrap", marginTop: 2 }}>
          {SUBJECTS[i % SUBJECTS.length]}
        </div>
        <div style={{ fontSize: 14, color: "#616161", whiteSpace: "nowrap", overflow: "hidden", marginTop: 1 }}>
          {PREVIEWS[i % PREVIEWS.length]}
        </div>
      </div>
    </div>
  );
};

const OutlookWindow: React.FC<{ frame: number; count: number }> = ({ frame, count }) => {
  // Messages slide down as new ones land on top; offset_i = sum of later arrivals' progress.
  const prog = ARRIVALS.map((a) => sp(frame, a * FPS, SNAPPY));
  const rows: React.ReactNode[] = [];
  let below = 0;
  for (let i = TOTAL - 1; i >= 0 && below < 11; i--) {
    if (prog[i] <= 0.001) continue;
    rows.unshift(<MessageRow key={i} i={i} y={below * ROW_H} p={prog[i]} />);
    below += prog[i];
  }
  const attPulse = ramp(frame, sec(S1.clauses[1].start) - 6, sec(S1.clauses[1].start));
  return (
    <div style={{ width: WIN.w, height: WIN.h, borderRadius: 14, overflow: "hidden", background: "#fff", fontFamily: FONT,
      boxShadow: "0 50px 140px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08)", position: "relative" }}>
      {/* title bar */}
      <div style={{ height: 48, background: OUTLOOK_BLUE, display: "flex", alignItems: "center", padding: "0 18px", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 4px)", gap: 3 }}>
          {Array.from({ length: 9 }, (_, k) => <div key={k} style={{ width: 4, height: 4, background: "#fff", borderRadius: 1 }} />)}
        </div>
        <div style={{ color: "#fff", fontSize: 19, fontWeight: 600 }}>Outlook</div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ width: 520, height: 32, borderRadius: 6, background: "rgba(255,255,255,0.88)", display: "flex",
            alignItems: "center", gap: 8, padding: "0 12px", color: "#616161", fontSize: 15 }}>
            <SearchIcon size={16} color="#616161" /> Search
          </div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: "#E8EBFA", color: OUTLOOK_BLUE, fontSize: 13,
          fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>MM</div>
      </div>
      <div style={{ display: "flex", height: WIN.h - 48 }}>
        {/* app rail */}
        <div style={{ width: RAIL, background: "#F0F0F0", display: "flex", flexDirection: "column", alignItems: "center",
          gap: 22, paddingTop: 18 }}>
          <div style={{ padding: 6, borderRadius: 6, background: "#E1E9F7" }}><Envelope size={22} color={OUTLOOK_BLUE} stroke={2} /></div>
          <DocIcon size={22} color="#616161" />
          <SheetIcon size={22} color="#616161" />
        </div>
        {/* folder pane */}
        <div style={{ width: FOLDERS, background: "#FAF9F8", padding: "18px 10px", boxSizing: "border-box",
          borderRight: "1px solid #EDEBE9" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#242424", padding: "4px 12px 10px" }}>Favourites</div>
          {[["Inbox", count], ["Sent Items", 0], ["Drafts", 0], ["Archive", 0], ["RFQ Replies", 0]].map(([name, n], k) => (
            <div key={String(name)} style={{ display: "flex", alignItems: "center", height: 38, padding: "0 12px", borderRadius: 6,
              background: k === 0 ? "#E1E9F7" : "transparent", fontSize: 16, color: "#242424", fontWeight: k === 0 ? 700 : 400 }}>
              <span style={{ flex: 1 }}>{name}</span>
              {Number(n) > 0 && <span style={{ color: OUTLOOK_BLUE, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{n}</span>}
            </div>
          ))}
        </div>
        {/* message list */}
        <div style={{ width: LIST, position: "relative", borderRight: "1px solid #EDEBE9" }}>
          <div style={{ height: 96, padding: "16px 18px 0", boxSizing: "border-box", borderBottom: "1px solid #EDEBE9" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#242424" }}>Inbox</div>
            <div style={{ display: "flex", gap: 20, marginTop: 10, fontSize: 15 }}>
              <span style={{ color: "#242424", fontWeight: 600, borderBottom: `3px solid ${OUTLOOK_BLUE}`, paddingBottom: 6 }}>Focused</span>
              <span style={{ color: "#616161" }}>Other</span>
            </div>
          </div>
          <div style={{ position: "absolute", top: 96, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>{rows}</div>
        </div>
        {/* reading pane */}
        <div style={{ flex: 1, background: "#FAF9F8", padding: 26 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: "24px 26px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#242424" }}>RE: RFQ 53082 – Customer Reprice</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: AVATAR_COLOURS[1], color: "#fff", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center" }}>NE</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#242424" }}>Northline Electrical</div>
                <div style={{ fontSize: 14, color: "#616161" }}>To: RFQ Team</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              {[["quote.pdf", DocIcon, "#C4314B"], ["rfq.xlsx", SheetIcon, "#107C41"]].map(([label, Icon, col]) => {
                const I = Icon as typeof DocIcon;
                return (
                  <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                    border: `1px solid ${attPulse > 0 ? "#C7C7C7" : "#E0E0E0"}`, borderRadius: 6, fontSize: 15, color: "#242424",
                    boxShadow: `0 0 0 ${3 * attPulse}px rgba(15,108,189,${0.25 * attPulse})` }}>
                    <I size={18} color={String(col)} /> {String(label)}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 16, color: "#424242", marginTop: 22, lineHeight: 1.6 }}>
              Hi team,<br />Please find our pricing below. Some lines are in the attached quote,
              others are listed here. Prices valid 30 days.
            </div>
            <div style={{ marginTop: 14, fontSize: 15, color: "#424242", borderTop: "1px solid #EDEBE9" }}>
              {[["NL-CT300-3", "$48.20 ea"], ["NL-CND25-4", "$6.85 ea"], ["NL-TPS25-100", "$189.00 / roll"]].map(([a, b]) => (
                <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #EDEBE9",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
                  <span>{a}</span><span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------- attachments pile up
const clause2 = S1.clauses[1];
const KEY_CHIPS = [
  { label: "quote.pdf", kind: "pdf", t: wordTime(clause2, "PDFs") },
  { label: "rfq.xlsx", kind: "sheet", t: wordTime(clause2, "spreadsheets") },
  { label: "prices in email body", kind: "mail", t: wordTime(clause2, "prices") },
] as const;
const EXTRA_CHIPS = Array.from({ length: 16 }, (_, i) => {
  const a = ATTACHMENTS[(i + 3) % ATTACHMENTS.length];
  return { label: a.label, kind: a.kind, t: KEY_CHIPS[2].t + 0.3 + i * 0.12 };
});
const CHIPS = [...KEY_CHIPS, ...EXTRA_CHIPS].map((c, i) => {
  const isKey = i < 3;
  const row = isKey ? 0 : Math.floor((i - 3) / 6);
  const col = isKey ? i - 1 : ((i - 3) % 6) - 2.5;
  return {
    ...c, isKey,
    fromX: 1100 + (rand(i * 2.2) - 0.5) * 700, fromY: 420 + (rand(i * 3.7) - 0.5) * 300,
    x: 1040 + col * (isKey ? 340 : 215) + (rand(i * 9.1) - 0.5) * 50,
    y: isKey ? 640 + (rand(i * 4.4) - 0.5) * 24 : 860 - row * 62 + (rand(i * 2.9) - 0.5) * 14,
    rot: (rand(i * 6.6) - 0.5) * (isKey ? 7 : 16),
    z: isKey ? 100 + i : i,
  };
});

const Chip: React.FC<{ c: (typeof CHIPS)[number]; frame: number }> = ({ c, frame }) => {
  const p = sp(frame, c.t * FPS, BOUNCY);
  if (p <= 0.001) return null;
  const Icon = c.kind === "pdf" ? DocIcon : c.kind === "sheet" ? SheetIcon : Envelope;
  const tone = c.kind === "pdf" ? "#E98A8A" : c.kind === "sheet" ? "#7FD3A0" : "#9FC3EC";
  const x = interpolate(p, [0, 1], [c.fromX, c.x]);
  const y = interpolate(p, [0, 1], [c.fromY, c.y]) - Math.sin(Math.min(1, p) * Math.PI) * 120;
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: c.z,
      transform: `translate(-50%,-50%) rotate(${c.rot * p}deg) scale(${(c.isKey ? 1.3 : 0.95) * (0.6 + 0.4 * Math.min(1, p))})`,
      display: "flex", alignItems: "center", gap: 10, padding: "10px 18px 10px 14px", borderRadius: 999,
      background: c.isKey ? "#1D2639" : "#161E2F", border: `1px solid ${c.isKey ? "rgba(255,255,255,0.24)" : C.line}`,
      boxShadow: "0 16px 36px rgba(0,0,0,0.55)", fontFamily: FONT, fontSize: 24, fontWeight: 500, color: C.text, whiteSpace: "nowrap" }}>
      <Paperclip size={20} color={C.muted} />
      <Icon size={22} color={tone} />
      {c.label}
    </div>
  );
};

// ------------------------------------------------------------------- the clock
const Clock: React.FC<{ frame: number }> = ({ frame }) => {
  const t0 = sec(S1.clauses[2].start) - 4;
  const p = sp(frame, t0, SNAPPY);
  if (p <= 0.001) return null;
  const local = Math.max(0, frame - t0);
  const minuteDeg = 0.7 * local * local + 30 * local;
  const hourDeg = minuteDeg / 12;
  const arc = (a0: number, a1: number, r: number) => {
    const pt = (a: number) => {
      const rad = ((a - 90) * Math.PI) / 180;
      return `${(r * Math.cos(rad)).toFixed(2)} ${(r * Math.sin(rad)).toFixed(2)}`;
    };
    const sweep = Math.min(359, a1 - a0);
    return `M ${pt(a1 - sweep)} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${pt(a1)}`;
  };
  return (
    <div style={{ position: "absolute", left: 1330, top: 400, zIndex: 300, opacity: p, fontFamily: FONT, textAlign: "center",
      transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * p})` }}>
      <div style={{ position: "absolute", inset: -170, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(3,5,11,0.94) 38%, rgba(3,5,11,0) 70%)" }} />
      <svg width={320} height={320} viewBox="-160 -160 320 320" style={{ position: "relative", display: "block" }}>
        <circle r={148} fill="#0D1426" stroke="rgba(255,255,255,0.22)" strokeWidth={3} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} y1={-130} x2={0} y2={i % 3 === 0 ? -108 : -118} stroke="rgba(255,255,255,0.5)"
            strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" transform={`rotate(${i * 30})`} />
        ))}
        <path d={arc(Math.max(0, minuteDeg - 140), minuteDeg, 98)} stroke="rgba(255,255,255,0.12)" strokeWidth={22} fill="none" />
        <line x1={0} y1={0} x2={0} y2={-66} stroke={C.text} strokeWidth={10} strokeLinecap="round" transform={`rotate(${hourDeg})`} />
        <line x1={0} y1={14} x2={0} y2={-108} stroke={C.text} strokeWidth={5} strokeLinecap="round" transform={`rotate(${minuteDeg})`} />
        <circle r={10} fill={C.text} />
      </svg>
      <div style={{ position: "relative", marginTop: 18, fontSize: 36, fontWeight: 650, color: C.text, letterSpacing: -0.5 }}>
        Manual entry
      </div>
    </div>
  );
};

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const end = sec(SCENES.problem.to);
  const count = ARRIVALS.filter((a) => frame >= a * FPS).length;
  const c3 = sec(S1.clauses[2].start);

  const winIn = sp(frame, 0, { damping: 22, stiffness: 90, mass: 1 });
  const recede = sp(frame, c3 - 6, { damping: 200, stiffness: 80 });
  const push = easeInOut(ramp(frame, end - 10, end));
  const camera = interpolate(frame, [0, end], [1, 1.06], clamp) + 0.14 * push;
  const sat = interpolate(frame, [0, sec(S1.clauses[1].start), end], [1, 0.75, 0.35], clamp);
  const rotY = interpolate(winIn, [0, 1], [-18, -7]) + 3 * recede;
  const rotX = interpolate(winIn, [0, 1], [10, 4]);
  const counterIn = sp(frame, 4, SNAPPY);

  return (
    <AbsoluteFill style={{ transform: `scale(${camera})`, filter: `saturate(${sat})` }}>
      <AbsoluteFill style={{ filter: "blur(2.5px) brightness(0.55)", transform: `translateX(${-frame * 0.5}px)` }}>
        {BG_CARDS.map((c) => <BgCard key={c.id} c={c} frame={frame} />)}
      </AbsoluteFill>

      <div style={{ position: "absolute", left: WIN.x, top: WIN.y, perspective: 2400 }}>
        <div style={{ opacity: winIn, transformOrigin: "40% 50%",
          transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) translateY(${(1 - winIn) * 80}px) scale(${1 - 0.06 * recede})`,
          filter: `brightness(${1 - 0.45 * recede})` }}>
          <OutlookWindow frame={frame} count={count} />
        </div>
      </div>

      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,5,11,0) 55%, rgba(3,5,11,0.6) 100%)" }} />
      {CHIPS.map((c, i) => <Chip key={i} c={c} frame={frame} />)}

      {/* Reply counter */}
      <div style={{ position: "absolute", left: 84, top: 310, zIndex: 400, opacity: counterIn, fontFamily: FONT,
        transform: `translateX(${(1 - counterIn) * -40}px)`, padding: "26px 34px 30px", borderRadius: 24,
        background: "rgba(5,8,16,0.96)", border: `1px solid ${C.lineHi}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AppTile app="outlook" size={30} />
          <span style={{ color: C.muted, fontSize: 21, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>Inbox</span>
        </div>
        <div style={{ color: C.text, fontSize: 128, fontWeight: 800, letterSpacing: -5, lineHeight: 1, marginTop: 10,
          fontVariantNumeric: "tabular-nums" }}>{count}</div>
        <div style={{ color: C.text, fontSize: 40, fontWeight: 600, letterSpacing: -1, marginTop: 4 }}>replies</div>
      </div>

      <Clock frame={frame} />
    </AbsoluteFill>
  );
};
