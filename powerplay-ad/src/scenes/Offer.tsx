// S4 "Black Friday is up to forty percent off, plus a free gift with every fifty dollars."
// 40% slams in teal over real CAGECRAFT product cut-outs (from the sale ad), then the free-gift line and
// the five gifts pop on "every fifty dollars". Everything key sits above Meta's bottom 35 %.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "../config";
import { alpha, display, label, THEME } from "../theme";
import { BOUNCY, clamp, push, rand, sp, SNAPPY, SOFT } from "../components/motion";
import { Gift, Truck } from "../components/Shapes";
import { sec, word } from "../timing";
import type { SceneProps } from "../Video";

// Best sellers, last 30 days (Shopify sales): Fight Jersey Diamond #1 front and centre. Real product photos
// keyed off their studio backgrounds; back row first, front row on "forty".
const PRODUCTS = [
  { src: "img/cut-hoodie-concrete.png", x: 135, y: 800, h: 250, r: -9, at: "Black" },
  { src: "img/cut-jersey-concrete.png", x: 330, y: 790, h: 260, r: -4, at: "Black" },
  { src: "img/cut-shorts-legacy.png", x: 540, y: 760, h: 170, r: 0, at: "Friday" },
  { src: "img/cut-hoodie-cottoncandy.png", x: 750, y: 790, h: 260, r: 4, at: "Friday" },
  { src: "img/cut-jersey-tiffany.png", x: 945, y: 800, h: 250, r: 9, at: "is" },
  { src: "img/cut-monarch-shorts.png", x: 300, y: 1145, h: 150, r: -6, at: "up" },
  { src: "img/cut-jersey-cottoncandy.png", x: 140, y: 1010, h: 300, r: -11, at: "up" },
  { src: "img/cut-boxer-diamond.png", x: 345, y: 1030, h: 250, r: -5, at: "to" },
  { src: "img/cut-essentials-2.png", x: 735, y: 1030, h: 250, r: 5, at: "to" },
  { src: "img/cut-hoodie-diamond.png", x: 940, y: 1010, h: 300, r: 11, at: "forty" },
  { src: "img/cut-jersey-diamond.png", x: 540, y: 1000, h: 380, r: 0, at: "forty" },
];
const GIFTS = [
  { name: "KIT BAG", icon: "gift" }, { name: "SOCKS", icon: "gift" }, { name: "SHIPPING", icon: "truck" }, { name: "TOWEL", icon: "gift" }, { name: "TEE", icon: "gift" },
];

export const Offer: React.FC<SceneProps> = ({ from, to }) => {
  const frame = useCurrentFrame() + sec(from);
  const t = frame / FPS;
  const w = (x: string) => word("S4.0", x);
  const v = (x: string) => word("S4.1", x);
  const bf = sp(frame, sec(w("Black") - 0.04), SNAPPY);
  const upTo = sp(frame, sec(w("up") - 0.04), SNAPPY);
  const forty = sp(frame, sec(w("forty") - 0.06), BOUNCY);
  const off = sp(frame, sec(w("off") - 0.04), BOUNCY);
  const giftLine = sp(frame, sec(v("plus") - 0.04), SNAPPY);
  const recede = sp(frame, sec(v("plus") - 0.1), SOFT);           // products step back for the gifts
  const exit = sp(frame, sec(to - 0.25), SOFT);
  const cam = push(frame, sec(from), sec(to), 0.06);
  return (
    <AbsoluteFill style={{ transform: `scale(${cam * (1 + 0.2 * exit)})`, opacity: 1 - exit, filter: exit > 0.02 ? `blur(${exit * 8}px)` : undefined }}>
      {/* products */}
      <AbsoluteFill style={{ transform: `translateY(${recede * 150}px) scale(${1 - 0.16 * recede})`, opacity: 1 - 0.55 * recede, filter: recede > 0.02 ? `blur(${recede * 2.5}px)` : undefined }}>
        <div style={{ position: "absolute", left: 140, right: 140, top: 640, height: 600, background: `radial-gradient(ellipse at 50% 55%, ${alpha(THEME.teal, 0.28)}, transparent 68%)` }} />
        {PRODUCTS.map((p, i) => {
          const s = sp(frame, sec(w(p.at) - 0.05 + (i % 2) * 0.06), BOUNCY);
          const bob = Math.sin(t * 1.6 + i) * 6;
          return (
            <Img key={p.src} src={staticFile(p.src)} style={{ position: "absolute", left: p.x, top: p.y + bob, height: p.h, transform: `translate(-50%, -50%) translateY(${(1 - s) * 260}px) rotate(${p.r + (1 - s) * 10 * (rand(i) - 0.5)}deg) scale(${0.6 + 0.4 * s})`,
              opacity: Math.min(1, s * 1.6), filter: `drop-shadow(0 0 22px ${alpha(THEME.teal, 0.45)}) drop-shadow(0 24px 30px rgba(0,0,0,0.7))` }} />
          );
        })}
      </AbsoluteFill>
      {/* BLACK FRIDAY / UP TO 40% OFF */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 292, textAlign: "center", opacity: bf, transform: `translateY(${(1 - bf) * 30}px)` }}>
        <span style={{ ...label(34), color: THEME.text, letterSpacing: "0.42em" }}>BLACK FRIDAY</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", transform: `translateY(${-recede * 30}px) scale(${1 - 0.12 * recede})` }}>
        <div style={{ ...display(84), color: THEME.text, opacity: Math.min(1, upTo * 1.7), transform: `translateY(${(1 - upTo) * 40}px)` }}>UP TO</div>
        <div style={{ whiteSpace: "nowrap", marginTop: 6 }}>
          <span style={{ ...display(200), color: THEME.ui, display: "inline-block", opacity: Math.min(1, forty * 1.8), transform: `scale(${interpolate(forty, [0, 1], [1.7, 1])})`,
            filter: `blur(${(1 - Math.min(1, forty)) * 16}px)`, textShadow: `0 0 60px ${alpha(THEME.teal, 0.75)}` }}>40%</span>
          <span style={{ ...display(124), color: THEME.text, display: "inline-block", marginLeft: 26, opacity: Math.min(1, off * 1.8), transform: `scale(${interpolate(off, [0, 1], [1.5, 1])})`,
            filter: `blur(${(1 - Math.min(1, off)) * 12}px)` }}>OFF</span>
        </div>
      </div>
      {/* + A FREE GIFT EVERY $50 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 780, textAlign: "center", opacity: Math.min(1, giftLine * 1.7), transform: `translateY(${(1 - giftLine) * 40}px)` }}>
        <span style={{ ...display(70), color: THEME.text }}>+ A </span>
        <span style={{ ...display(70), color: THEME.ui, textShadow: `0 0 34px ${alpha(THEME.teal, 0.6)}` }}>FREE GIFT</span>
        <div style={{ ...display(70), color: THEME.text, marginTop: 8 }}>EVERY $50</div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1000, display: "flex", justifyContent: "space-between" }}>
        {GIFTS.map((g, i) => {
          const p = sp(frame, sec(v("every") - 0.05 + i * 0.09), BOUNCY);
          return (
            <div key={g.name} style={{ width: 170, textAlign: "center", opacity: Math.min(1, p * 1.7), transform: `translateY(${(1 - p) * 50}px) scale(${interpolate(p, [0, 1], [0.7, 1])})` }}>
              <div style={{ width: 118, height: 118, margin: "0 auto", borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center",
                background: alpha(THEME.teal, 0.14), boxShadow: `inset 0 0 0 2px ${alpha(THEME.ui, 0.75)}, 0 0 30px ${alpha(THEME.teal, 0.35)}` }}>
                {g.icon === "truck" ? <Truck size={66} color={THEME.ui} /> : <Gift size={66} color={THEME.ui} />}
              </div>
              <div style={{ ...label(22), color: THEME.text, marginTop: 14, letterSpacing: "0.16em" }}>{g.name}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1196, textAlign: "center", opacity: interpolate(t, [v("dollars"), v("dollars") + 0.4], [0, 0.8], clamp) }}>
        <span style={{ ...label(19), color: THEME.dim }}>Gifts at $50 / $100 / $150 (free AU shipping) / $200 / $250 · T&amp;Cs apply</span>
      </div>
    </AbsoluteFill>
  );
};
