// WAR FC fight shorts proposal deck: 1920x1080 slides at 2x (4K PNG) + PDF.
// Same house format as the Rival Gym deck (cagecraft-wholesale-process skill).
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from './pw.mjs';
import { warLogo, axLogo, cagecraftLogo, CROWN_D, CROWN_BOX, WAR_RED, WHITE } from './brand.mjs';
import { CONCEPTS, PRODUCTS } from './shorts.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CUT = path.join(ROOT, 'out/products/cutouts_cropped');
const OUT = path.join(ROOT, 'out/deck');
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f));
const META = JSON.parse(fs.readFileSync(path.join(CUT, 'meta.json'), 'utf8'));
const MAX_H = Math.max(...Object.values(META).map((m) => m.h));
const b64 = (p) => `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
const cut = (name) => b64(path.join(CUT, `${name}.png`));
const full = (name) => b64(path.join(ROOT, 'out/products', `${name}.png`));

const svgOf = (logo, w, extra = '') => {
  const [x0, y0, x1, y1] = logo.box;
  return `<svg viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" width="${w}" style="display:block;${extra}">${logo.svg}</svg>`;
};
const CC_DARK = svgOf(cagecraftLogo('#1a1a1a'), 150);
const CC_LIGHT = svgOf(cagecraftLogo('#f4f4f2'), 150);

const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:1920px;height:1080px;overflow:hidden}
  body{font-family:Inter,sans-serif;color:#111;-webkit-font-smoothing:antialiased}
  .slide{position:relative;width:1920px;height:1080px;overflow:hidden}
  .light{background:radial-gradient(ellipse 85% 75% at 50% 52%,#e2e2e0 0%,#d2d2d0 58%,#bdbdbb 100%)}
  .dark{background:#0d0d0d;color:#f4f4f2}
  .kicker{font:600 15px/1 Inter;letter-spacing:.28em;text-transform:uppercase;color:#6a6a6a}
  .dark .kicker{color:#8a8a8a}
  .title{font:900 64px/1 'Inter Display',Inter;letter-spacing:-.01em;text-transform:uppercase}
  .sub{font:500 21px/1.35 Inter;color:#4a4a4a}
  .dark .sub{color:#b5b5b3}
  .red{color:${WAR_RED}}
  .hdr{position:absolute;left:84px;top:66px;right:84px;display:flex;justify-content:space-between;align-items:flex-start}
  .credit{display:flex;align-items:center;gap:12px;font:600 13px/1 Inter;letter-spacing:.22em;text-transform:uppercase;color:#6a6a6a}
  .chips{display:flex;gap:26px;align-items:center}
  .chip{display:flex;align-items:center;gap:10px;font:600 15px/1 Inter;color:#333}
  .chip i{display:block;width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(0,0,0,.25)}
  .foot{position:absolute;left:84px;right:84px;bottom:52px;display:flex;justify-content:space-between;align-items:center}
  .pg{font:600 13px/1 Inter;letter-spacing:.2em;color:#8a8a8a}
  .cap{font:800 19px/1 'Inter Display',Inter;letter-spacing:.14em;text-transform:uppercase;text-align:center}
  .capn{font:500 15px/1.3 Inter;color:#5d5d5d;text-align:center;margin-top:8px}
  .num{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:${WAR_RED};color:#fff;font:800 16px/1 Inter;flex:none;box-shadow:0 4px 10px rgba(0,0,0,.25)}
  .note{font:500 17px/1.45 Inter;color:#333}
  .note b{font-weight:800;color:#111}
`;

const header = (kicker, title, sub) => `
  <div class="hdr">
    <div><div class="kicker">${kicker}</div><div class="title" style="margin-top:16px">${title}</div>
    ${sub ? `<div class="sub" style="margin-top:14px">${sub}</div>` : ''}</div>
    <div class="credit" style="margin-top:4px">Designed by ${CC_DARK}</div>
  </div>`;
const footer = (n, left = '') => `<div class="foot"><div>${left}</div><div class="pg">WAR FC × CAGECRAFT — ${String(n).padStart(2, '0')}</div></div>`;
const chips = (c) => `<div class="chips">
  <div class="chip"><i style="background:${c.base}"></i>Base: ${c.key === 'black' ? 'Black' : 'WAR Red'}</div>
  <div class="chip"><i style="background:${c.panel}"></i>Side panels: ${c.key === 'black' ? 'WAR Red' : 'Black'}</div>
  <div class="chip"><i style="background:#F4F4F2"></i>Marks: White</div>
  <div class="chip"><i style="background:${c.tone}"></i>Crown monogram: tonal</div></div>`;

// tonal crown monogram as a CSS-free SVG background block
function monoBg(w, h, tone, scale = 1) {
  const cw = 80 * scale, s = cw / (CROWN_BOX[2] - CROWN_BOX[0]), tw = 260 * scale, th = 215 * scale;
  const crown = (x, y) => `<path transform="translate(${x - cw / 2} ${y - 20 * scale}) scale(${s}) translate(${-CROWN_BOX[0]} 0)" d="${CROWN_D}" fill="${tone}"/>`;
  return `<svg width="${w}" height="${h}" style="position:absolute;left:0;top:0"><defs><pattern id="mb" width="${tw}" height="${th}" patternUnits="userSpaceOnUse">${crown(0, 0)}${crown(tw, 0)}${crown(0, th)}${crown(tw, th)}${crown(tw / 2, th / 2)}</pattern></defs><rect width="100%" height="100%" fill="url(#mb)"/></svg>`;
}

// --- slides ------------------------------------------------------------------------------
function cover() {
  const logo = warLogo({ red: WAR_RED, white: WHITE });
  return `<div class="slide dark">
    ${monoBg(1920, 1080, '#171717', 1.1)}
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 55% at 50% 45%,rgba(13,13,13,.0) 0%,rgba(13,13,13,.85) 75%)"></div>
    <div style="position:absolute;left:84px;top:72px" class="kicker">Event fight shorts · Uniform proposal</div>
    <div style="position:absolute;right:84px;top:66px" class="credit">Designed by ${CC_LIGHT}</div>
    <div style="position:absolute;left:0;right:0;top:230px;display:flex;justify-content:center">${svgOf(logo, 960)}</div>
    <div style="position:absolute;left:0;right:0;top:668px;text-align:center">
      <div style="font:900 44px/1 'Inter Display';letter-spacing:.2em;text-transform:uppercase">Official <span class="red">Fight Shorts</span></div>
      <div class="sub" style="margin-top:20px;font-size:22px">Fight Short &amp; Compression Short — two design directions, front and back</div>
    </div>
    <div class="foot"><div class="pg" style="color:#777;display:flex;align-items:center;gap:14px">PRESENTING SPONSOR ${svgOf(axLogo('#9a9a98'), 44)}</div><div class="pg" style="color:#777">NOVEMBER 2026</div></div>
  </div>`;
}

function directionsSlide(n) {
  const k = 0.47;
  const tile = (c) => {
    const nm = `fight-short_${c.key}_front`, m = META[nm];
    return `<div style="display:flex;flex-direction:column;align-items:center;width:820px">
      <img src="${cut(nm)}" style="width:${Math.round(m.w * k)}px;height:${Math.round(m.h * k)}px;display:block">
      <div class="cap" style="margin-top:18px;font-size:22px">${c.label} · ${c.name}</div>
      <div class="capn" style="max-width:640px">${c.sub}</div></div>`;
  };
  return `<div class="slide light">
    ${header('Two directions', 'Pick your <span class="red">war paint</span>', 'Both built for the cage: no external drawstring, a raised waistband logo panel, and every logo on clean ground.')}
    <div style="position:absolute;left:84px;right:84px;top:262px;display:flex;justify-content:space-around">${Object.values(CONCEPTS).map(tile).join('')}</div>
    ${footer(n)}
  </div>`;
}

function placementSlide(n) {
  const k = 0.42;
  const at = (name, x, y) => { const m = META[name]; return [(x - m.box[0]) * k, (y - m.box[1]) * k]; };
  const pin = (name, x, y, i) => { const [px, py] = at(name, x, y); return `<div class="num" style="position:absolute;left:${px - 17}px;top:${py - 17}px">${i}</div>`; };
  const fig = (name, pins, label) => {
    const m = META[name];
    return `<div style="position:relative;width:${m.w * k}px;height:${m.h * k}px">
      <img src="${cut(name)}" style="width:100%;height:100%;display:block">${pins.map(([x, y, i]) => pin(name, x, y, i)).join('')}
      <div class="kicker" style="position:absolute;left:0;right:0;bottom:-34px;text-align:center;font-size:12px">${label}</div></div>`;
  };
  const front = fig('fight-short_A_front', [[770, 1112, 1], [1290, 1705, 2], [1205, 735, 3], [600, 717, 5]], 'Front');
  const back = fig('fight-short_A_back', [[1350, 1030, 4], [720, 1712, 2], [1170, 721, 3], [600, 717, 5]], 'Back');
  const rows = [
    ['WAR FC primary logo', 'Upper front leg: crown, wordmark and FIGHTING CHAMPIONSHIPS on clean ground.'],
    ['AX Carpentry, presenting sponsor', 'Lower front leg, and again on the back of the leg for walkouts and cage-side shots.'],
    ['CAGECRAFT', 'Emblem on the raised waistband logo panel at the front; wordmark centred on the back waistband.'],
    ['WAR FC back crest', 'Full logo with PROVE YOU BELONG across the back, below the waistband.'],
    ['Waistband band', 'Key-pattern band (A) or twin red stripes (B) either side of the logo panel.'],
    ['PROVE YOU BELONG sash', 'Concept B only: a diagonal sash across the lower outer leg.'],
  ];
  return `<div class="slide light">
    ${header('Logo placement', 'Every logo has a <span class="red">home</span>', 'Shown on the Concept A Fight Short; the Compression Short and Concept B follow the same map.')}
    <div style="position:absolute;left:70px;top:236px;display:flex;gap:30px">${front}${back}</div>
    <div style="position:absolute;left:1170px;right:84px;top:270px;display:flex;flex-direction:column;gap:22px">
      ${rows.map(([h, t], i) => `<div style="display:flex;gap:16px;align-items:flex-start"><span class="num">${i + 1}</span><div class="note"><b>${h}</b><br>${t}</div></div>`).join('')}
    </div>
    ${footer(n)}
  </div>`;
}

function productSlide(p, c, n) {
  const k = Math.min(0.6, 650 / MAX_H);
  const cell = (view) => {
    const name = `${p.key}_${c.key}_${view}`, m = META[name];
    return `<div style="display:flex;flex-direction:column;align-items:center">
      <div style="height:${Math.round(MAX_H * k)}px;display:flex;align-items:center"><img src="${cut(name)}" style="width:${Math.round(m.w * k)}px;height:${Math.round(m.h * k)}px;display:block"></div>
      <div class="cap" style="margin-top:20px">${view}</div></div>`;
  };
  return `<div class="slide light">
    ${header(`${c.label} · ${p.label} · ${p.sub}`, `${c.name} <span class="red">·</span> ${p.label}`, c.sub)}
    <div style="position:absolute;left:120px;right:120px;top:236px;display:flex;justify-content:space-around;align-items:flex-start">${cell('front')}${cell('back')}</div>
    ${footer(n, `<div class="chips"><div class="chip"><i style="background:#141414"></i>Black</div><div class="chip"><i style="background:${WAR_RED}"></i>WAR Red #ED1C24</div><div class="chip"><i style="background:#F4F4F2"></i>White</div></div>`)}
  </div>`;
}

function detailsSlide(n) {
  // full-res crops from the 2000x2500 product renders
  const crop = (name, x, y, w, h, label, note) => {
    const tw = 400, th = Math.round((tw * h) / w), sc = tw / w;
    return `<div style="width:${tw}px">
      <div style="width:${tw}px;height:${th}px;border-radius:14px;overflow:hidden;box-shadow:0 14px 30px rgba(0,0,0,.18);background:url(${full(name)}) ${-x * sc}px ${-y * sc}px / ${2000 * sc}px ${2500 * sc}px no-repeat"></div>
      <div class="cap" style="text-align:left;margin-top:16px;font-size:16px">${label}</div><div class="capn" style="text-align:left">${note}</div></div>`;
  };
  return `<div class="slide light">
    ${header('Up close', 'The <span class="red">details</span>', '')}
    <div style="position:absolute;left:84px;right:84px;top:240px;display:flex;justify-content:space-between">
      ${crop('fight-short_A_front', 720, 580, 560, 644, 'Waistband logo panel', 'Raised panel with the CAGECRAFT emblem; key-pattern band either side. No external drawstring.')}
      ${crop('fight-short_A_front', 1150, 1270, 520, 598, 'Smoke &amp; stone', 'Stone-flake black with red and white smoke rising from the hem and side splits.')}
      ${crop('fight-short_B_front', 1100, 1150, 520, 598, 'PROVE YOU BELONG sash', 'Diagonal sash with red keylines across the lower outer leg.')}
      ${crop('fight-short_B_front', 380, 1290, 520, 598, 'Brushed war streaks', 'Dry-brush streaks drawn from the WAR FC logo, tonal across the whole short.')}
    </div>
    ${footer(n)}
  </div>`;
}

function lineupSlide(n) {
  const k = Math.min(0.25, 330 / MAX_H);
  const img = (name) => { const m = META[name]; return `<img src="${cut(name)}" style="width:${Math.round(m.w * k)}px;height:${Math.round(m.h * k)}px;display:block">`; };
  const col = (c) => `<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
      <div class="cap" style="font-size:22px">${c.label} · ${c.name}</div><div class="capn" style="margin:0 0 14px">Front and back</div>
      ${Object.values(PRODUCTS).map((p) => `<div style="display:flex;gap:16px;align-items:center;height:${Math.round(MAX_H * k)}px">${img(`${p.key}_${c.key}_front`)}${img(`${p.key}_${c.key}_back`)}</div>
        <div class="kicker" style="font-size:11px;margin-bottom:8px">${p.label}</div>`).join('')}
    </div>`;
  return `<div class="slide light">
    ${header('The full set', 'Two cuts. <span class="red">Two directions.</span>', '')}
    <div style="position:absolute;left:84px;right:84px;top:200px;display:flex;justify-content:space-around">${Object.values(CONCEPTS).map(col).join('')}</div>
    ${footer(n)}
  </div>`;
}

function partnershipSlide(n) {
  const card = (title, body) => `<div style="flex:1;background:#121212;color:#f4f4f2;border-radius:18px;padding:34px 36px;box-shadow:0 18px 40px rgba(0,0,0,.18)">
      <div class="kicker" style="color:#8a8a8a;font-size:12px">${title}</div><div style="margin-top:18px;font:500 19px/1.55 Inter;color:#e2e2e0">${body}</div></div>`;
  return `<div class="slide light">
    ${header('The partnership', 'In-kind <span class="red">sponsorship</span>', 'As discussed with Benny.')}
    <div style="position:absolute;left:84px;right:84px;top:300px;display:flex;gap:28px">
      ${card('CAGECRAFT provides', 'Official WAR FC fight shorts in the Fight Short and/or Compression cut, in the chosen direction, branded with WAR FC, AX Carpentry and CAGECRAFT.')}
      ${card('WAR FC provides', 'CAGECRAFT on WAR FC fight posters, venue access, and CAGECRAFT featured across WAR FC social media branding and collaborations.')}
    </div>
    <div style="position:absolute;left:84px;right:84px;top:640px">
      <div class="kicker">Next steps</div>
      <div style="display:flex;gap:40px;margin-top:22px" class="note">
        ${[['1', 'Pick a direction: Smoke &amp; Stone or War Streaks.'], ['2', 'Pick the cut(s): Fight Short, Compression, or both.'], ['3', 'Fighter roster: sizes and event date.'], ['4', 'We lock production and the sponsorship schedule.']]
          .map(([i, t]) => `<div style="display:flex;gap:14px;align-items:flex-start;flex:1"><span class="num">${i}</span><div>${t}</div></div>`).join('')}
      </div>
    </div>
    ${footer(n)}
  </div>`;
}

const P = PRODUCTS, C = CONCEPTS;
const slides = [
  cover(), directionsSlide(2), placementSlide(3),
  productSlide(P['fight-short'], C.A, 4), productSlide(P.compression, C.A, 5),
  productSlide(P['fight-short'], C.B, 6), productSlide(P.compression, C.B, 7),
  detailsSlide(8), lineupSlide(9), partnershipSlide(10),
];
const names = ['01_cover', '02_two-directions', '03_logo-placement', '04_A-fight-short', '05_A-compression', '06_B-fight-short', '07_B-compression', '08_details', '09_full-set', '10_partnership'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
const pngs = [];
for (let i = 0; i < slides.length; i++) {
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${slides[i]}</body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const file = path.join(OUT, `${names[i]}.png`);
  await page.screenshot({ path: file });
  pngs.push(file);
  console.log('slide', names[i]);
}
const jpgs = [];
for (const f of pngs) {
  await page.setContent(`<html><body style="margin:0"><img src="${b64(f)}" style="width:1920px;height:1080px;display:block"></body></html>`);
  const jf = f.replace(/\.png$/, '.jpg');
  await page.screenshot({ path: jf, type: 'jpeg', quality: 90 });
  jpgs.push(jf);
}
const pdfPage = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await pdfPage.setContent(`<!doctype html><html><head><style>@page{size:1920px 1080px;margin:0}body{margin:0}img{width:1920px;height:1080px;display:block;page-break-after:always}</style></head><body>${jpgs
  .map((j) => `<img src="data:image/jpeg;base64,${fs.readFileSync(j).toString('base64')}">`).join('')}</body></html>`, { waitUntil: 'load' });
await pdfPage.pdf({ path: path.join(OUT, 'WAR-FC-Fight-Shorts-Proposal.pdf'), width: '1920px', height: '1080px', printBackground: true });
for (const j of jpgs) fs.unlinkSync(j);
await browser.close();
console.log('pdf done');
