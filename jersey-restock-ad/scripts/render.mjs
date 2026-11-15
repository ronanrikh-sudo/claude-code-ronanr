// Render all three hook versions: node scripts/render.mjs [Composition...]
// -> out/CAGECRAFT-FightJersey2-<Comp>-9x16.mp4 (H.264 High, CRF 16, AAC 320k, 30 fps) + thumbnail JPG.
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ["Restock", "Colourway", "KitBag"];
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  const base = `out/CAGECRAFT-FightJersey2-${id}-9x16`;
  await renderMedia({
    composition, serveUrl, codec: "h264", crf: 16, pixelFormat: "yuv420p", audioCodec: "aac", audioBitrate: "320k",
    imageFormat: "jpeg", jpegQuality: 95, outputLocation: path.resolve(`${base}.mp4`), browserExecutable, concurrency: 4,
    onProgress: ({ progress }) => { if (Math.round(progress * 100) % 25 === 0) process.stdout.write(`\r${id} ${Math.round(progress * 100)}%  `); },
  });
  await renderStill({ composition, serveUrl, frame: 30, output: path.resolve(`${base}-thumb.jpg`), imageFormat: "jpeg", jpegQuality: 92, browserExecutable });
  console.log(`\n${base}.mp4`);
}
