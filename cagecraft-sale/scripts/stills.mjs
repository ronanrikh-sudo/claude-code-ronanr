// QC stills: node scripts/stills.mjs 0.5 3 6 ...   (seconds) -> out/frames/t<sec>.jpg
// Look at every one of them before calling a render done. Uses one browser for all stills.
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const puppeteerInstance = await openBrowser("chrome", { browserExecutable, chromiumOptions });
const composition = await selectComposition({ serveUrl, id: "Main", puppeteerInstance });
fs.mkdirSync(path.join(root, "out/frames"), { recursive: true });
for (const t of process.argv.slice(2).map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const output = path.join(root, `out/frames/t${t.toFixed(2)}.jpg`);
  const t0 = Date.now();
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 90, puppeteerInstance, timeoutInMilliseconds: 120000 });
  console.log(output, `${Date.now() - t0}ms`);
}
await puppeteerInstance.close({ silent: true });
