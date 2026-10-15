// HOOK / PROBLEM: a parallax flood of cards, a HUD counter ticking up, chips piling
// up on the words that name them, saturation draining as the clutter grows, and a
// fast camera push into the cut.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "../config";
import { HOOK } from "../content";
import { seg, sec, wordTime } from "../timing";
import type { SceneProps } from "../Video";
import { ChatIcon, Envelope } from "../components/Icons";
import { Chip, Counter } from "../components/ui";
import { BOUNCY, clamp, easeInOut, ramp, rand, SNAPPY, sp } from "../components/motion";

const LAYERS = [
  { depth: 0.5, count: 60, blur: 2.2, dim: 0.5 },
  { depth: 0.72, count: 40, blur: 0.8, dim: 0.75 },
  { depth: 1, count: 24, blur: 0, dim: 1 },
];

export const Hook: React.FC<SceneProps> = ({ to }) => {
  const frame = useCurrentFrame(); // first scene: local frame == absolute frame
  const S1 = seg("S1");
  const end = sec(to);

  // Flood accelerates so the counter lands while the first line is still being spoken.
  const floodStart = S1.start - 0.1;
  const floodEnd = S1.clauses[0].end + 0.4;
  const total = LAYERS.reduce((n, l) => n + l.count, 0);
  const arrival = (k: number) => floodStart + (floodEnd - floodStart) * Math.pow(k / (total - 1), 0.7);
  let id = 0;
  const cards = LAYERS.flatMap((L, li) => Array.from({ length: L.count }, () => {
    const i = id++;
    return { i, li, x: -160 + rand(i * 3.1 + 1) * 2140, y: -60 + rand(i * 7.7 + 2) * 1120,
      rot: (rand(i * 5.3 + 3) - 0.5) * 9 * L.depth, arrive: arrival(Math.floor(rand(i * 13.7) * total)) };
  }));
  const arrived = cards.filter((c) => frame >= c.arrive * FPS).length;
  const count = Math.round((HOOK.counter.target * arrived) / total);

  const clause2 = S1.clauses[1] ?? S1.clauses[0];
  const chips = HOOK.chips.map((c, i) => ({ ...c, t: wordTime(clause2, c.word), x: 960 + (i - 1) * 380, y: 700 + (rand(i) - 0.5) * 30, rot: (rand(i * 6.6) - 0.5) * 8 }));

  const push = easeInOut(ramp(frame, end - 10, end));
  const scale = interpolate(frame, [0, end - 10], [1, 1.09], clamp) + 0.12 * push;
  const sat = interpolate(frame, [0, end], [0.7, 0.35], clamp);
  const hud = sp(frame, 2, SNAPPY);

  return (
    <AbsoluteFill style={{ filter: `saturate(${sat}) brightness(${1 - 0.06 * push})` }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        {LAYERS.map((L, li) => (
          <AbsoluteFill key={li} style={{ transform: `translateX(${-frame * 0.9 * L.depth}px) scale(${L.depth})`,
            filter: L.blur ? `blur(${L.blur}px) brightness(${L.dim})` : undefined }}>
            {cards.filter((c) => c.li === li).map((c) => {
              const p = sp(frame, c.arrive * FPS, SNAPPY);
              if (p <= 0.001) return null;
              return (
                <div key={c.i} style={{ position: "absolute", left: c.x, top: c.y, width: 380, height: 100, borderRadius: 14,
                  opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * -70}px) scale(${0.88 + 0.12 * p}) rotate(${c.rot}deg)`,
                  background: "linear-gradient(180deg,#161F33,#111829)", border: `1px solid ${C.lineHi}`, boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
                  padding: "14px 18px", fontFamily: FONT, display: "flex", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex",
                    alignItems: "center", justifyContent: "center" }}><Envelope size={22} color={C.muted} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: C.text, fontSize: 19, fontWeight: 600, whiteSpace: "nowrap" }}>{HOOK.senders[c.i % HOOK.senders.length]}</div>
                    <div style={{ color: C.muted, fontSize: 15, marginTop: 4, whiteSpace: "nowrap" }}>{HOOK.subjects[c.i % HOOK.subjects.length]}</div>
                  </div>
                </div>
              );
            })}
          </AbsoluteFill>
        ))}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,5,11,0) 45%, rgba(3,5,11,0.55) 100%)" }} />
        {chips.map((c, i) => {
          const p = sp(frame, c.t * FPS, BOUNCY);
          if (p <= 0.001) return null;
          return (
            <div key={i} style={{ position: "absolute", left: c.x, top: c.y, zIndex: 10 + i,
              transform: `translate(-50%, ${(1 - p) * -520}px) rotate(${c.rot * p}deg) scale(1.25)` }}>
              <Chip strong icon={<ChatIcon size={22} color={C.muted} />}>{c.label}</Chip>
            </div>
          );
        })}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 90, top: 80, opacity: hud, transform: `translateY(${(1 - hud) * -20}px)` }}>
        <Counter label={HOOK.counter.label} value={count} unit={HOOK.counter.unit} icon={<Envelope size={24} />} />
      </div>
    </AbsoluteFill>
  );
};
