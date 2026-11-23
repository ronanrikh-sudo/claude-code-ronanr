// WAR FC fight shorts proposal deck: 1920x1080 slides at 2x (4K PNG) + PDF.
// Same house format as the Rival Gym deck (cagecraft-wholesale-process skill).
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from './pw.mjs';
import { warLogo, axLogo, axWordmark, axEmblem, cagecraftLogo, emblemLogo, CROWN_D, CROWN_BOX, WAR_RED, WHITE } from './brand.mjs';
import { CONCEPTS, PRODUCTS, FRONT_OPTIONS, REC } from './shorts.mjs';

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
      <div class="sub" style="margin-top:20px;font-size:22px">Fight Short &amp; Compression Short — Black Corner and White Corner, front and back</div>
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
      <div class="cap" style="margin-top:18px;font-size:22px">${c.label}</div>
      <div class="capn" style="max-width:640px">${c.sub}</div></div>`;
  };
  return `<div class="slide light">
    ${header('War Streaks', 'One design. <span class="red">Two corners.</span>', 'Brushed streaks from the WAR FC logo, with a white alternate for the opposite corner so opponents are instantly distinguishable.')}
    <div style="position:absolute;left:84px;right:84px;top:262px;display:flex;justify-content:space-around">${Object.values(CONCEPTS).map(tile).join('')}</div>
    ${footer(n)}
  </div>`;
}

// front directions: columns = options A/B/C, rows = products, all in one corner
function optionsSlide(prods, corner, n) {
  const rows = prods.length;
  const names = Object.keys(FRONT_OPTIONS).flatMap((o) => prods.map((p) => `${p.key}_${corner.key}_front-${o}`));
  const rowH = rows === 1 ? 560 : 300;
  const k = Math.min(0.45, rowH / MAX_H, 540 / Math.max(...names.map((nm) => META[nm].w)));
  const img = (nm) => { const m = META[nm]; return `<img src="${cut(nm)}" style="width:${Math.round(m.w * k)}px;height:${Math.round(m.h * k)}px;display:block">`; };
  const col = (o) => `<div style="width:560px;display:flex;flex-direction:column;align-items:center">
      ${prods.map((p) => `<div style="height:${Math.round(MAX_H * k)}px;display:flex;align-items:center">${img(`${p.key}_${corner.key}_front-${o.key}`)}</div>`).join('<div style="height:10px"></div>')}
      <div class="cap" style="margin-top:18px;font-size:20px">${o.label} · ${o.name}${o.key === REC ? ' <span class="red">· Recommended</span>' : ''}</div>
      <div class="capn" style="max-width:500px">${o.sub}</div></div>`;
  const what = rows === 1 ? `${prods[0].label} · ${corner.label}` : `${corner.label} · both cuts`;
  return `<div class="slide light">
    ${header(`Front directions · ${what}`, 'Three ways to <span class="red">lead with WAR</span>', 'The WAR logo moves off the centre and onto the leg. Back, sides, sash and waistband stay as approved.')}
    <div style="position:absolute;left:84px;right:84px;top:${rows === 1 ? 250 : 236}px;display:flex;justify-content:space-between">${Object.values(FRONT_OPTIONS).map(col).join('')}</div>
    ${footer(n)}
  </div>`;
}

function logoSystemSlide(n) {
  const L = { red: WAR_RED, white: WHITE };
  const tile = (inner, label, note) => `<div style="width:564px">
      <div style="background:#121212;border-radius:16px;height:250px;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 30px rgba(0,0,0,.16)">${inner}</div>
      <div class="cap" style="text-align:left;margin-top:14px;font-size:16px">${label}</div><div class="capn" style="text-align:left;margin-top:6px">${note}</div></div>`;
  const row = (title, tiles) => `<div><div class="kicker" style="font-size:12px;margin-bottom:14px">${title}</div><div style="display:flex;gap:30px">${tiles.join('')}</div></div>`;
  return `<div class="slide light">
    ${header('Logo system', 'Every logo, <span class="red">two ways</span>', 'Each brand gets a primary and a secondary lockup, so the logos look designed into the kit, not stuck on.')}
    <div style="position:absolute;left:84px;right:84px;top:250px;display:flex;flex-direction:column;gap:34px">
      ${row('WAR Fighting Championships', [
        tile(svgOf(warLogo(L, ['Crown', 'WAR', 'FIGHTING_CHAMPIONSHIPS']), 400), 'Full crest · front (Option A)', 'Big and level on the lower left leg.'),
        tile(svgOf(warLogo(L, ['WAR', 'FIGHTING_CHAMPIONSHIPS']), 440), 'Long wordmark · back (and front B, C)', 'Below the back waistband; vertical (B) or level (C) on the front leg.'),
        tile(svgOf(warLogo(L, ['Crown']), 190), 'Crown · back leg (and front B, C)', 'The crown on its own, on the open leg.'),
      ])}
      ${row('AX Carpentry · presenting sponsor  /  CAGECRAFT · kit partner', [
        tile(svgOf(axLogo(WHITE), 200), 'AX logo · as supplied', 'Their primary logo, for posters and socials.'),
        tile(svgOf(axWordmark(WHITE), 470), 'AX wordmark · both sides', 'The same wordmark runs the full height of both sides. Built from AX’s own monogram and lettering; for AX’s sign-off.'),
        tile(`<div style="display:flex;align-items:center;gap:40px">${svgOf(emblemLogo(WHITE), 170)}${svgOf(cagecraftLogo(WHITE), 230)}</div>`, 'CAGECRAFT · waistband', 'Emblem on the front panel; wordmark at the back.'),
      ])}
    </div>
    ${footer(n)}
  </div>`;
}

const VIEWS = [['front', 'Front'], ['back', 'Back'], ['side-wordmark', 'Side · right'], ['side-sash', 'Side · left (sash)']];

function placementSlide(n) {
  const base = 'fight-short_black_';
  const widths = VIEWS.reduce((a, [v]) => a + META[base + v].w, 0);
  const k = Math.min(0.36, (1760 - 3 * 26) / widths);
  const at = (name, x, y) => { const m = META[name]; return [(x - m.box[0]) * k, (y - m.box[1]) * k]; };
  const pin = (name, x, y, i) => { const [px, py] = at(name, x, y); return `<div class="num" style="position:absolute;left:${px - 17}px;top:${py - 17}px">${i}</div>`; };
  const fig = (view, pins, label) => {
    const name = base + view, m = META[name];
    return `<div style="position:relative;width:${m.w * k}px;height:${MAX_H * k}px;display:flex;align-items:center">
      <div style="position:relative;width:${m.w * k}px;height:${m.h * k}px"><img src="${cut(name)}" style="width:100%;height:100%;display:block">${pins.map(([x, y, i]) => pin(name, x, y, i)).join('')}</div>
      <div class="kicker" style="position:absolute;left:-20px;right:-20px;bottom:-30px;text-align:center;font-size:11px">${label}</div></div>`;
  };
  const figs = [
    fig('front', [[960, 1690, 1], [1132, 1730, 5], [1186, 716, 6], [556, 716, 7]], 'Front (Option A)'),
    fig('back', [[1335, 905, 2], [1272, 1370, 3], [1200, 716, 6]], 'Back'),
    fig('side-wordmark', [[1045, 880, 4]], 'Side · wearer’s right'),
    fig('side-sash', [[1240, 860, 4], [1330, 1060, 5]], 'Side · wearer’s left'),
  ];
  const rows = [
    ['WAR FC crest (hero)', 'Option A: big and level on the lower left leg. See the three front directions.'],
    ['WAR FC wordmark', 'Supporting: level and smaller, across the back below the waistband.'],
    ['WAR crown', 'The crown emblem on the open back leg.'],
    ['AX Carpentry wordmark', 'Presenting sponsor: the same wordmark runs the full height of both sides.'],
    ['PROVE YOU BELONG sash', 'Across the right front leg, wrapping round the side.'],
    ['CAGECRAFT', 'Emblem in the front waistband panel; modest wordmark at the back.'],
    ['Crest bar', 'WAR crown and spear bars between red rules on the waistband.'],
  ];
  const top = 230, figH = MAX_H * k;
  return `<div class="slide light">
    ${header('Logo placement', 'Every logo has a <span class="red">home</span>', 'Shown on the Black Corner Fight Short; the Compression Short and White Corner follow the same map.')}
    <div style="position:absolute;left:84px;right:84px;top:${top}px;display:flex;justify-content:space-between;align-items:flex-start">${figs.join('')}</div>
    <div style="position:absolute;left:84px;right:84px;top:${Math.round(top + figH + 62)}px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px 34px">
      ${rows.map(([h, t], i) => `<div style="display:flex;gap:12px;align-items:flex-start"><span class="num" style="width:28px;height:28px;font-size:14px">${i + 1}</span><div class="note" style="font-size:14.5px;line-height:1.35"><b>${h}</b><br>${t}</div></div>`).join('')}
    </div>
    ${footer(n)}
  </div>`;
}

function productSlide(p, c, n) {
  const widths = VIEWS.reduce((a, [v]) => a + META[`${p.key}_${c.key}_${v}`].w, 0);
  const k = Math.min(0.6, 600 / MAX_H, (1752 - 3 * 34) / widths);
  const cell = ([view, label]) => {
    const name = `${p.key}_${c.key}_${view}`, m = META[name];
    return `<div style="display:flex;flex-direction:column;align-items:center">
      <div style="height:${Math.round(MAX_H * k)}px;display:flex;align-items:center"><img src="${cut(name)}" style="width:${Math.round(m.w * k)}px;height:${Math.round(m.h * k)}px;display:block"></div>
      <div class="cap" style="margin-top:20px;font-size:15px">${label}</div></div>`;
  };
  return `<div class="slide light">
    ${header(`War Streaks · ${p.label} · ${p.sub}`, `${c.label} <span class="red">·</span> ${p.label}`, c.sub)}
    <div style="position:absolute;left:84px;right:84px;top:250px;display:flex;justify-content:space-between;align-items:flex-start">${VIEWS.map(cell).join('')}</div>
    ${footer(n, c.key === 'white'
      ? `<div class="chips"><div class="chip"><i style="background:#EEEEEC"></i>Base: White</div><div class="chip"><i style="background:#8E0B13"></i>Accents: Dark red #8E0B13</div><div class="chip"><i style="background:#151515"></i>Marks: Black</div><div class="chip"><i style="background:${WAR_RED}"></i>WAR Red #ED1C24</div></div>`
      : `<div class="chips"><div class="chip"><i style="background:#141414"></i>Base: Black</div><div class="chip"><i style="background:${WAR_RED}"></i>Accents: WAR Red #ED1C24</div><div class="chip"><i style="background:#F4F4F2"></i>Marks: White</div></div>`)}
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
      ${crop('fight-short_black_front', 420, 1200, 600, 690, 'WAR crest · Option A', 'The full WAR FC crest, big and level on the lower left leg, with claw streaks above.')}
      ${crop('fight-short_black_side-wordmark', 700, 830, 600, 690, 'AX side wordmark', 'AX monogram and CARPENTRY run the full height of the side, made for side-on and action shots.')}
      ${crop('fight-short_black_front', 1100, 1150, 520, 598, 'PROVE YOU BELONG sash', 'Black italic lettering flanked by the WAR spear bars, with red keylines.')}
      ${crop('fight-short_black_side-sash', 760, 900, 600, 690, 'Sash side', 'The sash wraps round and stops in spear tips either side of the AX wordmark.')}
    </div>
    ${footer(n)}
  </div>`;
}

function lineupSlide(n) {
  const k = Math.min(0.25, 330 / MAX_H);
  const img = (name) => { const m = META[name]; return `<img src="${cut(name)}" style="width:${Math.round(m.w * k)}px;height:${Math.round(m.h * k)}px;display:block">`; };
  const col = (c) => `<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
      <div class="cap" style="font-size:22px">${c.label}</div><div class="capn" style="margin:0 0 14px">Front and back</div>
      ${Object.values(PRODUCTS).map((p) => `<div style="display:flex;gap:16px;align-items:center;height:${Math.round(MAX_H * k)}px">${img(`${p.key}_${c.key}_front`)}${img(`${p.key}_${c.key}_back`)}</div>
        <div class="kicker" style="font-size:11px;margin-bottom:8px">${p.label}</div>`).join('')}
    </div>`;
  return `<div class="slide light">
    ${header('The full set', 'Two cuts. <span class="red">Two corners.</span>', '')}
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
      ${card('CAGECRAFT provides', 'Official WAR FC fight shorts in the Fight Short and/or Compression cut, in Black Corner and White Corner, branded with WAR FC, AX Carpentry and CAGECRAFT.')}
      ${card('WAR FC provides', 'CAGECRAFT on WAR FC fight posters, venue access, and CAGECRAFT featured across WAR FC social media branding and collaborations.')}
    </div>
    <div style="position:absolute;left:84px;right:84px;top:640px">
      <div class="kicker">Next steps</div>
      <div style="display:flex;gap:40px;margin-top:22px" class="note">
        ${[['1', 'Pick a front direction: A, B or C.'], ['2', 'Pick the cut(s): Fight Short, Compression, or both.'], ['3', 'Fighter roster: sizes per corner and event date.'], ['4', 'We lock production and the sponsorship schedule.']]
          .map(([i, t]) => `<div style="display:flex;gap:14px;align-items:flex-start;flex:1"><span class="num">${i}</span><div>${t}</div></div>`).join('')}
      </div>
    </div>
    ${footer(n)}
  </div>`;
}

const P = PRODUCTS, C = CONCEPTS;
const slides = [
  cover(), optionsSlide([P['fight-short']], C.black, 2), optionsSlide([P.compression], C.black, 3), optionsSlide([P['fight-short'], P.compression], C.white, 4),
  directionsSlide(5), logoSystemSlide(6), placementSlide(7),
  productSlide(P['fight-short'], C.black, 8), productSlide(P['fight-short'], C.white, 9),
  productSlide(P.compression, C.black, 10), productSlide(P.compression, C.white, 11),
  detailsSlide(12), lineupSlide(13), partnershipSlide(14),
];
const names = ['01_cover', '02_front-options-fight-short', '03_front-options-compression', '04_front-options-white-corner', '05_two-corners', '06_logo-system', '07_logo-placement', '08_fight-short-black', '09_fight-short-white', '10_compression-black', '11_compression-white', '12_details', '13_full-set', '14_partnership'];

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
