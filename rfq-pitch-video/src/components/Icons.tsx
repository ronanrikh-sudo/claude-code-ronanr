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
