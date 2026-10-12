import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { accent, ACCENT, C, FONT } from "../config";
import { FOLIO, REPORT_ROWS } from "../data";
import { S4, SCENES, sec, wordTime } from "../timing";
import { EyeIcon, PersonIcon, ReportIcon, SheetIcon } from "../components/Icons";
import { clamp, easeInOut, easeOut, ramp, rand, SNAPPY, SOFT, sp } from "../components/motion";

const READY = 196;
const STATUS = { ok: C.ok, warn: C.warn, bad: C.bad } as const;

const Folder: React.FC<{ frame: number; fillFrom: number; fillTo: number }> = ({ frame, fillFrom, fillTo }) => {
  const count = Math.round(READY * easeOut(ramp(frame, fillFrom, fillTo)));
  const bump = Math.max(0, 1 - Math.abs(((frame - fillFrom) % 5) - 2) / 3) * (frame < fillTo && frame > fillFrom ? 1 : 0);
  // Stack of file edges that grows inside the folder
  const layers = Math.min(9, Math.ceil((count / READY) * 9));
  return (
    <div style={{ position: "relative", width: 560, fontFamily: FONT }}>
      <div style={{ position: "relative", height: 400 }}>
        {/* back of folder */}
        <div style={{ position: "absolute", left: 0, top: 30, width: 560, height: 360, borderRadius: 28,
          background: "linear-gradient(180deg,#1B2A4A,#14203A)", border: `1px solid ${C.lineHi}` }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 220, height: 70, borderRadius: "22px 22px 0 0",
          background: "#1B2A4A", border: `1px solid ${C.lineHi}`, borderBottom: "none" }} />
        {/* files inside */}
        {Array.from({ length: layers }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 50 + i * 6, top: 120 - i * 9, width: 440 - i * 4, height: 230,
            borderRadius: 14, background: i === layers - 1 ? "#E9EEF7" : `rgba(233,238,247,${0.35 + i * 0.06})`,
            border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 -4px 14px rgba(0,0,0,0.25)" }}>
            {i === layers - 1 && (
              <div style={{ display: "flex", gap: 10, padding: "16px 20px", color: "#1E8F57" }}>
                <SheetIcon size={30} color="#1E8F57" />
                <div style={{ flex: 1, display: "grid", gap: 8, paddingTop: 4 }}>
                  {[0.9, 0.7, 0.8].map((w, j) => (
                    <div key={j} style={{ height: 7, width: `${w * 100}%`, borderRadius: 4, background: "rgba(30,143,87,0.35)" }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {/* front of folder */}
        <div style={{ position: "absolute", left: 0, top: 150, width: 560, height: 250, borderRadius: 28,
          background: `linear-gradient(180deg, color-mix(in srgb, ${ACCENT} 94%, #fff), color-mix(in srgb, ${ACCENT} 72%, #0A1430))`,
          boxShadow: `0 30px 90px rgba(0,0,0,0.5), 0 0 ${60 + 40 * bump}px ${accent(0.35)}`,
          transform: `perspective(900px) rotateX(${-8 - 4 * bump}deg)`, transformOrigin: "50% 100%",
          display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 40px 34px" }}>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 26, fontWeight: 600 }}>RFQ Replies</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, color: "#fff" }}>
            <span style={{ fontSize: 104, fontWeight: 800, letterSpacing: -4, lineHeight: 1, fontVariantNumeric: "tabular-nums",
              minWidth: 190 }}>{count}</span>
            <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Output: React.FC = () => {
  const offset = sec(SCENES.output.from);
  const frame = useCurrentFrame() + offset;
  const end = sec(SCENES.output.to);
  const c1 = S4.clauses[0];
  const c2 = S4.clauses[1];
  const reportAt = sec(c2.start) - 2;
  const humanAt = sec(wordTime(c2, "human")) - 2;

  const folderIn = sp(frame, offset, SNAPPY);
  const split = sp(frame, reportAt - 4, SOFT);
  const folderX = interpolate(split, [0, 1], [960, 480]);
  const report = sp(frame, reportAt, { damping: 20, stiffness: 120, mass: 0.9 });
  const human = sp(frame, humanAt, SNAPPY);
  const camera = interpolate(frame, [offset, end], [1, 1.05], clamp);
  const exit = easeInOut(ramp(frame, end - 8, end));

  // Files streaming into the folder
  const fillFrom = sec(c1.start) + 2;
  const fillTo = sec(c1.end) + 4;
  const particles = Array.from({ length: 26 }, (_, i) => {
    const t0 = fillFrom - 6 + i * ((fillTo - fillFrom) / 26);
    const p = ramp(frame, t0, t0 + 13);
    if (p <= 0 || p >= 1) return null;
    const e = easeInOut(p);
    const sx = folderX + (rand(i * 3.3) - 0.5) * 900;
    const x = interpolate(e, [0, 1], [sx, folderX]);
    const y = interpolate(e, [0, 1], [-80, 470]) - Math.sin(e * Math.PI) * 60;
    return (
      <div key={i} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${1 - 0.5 * e}) rotate(${(1 - e) * (rand(i) - 0.5) * 50}deg)`,
        width: 64, height: 78, borderRadius: 10, background: "#E9EEF7", opacity: 1 - ramp(p, 0.85, 1),
        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
        <SheetIcon size={34} color="#1E8F57" />
      </div>
    );
  });

  return (
    <AbsoluteFill style={{ transform: `scale(${camera})`, opacity: 1 - exit * 0.0 }}>
      {particles}
      <div style={{ position: "absolute", left: folderX, top: 500, transform: `translate(-50%,-50%) scale(${(0.85 + 0.15 * folderIn) * (1 - 0.06 * split)})`,
        opacity: folderIn * (1 - exit) }}>
        <Folder frame={frame} fillFrom={fillFrom} fillTo={fillTo} />
      </div>

      {/* Briefing report */}
      {report > 0.001 && (
        <div style={{ position: "absolute", left: 860, top: 500, transform: `translate(${(1 - report) * 500}px,-50%)`,
          opacity: Math.min(1, report * 1.5) * (1 - exit), width: 940, fontFamily: FONT }}>
          <div style={{ borderRadius: 26, background: "linear-gradient(180deg,#121B2F,#0D1424)", border: `1px solid ${C.lineHi}`,
            boxShadow: "0 40px 120px rgba(0,0,0,0.6)", padding: "30px 34px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <ReportIcon size={34} color={ACCENT} stroke={2} />
              <div style={{ color: C.text, fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>Briefing report</div>
              <div style={{ flex: 1 }} />
              <div style={{ color: C.muted, fontSize: 21, fontWeight: 500 }}>Folio {FOLIO}</div>
            </div>
            {REPORT_ROWS.map((r, i) => {
              const rp = sp(frame, reportAt + 5 + i * 3, SNAPPY);
              const flagged = r.status !== "ok";
              const hl = flagged ? human : 0;
              return (
                <div key={r.supplier} style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, height: 84,
                  padding: "0 20px", marginTop: 6, borderRadius: 16,
                  opacity: rp * (flagged ? 1 : 1 - 0.45 * human), transform: `translateX(${(1 - rp) * 40}px)`,
                  background: hl > 0.01 ? `rgba(255,255,255,${0.035 + 0.025 * hl})` : "rgba(255,255,255,0.025)",
                  border: `${hl > 0.01 ? 2 : 1}px solid ${hl > 0.01 ? accent(0.25 + 0.6 * hl) : C.line}`,
                  boxShadow: hl > 0.01 ? `0 0 ${36 * hl}px ${accent(0.22 * hl)}` : "none" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 11, background: STATUS[r.status],
                    boxShadow: `0 0 18px ${STATUS[r.status]}` }} />
                  <div style={{ width: 300, color: C.text, fontSize: 27, fontWeight: 650, letterSpacing: -0.3, whiteSpace: "nowrap" }}>{r.supplier}</div>
                  <div style={{ flex: 1, color: flagged ? "#D6DEEC" : C.muted, fontSize: 24, whiteSpace: "nowrap" }}>{r.note}</div>
                </div>
              );
            })}
          </div>
          {/* Human reviewer */}
          {human > 0.001 && (
            <div style={{ position: "absolute", right: -10, top: -86, display: "flex", alignItems: "center", gap: 14,
              opacity: human, transform: `translateY(${(1 - human) * 20}px) scale(${0.9 + 0.1 * human})`, transformOrigin: "100% 100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 22px", borderRadius: 999,
                background: accent(0.22), border: `1.5px solid ${accent(0.9)}`, color: C.text, fontSize: 26, fontWeight: 700,
                boxShadow: `0 0 40px ${accent(0.45)}` }}>
                <EyeIcon size={26} color={ACCENT} stroke={2.2} /> Human review
              </div>
              <div style={{ width: 66, height: 66, borderRadius: 33, background: "linear-gradient(180deg,#24314F,#18223A)",
                border: `2px solid ${ACCENT}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PersonIcon size={36} color={C.text} stroke={2} />
              </div>
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
