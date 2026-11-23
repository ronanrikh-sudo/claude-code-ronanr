// S2-S5: one continuous camera move on a phone showing the REAL live-site captures (public/shots,
// 1170x2532 @3x from cagecraftco.com). Coordinates below are the captured CSS boxes (public/shots/boxes.json),
// so pushes land exactly on the gift bar, the button, the boost line, the total and the free Kit Bag.
// Only overlays are added on top (spotlight, highlight rings, button shimmer, tap ripple); the UI is untouched.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "../config";
import { alpha, label, THEME } from "../theme";
import { clause, cue, sec, seg, word } from "../timing";
import { clamp, CAMERA, sp, SOFT, SNAPPY, BOUNCY } from "../components/motion";
import { Headline } from "../components/Headline";
import type { SceneProps } from "../Video";

// ---------------------------------------------------------------- phone geometry
const VW = 390, VH = 844;                 // captured viewport (CSS px)
const SW = 560, S = SW / VW, SH = VH * S; // screen size on canvas
const BEZ = 15, PW = SW + BEZ * 2, PH = SH + BEZ * 2;
const CX = 540;

type Box = [number, number, number, number];
const B = {
  bar: [39, 53, 351, 53] as Box,
  btn: [63, 126, 303, 61] as Box,
  pp: [63, 126, 303, 97] as Box,
  ppOn: [63, 126, 303, 52] as Box,
  kit: [39, 184, 351, 86] as Box,
  boost: [39, 276, 351, 110] as Box,
  total: [74, 648, 281, 30] as Box,
};
const centre = (b: Box) => [b[0] + b[2] / 2, b[1] + b[3] / 2] as const;

// ---------------------------------------------------------------- timeline (all from word times)
const tTap = () => word("S4.0", "tap");
const tCart = () => word("S2.0", "cart");

type Shot = { t: number; fx: number; fy: number; z: number; ty: number; rx: number; ry: number };
const shots = (): Shot[] => {
  const [bx, by] = centre(B.bar), [px, py] = centre(B.pp), [kx, ky] = centre(B.kit), [ox, oy] = centre(B.boost), [tx, ty] = centre(B.total);
  return [
    { t: cue("S2") - 0.3, fx: 195, fy: 422, z: 0.78, ty: 1960, rx: 24, ry: -10 },   // below frame, tilted
    { t: cue("S2") - 0.12, fx: 195, fy: 422, z: 1.0, ty: 1115, rx: 5, ry: -7 },     // rises into frame, clear of the headline
    { t: cue("S3.0") - 0.1, fx: bx, fy: by + 4, z: 2.0, ty: 1010, rx: 0, ry: 0 },   // gift bar
    { t: cue("S3.1") - 0.1, fx: px, fy: py, z: 2.2, ty: 1020, rx: 0, ry: 0 },       // the button
    { t: tTap() + 0.7, fx: 214, fy: 262, z: 1.45, ty: 1060, rx: 0, ry: 0 },         // pull back: result
    { t: cue("S4.1") - 0.05, fx: ox, fy: oy, z: 2.0, ty: 1030, rx: 0, ry: 0 },      // the boost line
    { t: cue("S5.0") - 0.1, fx: tx + 40, fy: ty, z: 2.3, ty: 1120, rx: 0, ry: 0 },  // total $50.00
    { t: cue("S5.1") - 0.08, fx: kx, fy: ky, z: 2.0, ty: 1040, rx: 0, ry: 0 },      // free Kit Bag
  ];
};

const camera = (frame: number) => {
  const sh = shots();
  const v = { ...sh[0] };
  for (let i = 1; i < sh.length; i++) {
    const p = sp(frame, sec(sh[i].t), i === 1 ? SNAPPY : SOFT);
    (["fx", "fy", "z", "ty", "rx", "ry"] as const).forEach((k) => { v[k] += p * (sh[i][k] - sh[i - 1][k]); });
  }
  return v;
};

// ---------------------------------------------------------------- screen overlays
const Spotlight: React.FC<{ box: Box; a: number; b: number; t: number; pad?: number; radius?: number }> = ({ box, a, b, t, pad = 4, radius = 13 }) => {
  const frame = Math.round(t * FPS);
  const pin = sp(frame, sec(a), SNAPPY), pout = interpolate(t, [b - 0.12, b + 0.08], [0, 1], clamp);
  const k = Math.min(1, pin) * (1 - pout);
  if (k <= 0.001) return null;
  const [x, y, w, h] = [box[0] - pad, box[1] - pad, box[2] + pad * 2, box[3] + pad * 2];
  const per = 2 * (w + h);
  const draw = interpolate(frame, [sec(a), sec(a) + 12], [per, 0], clamp);
  const breathe = 0.75 + 0.25 * Math.sin(t * 5.2);
  return (
    <svg width={VW} height={VH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <mask id={`hole-${Math.round(a * 100)}`}><rect width={VW} height={VH} fill="#fff" /><rect x={x} y={y} width={w} height={h} rx={radius} fill="#000" /></mask>
        <filter id={`glow-${Math.round(a * 100)}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.2" /></filter>
      </defs>
      <rect width={VW} height={VH} fill="#000" opacity={0.5 * k} mask={`url(#hole-${Math.round(a * 100)})`} />
      <rect x={x} y={y} width={w} height={h} rx={radius} fill="none" stroke={THEME.ui} strokeWidth={2.6} opacity={0.75 * k * breathe}
        filter={`url(#glow-${Math.round(a * 100)})`} strokeDasharray={per} strokeDashoffset={draw} />
      <rect x={x} y={y} width={w} height={h} rx={radius} fill="none" stroke={THEME.ui} strokeWidth={1.4} opacity={k}
        strokeDasharray={per} strokeDashoffset={draw} />
    </svg>
  );
};

const ButtonLife: React.FC<{ t: number }> = ({ t }) => {
  // "lights up": a stronger glow and the button's own shine sweep, from the word "lights" until the tap
  const on = interpolate(t, [word("S3.1", "lights") - 0.05, word("S3.1", "lights") + 0.25], [0, 1], clamp) *
    interpolate(t, [tTap() + 0.08, tTap() + 0.2], [1, 0], clamp);
  if (on <= 0.001) return null;
  const [x, y, w, h] = B.btn;
  const sweep = ((t - word("S3.1", "lights")) / 1.05) % 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 12, overflow: "hidden",
      boxShadow: `0 0 ${18 + 10 * Math.sin(t * 7)}px ${alpha(THEME.ui, 0.65 * on)}, 0 0 0 ${1.5}px ${alpha(THEME.ui, 0.9 * on)}` }}>
      <div style={{ position: "absolute", top: -10, bottom: -10, width: 70, left: -90 + sweep * (w + 180),
        background: `linear-gradient(105deg, transparent, rgba(255,255,255,${0.32 * on}), transparent)`, transform: "skewX(-20deg)" }} />
    </div>
  );
};

const Touch: React.FC<{ t: number }> = ({ t }) => {
  const t0 = tTap();
  const [x, y, w, h] = B.btn;
  const cx = x + w * 0.62, cy = y + h / 2;
  const appear = interpolate(t, [t0 - 0.35, t0 - 0.12], [0, 1], clamp), press = interpolate(t, [t0 - 0.06, t0, t0 + 0.12], [1, 0.82, 1], clamp);
  const gone = interpolate(t, [t0 + 0.18, t0 + 0.4], [1, 0], clamp);
  const r = interpolate(t, [t0, t0 + 0.55], [10, 120], clamp), ro = interpolate(t, [t0, t0 + 0.55], [0.85, 0], clamp);
  if (t < t0 - 0.4 || t > t0 + 0.6) return null;
  return (
    <svg width={VW} height={VH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {t >= t0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke={THEME.ui} strokeWidth={2.4} opacity={ro} />}
      <circle cx={cx} cy={cy} r={17 * press} fill="rgba(255,255,255,0.55)" stroke="rgba(255,255,255,0.9)" strokeWidth={1.5} opacity={appear * gone} />
    </svg>
  );
};

// ---------------------------------------------------------------- the screen
const Screen: React.FC<{ t: number }> = ({ t }) => {
  const frame = Math.round(t * FPS);
  const slide = sp(frame, sec(tCart() - 0.12), SOFT);         // cart drawer slides in on "cart"
  const tap = tTap();
  const loading = t >= tap + 0.1 && t < tap + 0.72;
  const done = interpolate(t, [tap + 0.72, tap + 0.86], [0, 1], clamp);
  const img = (name: string, style?: React.CSSProperties) => <Img src={staticFile(`shots/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width: VW, height: VH, ...style }} />;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: VW, height: VH, transform: `scale(${S})`, transformOrigin: "0 0", overflow: "hidden" }}>
      {slide < 0.999 && img("01-product")}
      {slide < 0.999 && <div style={{ position: "absolute", inset: 0, background: "#000", opacity: 0.5 * slide }} />}
      {slide > 0.001 && slide < 0.999 && (
        <div style={{ position: "absolute", left: 39, top: 0, width: VW - 39, height: VH, overflow: "hidden", transform: `translateX(${(1 - slide) * (VW - 39)}px)`,
          boxShadow: "-12px 0 30px rgba(0,0,0,0.35)" }}>
          <Img src={staticFile("shots/02-drawer-offer.png")} style={{ position: "absolute", left: -39, top: 0, width: VW, height: VH }} />
        </div>
      )}
      {slide >= 0.999 && img(loading ? "03-drawer-loading" : "02-drawer-offer")}
      {done > 0 && img("05-drawer-active", { opacity: done })}
      <ButtonLife t={t} />
      <Touch t={t} />
      <Spotlight box={B.bar} a={word("S3.0", "five") - 0.05} b={cue("S3.1") - 0.05} t={t} pad={3} />
      <Spotlight box={B.boost} a={word("S4.1", "exactly") - 0.05} b={cue("S5.0") - 0.05} t={t} pad={2} />
      <Spotlight box={B.total} a={word("S5.0", "twenty-nine") - 0.08} b={cue("S5.1") - 0.05} t={t} pad={7} />
      <Spotlight box={B.kit} a={word("S5.1", "free") - 0.05} b={seg("S5").end + 0.5} t={t} pad={2} />
    </div>
  );
};

// ---------------------------------------------------------------- scene
export const Demo: React.FC<SceneProps> = ({ from, to }) => {
  const local = useCurrentFrame();
  const frame = local + sec(from);
  const t = frame / FPS;
  const cam = camera(frame);
  const drift = 1 + 0.018 * CAMERA * Math.sin((t - from) * 0.9);
  const z = cam.z * drift;
  const lx = cam.fx * S - SW / 2, ly = cam.fy * S - SH / 2;    // focal point relative to the phone centre
  const pcx = CX - z * lx, pcy = cam.ty - z * ly;
  // exit: the phone drops away and dims as the tier ladder takes over
  const exit = sp(frame, sec(to - 0.28), SOFT);
  const ex = { y: exit * 900, s: 1 - 0.35 * exit, o: 1 - exit, b: exit * 6 };

  const c = (ref: string, w: string, n = 0) => word(ref, w, n);
  const H = 250;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ perspective: 2400 }}>
        <div style={{
          position: "absolute", left: pcx - PW / 2, top: pcy - PH / 2, width: PW, height: PH,
          transform: `translateY(${ex.y}px) scale(${z * ex.s}) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg)`, transformOrigin: "50% 50%",
          opacity: ex.o, filter: ex.b > 0.05 ? `blur(${ex.b}px)` : undefined,
        }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 78, background: THEME.phone,
            boxShadow: `0 60px 120px rgba(0,0,0,0.75), 0 0 0 2px #23252B, 0 0 90px ${alpha(THEME.teal, 0.18)}` }} />
          <div style={{ position: "absolute", left: BEZ, top: BEZ, width: SW, height: SH, borderRadius: 62, overflow: "hidden", background: "#fff" }}>
            <Screen t={t} />
          </div>
        </div>
      </AbsoluteFill>
      {/* top band so headlines always read over the pushed-in phone */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,5,6,0.96) 0%, rgba(5,5,6,0.9) 22%, rgba(5,5,6,0) 34%)" }} />

      <Headline from={from} y={H} size={110} outAt={cue("S3.0") - 0.12}
        lines={[[{ text: "POWERPLAY", at: c("S2.0", "PowerPlay") }], [{ text: "YOUR", at: c("S2.0", "your") }, { text: "CART.", at: c("S2.0", "cart"), accent: true }]]} />
      <Headline from={from} y={H} size={90} outAt={cue("S3.1") - 0.12}
        lines={[[{ text: "WITHIN", at: c("S3.0", "within") }, { text: "$5", at: c("S3.0", "five"), accent: true }, { text: "OF", at: c("S3.0", "of") }],
          [{ text: "A", at: c("S3.0", "a") }, { text: "FREE", at: c("S3.0", "free") }, { text: "GIFT.", at: c("S3.0", "gift") }]]} />
      <Headline from={from} y={H} size={104} outAt={cue("S4.0") - 0.12}
        lines={[[{ text: "THE", at: c("S3.1", "the") }, { text: "BUTTON", at: c("S3.1", "button") }], [{ text: "LIGHTS", at: c("S3.1", "lights"), accent: true }, { text: "UP.", at: c("S3.1", "up"), accent: true }]]} />
      <Headline from={from} y={H} size={96} outAt={cue("S4.1") - 0.12}
        lines={[[{ text: "ONE", at: c("S4.0", "one") }, { text: "TAP.", at: c("S4.0", "tap"), accent: true }], [{ text: "ADDS", at: c("S4.0", "adds") }, { text: "A", at: c("S4.0", "a") }, { text: "BOOST.", at: c("S4.0", "boost") }]]} />
      <Headline from={from} y={H} size={86} outAt={cue("S5.0") - 0.12}
        lines={[[{ text: "EXACTLY", at: c("S4.1", "exactly"), accent: true }, { text: "WHAT", at: c("S4.1", "what") }], [{ text: "YOU'RE", at: c("S4.1", "you're") }, { text: "SHORT.", at: c("S4.1", "short") }]]} />
      <Headline from={from} y={H - 10} size={210} outAt={cue("S5.1") - 0.12}
        lines={[[{ text: "$1.29", at: c("S5.0", "dollar"), accent: true }]]} />
      <PriceNote t={t} />
      <Headline from={from} y={H} size={86} outAt={to - 0.15}
        lines={[[{ text: "FREE", at: c("S5.1", "free"), accent: true }, { text: "KIT", at: c("S5.1", "kit"), accent: true }, { text: "BAG", at: c("S5.1", "bag"), accent: true }],
          [{ text: "IS", at: c("S5.1", "is") }, { text: "YOURS.", at: c("S5.1", "yours") }]]} />
    </AbsoluteFill>
  );
};

/** Under the big $1.29: "takes your cart to $50.00", landing with the number. */
const PriceNote: React.FC<{ t: number }> = ({ t }) => {
  const frame = Math.round(t * FPS);
  const a = word("S5.0", "twenty-nine");
  const p = sp(frame, sec(a), BOUNCY);
  const out = interpolate(t, [clause("S5.1").start - 0.12, clause("S5.1").start], [0, 1], clamp);
  if (t < a - 0.1 || out >= 1) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", opacity: Math.min(1, p * 1.6) * (1 - out),
      transform: `translateY(${(1 - p) * 24}px)` }}>
      <span style={{ ...label(30), color: THEME.text, letterSpacing: "0.26em" }}>
        TAKES YOUR CART TO <span style={{ color: THEME.ui }}>$50.00</span>
      </span>
    </div>
  );
};
