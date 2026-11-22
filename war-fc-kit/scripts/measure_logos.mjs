// One-off: measure logo group bounding boxes in a browser -> assets/logo_boxes.json
import fs from 'node:fs';
import { chromium } from './pw.mjs';
const war = fs.readFileSync('assets/src/WarFC-Logo.svg', 'utf8').replace(/<\?xml[^>]*>/, '');
const ax = fs.readFileSync('assets/src/ax-orange-over-black.svg', 'utf8').replace(/<\?xml[^>]*>/, '');
const b = await chromium.launch(); const p = await b.newPage();
await p.setContent(`<body>${war}${ax}</body>`);
const out = await p.evaluate(() => {
  const [w, a] = document.querySelectorAll('body > svg');
  const box = (el) => { const r = el.getBBox(); return [r.x, r.y, r.x + r.width, r.y + r.height].map((v) => +v.toFixed(2)); };
  const war = {};
  for (const id of ['WAR', 'Crown', 'FIGHTING_CHAMPIONSHIPS', 'PYB_BANNER']) war[id] = box(w.querySelector('#' + id));
  const paths = [...a.querySelectorAll('path')].slice(1); // first path is the black background box
  const bb = paths.map(box);
  const ax = [Math.min(...bb.map((q) => q[0])), Math.min(...bb.map((q) => q[1])), Math.max(...bb.map((q) => q[2])), Math.max(...bb.map((q) => q[3]))];
  const txt = bb.filter((q) => q[1] > 100); // CARPENTRY letters sit at the bottom
  return { war, ax, axMarkBottom: Math.min(...txt.map((q) => q[1])) };
});
fs.writeFileSync('assets/logo_boxes.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
await b.close();
