// Everything is driven by src/timing.json, written by scripts/make_audio.py from the
// measured voice-over. Re-run `npm run voice` and every beat follows the new take.
import timing from "./timing.json";
import { FPS } from "./config";

export type Clause = { text: string; start: number; end: number };
export type Segment = { id: string; start: number; end: number; clauses: Clause[] };
export type Timing = {
  provider: string; fps: number; totalSeconds: number; speechEnd: number;
  segments: Segment[]; ticks: number[]; captions: Clause[]; mix: { lufs: number; truePeak: number };
};

export const T = timing as Timing;
export const sec = (s: number) => Math.round(s * FPS);

export const seg = (id: string): Segment => {
  const s = T.segments.find((x) => x.id === id);
  if (!s) throw new Error(`segment ${id} missing from timing.json`);
  return s;
};

/** "S3" -> segment start, "S3.1" -> start of clause 1 (0-based) of S3. */
export const cue = (ref: string): number => {
  const [id, idx] = ref.split(".");
  const s = seg(id);
  return idx === undefined ? s.start : s.clauses[Number(idx)].start;
};

/** Approximate time a word starts inside a clause (character-proportional). */
export const wordTime = (clause: Clause, word: string) => {
  const i = clause.text.indexOf(word);
  if (i < 0) throw new Error(`"${word}" not in "${clause.text}"`);
  return clause.start + ((clause.end - clause.start) * i) / clause.text.length;
};

/** Cut a few frames ahead of the first word so every scene change lands on a VO beat. */
export const LEAD = 0.1;
