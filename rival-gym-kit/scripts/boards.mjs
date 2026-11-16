// Presentation deck for Rival Gym: 1920x1080 slides rendered at 2x (4K PNG) + PDF.
// node scripts/boards.mjs
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from './pw.mjs';
import { emblem, IDEAS, RED } from './emblem.mjs';
import { patternPath } from './pattern.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CUT = path.join(ROOT, 'out/products/cutouts_cropped');
const OUT = path.join(ROOT, 'out/deck');
fs.mkdirSync(OUT, { recursive: true });
const META = JSON.parse(fs.readFileSync(path.join(CUT, 'meta.json'), 'utf8'));
const b64 = (p) => `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
const cut = (name) => b64(path.join(CUT, `${name}.png`));
const CC_LOGO = b64(path.join(ROOT, '../cagecraft-sale/public/img/logo-white.png'));
const RIVAL_SRC = b64(path.join(ROOT, 'assets/rival-logo-source.png'));

const PRODUCTS = [
  { key: 'tee', label: 'Training Tee', note: 'Chest emblem only — clean hem' },
  { key: 'rashguard', label: 'Rashguard', note: 'Chest emblem + hem pattern' },
  { key: 'shorts', label: 'Mid-Length MMA Shorts', note: 'Single layer · longer cut · side slits' },
];
const IDEA_LIST = [IDEAS.A, IDEAS.B1, IDEAS.B2];
const SPEC = {
  A: [['Oval', 'White'], ['RIVAL', 'Red'], ['GYM', 'White'], ['Hem pattern', 'Red']],
  B1: [['Oval', 'Red'], ['RIVAL', 'Red'], ['GYM', 'Red'], ['Hem pattern', 'Red']],
  B2: [['Oval', 'White'], ['RIVAL', 'White'], ['GYM', 'White'], ['Hem pattern', 'White']],
};
const swatch = (c) => (c === 'Red' ? RED : c === 'White' ? '#F4F4F2' : '#141414');

const emblemSVG = (idea, w) =>
  `<svg viewBox="-640 -240 1180 480" width="${w}" style="display:block">${emblem(idea)}</svg>`;

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
  .red{color:${RED}}
  .hdr{position:absolute;left:84px;top:66px;right:84px;display:flex;justify-content:space-between;align-items:flex-start}
  .credit{display:flex;align-items:center;gap:12px;font:600 13px/1 Inter;letter-spacing:.22em;text-transform:uppercase;color:#6a6a6a}
  .credit img{height:17px;filter:invert(1);opacity:.85}
  .dark .credit img{filter:none}
  .chips{display:flex;gap:26px;align-items:center}
  .chip{display:flex;align-items:center;gap:10px;font:600 15px/1 Inter;color:#333}
  .chip i{display:block;width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(0,0,0,.25)}
  .dark .chip{color:#ddd}.dark .chip i{border-color:rgba(255,255,255,.3)}
  .foot{position:absolute;left:84px;right:84px;bottom:52px;display:flex;justify-content:space-between;align-items:center}
  .pg{font:600 13px/1 Inter;letter-spacing:.2em;color:#8a8a8a}
  .cap{font:800 19px/1 'Inter Display',Inter;letter-spacing:.14em;text-transform:uppercase;text-align:center}
  .capn{font:500 15px/1.3 Inter;color:#5d5d5d;text-align:center;margin-top:8px}
`;

const header = (kicker, title, sub, dark = false) => `
  <div class="hdr">
    <div><div class="kicker">${kicker}</div><div class="title" style="margin-top:16px">${title}</div>
    ${sub ? `<div class="sub" style="margin-top:14px">${sub}</div>` : ''}</div>
    <div class="credit" style="margin-top:4px">Designed by <img src="${CC_LOGO}"></div>
  </div>`;

const footer = (n, left = '') => `<div class="foot"><div>${left}</div><div class="pg">RIVAL GYM × CAGECRAFT — ${String(n).padStart(2, '0')}</div></div>`;

function specChips(key) {
  return `<div class="chips"><div class="chip"><i style="background:#141414"></i>Base: Black</div>${SPEC[key]
    .map(([k, c]) => `<div class="chip"><i style="background:${swatch(c)}"></i>${k}: ${c}</div>`)
    .join('')}</div>`;
}

// --- slides -------------------------------------------------------------
function cover() {
  const W = 1920, Hh = 460;
  const pat = patternPath({ width: W + 200, height: Hh, unit: 15, cx: (W + 200) / 2, vStretch: Hh / (31 * 15) });
  return `<div class="slide dark">
    <svg width="1920" height="${Hh}" style="position:absolute;left:0;bottom:0" viewBox="100 0 1920 ${Hh}">
      <defs><linearGradient id="cf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".55" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="cm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W + 200}" height="${Hh}"><rect width="${W + 200}" height="${Hh}" fill="url(#cf)"/></mask></defs>
      <path d="${pat}" stroke="${RED}" stroke-width="4.5" fill="none" mask="url(#cm)"/>
    </svg>
    <div style="position:absolute;left:84px;top:72px" class="kicker">Custom fight kit · Concept proposal</div>
    <div style="position:absolute;right:84px;top:66px" class="credit">Designed by <img src="${CC_LOGO}"></div>
    <div style="position:absolute;left:0;right:0;top:210px;display:flex;justify-content:center">${emblemSVG(IDEAS.A, 980)}</div>
    <div style="position:absolute;left:0;right:0;top:668px;text-align:center">
      <div style="font:900 44px/1 'Inter Display';letter-spacing:.2em;text-transform:uppercase">Custom <span class="red">Fight Kit</span></div>
      <div class="sub" style="margin-top:20px;font-size:22px">Training Tee · Rashguard · Mid-Length MMA Shorts — front designs in three colourways</div>
    </div>
    <div class="foot"><div class="pg" style="color:#777">BUILT ON THE CAGECRAFT LEGACY FIGHT KIT</div><div class="pg" style="color:#777">NOVEMBER 2026</div></div>
  </div>`;
}

function emblemSlide(n) {
  const tile = (idea) => `<div style="width:553px">
      <div style="background:#121212;border-radius:18px;height:310px;display:flex;align-items:center;justify-content:center;box-shadow:0 18px 40px rgba(0,0,0,.18)">${emblemSVG(idea, 460)}</div>
      <div class="cap" style="margin-top:22px;text-align:left">${idea.label}</div>
      <div class="capn" style="text-align:left">${idea.sub}</div></div>`;
  return `<div class="slide light">
    ${header('The centrepiece', 'The Rival <span class="red">oval</span>', 'Our Legacy oval, rebuilt around your wordmark.')}
    <div style="position:absolute;left:84px;top:318px;display:flex;gap:46px">${IDEA_LIST.map(tile).join('')}</div>
    <div style="position:absolute;left:84px;right:84px;top:790px;display:flex;gap:40px;align-items:flex-start">
      <div style="width:250px;flex:none;background:#fff;border-radius:14px;padding:14px 18px;box-shadow:0 10px 30px rgba(0,0,0,.08)">
        <div class="kicker" style="font-size:11px">Your logo</div>
        <img src="${RIVAL_SRC}" style="width:214px;height:110px;object-fit:cover;object-position:50% 50%;margin-top:6px;display:block">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:34px;font:500 17px/1.45 Inter;color:#333;padding-top:8px">
        <div><b style="font-weight:800;color:#111">Your wordmark, redrawn.</b><br>RIVAL is vectorised from your logo — same italic letterforms, matched to Rival Red <b>#C10212</b>.</div>
        <div><b style="font-weight:800;color:#111">GYM moved inside.</b><br>Lifted out of the lockup and set under RIVAL, keeping the rule line from your logo.</div>
        <div><b style="font-weight:800;color:#111">Legacy DNA.</b><br>Weighted oval, comet swoosh and sparkles carried over from our Legacy kit.</div>
      </div>
    </div>
    ${footer(n)}
  </div>`;
}

function ideaSlide(idea, n) {
  const k = 0.36; // px per canvas px, shared so garments keep real relative scale
  const cell = (p) => {
    const m = META[`${p.key}_${idea.key}`];
    return `<div style="display:flex;flex-direction:column;align-items:center">
      <div style="height:${Math.round(1779 * k)}px;display:flex;align-items:center"><img src="${cut(`${p.key}_${idea.key}`)}" style="width:${Math.round(m.w * k)}px;height:${Math.round(m.h * k)}px;display:block"></div>
      <div class="cap" style="margin-top:20px">${p.label}</div><div class="capn">${p.note}</div></div>`;
  };
  return `<div class="slide light">
    ${header(`Concept ${n - 2} of 3 · Front`, `${idea.label.replace('Idea ', 'Idea <span class="red">')}</span>`, idea.sub + (idea.key === 'A' ? ' — your logo colours, inverted for a black kit' : idea.key === 'B1' ? ' — one-colour, high-intensity' : ' — one-colour, high-contrast'))}
    <div style="position:absolute;left:60px;right:60px;top:250px;display:flex;justify-content:space-around;align-items:flex-start">${PRODUCTS.map(cell).join('')}</div>
    ${footer(n, specChips(idea.key))}
  </div>`;
}

function compareSlide(n) {
  const k = 0.205;
  const img = (name) => {
    const m = META[name];
    return `<img src="${cut(name)}" style="width:${Math.round(m.w * k)}px;height:${Math.round(m.h * k)}px;display:block">`;
  };
  const col = (idea) => `<div style="width:560px;display:flex;flex-direction:column;align-items:center">
      <div class="cap" style="font-size:24px">${idea.label}</div><div class="capn" style="margin-top:8px">${idea.sub}</div>
      <div style="display:flex;align-items:center;gap:18px;margin-top:26px;height:${Math.round(1779 * k)}px">${img(`tee_${idea.key}`)}${img(`rashguard_${idea.key}`)}</div>
      <div style="margin-top:14px">${img(`shorts_${idea.key}`)}</div>
    </div>`;
  return `<div class="slide light">
    ${header('Side by side', 'Pick your <span class="red">direction</span>', '')}
    <div style="position:absolute;left:84px;right:84px;top:238px;display:flex;justify-content:space-between">${IDEA_LIST.map(col).join('')}</div>
    ${footer(n, '<div class="sub" style="font-size:17px">Next: once a direction is chosen we\'ll build the back designs and sleeve details to match.</div>')}
  </div>`;
}

const slides = [cover(), emblemSlide(2), ideaSlide(IDEAS.A, 3), ideaSlide(IDEAS.B1, 4), ideaSlide(IDEAS.B2, 5), compareSlide(6)];
const names = ['01_cover', '02_the-oval', '03_idea-A', '04_idea-B1', '05_idea-B2', '06_side-by-side'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
const pngs = [];
for (let i = 0; i < slides.length; i++) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${slides[i]}</body></html>`;
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const file = path.join(OUT, `${names[i]}.png`);
  await page.screenshot({ path: file });
  pngs.push(file);
  console.log('slide', names[i]);
}
// PDF: one slide per page, JPEG-compressed rasters to keep it shareable
const jpgs = [];
for (const f of pngs) {
  await page.setContent(`<html><body style="margin:0"><img src="${b64(f)}" style="width:1920px;height:1080px;display:block"></body></html>`);
  const jf = f.replace(/\.png$/, '.jpg');
  await page.screenshot({ path: jf, type: 'jpeg', quality: 90 });
  jpgs.push(jf);
}
const pdfHtml = `<!doctype html><html><head><style>@page{size:1920px 1080px;margin:0}body{margin:0}img{width:1920px;height:1080px;display:block;page-break-after:always}</style></head><body>${jpgs
  .map((j) => `<img src="data:image/jpeg;base64,${fs.readFileSync(j).toString('base64')}">`)
  .join('')}</body></html>`;
const pdfPage = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await pdfPage.setContent(pdfHtml, { waitUntil: 'load' });
await pdfPage.pdf({ path: path.join(OUT, 'Rival-Gym-Fight-Kit-Concepts.pdf'), width: '1920px', height: '1080px', printBackground: true });
for (const j of jpgs) fs.unlinkSync(j);
await browser.close();
console.log('pdf done');
