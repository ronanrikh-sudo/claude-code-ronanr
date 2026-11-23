// Every time comes from src/timing.json (scripts/make_mix.py): clause and word times are measured from
// the voice-over's forced alignment, so beats land on the actual words.
import timing from "./timing.json";
import { FPS } from "./config";

export type Word = { w: string; start: number; end: number };
export type Clause = { text: string; start: number; end: number; words: Word[] };
export type Segment = { id: string; start: number; end: number; clauses: Clause[] };
export const T = timing as unknown as {
  totalSeconds: number; speechEnd: number; segments: Segment[]; captions: { text: string; start: number; end: number }[];
  marks: { now: number; bar2: number; hit: number; bar: number }; mix: { lufs: number; truePeak: number };
};

export const sec = (s: number) => Math.round(s * FPS);
export const seg = (id: string) => { const s = T.segments.find((x) => x.id === id); if (!s) throw new Error(`no ${id}`); return s; };
/** "S3" -> segment, "S3.1" -> clause 1 of S3 */
export const clause = (ref: string): Clause => { const [id, i] = ref.split("."); return seg(id).clauses[Number(i ?? 0)]; };
export const cue = (ref: string) => (ref.includes(".") ? clause(ref).start : seg(ref).start);
/** Start time of a spoken word inside a clause ("S4.0", "tap"); nth for repeats. */
export const word = (ref: string, w: string, nth = 0): number => {
  const hits = clause(ref).words.filter((x) => x.w.toLowerCase() === w.toLowerCase());
  if (!hits[nth]) throw new Error(`"${w}" not in ${ref}`);
  return hits[nth].start;
};
export const wordEnd = (ref: string, w: string, nth = 0): number => {
  const hits = clause(ref).words.filter((x) => x.w.toLowerCase() === w.toLowerCase());
  if (!hits[nth]) throw new Error(`"${w}" not in ${ref}`);
  return hits[nth].end;
};
export const LEAD = 0.1;
