// Reusable surfaces in the house style: glass panels, chips, app tiles, HUD counters.
import React from "react";
import { accent, C, FONT } from "../config";

/** Dark glass card: subtle top-lit gradient, hairline border, deep soft shadow. */
export const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; glow?: number }> = ({ children, style, glow = 0 }) => (
  <div style={{ borderRadius: 24, fontFamily: FONT, background: "linear-gradient(180deg,#141C2F,#0D1424)",
    border: `1px solid ${glow > 0.05 ? accent(0.4 + 0.5 * glow) : C.lineHi}`,
    boxShadow: `0 40px 100px rgba(0,0,0,0.6)${glow > 0.05 ? `, 0 0 ${60 * glow}px ${accent(0.35 * glow)}` : ""}`, ...style }}>
    {children}
  </div>
);

/** Pill chip, e.g. attachments or tags. */
export const Chip: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; style?: React.CSSProperties; strong?: boolean }> = ({ children, icon, style, strong }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 18px 10px 14px", borderRadius: 999,
    background: strong ? "#1D2639" : "#161E2F", border: `1px solid ${strong ? "rgba(255,255,255,0.24)" : C.line}`,
    boxShadow: "0 16px 36px rgba(0,0,0,0.55)", fontFamily: FONT, fontSize: 24, fontWeight: 500, color: C.text, whiteSpace: "nowrap", ...style }}>
    {icon}{children}
  </div>
);

/** Coloured rounded-square tile with a white glyph: stands in for an app without using its logo. */
export const AppTile: React.FC<{ color: string; size?: number; children: React.ReactNode }> = ({ color, size = 40, children }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.22, background: color, display: "flex", alignItems: "center",
    justifyContent: "center", boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.18)", flexShrink: 0, color: "#fff", fontFamily: FONT,
    fontWeight: 800, fontSize: size * 0.4 }}>
    {children}
  </div>
);

/** Big HUD stat: label, huge tabular number, unit. */
export const Counter: React.FC<{ label: string; value: number; unit: string; icon?: React.ReactNode; style?: React.CSSProperties }> = ({ label, value, unit, icon, style }) => (
  <div style={{ padding: "26px 34px 30px", borderRadius: 24, background: "rgba(5,8,16,0.96)", border: `1px solid ${C.lineHi}`,
    boxShadow: "0 30px 80px rgba(0,0,0,0.6)", fontFamily: FONT, ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 21, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>
      {icon}{label}
    </div>
    <div style={{ color: C.text, fontSize: 128, fontWeight: 800, letterSpacing: -5, lineHeight: 1, marginTop: 10, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    <div style={{ color: C.text, fontSize: 40, fontWeight: 600, letterSpacing: -1, marginTop: 4 }}>{unit}</div>
  </div>
);
