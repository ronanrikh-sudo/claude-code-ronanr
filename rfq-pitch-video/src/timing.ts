// Everything is driven by src/timing.json, which scripts/make_audio.py writes
// from the measured voice-over. Re-run `npm run voice` and the visuals follow.
import timing from "./timing.json";
import { FPS } from "./config";

export const T = timing;
export const sec = (s: number) => Math.round(s * FPS);

const seg = (id: string) => {
  const s = timing.segments.find((x) => x.id === id);
  if (!s) throw new Error(`segment ${id} missing`);
  return s;
};
export const S1 = seg("S1");
export const S2 = seg("S2");
export const S3 = seg("S3");
export const S4 = seg("S4");
export const S5 = seg("S5");

/** Approximate time a word starts inside a clause (character-proportional). */
export const wordTime = (clause: { text: string; start: number; end: number }, word: string) => {
  const i = clause.text.indexOf(word);
  if (i < 0) throw new Error(`"${word}" not in "${clause.text}"`);
  return clause.start + ((clause.end - clause.start) * i) / clause.text.length;
};

const LEAD = 0.1; // cut a few frames ahead of the first word

// Visual scenes (seconds). Scene 2 keeps the terminal on screen through
// "Claude reads the replies with read-only access", then the work begins.
export const SCENES = {
  problem: { from: 0, to: S2.start - LEAD },
  prompt: { from: S2.start - LEAD, to: S3.clauses[1].start - LEAD },
  work: { from: S3.clauses[1].start - LEAD, to: S4.start - LEAD },
  output: { from: S4.start - LEAD, to: S5.start - LEAD },
  close: { from: S5.start - LEAD, to: timing.totalSeconds },
};
