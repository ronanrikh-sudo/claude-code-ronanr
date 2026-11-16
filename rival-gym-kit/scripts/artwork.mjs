// Standalone vector artwork of the Rival oval in each colourway (transparent bg).
import fs from 'node:fs';
import { emblem, IDEAS } from './emblem.mjs';
fs.mkdirSync('out/artwork', { recursive: true });
for (const idea of Object.values(IDEAS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-640 -240 1180 480" width="1180" height="480">${emblem(idea)}</svg>`;
  fs.writeFileSync(`out/artwork/rival-oval_${idea.key}.svg`, svg);
}
console.log('artwork written');
