// Render QC stills: node scripts/stills.mjs 0.5 3 6 ...  (seconds) -> out/frames/t<sec>.jpg
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve(import.meta.dirname, "..");
const times = process.argv.slice(2).map(Number);
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "RfqPitch", browserExecutable });
fs.mkdirSync(path.join(root, "out/frames"), { recursive: true });
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const output = path.join(root, `out/frames/t${t.toFixed(2)}.jpg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 90, browserExecutable });
  console.log(output);
}
