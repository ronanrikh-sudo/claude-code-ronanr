// Reusable surfaces. All styling comes from theme.ts, so they re-skin with the direction.
import React from "react";
import { accent, FONTS, THEME } from "../theme";

/** Hero card: theme panel fill, hairline border, deep soft shadow; optional accent "live" glow. */
export const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; glow?: number }> = ({ children, style, glow = 0 }) => (
  <div style={{ borderRadius: THEME.radius, fontFamily: FONTS.body, background: THEME.panel,
    border: `1px solid ${glow > 0.05 ? accent(0.4 + 0.5 * glow) : THEME.lineStrong}`,
    boxShadow: `${THEME.shadow}${glow > 0.05 ? `, 0 0 ${60 * glow}px ${accent(0.35 * glow)}` : ""}`, ...style }}>
    {children}
  </div>
);

/** Pill chip, e.g. attachments or tags. */
export const Chip: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; style?: React.CSSProperties; strong?: boolean }> = ({ children, icon, style, strong }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 18px 10px 14px", borderRadius: 999,
    background: strong ? THEME.chipStrong : THEME.chip, border: `1px solid ${strong ? THEME.lineStrong : THEME.line}`,
    boxShadow: THEME.shadowSm, fontFamily: FONTS.body, fontSize: 24, fontWeight: 500, color: THEME.text, whiteSpace: "nowrap", ...style }}>
    {icon}{children}
  </div>
);

/** Coloured rounded-square tile with a glyph: stands in for an app or product without its logo. */
export const AppTile: React.FC<{ color: string; size?: number; children: React.ReactNode }> = ({ color, size = 40, children }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.22, background: color, display: "flex", alignItems: "center",
    justifyContent: "center", boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.18)", flexShrink: 0, color: "#fff", fontFamily: FONTS.body,
    fontWeight: 800, fontSize: size * 0.4 }}>
    {children}
  </div>
);

/** Big stat: label, huge tabular number, unit. Near-opaque so busy layers can't bleed through. */
export const Counter: React.FC<{ label: string; value: number; unit: string; icon?: React.ReactNode; style?: React.CSSProperties }> = ({ label, value, unit, icon, style }) => (
  <div style={{ padding: "26px 34px 30px", borderRadius: THEME.radius, background: THEME.hud, border: `1px solid ${THEME.lineStrong}`,
    boxShadow: THEME.shadow, fontFamily: FONTS.body, ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: THEME.muted, fontSize: 21, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>
      {icon}{label}
    </div>
    <div style={{ color: THEME.text, fontFamily: FONTS.display, fontSize: 128, fontWeight: 800, letterSpacing: -5, lineHeight: 1, marginTop: 10, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    <div style={{ color: THEME.text, fontSize: 40, fontWeight: 600, letterSpacing: -1, marginTop: 4 }}>{unit}</div>
  </div>
);
