// Icons drawn as SVG (emoji don't render headless). The bolt is the PowerPlay button's own glyph.
import React from "react";

export const BOLT_PATH = "M13.2 2 4.5 13.4h6.1L9.6 22l9.9-12.6h-6.4L13.2 2z";

export const Bolt: React.FC<{ size: number; color: string; glow?: string; style?: React.CSSProperties }> = ({ size, color, glow, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: "visible", filter: glow ? `drop-shadow(0 0 ${size * 0.18}px ${glow})` : undefined, ...style }}>
    <path d={BOLT_PATH} fill={color} />
  </svg>
);

export const Gift: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="8" width="17" height="4" rx="1" /><path d="M5 12v8h14v-8M12 8v12" />
    <path d="M12 8c-1.4-3.6-5.6-4.2-5.6-1.6C6.4 8 9.6 8 12 8zM12 8c1.4-3.6 5.6-4.2 5.6-1.6C17.6 8 14.4 8 12 8z" />
  </svg>
);

export const Truck: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" /><circle cx="6.5" cy="17" r="1.8" /><circle cx="17" cy="17" r="1.8" />
  </svg>
);
