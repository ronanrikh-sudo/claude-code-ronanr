// QC stills: node scripts/stills.mjs <Composition> <frame...> [--safe]  -> out/frames/<comp>-<frame>.jpg
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const args = process.argv.slice(2);
const safe = args.includes("--safe");
const [id, ...frames] = args.filter((a) => a !== "--safe");
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const inputProps = { safe };
const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable });
for (const fr of frames.map(Number)) {
  const output = path.resolve(`out/frames/${id}-${String(fr).padStart(3, "0")}${safe ? "-safe" : ""}.jpg`);
  await renderStill({ composition: { ...composition, props: { ...composition.props, safe } }, serveUrl, frame: fr, output, imageFormat: "jpeg", jpegQuality: 90, browserExecutable, inputProps });
  console.log(output);
}
