// Render WAR FC shorts: node scripts/build.mjs [outDir] [filter]
// Writes <cut>_<concept>_<view>.png (studio background) + cutouts/ (transparent, for the deck).
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from './pw.mjs';
import { W, H, RENDER } from './kit.mjs';
import { PRODUCTS, CONCEPTS } from './shorts.mjs';

const outDir = process.argv[2] || 'out/products';
const only = process.argv[3] || '';
fs.mkdirSync(path.join(outDir, 'cutouts'), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
for (const p of Object.values(PRODUCTS)) for (const c of Object.values(CONCEPTS)) for (const view of ['front', 'back', 'side-wordmark', 'side-sash']) {
  const name = `${p.key}_${c.key}_${view}`;
  if (only && !name.includes(only)) continue;
  for (const transparent of [false, true]) {
    RENDER.transparent = transparent;
    const svg = p.fn(c, view);
    if (!transparent) fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
    await page.setContent(`<!doctype html><html><body style="margin:0;background:${transparent ? 'transparent' : '#ccc'}">${svg}</body></html>`);
    await page.screenshot({ path: path.join(outDir, transparent ? 'cutouts' : '', `${name}.png`), clip: { x: 0, y: 0, width: W, height: H }, omitBackground: transparent });
  }
  console.log('rendered', name);
}
await browser.close();
