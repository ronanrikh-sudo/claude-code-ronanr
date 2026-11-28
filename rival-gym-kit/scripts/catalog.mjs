// Rival Gym team kit catalogue: what they're getting and the size breakdown (A4 PDF, 5 pages).
// Cover → one page per garment (front + back, three close-up details, sizes) → order summary.
// No prices or payment details: those live on the invoice.
// node scripts/catalog.mjs   (needs out/products/*.svg and out/products/cutouts_cropped/)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from './pw.mjs';
import { emblem, topsLockup, cagecraft, IDEAS, RED, WHITE } from './emblem.mjs';
import { patternPath } from './pattern.mjs';
import { ORDER, ORDER_NO, SIZES, MAJOR } from './order.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROD = path.join(ROOT, 'out/products');
const OUT = path.join(ROOT, 'out/catalog');
const DET = path.join(OUT, 'details'); // regenerable close-up crops
const IMG = path.join(OUT, 'img'); // cut-outs resized to print size
const PREV = path.join(OUT, 'preview'); // page PNGs for QA
for (const d of [OUT, DET, IMG, PREV]) fs.mkdirSync(d, { recursive: true });

const INK = '#141414';
const DATE = 'November 2026';
const CLIENT = 'Rival Gym · Castle Hill';
const DETAIL_AR = 1.6; // close-up tiles are 1.6 : 1

// ---- the three garments ------------------------------------------------------------------------
// detail crops: [centre x, centre y, width] in the 2000×2500 product render
const PRODUCTS = [
  {
    key: 'rashguard', cat: 'Fightwear', name: 'Rashguard', front: 'rashguard_A', back: 'rashguard-back_A',
    line: 'Short sleeve · Full sublimation · Idea A',
    blurb: 'The centrepiece of the kit. The Rival oval sits front and centre in white and Rival red, with the CAGECRAFT Legacy pattern rising from the hem, front and back.',
    colours: [['Black', INK], ['Rival red', RED], ['White', WHITE]],
    details: [
      { src: 'rashguard_A', c: [998, 877, 700], t: 'Front', d: 'Rival oval in white and Rival red, centre chest' },
      { src: 'rashguard-back_A', c: [1000, 668, 430], t: 'Back', d: 'Rival × CAGECRAFT under the neckline' },
      { src: 'rashguard_A', c: [1000, 1768, 560], t: 'Hem', d: 'Legacy pattern in Rival red, front and back' },
    ],
  },
  {
    key: 'shorts', cat: 'Fightwear', name: 'MMA Shorts', front: 'shorts_A', back: 'shorts-back_A',
    line: 'Mid-length · Non-velcro curved cut · 7.5″ inseam',
    blurb: 'Built to match the rashguard. The Rival oval leads across the front, and the Legacy pattern runs down both legs to a curved, bound hem.',
    colours: [['Black', INK], ['Rival red', RED], ['White', WHITE]],
    details: [
      { src: 'shorts_A', c: [995, 1090, 880], t: 'Front', d: 'Rival oval across the front' },
      { src: 'shorts-back_A', c: [998, 880, 740], t: 'Back', d: 'CAGECRAFT × Rival Gym under the waist' },
      { src: 'shorts_A', c: [1325, 1735, 600], t: 'Legs', d: 'Legacy pattern down both legs, curved hem' },
    ],
  },
  {
    key: 'tee', cat: 'Training', name: 'Training Tee', front: 'tee_B2', back: 'tee-back_B2',
    line: 'Crew neck · White print on black',
    blurb: 'The everyday piece for the gym floor and beyond. A black tee with the Rival oval in clean white print, and the co-branded mark under the back neckline.',
    colours: [['Black', INK], ['White', WHITE]],
    details: [
      { src: 'tee_B2', c: [1000, 930, 720], t: 'Front', d: 'Rival oval in white, centre chest' },
      { src: 'tee-back_B2', c: [1000, 672, 430], t: 'Back', d: 'Rival × CAGECRAFT under the neckline' },
      { src: 'tee_B2', c: [1000, 652, 560], t: 'Finish', d: 'Crew neck and a clean hem, no pattern' },
    ],
  },
].map((p) => ({ ...p, ...ORDER[p.key] }));
const TOTAL = PRODUCTS.reduce((a, p) => a + p.qty, 0);
const SIZE_TOTALS = SIZES.map((_, k) => PRODUCTS.reduce((a, p) => a + p.sizes[k], 0));

// ---- assets -----------------------------------------------------------------------------------
const b64 = (p, mime = 'image/png') => `data:${mime};base64,${fs.readFileSync(p).toString('base64')}`;
const META = JSON.parse(fs.readFileSync(path.join(PROD, 'cutouts_cropped/meta.json'), 'utf8'));
// cut-outs are embedded at 3 device px per CSS px (sharp in print), not at full render size,
// which keeps the PDF small enough to email or message
const PRINT_DPR = 3;
const RESIZE = 'import sys; from PIL import Image; s, d, w = sys.argv[1], sys.argv[2], int(sys.argv[3]); im = Image.open(s); im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(d, optimize=True)';
const cutImg = (n, cssW) => {
  const src = path.join(PROD, 'cutouts_cropped', `${n}.png`);
  const w = Math.round(cssW * PRINT_DPR);
  if (w >= META[n].w) return `<img src="${b64(src)}" style="width:${cssW.toFixed(1)}px;display:block">`;
  const dst = path.join(IMG, `${n}_${w}.png`);
  if (!fs.existsSync(dst) || fs.statSync(dst).mtimeMs < fs.statSync(src).mtimeMs) execFileSync('python3', ['-I', '-c', RESIZE, src, dst, String(w)]);
  return `<img src="${b64(dst)}" style="width:${cssW.toFixed(1)}px;display:block">`;
};
const EMB = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/cagecraft_emblem.json'), 'utf8')).EMBLEM;
const ccEmblem = (w, fill) => {
  const [x0, y0, x1, y1] = EMB.bbox;
  return `<svg viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" width="${w}" style="display:block"><path d="${EMB.d}" fill="${fill}" fill-rule="evenodd"/></svg>`;
};
const ccWord = (w, fill) => {
  const cc = cagecraft(fill, 0, 0, 1000);
  return `<svg viewBox="0 0 1000 ${cc.h.toFixed(1)}" width="${w}" style="display:block">${cc.svg}</svg>`;
};
const oval = (w, colours) => `<svg viewBox="-640 -240 1180 480" width="${w}" style="display:block">${emblem(colours)}</svg>`;
const DARK_OVAL = { ring: INK, word: RED, gym: INK };
const heroLockup = (w) => {
  const { svg, box } = topsLockup(IDEAS.A, 'stack');
  const [x0, y0, x1, y1] = box;
  return `<svg viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" width="${w}" style="display:block">${svg}</svg>`;
};
// Legacy hem pattern, fading out upwards
const hem = ({ w, h, unit, colour, peak, id, stroke = 2.2 }) => {
  const d = patternPath({ width: w, height: h, unit, cx: w / 2, vStretch: h / (31 * unit) });
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block">
    <defs><linearGradient id="${id}g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="${peak}"/><stop offset=".6" stop-color="#fff" stop-opacity="${peak * 0.25}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="url(#${id}g)"/></mask></defs>
    <path d="${d}" stroke="${colour}" stroke-width="${stroke}" fill="none" mask="url(#${id}m)"/></svg>`;
};

// ---- close-up crops, rendered from the vector product SVGs at print resolution ----------------
async function renderDetails(browser) {
  const OUT_W = 760; // px per tile: ~3.5 device px per CSS px at 218 px wide
  for (const p of PRODUCTS) {
    for (const [i, d] of p.details.entries()) {
      const [cx, cy, w] = d.c, h = w / DETAIL_AR;
      const dsf = OUT_W / w;
      const ctx = await browser.newContext({ viewport: { width: 2000, height: 2500 }, deviceScaleFactor: dsf });
      const page = await ctx.newPage();
      await page.goto('file://' + path.join(PROD, `${d.src}.svg`));
      d.file = path.join(DET, `${p.key}-${i + 1}.jpg`);
      await page.screenshot({ path: d.file, type: 'jpeg', quality: 90, clip: { x: cx - w / 2, y: cy - h / 2, width: w, height: h } });
      await ctx.close();
    }
  }
}

// ---- page CSS ---------------------------------------------------------------------------------
const CSS = `
  @page { size: A4; margin: 0 }
  * { box-sizing: border-box; margin: 0; padding: 0 }
  html, body { background: #f7f7f5 }
  body { font-family: Inter, sans-serif; color: ${INK}; -webkit-font-smoothing: antialiased }
  .page { position: relative; width: 794px; height: 1123px; overflow: hidden; background: #f7f7f5; break-after: page }
  .page:last-child { break-after: auto }
  .kick { font: 600 8.5px/1 Inter; letter-spacing: .32em; text-transform: uppercase; color: #77777a }
  .lbl { font: 700 8px/1 Inter; letter-spacing: .24em; text-transform: uppercase; color: #8a8a88 }
  .studio { background: radial-gradient(ellipse 78% 82% at 50% 50%, #e4e4e2 0%, #d4d4d2 58%, #c0c0be 100%) }
  .pfoot { position: absolute; left: 52px; right: 52px; bottom: 26px; display: flex; justify-content: space-between; align-items: center; padding-top: 11px; border-top: 1px solid #e2e2df; font: 600 8px/1 Inter; letter-spacing: .24em; text-transform: uppercase; color: #9a9a98 }
  .pfoot b { color: ${INK}; font-weight: 700 }
  .x { font: 300 13px/1 Inter; color: #8a8a88 }

  /* cover */
  .cover { background: #0c0c0c }
  .cv-dark { position: absolute; left: 0; top: 0; width: 794px; height: 650px; background: radial-gradient(ellipse 75% 70% at 50% 40%, #1d1d1d 0%, #0c0c0c 72%) }
  .cv-top { position: absolute; left: 52px; right: 52px; top: 40px; display: flex; justify-content: space-between; align-items: center }
  .cv-top .kick { color: #9a9a98 }
  .cv-brand { display: flex; align-items: center; gap: 10px; font: 800 10px/1 'Inter Display', Inter; letter-spacing: .2em; color: #f4f4f2 }
  .cv-lock { position: absolute; left: 0; right: 0; top: 128px; display: flex; justify-content: center }
  .cv-title { position: absolute; left: 0; right: 0; top: 400px; text-align: center; font: 900 76px/1 'Inter Display', Inter; letter-spacing: .01em; color: #f4f4f2 }
  .cv-sub { position: absolute; left: 0; right: 0; top: 492px; text-align: center; font: 500 12px/1 Inter; letter-spacing: .26em; text-transform: uppercase; color: #a5a5a3 }
  .cv-sub b { color: #f4f4f2; font-weight: 700 }
  .cv-hem { position: absolute; left: 0; top: 520px }
  .cv-stage { position: absolute; left: 0; top: 650px; width: 794px; height: 473px }
  .cv-line { position: absolute; left: 0; right: 0; top: 0; height: 4px; background: ${RED} }
  .lineup { position: absolute; left: 0; right: 0; top: 74px; display: flex; justify-content: center; align-items: flex-end; gap: 26px }
  .lineup figure { display: flex; flex-direction: column; align-items: center }
  .lineup img { display: block }
  .lineup figcaption { margin-top: 14px; text-align: center; font: 800 10px/1 'Inter Display', Inter; letter-spacing: .2em; text-transform: uppercase }
  .lineup figcaption span { display: block; margin-top: 6px; font: 500 9.5px/1 Inter; letter-spacing: .04em; text-transform: none; color: #5d5d5b }
  .cv-foot { position: absolute; left: 52px; right: 52px; bottom: 30px; display: flex; justify-content: space-between; font: 600 8px/1 Inter; letter-spacing: .24em; text-transform: uppercase; color: #5d5d5b }
  .cv-foot b { color: ${INK}; font-weight: 800 }

  /* product pages */
  .panel { position: absolute; left: 0; top: 0; width: 794px; height: 548px }
  .ph { position: absolute; left: 52px; right: 52px; top: 32px; display: flex; justify-content: space-between; align-items: center }
  .mini { display: flex; align-items: center; gap: 9px }
  .pair { position: absolute; left: 0; right: 0; top: 70px; bottom: 8px; display: flex; justify-content: center; align-items: center; gap: 44px }
  .pair figure { display: flex; flex-direction: column; align-items: center }
  .pair img { display: block }
  .pair figcaption { margin-top: 12px; font: 700 8px/1 Inter; letter-spacing: .32em; text-transform: uppercase; color: #5d5d5b }
  .pnum { position: absolute; right: 52px; bottom: 22px; font: 900 64px/1 'Inter Display', Inter; color: rgba(20,20,20,.07) }
  .content { position: absolute; left: 52px; right: 52px; top: 578px }
  .intro { display: flex; justify-content: space-between; align-items: flex-start; gap: 30px }
  .no { display: flex; align-items: center; gap: 10px }
  .no b { font: 800 11px/1 'Inter Display', Inter; color: ${RED}; letter-spacing: .06em }
  .no i { display: block; width: 18px; height: 1px; background: #b8b8b5 }
  h1 { font: 900 44px/1 'Inter Display', Inter; letter-spacing: -.005em; text-transform: uppercase; margin-top: 10px }
  .line { font: 600 11px/1 Inter; color: #3a3a3a; margin-top: 10px; letter-spacing: .01em }
  .blurb { font: 400 11px/1.6 Inter; color: #5d5d5b; margin-top: 10px; max-width: 420px }
  .qty { text-align: right; flex: none }
  .qty b { display: block; font: 900 54px/0.9 'Inter Display', Inter; letter-spacing: -.01em }
  .qty .lbl { margin-top: 8px }
  .chips { display: flex; justify-content: flex-end; gap: 12px; margin-top: 18px }
  .chip { display: flex; align-items: center; gap: 6px; font: 600 9px/1 Inter; color: #444 }
  .chip i { display: block; width: 12px; height: 12px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0,0,0,.18) }
  .details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 26px }
  .dt img { display: block; width: 100%; aspect-ratio: ${DETAIL_AR}; object-fit: cover; border-radius: 3px }
  .dt-t { font: 800 9px/1 'Inter Display', Inter; letter-spacing: .2em; text-transform: uppercase; margin-top: 10px }
  .dt-d { font: 500 10px/1.45 Inter; color: #5d5d5b; margin-top: 5px }
  .sizes { margin-top: 28px }
  .sz-h { display: flex; justify-content: space-between; align-items: baseline }
  .sz-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 7px; margin-top: 10px }
  .szt { background: #fff; border: 1px solid #e2e2df; border-radius: 4px; height: 54px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px }
  .szt span { font: 700 8px/1 Inter; letter-spacing: .18em; color: #8a8a88 }
  .szt b { font: 800 19px/1 'Inter Display', Inter; color: ${INK} }
  .szt.m { background: ${INK}; border-color: ${INK} }
  .szt.m span { color: #a5a5a3 } .szt.m b { color: #fff }
  .sz-n { font: 500 9.5px/1.4 Inter; color: #8a8a88; margin-top: 9px }

  /* summary */
  .sm-top { position: absolute; left: 0; top: 0; width: 794px; height: 214px; background: radial-gradient(ellipse 70% 90% at 30% 20%, #1c1c1c 0%, #0b0b0b 72%); color: #f4f4f2; overflow: hidden }
  .sm-top .hemw { position: absolute; left: 0; bottom: 0 }
  .sm-in { position: absolute; left: 52px; right: 52px; top: 40px; display: flex; justify-content: space-between; align-items: flex-start }
  .sm-in .kick { color: #9a9a98 }
  .sm-in h1 { font-size: 52px; margin-top: 12px; color: #f4f4f2 }
  .sm-in .s { font: 500 12px/1.4 Inter; color: #c8c8c6; margin-top: 12px }
  .sm-in .s b { color: #fff; font-weight: 700 }
  .sm-body { position: absolute; left: 52px; right: 52px; top: 244px; bottom: 92px; display: flex; flex-direction: column; justify-content: space-between }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px }
  .card { background: #fff; border: 1px solid #e6e6e3; border-radius: 6px; overflow: hidden }
  .card .im { height: 232px; display: flex; align-items: center; justify-content: center }
  .card .tx { padding: 12px 14px 13px; display: flex; justify-content: space-between; align-items: baseline }
  .card .n { font: 800 10.5px/1 'Inter Display', Inter; letter-spacing: .14em; text-transform: uppercase }
  .card .q { font: 800 15px/1 'Inter Display', Inter }
  .card .q span { font: 600 8px/1 Inter; letter-spacing: .18em; color: #8a8a88; margin-left: 4px }
  .grid { width: 100%; border-collapse: separate; border-spacing: 0 }
  .grid th { font: 700 8px/1 Inter; letter-spacing: .2em; text-transform: uppercase; color: #8a8a88; text-align: center; padding: 0 0 9px; border-bottom: 1.5px solid ${INK} }
  .grid th.l, .grid td.l { text-align: left }
  .grid td { text-align: center; font: 600 11.5px/1 Inter; color: #3a3a3a; padding: 13px 0; border-bottom: 1px solid #e2e2df }
  .grid td.l { font: 800 10px/1 'Inter Display', Inter; letter-spacing: .14em; text-transform: uppercase; color: ${INK} }
  .grid .mj { background: rgba(20,20,20,.045) }
  .grid th.mj { background: none; color: ${INK} }
  .grid td.t { font: 800 12px/1 'Inter Display', Inter; color: ${INK} }
  .grid tr.tot td { border-bottom: 0; border-top: 1.5px solid ${INK}; font: 800 12px/1 'Inter Display', Inter; color: ${INK} }
  .grid tr.tot td.t { color: ${RED} }
  .tl { display: grid; grid-template-columns: 210px 1fr; gap: 30px; align-items: start }
  .tl .big { font: 900 26px/1 'Inter Display', Inter }
  .tl .big + div { font: 500 10.5px/1.5 Inter; color: #5d5d5b; margin-top: 8px }
  .steps { position: relative; height: 56px; margin-top: 4px }
  .steps::before { content: ''; position: absolute; left: 7px; right: 7px; top: 6px; height: 2px; background: #d6d6d3 }
  .st { position: absolute; top: 0; font: 700 9.5px/1.3 Inter; color: ${INK}; white-space: nowrap }
  .st:nth-child(1) { left: 0 }
  .st:nth-child(2) { left: 33.33%; transform: translateX(-50%); text-align: center }
  .st:nth-child(3) { left: 66.67%; transform: translateX(-50%); text-align: center }
  .st:nth-child(4) { right: 0; text-align: right }
  .st i { display: block; width: 14px; height: 14px; border-radius: 50%; background: ${INK}; border: 2.5px solid #f7f7f5; box-shadow: 0 0 0 1px ${INK}; margin-bottom: 9px }
  .st:nth-child(2) i, .st:nth-child(3) i { margin-left: auto; margin-right: auto }
  .st:last-child i { margin-left: auto; background: ${RED}; box-shadow: 0 0 0 1px ${RED} }
  .st em { display: block; font: 500 9px/1.3 Inter; font-style: normal; color: #8a8a88; margin-top: 2px }
  .close { padding-top: 24px; border-top: 1px solid #e2e2df; display: flex; justify-content: space-between; align-items: flex-end; gap: 40px }
  .close h2 { font: 900 22px/1 'Inter Display', Inter; text-transform: uppercase }
  .close p { font: 400 10.5px/1.6 Inter; color: #5d5d5b; margin-top: 10px; max-width: 440px }
  .sig { text-align: right; flex: none }
  .sig b { display: block; font: 800 12px/1.2 'Inter Display', Inter }
  .sig span { display: block; font: 500 9.5px/1.6 Inter; color: #77777a }
  .redband { position: absolute; left: 0; right: 0; bottom: 0; height: 6px; background: ${RED} }
`;

// ---- pages ------------------------------------------------------------------------------------
const pad = (n) => String(n).padStart(2, '0');
const PAGES = 2 + PRODUCTS.length;
const foot = (n, left = 'CAGECRAFT CO · cagecraftco.com') =>
  `<div class="pfoot"><span>${left}</span><span>Rival Gym × CAGECRAFT · <b>${pad(n)}</b> / ${pad(PAGES)}</span></div>`;
const miniLock = (fill = INK) => `<div class="mini">${oval(58, DARK_OVAL)}<span class="x">×</span>${ccWord(78, fill)}</div>`;

function cover() {
  // fronts at one shared scale so the garments read at believable relative sizes
  const order = ['tee', 'rashguard', 'shorts'].map((k) => PRODUCTS.find((p) => p.key === k));
  const k = Math.min(226 / Math.max(...order.map((p) => META[p.front].w)), 300 / Math.max(...order.map((p) => META[p.front].h)));
  return `<section class="page cover">
    <div class="cv-dark"></div>
    <div class="cv-hem">${hem({ w: 794, h: 130, unit: 9, colour: RED, peak: 0.45, id: 'cv' })}</div>
    <div class="cv-top"><div class="kick">Team kit catalogue · ${DATE}</div><div class="cv-brand">${ccEmblem(22, '#f4f4f2')}CAGECRAFT CO</div></div>
    <div class="cv-lock">${heroLockup(330)}</div>
    <div class="cv-title">TEAM KIT</div>
    <div class="cv-sub">Prepared for <b>${CLIENT}</b></div>
    <div class="cv-stage studio">
      <div class="cv-line"></div>
      <div class="lineup">${order.map((p) => `<figure>${cutImg(p.front, META[p.front].w * k)}<figcaption>${p.name}<span>${p.qty} pieces</span></figcaption></figure>`).join('')}</div>
      <div class="cv-foot"><span>Order <b>${ORDER_NO}</b> · ${TOTAL} pieces</span><span>Designed &amp; made by <b>CAGECRAFT</b></span></div>
    </div>
  </section>`;
}

function productPage(p, n, idx) {
  const k = Math.min(318 / Math.max(META[p.front].w, META[p.back].w), 372 / Math.max(META[p.front].h, META[p.back].h));
  const fig = (name, label) => `<figure>${cutImg(name, META[name].w * k)}<figcaption>${label}</figcaption></figure>`;
  return `<section class="page">
    <div class="panel studio">
      <div class="ph">${miniLock()}<div class="kick">Team kit catalogue</div></div>
      <div class="pair">${fig(p.front, 'Front')}${fig(p.back, 'Back')}</div>
    </div>
    <div class="content">
      <div class="intro">
        <div>
          <div class="no"><b>${pad(idx)}</b><i></i><span class="kick">${p.cat}</span></div>
          <h1>${p.name}</h1>
          <div class="line">${p.line}</div>
          <p class="blurb">${p.blurb}</p>
        </div>
        <div class="qty"><b>${p.qty}</b><div class="lbl">Pieces</div>
          <div class="chips">${p.colours.map(([nm, c]) => `<div class="chip"><i style="background:${c}"></i>${nm}</div>`).join('')}</div>
        </div>
      </div>
      <div class="details">${p.details.map((d) => `<div class="dt"><img src="${b64(d.file, 'image/jpeg')}"><div class="dt-t">${d.t}</div><div class="dt-d">${d.d}</div></div>`).join('')}</div>
      <div class="sizes">
        <div class="sz-h"><span class="lbl" style="color:${INK}">Size breakdown</span><span class="lbl">${p.qty} pieces</span></div>
        <div class="sz-row">${SIZES.map((z, i) => `<div class="szt${MAJOR.has(z) ? ' m' : ''}"><span>${z}</span><b>${p.sizes[i]}</b></div>`).join('')}</div>
        <div class="sz-n">Mostly M, L and XL as requested, with a spread across the other sizes${p.sizes[0] ? ', including XS for female members' : ''}.</div>
      </div>
    </div>
    ${foot(n)}
  </section>`;
}

function summary(n) {
  const kc = Math.min(196 / Math.max(...PRODUCTS.map((p) => META[p.front].w)), 196 / Math.max(...PRODUCTS.map((p) => META[p.front].h)));
  return `<section class="page">
    <div class="sm-top">
      <div class="hemw">${hem({ w: 794, h: 96, unit: 7, colour: RED, peak: 0.42, id: 'sm' })}</div>
      <div class="sm-in">
        <div><div class="kick">Order summary · ${ORDER_NO}</div><h1>Your order</h1>
          <div class="s"><b>${TOTAL} pieces</b> across three garments, made for ${CLIENT}</div></div>
        <div style="margin-top:2px">${heroLockup(120)}</div>
      </div>
    </div>
    <div class="sm-body">
      <div class="cards">${PRODUCTS.map((p) => `<div class="card"><div class="im studio">${cutImg(p.front, META[p.front].w * kc)}</div>
        <div class="tx"><span class="n">${p.name}</span><span class="q">${p.qty}<span>PCS</span></span></div></div>`).join('')}</div>
      <div>
      <table class="grid">
        <tr><th class="l">Size breakdown</th>${SIZES.map((z) => `<th class="${MAJOR.has(z) ? 'mj' : ''}">${z}</th>`).join('')}<th>Total</th></tr>
        ${PRODUCTS.map((p) => `<tr><td class="l">${p.name}</td>${p.sizes.map((v, i) => `<td class="${MAJOR.has(SIZES[i]) ? 'mj' : ''}">${v}</td>`).join('')}<td class="t">${p.qty}</td></tr>`).join('')}
        <tr class="tot"><td class="l">All garments</td>${SIZE_TOTALS.map((v, i) => `<td class="${MAJOR.has(SIZES[i]) ? 'mj' : ''}">${v}</td>`).join('')}<td class="t">${TOTAL}</td></tr>
      </table>
      <div class="sz-n">Want to adjust any sizes? Just let us know before production starts and we'll update your order.</div>
      </div>
      <div class="tl">
        <div><div class="big">30–40 days</div><div>From payment to your gym, door to door. Production starts within two days of payment.</div></div>
        <div class="steps">
          <div class="st"><i></i>Payment<em>Day 0</em></div>
          <div class="st"><i></i>Production<em>Day 1–2</em></div>
          <div class="st"><i></i>QC &amp; dispatch<em>≈ Day 25</em></div>
          <div class="st"><i></i>At your gym<em>Day 30–40</em></div>
        </div>
      </div>
      <div class="close">
        <div><h2>Thank you, <span style="color:${RED}">Rival Gym</span></h2>
          <p>Every piece is quality checked before dispatch. If you have any questions or want to change anything, just reach out. We're with you until the kit is at your gym.</p></div>
        <div class="sig"><b>Ronan Rikh</b><span>Founder, CAGECRAFT</span><span>info@cagecraftco.com · @cagecraftco</span></div>
      </div>
    </div>
    ${foot(n)}
    <div class="redband"></div>
  </section>`;
}

// ---- render -----------------------------------------------------------------------------------
const browser = await chromium.launch();
await renderDetails(browser);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
  ${cover()}
  ${PRODUCTS.map((p, i) => productPage(p, i + 2, i + 1)).join('')}
  ${summary(PAGES)}
</body></html>`;
const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.5 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
// fit check: content must clear each page footer by 12px
const clash = await page.evaluate(() => [...document.querySelectorAll('.page')].map((pg, i) => {
  const f = pg.querySelector('.pfoot');
  const body = pg.querySelector('.content, .sm-body');
  if (!f || !body) return null;
  const last = body.lastElementChild;
  const over = Math.ceil(Math.max(body.getBoundingClientRect().bottom, last.getBoundingClientRect().bottom) - (f.getBoundingClientRect().top - 12));
  return over > 0 ? `page ${i + 1}: content is ${over}px into the footer` : null;
}).filter(Boolean));
for (const c of clash) console.warn('WARNING:', c);
for (const f of fs.readdirSync(PREV)) fs.unlinkSync(path.join(PREV, f));
const sections = await page.$$('section.page');
for (const [i, s] of sections.entries()) await s.screenshot({ path: path.join(PREV, `${pad(i + 1)}.png`) });
const pdf = path.join(OUT, 'Rival-Gym-Team-Kit-Catalogue.pdf');
await page.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`${sections.length} pages, ${TOTAL} pieces · wrote ${pdf} (${(fs.statSync(pdf).size / 1e6).toFixed(1)} MB)`);
