import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { accent, ACCENT, C, FONT } from "../config";
import { FOLIO, REPORT_ROWS } from "../data";
import { S4, SCENES, sec, wordTime } from "../timing";
import { AppTile, DatabaseIcon, EyeIcon, PersonIcon, ReportIcon, SheetIcon } from "../components/Icons";
import { clamp, easeInOut, easeOut, ramp, rand, SNAPPY, SOFT, sp } from "../components/motion";

const READY = 196;
const STATUS = { ok: C.ok, warn: C.warn, bad: C.bad } as const;

const Folder: React.FC<{ count: number; bump: number }> = ({ count, bump }) => {
  const layers = Math.min(9, Math.ceil((count / READY) * 9));
  return (
    <div style={{ position: "relative", width: 560, height: 400, fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 0, top: 30, width: 560, height: 360, borderRadius: 28,
        background: "linear-gradient(180deg,#2A2320,#1E1A18)", border: `1px solid ${C.lineHi}` }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 220, height: 70, borderRadius: "22px 22px 0 0",
        background: "#2A2320", border: `1px solid ${C.lineHi}`, borderBottom: "none" }} />
      {Array.from({ length: layers }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 50 + i * 6, top: 120 - i * 9, width: 440 - i * 4, height: 230, borderRadius: 14,
          background: i === layers - 1 ? "#EEF3EF" : `rgba(238,243,239,${0.35 + i * 0.06})`, border: "1px solid rgba(255,255,255,0.4)" }}>
          {i === layers - 1 && (
            <div style={{ display: "flex", gap: 10, padding: "16px 20px" }}>
              <SheetIcon size={30} color="#107C41" />
              <div style={{ flex: 1, display: "grid", gap: 8, paddingTop: 4 }}>
                {[0.9, 0.7, 0.8].map((w, j) => <div key={j} style={{ height: 7, width: `${w * 100}%`, borderRadius: 4, background: "rgba(16,124,65,0.35)" }} />)}
              </div>
            </div>
          )}
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, top: 150, width: 560, height: 250, borderRadius: 28,
        background: `linear-gradient(180deg, color-mix(in srgb, ${ACCENT} 96%, #fff), color-mix(in srgb, ${ACCENT} 72%, #1A0E08))`,
        boxShadow: `0 30px 90px rgba(0,0,0,0.5), 0 0 ${60 + 50 * bump}px ${accent(0.4)}`,
        transform: `perspective(900px) rotateX(${-8 - 4 * bump}deg)`, transformOrigin: "50% 100%",
        display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 40px 32px" }}>
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 26, fontWeight: 600 }}>RFQ Replies</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, color: "#fff" }}>
          <span style={{ fontSize: 104, fontWeight: 800, letterSpacing: -4, lineHeight: 1, fontVariantNumeric: "tabular-nums", minWidth: 190 }}>{count}</span>
          <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>ready</span>
        </div>
      </div>
    </div>
  );
};

const CmTile: React.FC<{ glow: number; fill: number }> = ({ glow, fill }) => (
  <div style={{ width: 420, padding: "34px 36px", borderRadius: 28, fontFamily: FONT, background: "linear-gradient(180deg,#151D31,#0E1424)",
    border: `1px solid ${glow > 0.05 ? accent(0.4 + 0.5 * glow) : C.lineHi}`,
    boxShadow: `0 40px 100px rgba(0,0,0,0.55), 0 0 ${80 * glow}px ${accent(0.35 * glow)}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <AppTile app="cm" size={72} />
      <div>
        <div style={{ color: C.text, fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>CM</div>
        <div style={{ color: C.muted, fontSize: 21 }}>Import queue</div>
      </div>
      <div style={{ flex: 1 }} />
      <DatabaseIcon size={40} color={C.muted} />
    </div>
    <div style={{ marginTop: 26, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 6, background: `linear-gradient(90deg, ${accent(0.6)}, ${ACCENT})` }} />
    </div>
    <div style={{ marginTop: 12, color: C.text, fontSize: 22, fontWeight: 600 }}>Ready to integrate</div>
  </div>
);

export const Output: React.FC = () => {
  const offset = sec(SCENES.output.from);
  const frame = useCurrentFrame() + offset;
  const end = sec(SCENES.output.to);
  const c1 = S4.clauses[0];
  const c2 = S4.clauses[1];
  const reportAt = sec(c2.start) - 3;
  const humanAt = sec(wordTime(c2, "human")) - 3;
  const furtherAt = sec(wordTime(c2, "further")) - 3;

  const fillFrom = sec(c1.start) + 2;
  const fillTo = sec(wordTime(c1, "integrate"));
  const count = Math.round(READY * easeOut(ramp(frame, fillFrom, fillTo)));
  const bump = frame > fillFrom && frame < fillTo ? Math.max(0, 1 - Math.abs(((frame - fillFrom) % 5) - 2) / 3) : 0;
  const intoCm = ramp(frame, sec(wordTime(c1, "straight")) - 6, sec(c1.end));

  const inA = sp(frame, offset, SNAPPY);
  const cmIn = sp(frame, offset + 8, SNAPPY);
  const up = sp(frame, reportAt - 6, SOFT);
  const report = sp(frame, reportAt, { damping: 20, stiffness: 120, mass: 0.9 });
  const human = sp(frame, humanAt, SNAPPY);
  const further = sp(frame, furtherAt, SNAPPY);
  const camera = interpolate(frame, [offset, end], [1, 1.04], clamp);
  const exit = easeInOut(ramp(frame, end - 8, end));

  const folder = { x: interpolate(up, [0, 1], [600, 700]), y: interpolate(up, [0, 1], [480, 180]), s: interpolate(up, [0, 1], [1, 0.4]) };
  const cm = { x: interpolate(up, [0, 1], [1360, 1180]), y: interpolate(up, [0, 1], [480, 180]), s: interpolate(up, [0, 1], [1, 0.52]) };

  // Files streaming into the folder, then pulses travelling folder -> CM
  const particles = Array.from({ length: 24 }, (_, i) => {
    const t0 = fillFrom - 6 + i * ((fillTo - fillFrom) / 24);
    const p = ramp(frame, t0, t0 + 13);
    if (p <= 0 || p >= 1 || up > 0.2) return null;
    const e = easeInOut(p);
    const sx = folder.x + (rand(i * 3.3) - 0.5) * 900;
    return (
      <div key={i} style={{ position: "absolute", left: interpolate(e, [0, 1], [sx, folder.x]),
        top: interpolate(e, [0, 1], [-80, folder.y]) - Math.sin(e * Math.PI) * 60, width: 60, height: 74, borderRadius: 10,
        background: "#EEF3EF", transform: `translate(-50%,-50%) scale(${1 - 0.5 * e}) rotate(${(1 - e) * (rand(i) - 0.5) * 50}deg)`,
        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", opacity: 1 - ramp(p, 0.85, 1) }}>
        <SheetIcon size={32} color="#107C41" />
      </div>
    );
  });
  const linkX0 = folder.x + 280 * folder.s;
  const linkX1 = cm.x - 210 * cm.s;
  const linkY0 = folder.y + 30 * folder.s;
  const pulses = Array.from({ length: 6 }, (_, i) => (frame / 22 + i / 6) % 1);

  return (
    <AbsoluteFill style={{ transform: `scale(${camera})`, opacity: 1 - exit, fontFamily: FONT }}>
      {particles}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: intoCm * (1 - 0.3 * up) }}>
        <line x1={linkX0} y1={linkY0} x2={linkX0 + (linkX1 - linkX0) * intoCm} y2={linkY0 + (cm.y - linkY0) * intoCm}
          stroke={accent(0.5)} strokeWidth={4} strokeDasharray="10 12" strokeDashoffset={-frame * 2} />
        {intoCm > 0.9 && pulses.map((q, i) => (
          <circle key={i} cx={linkX0 + (linkX1 - linkX0) * q} cy={linkY0 + (cm.y - linkY0) * q} r={7} fill={ACCENT} opacity={Math.sin(q * Math.PI)} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: folder.x, top: folder.y, opacity: inA,
        transform: `translate(-50%,-50%) scale(${(0.85 + 0.15 * inA) * folder.s})` }}>
        <Folder count={count} bump={bump} />
      </div>
      <div style={{ position: "absolute", left: cm.x, top: cm.y, opacity: cmIn,
        transform: `translate(-50%,-50%) scale(${(0.9 + 0.1 * cmIn) * cm.s})` }}>
        <CmTile glow={intoCm * (1 - up)} fill={intoCm} />
      </div>

      {report > 0.001 && (
        <div style={{ position: "absolute", left: 960, top: 640, width: 1180, opacity: Math.min(1, report * 1.5),
          transform: `translate(-50%, calc(-50% + ${(1 - report) * 300}px))` }}>
          <div style={{ borderRadius: 26, background: "linear-gradient(180deg,#141C2F,#0D1424)", border: `1px solid ${C.lineHi}`,
            boxShadow: "0 40px 120px rgba(0,0,0,0.6)", padding: "26px 32px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <ReportIcon size={34} color={ACCENT} stroke={2} />
              <div style={{ color: C.text, fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>Briefing report</div>
              <div style={{ flex: 1 }} />
              <div style={{ color: C.muted, fontSize: 21 }}>Folio {FOLIO}</div>
            </div>
            {REPORT_ROWS.map((r, i) => {
              const rp = sp(frame, reportAt + 5 + i * 3, SNAPPY);
              const flagged = r.status !== "ok";
              const hl = flagged ? human : 0;
              return (
                <div key={r.supplier} style={{ display: "flex", alignItems: "center", gap: 20, height: 74, padding: "0 22px", marginTop: 6,
                  borderRadius: 16, opacity: rp * (flagged ? 1 : 1 - 0.45 * human), transform: `translateX(${(1 - rp) * 40}px)`,
                  background: `rgba(255,255,255,${0.025 + 0.03 * hl})`,
                  border: `${hl > 0.01 ? 2 : 1}px solid ${hl > 0.01 ? accent(0.25 + 0.6 * hl) : C.line}`,
                  boxShadow: hl > 0.01 ? `0 0 ${36 * hl}px ${accent(0.22 * hl)}` : "none" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 11, background: STATUS[r.status], boxShadow: `0 0 18px ${STATUS[r.status]}` }} />
                  <div style={{ width: 330, color: C.text, fontSize: 27, fontWeight: 650, whiteSpace: "nowrap" }}>{r.supplier}</div>
                  <div style={{ flex: 1, color: flagged ? "#D6DEEC" : C.muted, fontSize: 25, whiteSpace: "nowrap" }}>{r.note}</div>
                  {flagged && further > 0.01 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, fontSize: 19, fontWeight: 700,
                      color: C.text, background: accent(0.22), border: `1px solid ${accent(0.8)}`, opacity: further,
                      transform: `scale(${0.8 + 0.2 * further})` }}>
                      <EyeIcon size={20} color={ACCENT} stroke={2.2} /> Further check
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {human > 0.001 && (
            <div style={{ position: "absolute", right: -40, top: -42, width: 84, height: 84, borderRadius: 42, opacity: human,
              transform: `scale(${0.7 + 0.3 * human})`, background: "linear-gradient(180deg,#2A3554,#1A2238)", border: `3px solid ${ACCENT}`,
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${accent(0.5)}` }}>
              <PersonIcon size={46} color={C.text} stroke={2} />
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
