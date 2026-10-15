// KINETIC LINE: the payoff sentence as type. Words rise in on their VO timing with a
// blur-to-sharp spring; the first line dims as an arrow draws on the pivot word and
// the accent line lands. Hold it long enough to read before the next cut.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { display, FONTS, THEME } from "../theme";
import { KINETIC } from "../content";
import { sec, T, type Clause } from "../timing";
import type { SceneProps } from "../Video";
import { clamp, easeInOut, ramp, SNAPPY, sp } from "../components/motion";

const Word: React.FC<{ text: string; at: number; frame: number; color?: string }> = ({ text, at, frame, color }) => {
  const p = sp(frame, at, SNAPPY);
  return (
    <span style={{ display: "inline-block", marginRight: "0.26em", color, opacity: Math.min(1, p * 1.6),
      transform: `translateY(${(1 - p) * 46}px)`, filter: `blur(${(1 - Math.min(1, p * 1.3)) * 8}px)` }}>{text}</span>
  );
};

/** Find the clause (anywhere in the scene's time window) that contains a word. */
const clauseFor = (word: string, a: number, b: number): Clause | undefined =>
  T.segments.flatMap((s) => s.clauses).find((c) => c.start >= a - 0.2 && c.start < b && c.text.includes(word));

export const KineticLine: React.FC<SceneProps> = ({ from, to }) => {
  const offset = sec(from);
  const frame = useCurrentFrame() + offset;
  const end = sec(to);
  // Per-clause search cursor so repeated words ("of") resolve to the right occurrence.
  const cursors = new Map<Clause, number>();
  const at = (word: string) => {
    const c = clauseFor(word, from, to);
    if (!c) return offset + 6;
    const i = Math.max(0, c.text.indexOf(word, cursors.get(c) ?? 0));
    cursors.set(c, i + word.length);
    return sec(c.start + ((c.end - c.start) * i) / c.text.length) - 3;
  };
  const fromTimes = KINETIC.from.map(at);
  const pivotAt = at(KINETIC.pivot);
  const toTimes = KINETIC.to.map(at);
  const arrow = easeInOut(ramp(frame, pivotAt, toTimes[0] + 2));
  const dim = ramp(frame, toTimes[0], toTimes[0] + 10);
  const exit = ramp(frame, end - 8, end);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONTS.body, opacity: 1 - exit,
      filter: `blur(${exit * 10}px)`, transform: `scale(${interpolate(frame, [offset, end], [1.04, 1], clamp)})` }}>
      <div style={{ ...display(124), lineHeight: 1.12, textAlign: "center", color: THEME.text }}>
        <div style={{ opacity: 1 - 0.55 * dim }}>
          {KINETIC.from.map((w, i) => <Word key={i} text={w} at={fromTimes[i]} frame={frame} />)}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 34, marginTop: 6 }}>
          <svg width={130} height={70} viewBox="0 0 130 70" style={{ opacity: arrow > 0 ? 1 : 0 }}>
            <path d="M6 35 H118" stroke={THEME.accent} strokeWidth={10} strokeLinecap="round" strokeDasharray={112} strokeDashoffset={112 * (1 - arrow)} />
            <path d="M92 12 L120 35 L92 58" stroke={THEME.accent} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={ramp(arrow, 0.6, 1)} />
          </svg>
          <div>{KINETIC.to.map((w, i) => <Word key={i} text={w} at={toTimes[i]} frame={frame} color={THEME.accent} />)}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
