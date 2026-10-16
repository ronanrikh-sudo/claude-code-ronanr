// Render -> mux the mastered mix -> automated checks (duration, audio, loudness).
//   node scripts/render.mjs     (REMOTION_BROWSER=/path/to/chrome-headless-shell optional)
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const script = JSON.parse(fs.readFileSync(path.join(root, "script.json"), "utf8"));
const timing = JSON.parse(fs.readFileSync(path.join(root, "src", "timing.json"), "utf8"));
const silent = path.join(root, ".build", "video-silent.mp4");
const final = path.join(root, "out", `${script.output ?? "video"}.mp4`);
const mix = path.join(root, "public", "audio", "mix.wav");
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const chromiumOptions = { gl: "angle" };
const concurrency = Number(process.env.CONCURRENCY || 4);
fs.mkdirSync(path.dirname(silent), { recursive: true });
fs.mkdirSync(path.dirname(final), { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "Main", browserExecutable, chromiumOptions });
let last = -1;
await renderMedia({
  serveUrl, composition, browserExecutable, chromiumOptions, concurrency, timeoutInMilliseconds: 180000,
  codec: "h264", crf: 16, x264Preset: "slow", pixelFormat: "yuv420p",
  imageFormat: "jpeg", jpegQuality: 95, muted: true, outputLocation: silent, overwrite: true,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 10) * 10;
    if (pct !== last) { last = pct; console.log(`render ${pct}%`); }
  },
});

// The mix is already mastered; mux it untouched apart from AAC encoding.
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", silent, "-i", mix, "-map", "0:v", "-map", "1:a",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-t", String(timing.totalSeconds),
  "-movflags", "+faststart", final]);

const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries",
  "format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames", "-of", "json", final]).toString());
const video = probe.streams.find((s) => s.codec_type === "video");
const audio = probe.streams.find((s) => s.codec_type === "audio");
const ln = spawnSync("ffmpeg", ["-v", "info", "-i", final, "-af", "loudnorm=print_format=json", "-f", "null", "-"]).stderr.toString();
const loud = JSON.parse(ln.slice(ln.lastIndexOf("{"), ln.lastIndexOf("}") + 1));
const report = {
  file: path.relative(root, final),
  duration: Number(probe.format.duration),
  video: video && `${video.codec_name} ${video.width}x${video.height} @ ${video.r_frame_rate} (${video.nb_frames} frames)`,
  audio: audio ? audio.codec_name : "MISSING",
  loudnessLUFS: Number(loud.input_i),
  truePeakdBTP: Number(loud.input_tp),
};
console.log(JSON.stringify(report, null, 2));
const ok = Math.abs(report.duration - timing.totalSeconds) <= 0.2 && !!audio
  && report.truePeakdBTP <= -1 && Math.abs(report.loudnessLUFS + 16) <= 1;
if (!ok) { console.error("QC FAILED"); process.exit(1); }
console.log("QC passed");
