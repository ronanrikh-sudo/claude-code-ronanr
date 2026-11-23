// Meta ad, 0 s to the offer: the hook and the demo as one continuous camera move on a phone showing the REAL live-site captures (public/shots,
// 1170x2532 @3x from cagecraftco.com). Coordinates below are the captured CSS boxes (public/shots/boxes.json),
// so pushes land exactly on the gift bar, the upsell, the button, the boost line and the free tee.
// Only overlays are added on top (spotlight, highlight rings, button shimmer, tap ripple); the UI is untouched.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "../config";
import { alpha, display, label, THEME } from "../theme";
import { cue, sec, seg, word } from "../timing";
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
  btn: [63, 126, 303, 67] as Box,
  pp: [63, 126, 303, 102] as Box,
  ppOn: [63, 126, 303, 52] as Box,
  tee: [39, 184, 351, 152] as Box,       // free Essentials Training Tee 2.0 line (unlocked state)
  teeThumb: [53, 196, 58, 64] as Box,    // its product thumbnail
  boost: [39, 342, 351, 110] as Box,
  total: [74, 648, 281, 30] as Box,
  upsell: [45, 432, 339, 138] as Box,    // "Complete your fit" in the scrolled view (01-upsell)
};
const centre = (b: Box) => [b[0] + b[2] / 2, b[1] + b[3] / 2] as const;

// ---------------------------------------------------------------- timeline (all from word times)
const tTap = () => word("S2.1", "tap");
export const tReveal = () => word("S3.0", "unlocked") - 0.1;
const camOnButton = () => word("S2.0", "item") + 0.15;

type Shot = { t: number; fx: number; fy: number; z: number; ty: number; rx: number; ry: number };
const shots = (): Shot[] => {
  const [bx, by] = centre(B.bar), [px, py] = centre(B.pp), [ox, oy] = centre(B.boost), [ux, uy] = centre(B.upsell);
  const [tx, ty] = centre(B.tee), [hx, hy] = centre(B.teeThumb);
  return [
    { t: -0.2, fx: bx, fy: by + 4, z: 3.3, ty: 880, rx: 0, ry: 0 },               // whip-in start (frame 0 is mid-move)
    { t: -0.12, fx: bx, fy: by + 4, z: 2.05, ty: 930, rx: 0, ry: 0 },             // HOOK: "$3.41 left for Free Training Tee"
    { t: cue("S2.0") - 0.1, fx: ux, fy: uy, z: 1.7, ty: 900, rx: 0, ry: 0 },       // "Don't add another item" -> the upsell
    { t: camOnButton(), fx: px, fy: py, z: 2.2, ty: 930, rx: 0, ry: 0 },          // the button, lit before the tap
    { t: tTap() + 0.7, fx: 214, fy: 262, z: 1.45, ty: 960, rx: 0, ry: 0 },        // pull back: result
    { t: cue("S2.2") - 0.05, fx: ox, fy: oy, z: 2.0, ty: 930, rx: 0, ry: 0 },      // the boost line
    { t: cue("S3") - 0.1, fx: tx, fy: ty, z: 2.0, ty: 930, rx: 0, ry: 0 },         // the free tee line
    { t: tReveal() - 0.12, fx: hx, fy: hy, z: 7.5, ty: 860, rx: 0, ry: 0 },        // dive into the tee thumbnail
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
  // the button lights up as the camera arrives on it, until the tap
  const a = camOnButton();
  const on = interpolate(t, [a, a + 0.3], [0, 1], clamp) * interpolate(t, [tTap() + 0.08, tTap() + 0.2], [1, 0], clamp);
  if (on <= 0.001) return null;
  const [x, y, w, h] = B.btn;
  const sweep = ((t - a) / 0.9) % 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 12, overflow: "hidden",
      boxShadow: `0 0 ${18 + 10 * Math.sin(t * 7)}px ${alpha(THEME.ui, 0.65 * on)}, 0 0 0 1.5px ${alpha(THEME.ui, 0.9 * on)}` }}>
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

/** "Don't add another item": the upsell row is ringed in grey and struck through. */
const NoUpsell: React.FC<{ t: number }> = ({ t }) => {
  const a = word("S2.0", "add") - 0.05;
  const k = interpolate(t, [a, a + 0.2], [0, 1], clamp) * (t < camOnButton() + 0.04 ? 1 : 0);   // gone with the upsell view
  if (k <= 0.001) return null;
  const [x, y, w, h] = B.upsell;
  const strike = interpolate(t, [word("S2.0", "another") - 0.05, word("S2.0", "item") + 0.1], [0, 1], clamp);
  return (
    <svg width={VW} height={VH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs><mask id="upsellHole"><rect width={VW} height={VH} fill="#fff" /><rect x={x} y={y} width={w} height={h} rx={12} fill="#000" /></mask></defs>
      <rect width={VW} height={VH} fill="#000" opacity={0.45 * k} mask="url(#upsellHole)" />
      <rect x={x} y={y} width={w} height={h} rx={12} fill="rgba(5,5,6,0.35)" opacity={k * strike} />
      <rect x={x} y={y} width={w} height={h} rx={12} fill="none" stroke="#C9CDD3" strokeWidth={1.6} strokeDasharray="6 5" opacity={k} />
      <line x1={x + 18} y1={y + h / 2 + 30} x2={x + 18 + (w - 36) * strike} y2={y + h / 2 + 30 - 60 * strike} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={k} />
    </svg>
  );
};

// ---------------------------------------------------------------- the screen
const Screen: React.FC<{ t: number }> = ({ t }) => {
  const tap = tTap();
  const loading = t >= tap + 0.1 && t < tap + 0.72;
  const done = interpolate(t, [tap + 0.72, tap + 0.86], [0, 1], clamp);
  // "Don't add another item": the drawer scrolled down to its "Complete your fit" upsell, then back up
  // clean cuts hidden inside the fast camera moves (a cross-fade would blend two scroll positions)
  const up = t >= cue("S2.0") - 0.08 && t < camOnButton() + 0.04 ? 1 : 0;
  const img = (name: string, style?: React.CSSProperties) => <Img src={staticFile(`shots-tee/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width: VW, height: VH, ...style }} />;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: VW, height: VH, transform: `scale(${S})`, transformOrigin: "0 0", overflow: "hidden" }}>
      {img(loading ? "03-loading" : "02-offer")}
      {up > 0 && img("01-upsell", { opacity: up })}
      {done > 0 && img("05-active", { opacity: done })}
      <ButtonLife t={t} />
      <Touch t={t} />
      <NoUpsell t={t} />
      <Spotlight box={B.bar} a={0.08} b={cue("S2.0") - 0.12} t={t} pad={3} />
      <Spotlight box={B.boost} a={word("S2.2", "tops") - 0.05} b={cue("S3") - 0.1} t={t} pad={2} />
      <Spotlight box={B.tee} a={cue("S3") - 0.06} b={tReveal() + 0.3} t={t} pad={2} />
    </div>
  );
};

// ---------------------------------------------------------------- scene
export const AdDemo: React.FC<SceneProps> = ({ from, to }) => {
  const local = useCurrentFrame();
  const frame = local + sec(from);
  const t = frame / FPS;
  const cam = camera(frame);
  const drift = 1 + 0.018 * CAMERA * Math.sin(t * 0.9);
  const z = cam.z * drift;
  const lx = cam.fx * S - SW / 2, ly = cam.fy * S - SH / 2;
  const pcx = CX - z * lx, pcy = cam.ty - z * ly;
  const whip = interpolate(frame, [0, 5], [8, 0], clamp);              // motion blur on the opening whip
  const cut = (at: number) => Math.max(0, 1 - Math.abs(t - at) / 0.09) * 3;  // blur over the hard screen swaps
  const travel = cut(cue("S2.0") - 0.08) + cut(camOnButton() + 0.04);
  const dive = interpolate(t, [tReveal() - 0.02, tReveal() + 0.18], [0, 1], clamp);
  const ex = { y: 0, s: 1, o: 1 - dive, b: dive * 10 };
  const exit = dive;
  const c = (ref: string, w: string, n = 0) => word(ref, w, n);
  const H = 360;            // below Meta's top 14 % (Reels/Stories UI)
  const brand = interpolate(frame, [2, 9], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ perspective: 2400 }}>
        <div style={{
          position: "absolute", left: pcx - PW / 2, top: pcy - PH / 2, width: PW, height: PH,
          transform: `translateY(${ex.y}px) scale(${z * ex.s}) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg)`, transformOrigin: "50% 50%",
          opacity: ex.o, filter: whip + ex.b + travel > 0.05 ? `blur(${whip + ex.b + travel}px)` : undefined,
        }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 78, background: THEME.phone,
            boxShadow: `0 60px 120px rgba(0,0,0,0.75), 0 0 0 2px #23252B, 0 0 90px ${alpha(THEME.teal, 0.18)}` }} />
          <div style={{ position: "absolute", left: BEZ, top: BEZ, width: SW, height: SH, borderRadius: 62, overflow: "hidden", background: "#fff" }}>
            <Screen t={t} />
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,5,6,0.97) 0%, rgba(5,5,6,0.92) 31%, rgba(5,5,6,0) 43%)" }} />
      {/* brand from frame 2 (Meta: brand in the first 3 s) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 282, display: "flex", justifyContent: "center", opacity: brand * (1 - exit) }}>
        <Img src={staticFile("logo-white.png")} style={{ width: 300, height: 29, opacity: 0.9 }} />
      </div>

      <Headline from={from} y={H} size={118} outAt={cue("S2.0") - 0.12}
        lines={[[{ text: "$3.41", at: 0.1, accent: true }, { text: "AWAY", at: c("S1.0", "away") }],
          [{ text: "FROM", at: c("S1.0", "from"), size: 82 }, { text: "A", at: c("S1.0", "a"), size: 82 }],
          [{ text: "FREE", at: c("S1.0", "free"), size: 92, accent: true }, { text: "T-SHIRT?", at: c("S1.0", "t-shirt"), size: 92, accent: true }]]} />
      <Headline from={from} y={H} size={88} outAt={camOnButton() - 0.05}
        lines={[[{ text: "DON'T", at: c("S2.0", "Don't") }, { text: "ADD", at: c("S2.0", "add") }], [{ text: "ANOTHER", at: c("S2.0", "another") }, { text: "ITEM.", at: c("S2.0", "item") }]]} />
      <Headline from={from} y={H} size={88} outAt={cue("S2.2") - 0.12}
        lines={[[{ text: "ONE", at: c("S2.1", "one") }, { text: "TAP.", at: c("S2.1", "tap"), accent: true }], [{ text: "POWERPLAY", at: c("S2.1", "PowerPlays"), accent: true }, { text: "IT.", at: c("S2.1", "cart") }]]} />
      <Headline from={from} y={H} size={84} outAt={cue("S3") - 0.12}
        lines={[[{ text: "TOPS", at: c("S2.2", "tops"), accent: true }, { text: "UP", at: c("S2.2", "up"), accent: true }], [{ text: "THE", at: c("S2.2", "the") }, { text: "DIFFERENCE.", at: c("S2.2", "difference") }]]} />
      <Headline from={from} y={H} size={116} outAt={tReveal() + 0.05}
        lines={[[{ text: "FREE", at: c("S3.0", "Free"), accent: true }, { text: "TEE", at: c("S3.0", "tee"), accent: true }]]} />
    </AbsoluteFill>
  );
};
