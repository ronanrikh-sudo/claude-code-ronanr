// Standalone vector artwork (transparent bg): the Rival oval in each colourway,
// plus the co-branded back lockups for the final colourways (A, B.2).
import fs from 'node:fs';
import { emblem, topsLockup, shortsLockup, IDEAS } from './emblem.mjs';
fs.mkdirSync('out/artwork', { recursive: true });
const write = (name, [x0, y0, x1, y1], body, pad = 20) => {
  const w = x1 - x0 + pad * 2, h = y1 - y0 + pad * 2;
  fs.writeFileSync(`out/artwork/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0 - pad} ${y0 - pad} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
};
for (const idea of Object.values(IDEAS)) write(`rival-oval_${idea.key}`, [-620, -220, 520, 220], emblem(idea));
for (const idea of [IDEAS.A, IDEAS.B2]) {
  const t = topsLockup(idea);
  write(`back-lockup-tops_${idea.key}`, t.box, t.svg);
  const s = shortsLockup(idea, 1000);
  write(`back-lockup-shorts_${idea.key}`, s.box, s.svg);
}
console.log('artwork written');
