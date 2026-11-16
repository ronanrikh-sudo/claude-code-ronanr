// Render product mockups: node scripts/build.mjs [outDir] [filter]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from './pw.mjs';
import { PRODUCTS, W, H, RENDER } from './garments.mjs';
import { IDEAS } from './emblem.mjs';

const outDir = process.argv[2] || 'out/products';
const only = process.argv[3] || '';
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
for (const p of Object.values(PRODUCTS)) {
  for (const idea of Object.values(IDEAS)) {
    const name = `${p.key}_${idea.key}`;
    if (only && !name.includes(only)) continue;
    RENDER.transparent = false;
    const svg = p.fn(idea);
    fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
    await page.setContent(`<!doctype html><html><body style="margin:0;background:#ccc">${svg}</body></html>`);
    await page.screenshot({ path: path.join(outDir, `${name}.png`), clip: { x: 0, y: 0, width: W, height: H } });
    // transparent cut-out for the presentation boards
    RENDER.transparent = true;
    fs.mkdirSync(path.join(outDir, 'cutouts'), { recursive: true });
    await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${p.fn(idea)}</body></html>`);
    await page.screenshot({ path: path.join(outDir, 'cutouts', `${name}.png`), clip: { x: 0, y: 0, width: W, height: H }, omitBackground: true });
    console.log('rendered', name);
  }
}
await browser.close();
