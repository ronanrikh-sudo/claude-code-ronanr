// S6 "It works on every tier. Socks, free shipping, a towel, even a free tee."
// The gift ladder climbs: $50 Kit Bag is already unlocked; each tier lights on its spoken word and a
// teal charge runs up the rail to it.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FPS } from "../config";
import { alpha, display, label, THEME } from "../theme";
import { BOUNCY, clamp, push, sp, SNAPPY, SOFT } from "../components/motion";
import { Bolt, Gift, Truck } from "../components/Shapes";
import { Headline } from "../components/Headline";
import { cue, sec, seg, word } from "../timing";
import type { SceneProps } from "../Video";

const RAIL_X = 196, TOP = 640, STEP = 186;
const TIERS = () => [
  { amt: "$50", gift: "KIT BAG", at: seg("S6").start - 0.3, icon: "gift" },
  { amt: "$100", gift: "CREW SOCKS", at: word("S6.1", "Socks"), icon: "gift" },
  { amt: "$150", gift: "FREE SHIPPING", at: word("S6.1", "shipping"), icon: "truck" },
  { amt: "$200", gift: "TRAINING TOWEL", at: word("S6.1", "towel"), icon: "gift" },
  { amt: "$250", gift: "ESSENTIALS TEE", at: word("S6.1", "tee"), icon: "gift" },
];

export const Ladder: React.FC<SceneProps> = ({ from, to }) => {
  const frame = useCurrentFrame() + sec(from);
  const t = frame / FPS;
  const tiers = TIERS();
  const yOf = (i: number) => TOP + (tiers.length - 1 - i) * STEP;   // $50 at the bottom
  const enter = (i: number) => sp(frame, sec(from + 0.05 + i * 0.07), SNAPPY);
  // the charge on the rail climbs to the newest lit tier
  let lit = 0;
  tiers.forEach((x, i) => { if (t >= x.at - 0.04) lit = i; });
  const climb = tiers.reduce((acc, x, i) => (i === 0 ? acc : acc + sp(frame, sec(x.at - 0.06), SOFT) * STEP), 0);
  const railTop = yOf(0) - climb;
  const exit = sp(frame, sec(to - 0.25), SOFT);
  const cam = push(frame, sec(from), sec(to), 0.05);
  return (
    <AbsoluteFill style={{ transform: `scale(${cam * (1 + 0.25 * exit)})`, opacity: 1 - exit, filter: exit > 0.02 ? `blur(${exit * 8}px)` : undefined }}>
      <Headline from={from} y={250} size={98} lines={[[{ text: "EVERY", at: word("S6.0", "every") }, { text: "TIER.", at: word("S6.0", "tier"), accent: true }]]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 392, textAlign: "center", opacity: interpolate(t, [word("S6.0", "tier") + 0.15, word("S6.0", "tier") + 0.5], [0, 1], clamp) }}>
        <span style={{ ...label(26), color: THEME.muted }}>Every $50 unlocks a free gift</span>
      </div>
      {/* rail */}
      <div style={{ position: "absolute", left: RAIL_X - 3, top: yOf(4), width: 6, height: yOf(0) - yOf(4), borderRadius: 3, background: THEME.line,
        transform: `scaleY(${enter(0)})`, transformOrigin: "50% 100%" }} />
      <div style={{ position: "absolute", left: RAIL_X - 3, top: railTop, width: 6, height: yOf(0) - railTop, borderRadius: 3,
        background: `linear-gradient(0deg, ${THEME.teal}, ${THEME.ui})`, boxShadow: `0 0 22px ${alpha(THEME.teal, 0.8)}` }} />
      <div style={{ position: "absolute", left: RAIL_X - 24, top: railTop - 26, opacity: lit > 0 ? 1 : 0 }}>
        <Bolt size={48} color={THEME.ui} glow={alpha(THEME.teal, 0.95)} />
      </div>
      {tiers.map((x, i) => {
        const e = enter(i);
        const on = sp(frame, sec(x.at - 0.04), BOUNCY);
        const isOn = t >= x.at - 0.04;
        const y = yOf(i);
        const col = isOn ? THEME.ui : THEME.text;
        return (
          <div key={x.amt} style={{ position: "absolute", left: 0, right: 0, top: y - 60, height: 120, opacity: Math.min(1, e * 1.6),
            transform: `translateX(${(1 - e) * 60}px)` }}>
            <div style={{ position: "absolute", left: RAIL_X - 22, top: 38, width: 44, height: 44, borderRadius: 22,
              background: isOn ? THEME.ui : THEME.bg, border: `3px solid ${isOn ? THEME.ui : THEME.dim}`,
              boxShadow: isOn ? `0 0 ${26 * on}px ${alpha(THEME.teal, 0.9)}` : "none", transform: `scale(${isOn ? interpolate(on, [0, 1], [1.5, 1]) : 1})` }} />
            <div style={{ position: "absolute", left: RAIL_X + 64, top: 12 }}>
              <div style={{ ...display(84), color: col, textShadow: isOn ? `0 0 34px ${alpha(THEME.teal, 0.55)}` : "none",
                transform: `scale(${isOn ? interpolate(on, [0, 1], [1.12, 1]) : 1})`, transformOrigin: "0 50%" }}>{x.amt}</div>
              <div style={{ ...label(26), color: isOn ? THEME.text : THEME.muted, marginTop: 10 }}>{x.gift}</div>
            </div>
            <div style={{ position: "absolute", right: 120, top: 24, opacity: isOn ? 1 : 0.45, transform: `scale(${isOn ? interpolate(on, [0, 1], [1.4, 1]) : 1})` }}>
              {x.icon === "truck" ? <Truck size={72} color={col} /> : <Gift size={72} color={col} />}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1540, textAlign: "center", opacity: interpolate(t, [word("S6.1", "shipping"), word("S6.1", "shipping") + 0.4], [0, 0.8], clamp) }}>
        <span style={{ ...label(20), color: THEME.dim }}>Free shipping on Australian orders · T&amp;Cs apply</span>
      </div>
    </AbsoluteFill>
  );
};
