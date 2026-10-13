import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { accent, ACCENT, C, EXCEL_GREEN, FONT, MONO } from "../config";
import { CHECKS, SHEET_COLUMNS, SHEET_FLAGS, SHEET_ROWS, SheetKey } from "../data";
import { S3, SCENES, sec, T } from "../timing";
import { AppTile, CheckIcon } from "../components/Icons";
import { BOUNCY, clamp, easeInOut, ramp, SNAPPY, SOFT, sp } from "../components/motion";

const W = 1640;
const H = 800;
const ROW_HDR = 46;
const COL_HDR = 26;
const CELL_H = 50;
const INPUT_KEYS = SHEET_COLUMNS.filter((c) => c.input).map((c) => c.key);
const colX = (key: SheetKey) => {
  let x = ROW_HDR;
  for (const c of SHEET_COLUMNS) {
    if (c.key === key) return x;
    x += c.w;
  }
  return x;
};
const colW = (key: SheetKey) => SHEET_COLUMNS.find((c) => c.key === key)!.w;

// Excel's built-in Good / Neutral / Bad cell styles
const FLAG_STYLE = {
  ok: { bg: "#C6EFCE", fg: "#006100" },
  note: { bg: "#FFEB9C", fg: "#9C5700" },
  error: { bg: "#FFC7CE", fg: "#9C0006" },
} as const;

type Timing = { fill: number; flags: number };
const cellStart = (t: Timing, r: number, key: SheetKey) => t.fill + 4 + r * 7 + INPUT_KEYS.indexOf(key as never) * 2;

const ExcelWindow: React.FC<{ frame: number; t: Timing; highlight: Record<string, number>; saved: number }> = ({
  frame, t, highlight, saved,
}) => {
  // Which cell is "active" (being typed) for the selection box + formula bar
  let active: { r: number; key: SheetKey; value: string } = { r: 0, key: "cost", value: "" };
  SHEET_ROWS.forEach((row, r) => INPUT_KEYS.forEach((key) => {
    const s = cellStart(t, r, key);
    if (frame >= s) active = { r, key, value: row[key as keyof typeof row] };
  }));
  const flagsOn = frame >= t.flags;
  if (flagsOn) active = { r: 2, key: "flag", value: "Note" };

  return (
    <div style={{ width: W, height: H, borderRadius: 12, overflow: "hidden", background: "#fff", fontFamily: FONT,
      boxShadow: "0 50px 140px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)", position: "relative", color: "#242424" }}>
      {/* title bar */}
      <div style={{ height: 44, background: EXCEL_GREEN, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <span>AutoSave</span>
          <div style={{ width: 34, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.9)", position: "relative" }}>
            <div style={{ position: "absolute", right: 2, top: 2, width: 14, height: 14, borderRadius: 7, background: EXCEL_GREEN }} />
          </div>
        </div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 600 }}>
          RFQ_53082_Northline.xlsx
          <span style={{ fontWeight: 400, opacity: 0.85 }}>{saved > 0.5 ? "  ·  Saved to RFQ Replies" : "  ·  Excel"}</span>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: 15, background: "rgba(255,255,255,0.9)", color: EXCEL_GREEN, fontSize: 12,
          fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>MM</div>
      </div>
      {/* ribbon */}
      <div style={{ height: 36, background: "#F3F2F1", display: "flex", alignItems: "flex-end", gap: 26, padding: "0 18px", fontSize: 15 }}>
        {["File", "Home", "Insert", "Page Layout", "Formulas", "Data", "Review", "View"].map((tab) => (
          <div key={tab} style={{ paddingBottom: 7, borderBottom: tab === "Home" ? `3px solid ${EXCEL_GREEN}` : "3px solid transparent",
            fontWeight: tab === "Home" ? 600 : 400, color: tab === "Home" ? "#242424" : "#424242" }}>{tab}</div>
        ))}
      </div>
      <div style={{ height: 58, background: "#FAFAFA", borderBottom: "1px solid #E1DFDD", display: "flex", alignItems: "center",
        gap: 28, padding: "0 20px" }}>
        {[["Paste", 3], ["Calibri  11", 5], ["Wrap Text", 3], ["General", 4], ["Conditional Formatting", 3], ["Cell Styles", 3]].map(([label, n]) => (
          <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 28, borderRight: "1px solid #E1DFDD" }}>
            {Array.from({ length: Number(n) }, (_, k) => (
              <div key={k} style={{ width: 18, height: 18, borderRadius: 3, background: "#E1DFDD" }} />
            ))}
            <span style={{ fontSize: 13, color: "#616161", marginLeft: 4 }}>{String(label)}</span>
          </div>
        ))}
      </div>
      {/* formula bar */}
      <div style={{ height: 36, display: "flex", alignItems: "center", borderBottom: "1px solid #E1DFDD", fontSize: 15 }}>
        <div style={{ width: 96, height: "100%", display: "flex", alignItems: "center", padding: "0 12px", borderRight: "1px solid #E1DFDD" }}>
          {SHEET_COLUMNS.find((c) => c.key === active.key)!.letter}{active.r + 2}
        </div>
        <div style={{ padding: "0 14px", color: "#616161", fontStyle: "italic", fontFamily: "serif", fontSize: 17 }}>fx</div>
        <div style={{ fontFamily: active.key === "quote" ? MONO : FONT }}>{active.value}</div>
      </div>
      {/* grid */}
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", height: COL_HDR, background: "#F3F2F1", borderBottom: "1px solid #D1D1D1", fontSize: 14, color: "#616161" }}>
          <div style={{ width: ROW_HDR, borderRight: "1px solid #D1D1D1" }} />
          {SHEET_COLUMNS.map((c) => (
            <div key={c.key} style={{ width: c.w, textAlign: "center", lineHeight: `${COL_HDR}px`, borderRight: "1px solid #D1D1D1",
              background: c.key === active.key ? "#D3F0E0" : undefined, color: c.key === active.key ? EXCEL_GREEN : undefined,
              fontWeight: c.key === active.key ? 700 : 400 }}>{c.letter}</div>
          ))}
          <div style={{ width: 100, textAlign: "center", lineHeight: `${COL_HDR}px`, borderRight: "1px solid #D1D1D1" }}>I</div>
          <div style={{ width: 100, textAlign: "center", lineHeight: `${COL_HDR}px` }}>J</div>
        </div>
        {/* header row (row 1) */}
        <div style={{ display: "flex", height: CELL_H, borderBottom: "1px solid #D1D1D1", fontSize: 16, fontWeight: 700 }}>
          <div style={{ width: ROW_HDR, background: "#F3F2F1", color: "#616161", fontWeight: 400, textAlign: "center", lineHeight: `${CELL_H}px`,
            borderRight: "1px solid #D1D1D1" }}>1</div>
          {SHEET_COLUMNS.map((c) => (
            <div key={c.key} style={{ width: c.w, padding: "0 10px", lineHeight: `${CELL_H}px`, borderRight: "1px solid #E1DFDD",
              background: "#1E5B3A", color: "#fff", whiteSpace: "nowrap", boxSizing: "border-box" }}>{c.label}</div>
          ))}
        </div>
        {SHEET_ROWS.map((row, r) => (
          <div key={r} style={{ display: "flex", height: CELL_H, borderBottom: "1px solid #E1DFDD", fontSize: 17 }}>
            <div style={{ width: ROW_HDR, background: active.r === r ? "#D3F0E0" : "#F3F2F1", color: active.r === r ? EXCEL_GREEN : "#616161",
              textAlign: "center", lineHeight: `${CELL_H}px`, borderRight: "1px solid #D1D1D1", fontSize: 14 }}>{r + 2}</div>
            {SHEET_COLUMNS.map((c) => {
              const base: React.CSSProperties = { width: c.w, padding: "0 10px", lineHeight: `${CELL_H}px`, borderRight: "1px solid #E1DFDD",
                whiteSpace: "nowrap", overflow: "hidden", boxSizing: "border-box", position: "relative" };
              if (c.key === "flag") {
                const f = SHEET_FLAGS[r];
                const p = sp(frame, t.flags + r * 3, BOUNCY);
                const st = FLAG_STYLE[f.kind];
                return (
                  <div key={c.key} style={{ ...base, background: p > 0.01 ? st.bg : "#fff", color: st.fg, fontWeight: 700 }}>
                    <span style={{ display: "inline-block", opacity: Math.min(1, p * 1.5), transform: `scale(${0.6 + 0.4 * p})` }}>
                      {f.kind === "ok" ? "✓ " : f.kind === "note" ? "● " : "✕ "}{f.label}
                    </span>
                  </div>
                );
              }
              if (!c.input) {
                return <div key={c.key} style={{ ...base, fontFamily: c.key === "code" ? MONO : FONT, fontSize: c.key === "code" ? 16 : 17 }}>
                  {row[c.key as keyof typeof row]}</div>;
              }
              const v = row[c.key as keyof typeof row];
              const s = cellStart(t, r, c.key);
              const n = Math.floor(interpolate(frame, [s, s + 5], [0, v.length], clamp));
              const flash = Math.max(0, 1 - Math.abs(frame - (s + 5)) / 8);
              const isError = SHEET_FLAGS[r].kind === "error" && c.key === "cost";
              const isNote = SHEET_FLAGS[r].kind === "note" && c.key === "uom";
              const errOn = isError && flagsOn;
              return (
                <div key={c.key} style={{ ...base, background: errOn ? "#FFC7CE" : `rgba(${flash > 0 ? "169,208,142" : "226,239,218"},${flash > 0 ? 0.6 + 0.4 * flash : 1})`,
                  textAlign: c.key === "cost" ? "right" : "left", fontFamily: c.key === "quote" ? MONO : FONT, fontSize: 17,
                  fontVariantNumeric: "tabular-nums" }}>
                  {v.slice(0, n)}
                  {(errOn || (isNote && flagsOn)) && (
                    <div style={{ position: "absolute", right: 0, top: 0, width: 0, height: 0, borderLeft: "12px solid transparent",
                      borderTop: `12px solid ${errOn ? "#C4314B" : "#C55A11"}` }} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {/* empty rows below the data, like a real sheet */}
        {Array.from({ length: 6 }, (_, k) => (
          <div key={`e${k}`} style={{ display: "flex", height: CELL_H, borderBottom: "1px solid #EDEBE9" }}>
            <div style={{ width: ROW_HDR, background: "#F3F2F1", color: "#616161", textAlign: "center", lineHeight: `${CELL_H}px`,
              borderRight: "1px solid #D1D1D1", fontSize: 14 }}>{k + 7}</div>
            {SHEET_COLUMNS.map((c) => <div key={c.key} style={{ width: c.w, borderRight: "1px solid #EDEBE9" }} />)}
          </div>
        ))}
        {/* selection box */}
        <div style={{ position: "absolute", left: colX(active.key) - 1, top: COL_HDR + CELL_H * (active.r + 1) - 1,
          width: colW(active.key) + 2, height: CELL_H + 2, border: `3px solid ${EXCEL_GREEN}`, boxSizing: "border-box", pointerEvents: "none" }}>
          <div style={{ position: "absolute", right: -5, bottom: -5, width: 8, height: 8, background: EXCEL_GREEN, border: "1px solid #fff" }} />
        </div>
        {/* check highlights */}
        {Object.entries(highlight).map(([key, h]) => {
          if (h < 0.01 || key === "tabs") return null;
          const all = key === "all";
          const x = all ? ROW_HDR : colX(key as SheetKey);
          const w = all ? SHEET_COLUMNS.reduce((n, c) => n + c.w, 0) : colW(key as SheetKey);
          return (
            <div key={key} style={{ position: "absolute", left: x - 3, top: COL_HDR - 3, width: w + 6, height: CELL_H * 6 + 6,
              border: `4px solid ${accent(h)}`, borderRadius: 6, boxShadow: `0 0 40px ${accent(0.5 * h)}`, background: accent(0.07 * h) }} />
          );
        })}
      </div>
      {/* sheet tabs + status bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, height: 38, background: "#F3F2F1", borderTop: "1px solid #D1D1D1",
        display: "flex", alignItems: "center", gap: 6, padding: "0 12px", fontSize: 15 }}>
        <div style={{ padding: "6px 18px", background: "#fff", borderBottom: `3px solid ${EXCEL_GREEN}`, fontWeight: 600, color: EXCEL_GREEN,
          boxShadow: highlight.tabs > 0.01 ? `0 0 0 4px ${accent(highlight.tabs)}, 0 0 30px ${accent(0.5 * highlight.tabs)}` : "none",
          borderRadius: 3 }}>RFQ Template</div>
        <div style={{ padding: "4px 10px", color: "#616161", fontSize: 18 }}>+</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 28, background: EXCEL_GREEN, color: "#fff",
        display: "flex", alignItems: "center", padding: "0 14px", fontSize: 13 }}>
        <span>Ready</span><span style={{ flex: 1 }} /><span>100%</span>
      </div>
    </div>
  );
};

/** Excel-style note, authored by Claude. */
const Note: React.FC<{ p: number; x: number; y: number; text: string; tone: string }> = ({ p, x, y, text, tone }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 400, opacity: Math.min(1, p * 1.4), zIndex: 20,
    transform: `translateY(${(1 - p) * 16}px) scale(${0.9 + 0.1 * p})`, transformOrigin: "0% 0%",
    background: "#FFFFE1", border: "1px solid #8A8A8A", boxShadow: "4px 6px 18px rgba(0,0,0,0.25)", padding: "10px 14px",
    fontFamily: FONT, fontSize: 18, lineHeight: 1.35, color: "#242424" }}>
    <div style={{ position: "absolute", left: -26, top: 14, width: 26, height: 2, background: tone }} />
    <b>Claude:</b> {text}
  </div>
);

const Checklist: React.FC<{ frame: number; enter: number; ready: number }> = ({ frame, enter, ready }) => (
  <div style={{ width: 500, padding: "30px 32px 26px", borderRadius: 24, fontFamily: FONT,
    background: "linear-gradient(180deg,#141C2F,#0D1424)", border: `1px solid ${C.lineHi}`,
    boxShadow: "0 40px 100px rgba(0,0,0,0.6)", opacity: enter, transform: `translateX(${(1 - enter) * 90}px)` }}>
    <div style={{ color: C.muted, fontSize: 19, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 12 }}>
      Pre-save checks
    </div>
    {CHECKS.map((c, i) => {
      const tickF = sec(T.checkTicks[i]);
      const p = sp(frame, tickF, BOUNCY);
      const lit = frame >= tickF;
      return (
        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 18, height: 66, borderTop: i ? `1px solid ${C.line}` : "none" }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${lit ? ACCENT : C.lineHi}`, background: lit ? accent(0.3 + 0.6 * p) : "transparent",
            transform: `scale(${lit ? 0.85 + 0.15 * p : 1})`, boxShadow: lit ? `0 0 ${22 * p}px ${accent(0.6)}` : "none" }}>
            {lit && <CheckIcon size={26} color="#fff" stroke={3} progress={Math.min(1, p * 1.3)} />}
          </div>
          <div style={{ fontSize: 27, fontWeight: 600, letterSpacing: -0.3, color: lit ? C.text : C.muted }}>{c.label}</div>
        </div>
      );
    })}
    <div style={{ marginTop: 18, height: 64, borderRadius: 16, display: "flex", alignItems: "center", gap: 14, padding: "0 18px",
      opacity: ready, transform: `scale(${0.9 + 0.1 * ready})`, background: "rgba(61,214,140,0.14)", border: "1px solid rgba(61,214,140,0.55)" }}>
      <AppTile app="cm" size={40} />
      <div style={{ color: C.text, fontSize: 25, fontWeight: 700 }}>Ready for CM integration</div>
    </div>
  </div>
);

export const Work: React.FC = () => {
  const offset = sec(SCENES.work.from);
  const frame = useCurrentFrame() + offset;
  const end = sec(SCENES.work.to);
  const t: Timing = { fill: sec(S3.clauses[1].start), flags: sec(S3.clauses[2].start) - 2 };
  const ready = sec(S3.clauses[3].start);

  const enter = sp(frame, offset, { damping: 20, stiffness: 110, mass: 0.9 });
  const toCheck = sp(frame, ready - 4, SOFT);
  const exit = easeInOut(ramp(frame, end - 9, end));
  const camera = interpolate(frame, [offset, ready], [1, 1.04], clamp);
  const flagPush = sp(frame, t.flags, SOFT) * (1 - toCheck);

  const highlight: Record<string, number> = {};
  CHECKS.forEach((c, i) => {
    const tk = sec(T.checkTicks[i]);
    highlight[c.col] = Math.max(highlight[c.col] ?? 0, ramp(frame, tk - 5, tk) * (1 - ramp(frame, tk + 7, tk + 14)));
  });
  const lastTick = sec(T.checkTicks[T.checkTicks.length - 1]);
  const readyP = sp(frame, lastTick + 6, SNAPPY);
  const notes = (1 - ramp(frame, ready - 8, ready));

  const scale = interpolate(toCheck, [0, 1], [0.97, 0.66]) * (1 + 0.025 * flagPush) * (1 - 0.55 * exit);
  const cx = interpolate(toCheck, [0, 1], [960, 600]) - 25 * flagPush;
  const cy = 520;

  return (
    <AbsoluteFill style={{ transform: `scale(${camera})` }}>
      <div style={{ position: "absolute", left: cx, top: cy, perspective: 2600, opacity: Math.min(1, enter * 2) * (1 - exit) }}>
        <div style={{ position: "relative", transform: `translate(-50%,-50%) scale(${scale * (0.8 + 0.2 * enter)}) rotateX(${(1 - enter) * 14}deg)` }}>
          <ExcelWindow frame={frame} t={t} highlight={highlight} saved={readyP} />
          <Note p={sp(frame, t.flags + 8, SNAPPY) * notes} x={colX("uom") + colW("uom") + 30} y={44 + 36 + 58 + 36 + COL_HDR + CELL_H * 3 + 6}
            text="Supplier note: sold in 100 m rolls only" tone="#C55A11" />
          <Note p={sp(frame, t.flags + 16, SNAPPY) * notes} x={colX("cost") + colW("cost") + 30} y={44 + 36 + 58 + 36 + COL_HDR + CELL_H * 5 + 30}
            text="No price quoted for this line. Flagged for review." tone="#C4314B" />
        </div>
      </div>
      {frame >= ready - 6 && (
        <div style={{ position: "absolute", left: 1210, top: 540, transform: "translateY(-50%)", opacity: 1 - exit }}>
          <Checklist frame={frame} enter={toCheck} ready={readyP} />
        </div>
      )}
    </AbsoluteFill>
  );
};
