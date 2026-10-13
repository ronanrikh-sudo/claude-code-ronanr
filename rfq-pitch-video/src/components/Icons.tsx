// Generic line icons drawn in code. No third-party marks.
import React from "react";

type P = { size?: number; color?: string; stroke?: number; style?: React.CSSProperties };

const Svg: React.FC<P & { children: React.ReactNode; vb?: string }> = ({
  size = 24, color = "currentColor", stroke = 1.8, style, children, vb = "0 0 24 24",
}) => (
  <svg width={size} height={size} viewBox={vb} fill="none" stroke={color} strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0, ...style }}>
    {children}
  </svg>
);

export const Envelope: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
    <path d="M3.8 7l8.2 6 8.2-6" />
  </Svg>
);

export const Paperclip: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M20 11.5l-7.6 7.6a4.8 4.8 0 01-6.8-6.8l7.9-7.9a3.2 3.2 0 014.5 4.5l-7.8 7.8a1.6 1.6 0 01-2.3-2.3l7.1-7.1" />
  </Svg>
);

export const DocIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4M9 12h6M9 15.5h6M9 9h2" />
  </Svg>
);

export const SheetIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="4" y="3.5" width="16" height="17" rx="2" />
    <path d="M4 9h16M4 14.5h16M10 3.5v17" />
  </Svg>
);

export const FolderIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M3 7.5a2 2 0 012-2h4.2l2 2.2H19a2 2 0 012 2v8.3a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </Svg>
);

export const ReportIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
  </Svg>
);

export const PersonIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.8 20a7.2 7.2 0 0114.4 0" />
  </Svg>
);

export const LockIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V7.8a4 4 0 018 0v2.7" />
  </Svg>
);

export const EyeIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </Svg>
);

export const BranchIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="6.5" cy="5.5" r="2" />
    <circle cx="6.5" cy="18.5" r="2" />
    <circle cx="17.5" cy="8.5" r="2" />
    <path d="M6.5 7.5v9M17.5 10.5c0 4-11 2.5-11 6" />
  </Svg>
);

export const CheckIcon: React.FC<P & { progress?: number }> = ({ progress = 1, ...p }) => (
  <Svg {...p}>
    <path d="M5 12.5l4.3 4.3L19 7.2" strokeDasharray={22} strokeDashoffset={22 * (1 - progress)} />
  </Svg>
);

export const TerminalIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.2" />
    <path d="M7 9.5l3 2.5-3 2.5M12.5 15h4.5" />
  </Svg>
);

export const DatabaseIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <ellipse cx="12" cy="6" rx="7.5" ry="3" />
    <path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
  </Svg>
);

export const SearchIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Svg>
);

/** Eight-ray asterisk in the spirit of the ✻ glyph the Claude Code CLI uses. */
export const Spark: React.FC<{ size?: number; color?: string; rotate?: number; style?: React.CSSProperties }> = ({
  size = 64, color = "#D97757", rotate = 0, style,
}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ display: "block", flexShrink: 0, ...style }}>
    <g transform={`rotate(${rotate})`} fill={color}>
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} transform={`rotate(${i * 45})`}
          d="M -5.5 -9 C -6.5 -22, -4.5 -38, 0 -46 C 4.5 -38, 6.5 -22, 5.5 -9 Z" />
      ))}
      <circle r={10} />
    </g>
  </svg>
);

/** App tiles: generic glyphs on each app's colour, so the UI reads as "our Outlook / our Excel". */
export const AppTile: React.FC<{ app: "outlook" | "excel" | "cm"; size?: number }> = ({ app, size = 40 }) => {
  const bg = app === "outlook" ? "#0F6CBD" : app === "excel" ? "#107C41" : "#2B3A55";
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.22, background: bg, display: "flex",
      alignItems: "center", justifyContent: "center", boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.18)", flexShrink: 0 }}>
      {app === "outlook" && <Envelope size={size * 0.62} color="#fff" stroke={2} />}
      {app === "excel" && <SheetIcon size={size * 0.62} color="#fff" stroke={2} />}
      {app === "cm" && <span style={{ color: "#fff", fontWeight: 800, fontSize: size * 0.4, letterSpacing: -0.5,
        fontFamily: "Inter, sans-serif" }}>CM</span>}
    </div>
  );
};
