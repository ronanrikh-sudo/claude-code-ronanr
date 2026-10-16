// HTML elements that ride on the 3D stage: gift labels, the hero products over the seven-day
// strip, the crisp CAGECRAFT wordmark over its voxel twin, and the shop-now sign-off.
// Positions come from projecting the stage through the same camera the 3D layer uses.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { FPS } from "../config";
import { alpha, BRAND, display, label, THEME } from "../theme";
import { M, word, wordEnd } from "../timing";
import { project } from "../world/camera";
import { GIFT_LABELS, GIFT_SPOTS, giftsRotation, LOGO, STAGE, WEEK, WEEK_ROT } from "../world/formations";
import { BOUNCY, clamp, sp, SNAPPY, SOFT } from "../components/motion";

const worldOf = (local: THREE.Vector3, rot?: THREE.Quaternion) =>
  local.clone().applyQuaternion(rot ?? new THREE.Quaternion()).add(STAGE);
const fadeWindow = (t: number, a: number, b: number, f = 0.15) =>
  Math.min(interpolate(t, [a, a + f], [0, 1], clamp), interpolate(t, [b - f, b], [1, 0], clamp));

// ------------------------------------------------------------------ FREE GIFTS labels
const GiftLabels: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const from = word("gifts"), to = word("months") - 0.15;
  if (t < from - 0.1 || t > to) return null;
  return (
    <>
      {GIFT_LABELS.map(([g, text, dy], k) => {
        const at = from + (g === 0 ? 0.35 : (g - 1) * 0.11 + 0.12);
        const p = sp(frame, at * FPS, SNAPPY);
        const pt = project(t, worldOf(GIFT_SPOTS[g as 0 | 1 | 2 | 3].clone().add(new THREE.Vector3(0, dy, 0)), giftsRotation(t)));
        return (
          <div key={k} style={{ position: "absolute", left: pt.x, top: pt.y, transform: `translate(-50%, ${(1 - p) * 18}px)`,
            opacity: Math.min(1, p * 1.5) * fadeWindow(t, at, to), whiteSpace: "nowrap", textAlign: "center" }}>
            <div style={{ ...label(24), color: g === 0 ? THEME.pinkSoft : THEME.text, padding: "7px 14px",
              border: `1.5px solid ${alpha(g === 0 ? THEME.pink : "#FFFFFF", 0.5)}`, borderRadius: 999,
              background: "rgba(5,5,6,0.72)" }}>{text}</div>
          </div>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ ONE WEEK ONLY: products + day labels
const PRODUCTS = [
  { src: "img/cut-jersey-tiffany.png", h: 330, x: -0.95, glow: THEME.teal, name: "FIGHT JERSEY 2.0" },
  { src: "img/cut-hoodie-cottoncandy.png", h: 380, x: 0, glow: THEME.pink, name: "WALKOUT HOODIE" },
  { src: "img/cut-shorts-legacy.png", h: 230, x: 0.95, glow: THEME.teal, name: "LEGACY SHORTS" },
];
const Week: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const from = word("one"), to = word("this") - 0.12;
  if (t < from || t > to + 0.1) return null;
  const only = word("only");
  return (
    <>
      {Array.from({ length: 7 }, (_, d) => {
        const pt = project(t, worldOf(new THREE.Vector3((d - 3) * WEEK.pitch, WEEK.y - 0.27, 0.2), WEEK_ROT));
        const at = word("week") + d * 0.045;
        return (
          <div key={d} style={{ position: "absolute", left: pt.x, top: pt.y, transform: "translateX(-50%)",
            ...label(20), letterSpacing: "0.1em", color: t > at ? THEME.tealSoft : THEME.dim, opacity: fadeWindow(t, from + 0.25, to) }}>
            {`DAY ${d + 1}`}
          </div>
        );
      })}
      {PRODUCTS.map((p, k) => {
        const at = only - 0.05 + k * 0.09;
        const s = sp(frame, at * FPS, BOUNCY);
        if (t < at) return null;
        const base = project(t, worldOf(new THREE.Vector3(p.x, WEEK.y + 0.3, 0), WEEK_ROT));
        const turn = Math.sin((t - at) * 2.2 + k) * 16;
        const out = interpolate(t, [to - 0.18, to], [0, 1], clamp);
        return (
          <div key={k} style={{ position: "absolute", left: base.x, top: base.y, width: 0, height: 0, perspective: 900,
            opacity: (1 - out), transform: `translateY(${(1 - s) * 90 - out * 40}px) scale(${0.6 + 0.4 * s})` }}>
            <div style={{ position: "absolute", left: -170, top: -p.h - 60, width: 340, height: p.h + 80,
              background: `radial-gradient(ellipse 50% 45% at 50% 55%, ${alpha(p.glow, 0.42)}, transparent 72%)` }} />
            <Img src={staticFile(p.src)} style={{ position: "absolute", height: p.h, left: "50%", bottom: 0,
              transform: `translateX(-50%) rotateY(${turn}deg)`, filter: "drop-shadow(0 22px 26px rgba(0,0,0,0.7))" }} />
          </div>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ THIS IS CAGECRAFT + SHOP NOW
const SignOff: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const lock = word("cagecraft");
  if (t < lock) return null;
  // crisp wordmark sits exactly over the voxel one, then rises for the CTA
  const left = project(t, STAGE.clone().add(new THREE.Vector3(-LOGO.width / 2, LOGO.y, 0)));
  const right = project(t, STAGE.clone().add(new THREE.Vector3(LOGO.width / 2, LOGO.y, 0)));
  const shop = word("shop");
  const rise = sp(frame, (shop - 0.25) * FPS, SOFT);
  const w0 = right.x - left.x;
  const w = w0 * (1 - 0.12 * rise);
  const cy = (left.y + right.y) / 2 - rise * 20;
  const appear = interpolate(t, [lock + 0.08, lock + 0.3], [0, 1], clamp);
  const sweep = interpolate(t, [lock + 0.15, lock + 0.75], [-0.3, 1.3], clamp);
  // button
  const b = sp(frame, (shop - 0.04) * FPS, BOUNCY);
  const hit = t - M.finalHit;
  const press = hit < 0 ? 1 : 1 - 0.07 * Math.exp(-hit * 18) * Math.sin(Math.min(Math.PI, hit * 30));
  const ring = hit > 0 ? hit : -1;
  const line = sp(frame, (wordEnd("now") - 0.1) * FPS, SNAPPY);
  const fine = sp(frame, (M.finalHit + 0.15) * FPS, SNAPPY);
  return (
    <>
      <div style={{ position: "absolute", left: 540 - w / 2, top: cy, width: w, transform: "translateY(-50%)", opacity: appear }}>
        <Img src={staticFile("img/logo-white.png")} style={{ width: "100%", display: "block",
          filter: `drop-shadow(0 0 ${18 + 30 * (1 - appear)}px rgba(255,255,255,${0.25 + 0.4 * (1 - appear)}))` }} />
        <div style={{ position: "absolute", inset: 0, mixBlendMode: "overlay",
          WebkitMaskImage: `url(${staticFile("img/logo-white.png")})`, WebkitMaskSize: "100% 100%",
          background: `linear-gradient(105deg, transparent ${sweep * 100 - 18}%, rgba(255,255,255,1) ${sweep * 100}%, transparent ${sweep * 100 + 18}%)` }} />
      </div>
      {t >= shop - 0.05 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: cy + 120, textAlign: "center", opacity: line,
            transform: `translateY(${(1 - line) * 16}px)`, ...label(27), color: THEME.muted }}>
            UP TO 40% OFF <span style={{ color: THEME.teal }}>·</span> FREE GIFTS <span style={{ color: THEME.teal }}>·</span> ONE WEEK ONLY
          </div>
          <div style={{ position: "absolute", left: 540, top: 1130, transform: `translate(-50%,-50%) scale(${(0.5 + 0.5 * b) * press})`, opacity: Math.min(1, b * 1.6) }}>
            {ring >= 0 && ring < 0.9 && (
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 520, height: 150, borderRadius: 999,
                border: `3px solid ${THEME.teal}`, transform: `translate(-50%,-50%) scale(${1 + ring * 0.9})`, opacity: 1 - ring / 0.9 }} />
            )}
            <div style={{ padding: "34px 86px", borderRadius: 999, background: THEME.teal, whiteSpace: "nowrap",
              boxShadow: `0 0 ${50 + (ring >= 0 ? 90 * Math.exp(-ring * 3) : 0)}px ${alpha(THEME.teal, 0.6)}, 0 24px 60px rgba(0,0,0,0.6)` }}>
              <span style={{ ...display(66), color: "#03181A" }}>SHOP NOW</span>
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1255, textAlign: "center", opacity: line,
            ...label(30), letterSpacing: "0.16em", color: THEME.text }}>{BRAND.url}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", opacity: fine * 0.85,
            ...label(19), color: THEME.dim }}>T&amp;Cs apply. Offer details at {BRAND.url}</div>
        </>
      )}
    </>
  );
};

export const StageOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill>
      <GiftLabels t={t} frame={frame} />
      <Week t={t} frame={frame} />
      <SignOff t={t} frame={frame} />
    </AbsoluteFill>
  );
};
