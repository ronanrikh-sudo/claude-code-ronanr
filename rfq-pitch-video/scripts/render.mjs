// Render the video, mux in the mastered mix, and run the automated checks.
//   node scripts/render.mjs            (REMOTION_BROWSER=/path/to/chrome optional)
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "out");
const silent = path.join(root, ".build", "video-silent.mp4");
const final = path.join(out, "rfq-pitch-30s.mp4");
const mix = path.join(root, "public", "audio", "mix.wav");
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
fs.mkdirSync(path.dirname(silent), { recursive: true });
fs.mkdirSync(out, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "RfqPitch", browserExecutable });
let last = -1;
await renderMedia({
  serveUrl, composition, browserExecutable,
  codec: "h264", crf: 16, x264Preset: "slow", pixelFormat: "yuv420p",
  imageFormat: "jpeg", jpegQuality: 95, muted: true,
  outputLocation: silent, overwrite: true,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 10) * 10;
    if (pct !== last) { last = pct; console.log(`render ${pct}%`); }
  },
});

// The mix is already mastered (-16 LUFS, < -1 dBTP); mux it untouched apart from AAC encoding.
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", silent, "-i", mix, "-map", "0:v", "-map", "1:a",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-t", "30", "-movflags", "+faststart", final]);

// ---- checks
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries",
  "format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames", "-of", "json", final]).toString());
const duration = Number(probe.format.duration);
const video = probe.streams.find((s) => s.codec_type === "video");
const audio = probe.streams.find((s) => s.codec_type === "audio");
const lnText = spawnSync("ffmpeg", ["-v", "info", "-i", final, "-af", "loudnorm=print_format=json", "-f", "null", "-"])
  .stderr.toString();
const loud = JSON.parse(lnText.slice(lnText.lastIndexOf("{"), lnText.lastIndexOf("}") + 1));

const report = {
  file: path.relative(root, final),
  duration,
  video: video && `${video.codec_name} ${video.width}x${video.height} @ ${video.r_frame_rate} (${video.nb_frames} frames)`,
  audio: audio ? audio.codec_name : "MISSING",
  loudnessLUFS: Number(loud.input_i),
  truePeakdBTP: Number(loud.input_tp),
};
console.log(JSON.stringify(report, null, 2));
const ok = Math.abs(duration - 30) <= 0.2 && !!audio && report.truePeakdBTP <= -1 && Math.abs(report.loudnessLUFS + 16) <= 1;
if (!ok) {
  console.error("QC FAILED");
  process.exit(1);
}
console.log("QC passed");
