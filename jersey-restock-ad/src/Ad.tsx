// CAGECRAFT Fight Jersey 2.0, re-edit of the winning rooftop jersey ad.
// Picture: the original footage with the 3.5 s fade-in cut, re-timed so every cut lands on a bar line.
// Three hook versions share everything except the first bar (0-59 frames).
//
//  frames   shot (footage plate)              on screen
//  0-58     backs, both jerseys               HOOK (restock | colourway | kitbag)
//  59-116   Diamond close-up                  COLOURWAY 01 / DIAMOND
//  117-175  Cotton Candy close-up (music drop) COLOURWAY 02 / COTTON CANDY
//  176-233  fronts, 2x slow motion            FIGHT JERSEY 2.0
//  234-299  end card over blurred fronts      logo, kit bag, FREE KIT BAG, SHOP NOW
import React, { CSSProperties } from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { CUT, HEIGHT, SAFE, WIDTH } from "./config";
import { BOUNCY, EXIT, SNAPPY, SOFT, ramp, sp } from "./motion";
import { BRAND, FONTS, SHADOW, THEME, display, fit, label } from "./theme";

const W = 1080 - 2 * SAFE.x; // usable line width

export const HOOKS = ["restock", "colourway", "kitbag"] as const;
export type Hook = (typeof HOOKS)[number];

// ------------------------------------------------------------------ plate

// Per-shot framing: base scale plus a nudge that frees the top-left for type.
// (Translation must stay within (scale - 1) * half the frame so no edge is exposed.)
const SHOTS = [
  { from: CUT.A, to: CUT.B, x: 0, y: 0, base: 1.0, push: 0.035 },
  { from: CUT.B, to: CUT.C, x: 30, y: 30, base: 1.06, push: 0.035 },
  { from: CUT.C, to: CUT.D, x: 0, y: 110, base: 1.12, push: 0.03 },
  { from: CUT.D, to: CUT.END, x: 0, y: 0, base: 1.0, push: 0.1 },
];

const Plate: React.FC = () => {
  const f = useCurrentFrame();
  const s = SHOTS.find((x) => f >= x.from && f < x.to) ?? SHOTS[SHOTS.length - 1];
  const punch = 1 + 0.075 * (1 - sp(f, s.from, SOFT)); // every cut lands as a short zoom-through settle
  const push = 1 + s.push * ((f - s.from) / (s.to - s.from)); // the camera is always travelling
  const e = f >= CUT.E ? sp(f, CUT.E, SOFT) : 0; // end card: push through, defocus, darken
  const scale = s.base * punch * push * (1 + 0.07 * e);
  const filter = `contrast(1.06) saturate(1.08) brightness(${1 - 0.64 * e}) blur(${16 * e}px)`;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: THEME.bg }}>
      <AbsoluteFill style={{ transform: `translate(${s.x}px, ${s.y}px) scale(${scale})`, filter }}>
        <OffthreadVideo src={staticFile("footage/footage.mp4")} muted style={{ width: WIDTH, height: HEIGHT }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Top scrim anchors the type (and sits under the platform header); a light floor for the caption UI. */
const Scrims: React.FC = () => {
  const f = useCurrentFrame();
  const k = 1 - ramp(f, CUT.E, CUT.E + 12);
  return (
    <>
      <AbsoluteFill style={{ opacity: k, background: "linear-gradient(180deg, rgba(5,5,6,0.74) 0px, rgba(5,5,6,0.58) 420px, rgba(5,5,6,0.16) 780px, rgba(5,5,6,0) 1020px)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.42) 0px, rgba(0,0,0,0) 620px)" }} />
    </>
  );
};

// ------------------------------------------------------------------ type primitives

/** A line that rises out of its own mask on `inAt` and leaves upward on `outAt`. */
const Line: React.FC<{ inAt: number; outAt?: number; style?: CSSProperties; children: React.ReactNode; glint?: { at: number; tint?: boolean } }> = ({ inAt, outAt, style, children, glint }) => {
  const f = useCurrentFrame();
  const p = sp(f, inAt, SNAPPY);
  const q = outAt === undefined ? 0 : sp(f, outAt, EXIT);
  const y = (1 - p) * 115 - q * 115;
  const skew = -8 * (1 - p) + 6 * q;
  const g = glint ? ramp(f, glint.at, glint.at + 18) : 0;
  const sweep = glint?.tint
    ? `linear-gradient(100deg, transparent 38%, ${THEME.diamond} 46%, #ffffff 50%, ${THEME.candy} 54%, transparent 62%)`
    : "linear-gradient(100deg, transparent 40%, rgba(255,255,255,0.95) 50%, transparent 60%)";
  return (
    <div style={{ clipPath: "inset(-2% -40% 0 -14%)", paddingTop: "0.04em" }}>
      <div style={{ position: "relative", transform: `translateY(${y}%) skewX(${skew}deg)`, ...style }}>
        {children}
        {g > 0 && g < 1 && (
          <div aria-hidden style={{
            position: "absolute", inset: 0, textShadow: "none",
            backgroundImage: sweep, backgroundSize: "260% 100%", backgroundPosition: `${120 - g * 140}% 0`,
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>{children}</div>
        )}
      </div>
    </div>
  );
};

/** Signature device: hairline split Diamond | Cotton Candy (or a single colour). */
const Rule: React.FC<{ at: number; outAt?: number; width: number; color?: string; height?: number }> = ({ at, outAt, width, color, height = 4 }) => {
  const f = useCurrentFrame();
  const p = sp(f, at, SOFT) * (outAt === undefined ? 1 : 1 - sp(f, outAt, EXIT));
  return (
    <div style={{ width: width * p, height, display: "flex", overflow: "hidden", flexShrink: 0, boxShadow: "0 0 18px rgba(0,0,0,0.35)" }}>
      <div style={{ flex: 1, background: color ?? THEME.diamond }} />
      <div style={{ flex: 1, background: color ?? THEME.candy }} />
    </div>
  );
};

const LabelRow: React.FC<{ at: number; outAt: number; text: string; color?: string; size?: number }> = ({ at, outAt, text, color, size = 28 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14 }}>
    <Rule at={at} outAt={outAt} width={56} color={color} />
    <Line inAt={at + 1} outAt={outAt} style={{ ...label(size), color: THEME.muted, textShadow: SHADOW }}>{text}</Line>
  </div>
);

const Block: React.FC<{ top?: number; children: React.ReactNode; style?: CSSProperties }> = ({ top = SAFE.top + 14, children, style }) => (
  <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, top, display: "flex", flexDirection: "column", alignItems: "flex-start", ...style }}>
    {children}
  </div>
);

const gradientText = (): CSSProperties => ({
  backgroundImage: `linear-gradient(95deg, ${THEME.diamond} 0%, #DDEBFF 50%, ${THEME.candy} 100%)`,
  WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
  filter: "drop-shadow(0 6px 28px rgba(0,0,0,0.45))",
});

// ------------------------------------------------------------------ bar 1: hooks

const HOOK_OUT = CUT.B - 9;

const HookRestock: React.FC = () => (
  <Block>
    <LabelRow at={1} outAt={HOOK_OUT} text="Fight Jersey 2.0" />
    <Line inAt={-5} outAt={HOOK_OUT} style={{ ...display(fit("Restocked", W, 150)), color: THEME.text, textShadow: SHADOW }}>Just</Line>
    <Line inAt={-2} outAt={HOOK_OUT + 1} glint={{ at: 14, tint: true }} style={{ ...display(fit("Restocked", W, 150)), color: THEME.text, textShadow: SHADOW, marginTop: -6 }}>Restocked</Line>
  </Block>
);

const HookColourway: React.FC = () => (
  <Block>
    <Line inAt={-5} outAt={HOOK_OUT} glint={{ at: 14 }} style={{ ...display(fit("Diamond", W, 150)), color: THEME.diamond, textShadow: SHADOW }}>Diamond</Line>
    <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "10px 0 8px" }}>
      <Rule at={0} outAt={HOOK_OUT} width={70} color={THEME.diamond} height={3} />
      <Line inAt={1} outAt={HOOK_OUT} style={{ ...label(34, 700), color: THEME.text, letterSpacing: "0.32em", textShadow: SHADOW }}>or</Line>
      <Rule at={0} outAt={HOOK_OUT} width={70} color={THEME.candy} height={3} />
    </div>
    <Line inAt={-2} outAt={HOOK_OUT + 1} glint={{ at: 20 }} style={{ ...display(fit("Cotton Candy?", W, 120)), color: THEME.candy, textShadow: SHADOW }}>Cotton Candy?</Line>
  </Block>
);

const HookKitBag: React.FC = () => {
  const f = useCurrentFrame();
  const d = sp(f, 2, BOUNCY);
  const out = sp(f, HOOK_OUT, EXIT);
  return (
    <>
      <Block>
        <Line inAt={-5} outAt={HOOK_OUT} style={{ ...display(fit("Kit Bag", W * 0.62, 150)), color: THEME.text, textShadow: SHADOW }}>Free</Line>
        <Line inAt={-2} outAt={HOOK_OUT + 1} glint={{ at: 14, tint: true }} style={{ ...display(fit("Kit Bag", W * 0.62, 150)), color: THEME.text, textShadow: SHADOW, marginTop: -6 }}>Kit Bag</Line>
        <div style={{ marginTop: 18 }}>
          <LabelRow at={3} outAt={HOOK_OUT} text={BRAND.offerSub} size={30} />
        </div>
      </Block>
      <Img src={staticFile("img/kitbag-cut.png")} style={{
        position: "absolute", width: 300, left: 700, top: SAFE.top - 6,
        opacity: Math.min(1, d * 1.5) * (1 - out),
        transform: `translateY(${(1 - d) * -160 - out * 80}px) rotate(${8 - 14 * d}deg) scale(${0.9 + 0.1 * d})`,
        filter: "drop-shadow(0 28px 36px rgba(0,0,0,0.55))",
      }} />
    </>
  );
};

// ------------------------------------------------------------------ bars 2-3: colourways

const Colourway: React.FC<{ from: number; to: number; n: string; name: string; color: string; size: number }> = ({ from, to, n, name, color, size }) => (
  <Block>
    <LabelRow at={from + 2} outAt={to - 8} text={`Colourway ${n}`} color={color} />
    <Line inAt={from + 1} outAt={to - 8} glint={{ at: from + 14 }} style={{ ...display(fit(name, W, size)), color, textShadow: SHADOW }}>{name}</Line>
  </Block>
);

// ------------------------------------------------------------------ bar 4: product

const Product: React.FC = () => {
  const from = CUT.D, out = CUT.E - 9;
  return (
    <Block>
      <LabelRow at={from + 3} outAt={out} text="Diamond · Cotton Candy" />
      <Line inAt={from + 1} outAt={out} style={{ ...display(fit("Fight Jersey", W, 120)), color: THEME.text, textShadow: SHADOW }}>Fight Jersey</Line>
      <Line inAt={from + 4} outAt={out + 1} style={{ ...display(176), ...gradientText(), marginTop: -4, paddingRight: 12 }}>2.0</Line>
    </Block>
  );
};

// ------------------------------------------------------------------ end card

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const E = CUT.E;
  const logo = sp(f, E + 3, SOFT);
  const bag = sp(f, E + 7, BOUNCY);
  const glow = sp(f, E + 4, SOFT);
  const cta = sp(f, E + 20, BOUNCY);
  const float = Math.sin((f - E) / 16) * 7;
  const shine = ramp(f, E + 32, E + 50);
  const centre: CSSProperties = { position: "absolute", left: 0, right: 0, display: "flex", justifyContent: "center" };
  return (
    <AbsoluteFill>
      {/* split glow behind the bag */}
      <div style={{ position: "absolute", left: 540 - 420, top: 400, width: 840, height: 560, opacity: 0.55 * glow,
        background: `radial-gradient(closest-side at 32% 55%, ${THEME.diamond}88, transparent), radial-gradient(closest-side at 68% 50%, ${THEME.candy}88, transparent)`,
        filter: "blur(40px)" }} />
      <div style={{ ...centre, top: 336 }}>
        <Img src={staticFile("img/logo-white.png")} style={{ width: 600, clipPath: `inset(0 ${100 - logo * 100}% 0 0)`,
          transform: `translateX(${(1 - logo) * -30}px)`, filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))" }} />
      </div>
      <div style={{ ...centre, top: 432 }}>
        <Img src={staticFile("img/kitbag-cut.png")} style={{ width: 420, opacity: Math.min(1, bag * 1.6),
          transform: `translateY(${(1 - bag) * -220 + float}px) rotate(${-4 + 9 * (1 - bag)}deg) scale(${0.86 + 0.14 * bag})`,
          filter: "drop-shadow(0 36px 44px rgba(0,0,0,0.6))" }} />
      </div>
      <div style={{ ...centre, top: 826 }}>
        <Line inAt={E + 11} glint={{ at: E + 26, tint: true }} style={{ ...display(fit(BRAND.offer, W, 112)), color: THEME.text, textShadow: SHADOW }}>{BRAND.offer}</Line>
      </div>
      <div style={{ ...centre, top: 958, alignItems: "center", gap: 20 }}>
        <Rule at={E + 14} width={64} color={THEME.diamond} height={3} />
        <Line inAt={E + 15} style={{ ...label(30), color: THEME.text, textShadow: SHADOW }}>{BRAND.offerSub}</Line>
        <Rule at={E + 14} width={64} color={THEME.candy} height={3} />
      </div>
      <div style={{ ...centre, top: 1040 }}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 999, background: "#FFFFFF",
          padding: "24px 58px 24px 64px", display: "flex", alignItems: "center", gap: 18,
          opacity: Math.min(1, cta * 1.6), transform: `scale(${0.78 + 0.22 * cta})`,
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)" }}>
          <span style={{ ...display(40), color: "#0A0A0B", letterSpacing: "0.01em" }}>Shop now</span>
          <svg width="34" height="22" viewBox="0 0 34 22"><path d="M0 11h30M21 2l9 9-9 9" fill="none" stroke="#0A0A0B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {shine > 0 && shine < 1 && (
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${-120 + shine * 240}%) skewX(-20deg)`,
              background: `linear-gradient(90deg, transparent, ${THEME.diamond}66, ${THEME.candy}66, transparent)` }} />
          )}
        </div>
      </div>
      <div style={{ ...centre, top: 1160 }}>
        <Line inAt={E + 24} style={{ ...label(22, 600), color: THEME.muted, letterSpacing: "0.3em" }}>{BRAND.url}</Line>
      </div>
      <div style={{ ...centre, top: 1200 }}>
        <Line inAt={E + 26} style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 21, color: THEME.dim, letterSpacing: "0.02em" }}>{BRAND.offerFine}</Line>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ finish

const FLASHES: [number, number][] = [[CUT.B, 0.12], [CUT.C, 0.34], [CUT.D, 0.12], [CUT.E, 0.16]];

const Finish: React.FC = () => {
  const f = useCurrentFrame();
  const flash = Math.min(0.8, FLASHES.reduce((a, [at, k]) => a + (f >= at ? k * Math.exp(-(f - at) / 3.2) : 0), 0));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {flash > 0.005 && <AbsoluteFill style={{ background: "#fff", opacity: flash, mixBlendMode: "screen" }} />}
      <svg width="100%" height="100%" viewBox="0 0 540 960" preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, opacity: THEME.grain, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 9} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="540" height="960" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 95% 80% at 50% 45%, transparent 55%, rgba(0,0,0,${THEME.vignette}) 100%)` }} />
    </AbsoluteFill>
  );
};

/** QC only: Reels UI zones (red) and the 4:5 feed crop (yellow). */
const SafeGuides: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 270, background: "rgba(255,0,0,0.22)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1250, bottom: 0, background: "rgba(255,0,0,0.22)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 285, height: 1350, border: "3px dashed rgba(255,220,0,0.8)" }} />
  </AbsoluteFill>
);

// ------------------------------------------------------------------ composition

export const Ad: React.FC<{ hook: Hook; safe?: boolean }> = ({ hook, safe }) => {
  const f = useCurrentFrame();
  const inRange = (a: number, b: number) => f >= a && f < b;
  return (
    <AbsoluteFill style={{ background: THEME.bg }}>
      <Plate />
      <Scrims />
      {inRange(CUT.A, CUT.B) && (hook === "restock" ? <HookRestock /> : hook === "colourway" ? <HookColourway /> : <HookKitBag />)}
      {inRange(CUT.B, CUT.C) && <Colourway from={CUT.B} to={CUT.C} n="01" name="Diamond" color={THEME.diamond} size={140} />}
      {inRange(CUT.C, CUT.D) && <Colourway from={CUT.C} to={CUT.D} n="02" name="Cotton Candy" color={THEME.candy} size={104} />}
      {inRange(CUT.D, CUT.E) && <Product />}
      {f >= CUT.E && <EndCard />}
      <Finish />
      {safe && <SafeGuides />}
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};

