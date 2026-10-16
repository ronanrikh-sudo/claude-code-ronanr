// One word at a time, on the voice. Each word slams in (scale, flip and blur on a punchy
// spring) and snaps out as the next arrives. Words the picture already says (40%, the logo,
// the button) are left to the picture.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FPS } from "../config";
import { alpha, display, THEME } from "../theme";
import { T } from "../timing";
import { sp, SNAPPY, clamp } from "../components/motion";

const HIDE = new Set(["40%", "CAGECRAFT.", "SHOP", "NOW."]);
const COLOR: Record<string, string> = {
  "EVER.": THEME.teal, "OFF.": THEME.teal, "ONLY.": THEME.teal, "FREE": THEME.pink, "GIFTS.": THEME.pink,
};
const SMALL = new Set(["THE", "IN", "UP", "TO", "OF", "IS"]);
export const CAPTION_Y = 1250;

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const caps = T.captions;
  let k = -1;
  for (let i = 0; i < caps.length; i++) if (caps[i].start - 0.04 <= t) k = i;
  if (k < 0) return null;
  const items = [k - 1, k].filter((i) => i >= 0);
  return (
    <AbsoluteFill style={{ perspective: 1400 }}>
      {items.map((i) => {
        const c = caps[i];
        if (HIDE.has(c.text)) return null;
        const next = caps[i + 1];
        const inAt = (c.start - 0.04) * FPS;
        const p = sp(frame, inAt, SNAPPY);
        // out: when the next word lands, or ~0.5 s after this one ends if there is a pause
        const outAt = Math.min(next ? next.start - 0.04 : Infinity, c.end + 0.5) * FPS;
        const out = interpolate(frame, [outAt, outAt + 4], [0, 1], clamp);
        if (out >= 1) return null;
        const small = SMALL.has(c.text);
        const len = c.text.replace(".", "").length;
        const size = small ? 104 : Math.min(200, 930 / (len * 0.86));
        const color = COLOR[c.text] ?? THEME.text;
        const glow = COLOR[c.text] ? alpha(color, 0.55) : "rgba(255,255,255,0.18)";
        const scale = interpolate(p, [0, 1], [1.55, 1]) * (1 - 0.18 * out);
        return (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0, top: CAPTION_Y, textAlign: "center",
            transform: `translateY(${(1 - p) * 70 - out * 40}px) rotateX(${(1 - p) * 38}deg) scale(${scale})`,
            filter: `blur(${(1 - Math.min(1, p)) * 14 + out * 6}px)`,
            opacity: Math.min(1, p * 1.8) * (1 - out),
          }}>
            <span style={{ ...display(size), color, whiteSpace: "nowrap", display: "inline-block",
              transform: "translateY(-50%)", textShadow: `0 0 34px ${glow}, 0 6px 30px rgba(0,0,0,0.85)` }}>
              {c.text}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
