// Kinetic headline: each word springs in on its spoken time (rise, de-blur), accent words in teal.
// The whole line leaves on `outAt` (quick lift + blur), so the next line can take its place.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { alpha, display, THEME } from "../theme";
import { sec } from "../timing";
import { clamp, sp, SNAPPY } from "./motion";

export type HWord = { text: string; at: number; accent?: boolean; size?: number };

export const Headline: React.FC<{ from: number; lines: HWord[][]; outAt?: number; size?: number; y: number; align?: "center" | "left"; dimFirst?: number }> =
  ({ from, lines, outAt, size = 108, y, align = "center", dimFirst }) => {
    const frame = useCurrentFrame() + sec(from); // absolute: word times are absolute
    const out = outAt === undefined ? 0 : interpolate(frame, [sec(outAt), sec(outAt) + 5], [0, 1], clamp);
    if (out >= 1) return null;
    const dim = dimFirst === undefined ? 0 : interpolate(frame, [sec(dimFirst), sec(dimFirst) + 8], [0, 1], clamp);
    return (
      <div style={{ position: "absolute", left: 70, right: 70, top: y, textAlign: align, opacity: 1 - out,
        transform: `translateY(${-out * 40}px)`, filter: `blur(${out * 8}px)` }}>
        {lines.map((line, li) => (
          <div key={li} style={{ whiteSpace: "nowrap", marginTop: li ? size * 0.06 : 0, opacity: li === 0 ? 1 - 0.55 * dim : 1 }}>
            {line.map((w, wi) => {
              const p = sp(frame, sec(w.at - 0.04), SNAPPY);
              const s = w.size ?? size;
              const col = w.accent ? THEME.ui : THEME.text;
              return (
                <span key={wi} style={{ ...display(s), color: col, display: "inline-block", marginRight: s * 0.22,
                  opacity: Math.min(1, p * 1.7), transform: `translateY(${(1 - p) * 52}px) scale(${interpolate(p, [0, 1], [1.12, 1])})`,
                  filter: `blur(${(1 - Math.min(1, p)) * 9}px)`,
                  textShadow: w.accent ? `0 0 38px ${alpha(THEME.teal, 0.6)}` : "0 6px 28px rgba(0,0,0,0.8)" }}>
                  {w.text}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
