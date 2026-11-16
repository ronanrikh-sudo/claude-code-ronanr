import React from "react";
import { AbsoluteFill, Composition, Img, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";
import "../../../kit/remotion/fonts";
import { CC, displayStyle } from "../../../kit/remotion/theme";

const FPS = 30, W = 1080, H = 1920, TOTAL = 711;
const INK = "#16B3B7"; // marker colour (Diamond teal)
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** A real photograph, cover-cropped to 9:16 and slowly pushed in. Geometric transform only. Annotations are
 *  children of the same transformed box so they stay registered to the photo. */
const Photo: React.FC<{ src: string; from: number; dur: number; s0?: number; s1?: number; ox?: number; oy?: number; dx?: number; dy?: number; children?: React.ReactNode }> =
  ({ src, from, dur, s0 = 1, s1 = 1.06, ox = 540, oy = 960, dx = 0, dy = 0, children }) => {
    const f = useCurrentFrame(); // frame is already relative to the enclosing Sequence
    const s = interpolate(f, [0, dur], [s0, s1], clamp) + interpolate(f, [0, 5], [0.035, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
    return (
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${s})`, transformOrigin: `${ox}px ${oy}px` }}>
        <Img src={staticFile("lib/" + src)} data-photo={src} style={{ position: "absolute", height: H, width: "auto", left: "50%", top: 0, transform: "translateX(-50%)", maxWidth: "none" }} />
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>{children}</svg>
      </AbsoluteFill>
    );
  };

/** Hand-drawn stroke that draws on. `at` is an absolute frame. Always a separate layer over the photo. */
const Ink: React.FC<{ d: string; at: number; dur?: number; w?: number }> = ({ d, at, dur = 12, w = 10 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [1, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  if (f < at) return null;
  return (<>
    <path d={d} pathLength={1} fill="none" stroke="rgba(0,0,0,.35)" strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={p} />
    <path d={d} pathLength={1} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={p} />
  </>);
};
const Scrawl: React.FC<{ x: number; y: number; at: number; size?: number; rot?: number; children: string }> = ({ x, y, at, size = 78, rot = -4, children }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const o = interpolate(f, [at, at + 5], [0, 1], clamp), s = interpolate(f, [at, at + 7], [1.25, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (<text x={x} y={y} fontFamily="'Permanent Marker', cursive" fontSize={size} fill={INK} stroke="rgba(0,0,0,.45)" strokeWidth={10} paintOrder="stroke" opacity={o}
    transform={`rotate(${rot} ${x} ${y}) translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>{children}</text>);
};
// wobbly ellipse as one path (overshoots its start slightly, like a marker)
const loop = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx * 0.96} ${cy - ry * 0.2} C ${cx - rx} ${cy - ry * 1.15}, ${cx + rx * 0.95} ${cy - ry * 1.2}, ${cx + rx} ${cy - ry * 0.05} C ${cx + rx * 1.04} ${cy + ry * 1.15}, ${cx - rx * 0.9} ${cy + ry * 1.2}, ${cx - rx * 1.02} ${cy + ry * 0.1} C ${cx - rx * 1.05} ${cy - ry * 0.55}, ${cx - rx * 0.7} ${cy - ry * 1.0}, ${cx - rx * 0.35} ${cy - ry * 1.08}`;
const arrow = (x1: number, y1: number, cx: number, cy: number, x2: number, y2: number) => {
  const a = Math.atan2(y2 - cy, x2 - cx), h = 34;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2} M ${x2 - h * Math.cos(a - 0.5)} ${y2 - h * Math.sin(a - 0.5)} L ${x2} ${y2} L ${x2 - h * Math.cos(a + 0.5)} ${y2 - h * Math.sin(a + 0.5)}`;
};

// captions: lower-case, 2-4 words, synced to the measured voice-over. [text, start s, y, big?]
const CAPS: [string, number, number, boolean?][] = [
  ["you reckon 110 bucks", 0.0, 470], ["is a lot", 1.44, 470], ["for a hoodie?", 1.98, 470], ["fair.", 3.24, 470], ["here's what you get.", 3.88, 470],
  ["it's 350gsm fleece,", 5.1, 380], ["heavy,", 7.48, 380], ["and soft inside.", 7.78, 380],
  ["that wordmark's", 9.74, 370], ["not a print.", 10.42, 370], ["it's mesh appliqué", 11.36, 370], ["framed in embroidery.", 12.28, 370],
  ["both sleeves?", 14.16, 460], ["embroidered too.", 15.24, 460],
  ["and it's cut boxy.", 16.48, 1150],
  ["not every hoodie's", 18.26, 400, true], ["worth walking out in.", 19.14, 400, true], ["this one was made for it.", 20.48, 400, true],
];
const END_VO = 22.05;
const Captions: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  let i = -1; for (let k = 0; k < CAPS.length; k++) if (t >= CAPS[k][1]) i = k;
  if (i < 0 || t > END_VO) return null;
  const [text, start, y, big] = CAPS[i];
  const lf = f - Math.round(start * FPS);
  const s = interpolate(lf, [0, 4], [0.86, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: y, textAlign: "center", transform: `scale(${s})`, transformOrigin: "50% 50%",
      fontFamily: big ? CC.display : CC.body, fontWeight: big ? 900 : 800, fontStretch: big ? "118%" : undefined, fontStyle: big ? "italic" : undefined, textTransform: big ? "uppercase" : undefined,
      fontSize: big ? 74 : 76, lineHeight: 1.02, letterSpacing: big ? "-0.01em" : "-0.015em", color: "#fff",
      WebkitTextStroke: "14px rgba(8,9,10,.92)", paintOrder: "stroke fill", textShadow: "0 6px 26px rgba(0,0,0,.55)" }}>{text}</div>
  );
};

const S = { hook: 0, fleece: 147, mark: 288, sleeves: 420, boxy: 489, payoff: 543, end: 663 };
const Main: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: CC.black }}>
      <Sequence from={S.hook} durationInFrames={S.fleece - S.hook} layout="none">
        <Photo src="photo/hoodie-concrete/hero.jpg" from={S.hook} dur={147} s0={1.0} s1={1.08} oy={1000}>
          <Scrawl x={640} y={372} at={10} size={92} rot={-6}>$109.95?</Scrawl>
          <Ink d="M 630 398 C 720 386, 860 392, 1010 372" at={16} dur={10} w={9} />
        </Photo>
      </Sequence>
      <Sequence from={S.fleece} durationInFrames={S.mark - S.fleece} layout="none">
        <Photo src="photo/hoodie-concrete/closeup-front.jpg" from={S.fleece} dur={141} s0={1.02} s1={1.1} ox={300} oy={1500}>
          <Scrawl x={64} y={1262} at={72} size={96} rot={-5}>heavy.</Scrawl>
          <Ink d="M 70 1298 C 170 1316, 330 1310, 430 1284" at={80} dur={10} w={9} />
        </Photo>
      </Sequence>
      <Sequence from={S.mark} durationInFrames={S.sleeves - S.mark} layout="none">
        <Photo src="photo/hoodie-concrete/closeup-back.jpg" from={S.mark} dur={132} s0={1.0} s1={1.035} oy={800}>
          <Ink d={arrow(520, 470, 420, 480, 330, 512)} at={8} dur={10} />
          <Ink d="M 78 600 C 44 612, 40 640, 44 720 C 46 800, 44 850, 80 872" at={22} dur={10} />
          <Ink d="M 1004 452 C 1046 468, 1052 520, 1048 640 C 1046 740, 1048 800, 1006 826" at={26} dur={10} />
          <Ink d="M 250 1470 C 420 1500, 660 1500, 840 1462" at={88} dur={12} />
        </Photo>
      </Sequence>
      <Sequence from={S.sleeves} durationInFrames={S.boxy - S.sleeves} layout="none">
        <Photo src="photo/hoodie-concrete/sleeves.jpg" from={S.sleeves} dur={69} s0={1.0} s1={1.05} oy={900}>
          <Ink d={loop(236, 868, 196, 138)} at={8} dur={12} />
          <Ink d={loop(905, 1022, 222, 112)} at={34} dur={12} />
        </Photo>
      </Sequence>
      <Sequence from={S.boxy} durationInFrames={S.payoff - S.boxy} layout="none">
        <Photo src="photo/hoodie-concrete/studio-model-front.jpg" from={S.boxy} dur={54} s0={1.12} s1={1.18} oy={640}>
          <Ink d="M 286 430 C 280 560, 292 760, 284 905" at={14} dur={9} />
          <Ink d="M 862 430 C 870 560, 858 760, 866 905" at={18} dur={9} />
          <Ink d="M 300 956 C 460 968, 700 968, 852 954 M 300 936 L 300 978 M 852 934 L 852 976" at={24} dur={10} />
        </Photo>
      </Sequence>
      <Sequence from={S.payoff} durationInFrames={S.end - S.payoff} layout="none">
        <Photo src="photo/hoodie-concrete/hero.jpg" from={S.payoff} dur={120} s0={1.22} s1={1.32} oy={1060} />
      </Sequence>
      <Sequence from={S.end} layout="none">
        <AbsoluteFill style={{ background: CC.black, alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", top: 640, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 34,
            opacity: interpolate(f, [S.end, S.end + 6], [0, 1], clamp), transform: `scale(${interpolate(f, [S.end, S.end + 10], [1.04, 1], { ...clamp, easing: Easing.out(Easing.cubic) })})` }}>
            <Img src={staticFile("lib/logo/logo-white.png")} style={{ width: 640, height: "auto" }} />
            <div style={{ ...displayStyle, fontSize: 80, color: "#fff", whiteSpace: "nowrap", textAlign: "center" }}>Walkout Hoodie</div>
            <div style={{ fontFamily: CC.body, fontWeight: 700, fontSize: 46, letterSpacing: "0.14em", color: INK }}>350GSM · $109.95</div>
            <div style={{ fontFamily: CC.body, fontWeight: 600, fontSize: 38, color: CC.silver }}>cagecraftco.com</div>
          </div>
        </AbsoluteFill>
      </Sequence>
      {f < S.end && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 78%, rgba(0,0,0,.3) 100%)" }} />}
      <Captions />
    </AbsoluteFill>
  );
};
export const Root: React.FC = () => <Composition id="Main" component={Main} width={W} height={H} fps={FPS} durationInFrames={TOTAL} />;
