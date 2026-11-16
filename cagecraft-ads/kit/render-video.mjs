#!/usr/bin/env node
// Render one ad video with Remotion, mux its audio, and write a QC contact sheet.
//
//   node kit/render-video.mjs ads/<id> [--comp Main] [--name <id>_9x16] [--audio ads/<id>/audio/mix.wav] [--every 1.5]
//
// Expects  ads/<id>/src/index.ts   (registerRoot)   and optionally  ads/<id>/assets.json  = ["cut/...png", "photo/...jpg", "video/...mp4"]
// (library-relative paths; they are synced into ads/<id>/public/lib/ so code can use staticFile("lib/<path>")).
// Other files (AI backgrounds, audio) live in ads/<id>/public/ directly.
// Renders are serialised machine-wide with a lock (4 cores are shared by every builder), so just call it and wait.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const LOCK = "/tmp/cagecraft-render.lock";
if (!process.env.CC_RENDER_LOCKED) {
  const r = spawnSync("flock", [LOCK, process.execPath, ...process.argv.slice(1)], { stdio: "inherit", env: { ...process.env, CC_RENDER_LOCKED: "1" } });
  process.exit(r.status ?? 1);
}
const { bundle } = await import("@remotion/bundler");
const { renderMedia, selectComposition } = await import("@remotion/renderer");

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const root = path.resolve(import.meta.dirname, "..");
const adDir = path.resolve(args[0]);
const id = path.basename(adDir);
const comp = opt("--comp", "Main");
const name = opt("--name", id);
const every = Number(opt("--every", "1.5"));
const audio = opt("--audio", fs.existsSync(path.join(adDir, "audio", "mix.wav")) ? path.join(adDir, "audio", "mix.wav") : null);
const outDir = path.join(adDir, "out"); fs.mkdirSync(outDir, { recursive: true });
const publicDir = path.join(adDir, "public"); fs.mkdirSync(publicDir, { recursive: true });

// sync library assets
const manifest = path.join(adDir, "assets.json");
if (fs.existsSync(manifest)) for (const rel of JSON.parse(fs.readFileSync(manifest, "utf8"))) {
  const src = path.join(root, "library", rel), dst = path.join(publicDir, "lib", rel);
  if (!fs.existsSync(src)) { console.error("missing library asset: " + rel); process.exit(1); }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (!fs.existsSync(dst) || fs.statSync(dst).size !== fs.statSync(src).size) fs.copyFileSync(src, dst);
}

const shellRoot = "/opt/pw-browsers";
const shellDir = fs.existsSync(shellRoot) ? fs.readdirSync(shellRoot).find((d) => d.startsWith("chromium_headless_shell")) : null;
const guess = shellDir && ["chrome-linux/headless_shell", "chrome-headless-shell-linux64/chrome-headless-shell"].map((p) => path.join(shellRoot, shellDir, p)).find((p) => fs.existsSync(p));
const browserExecutable = process.env.REMOTION_BROWSER || guess || undefined;
const chromiumOptions = { gl: "angle" };
const concurrency = Number(process.env.CONCURRENCY || 3);

const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.join(adDir, "src/index.ts"), publicDir });
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable, chromiumOptions });
const silent = path.join(adDir, "work", name + ".silent.mp4"); fs.mkdirSync(path.dirname(silent), { recursive: true });
const final = path.join(outDir, name + ".mp4");
let last = -1;
await renderMedia({
  serveUrl, composition, browserExecutable, chromiumOptions, concurrency, timeoutInMilliseconds: 180000,
  codec: "h264", crf: 17, x264Preset: "medium", pixelFormat: "yuv420p", imageFormat: "jpeg", jpegQuality: 95,
  muted: !!audio, outputLocation: audio ? silent : final, overwrite: true,
  onProgress: ({ progress }) => { const pct = Math.floor(progress * 4) * 25; if (pct !== last) { last = pct; console.log(`render ${pct}%`); } },
});
const seconds = composition.durationInFrames / composition.fps;
if (audio) execFileSync("ffmpeg", ["-y", "-v", "error", "-i", silent, "-i", path.resolve(audio), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-t", String(seconds), "-movflags", "+faststart", final]);

// QC: contact sheet + probe + loudness
const n = Math.max(1, Math.ceil(seconds / every)), cols = Math.min(n, 6), rows = Math.ceil(n / cols);
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", final, "-vf", `fps=1/${every},scale=360:-1,tile=${cols}x${rows}`, "-frames:v", "1", "-q:v", "3", path.join(outDir, name + ".sheet.jpg")]);
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate", "-of", "json", final]).toString());
const v = probe.streams.find((s) => s.codec_type === "video"), a = probe.streams.find((s) => s.codec_type === "audio");
const report = { file: path.relative(root, final), seconds: Number(probe.format.duration), mb: +(probe.format.size / 1e6).toFixed(1), video: `${v.codec_name} ${v.width}x${v.height} @ ${v.r_frame_rate}`, audio: a ? a.codec_name : "none", renderSeconds: Math.round((Date.now() - t0) / 1000) };
if (a) { const ln = spawnSync("ffmpeg", ["-v", "info", "-i", final, "-af", "loudnorm=print_format=json", "-f", "null", "-"]).stderr.toString(); const l = JSON.parse(ln.slice(ln.lastIndexOf("{"), ln.lastIndexOf("}") + 1)); report.loudnessLUFS = Number(l.input_i); report.truePeakdBTP = Number(l.input_tp); }
console.log(JSON.stringify(report, null, 2));
console.log("QC sheet: " + path.relative(root, path.join(outDir, name + ".sheet.jpg")));
