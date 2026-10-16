// Every time in the film comes from src/timing.json, written by scripts/make_mix.py from the
// measured voice-over (forced-aligned words) and the music edit. Re-run `npm run voice` and
// every beat follows.
import timing from "./timing.json";
import { FPS } from "./config";

export type Word = { w: string; start: number; end: number };
export type Caption = { text: string; start: number; end: number };
export type Timing = {
  fps: number; totalSeconds: number; voLead: number; speechEnd: number;
  words: Word[]; captions: Caption[];
  marks: {
    kick: number; slow_in: number; slow_full: number; contact: number; ramp_up: number; snap: number;
    freeze: number; biggest: number; finalHit: number; bar: number; musicStart: number;
  };
  voice: string; mix: { lufs: number; truePeak: number };
};

export const T = timing as Timing;
export const M = T.marks;
export const sec = (s: number) => Math.round(s * FPS);

/** Start time (s) of the n-th occurrence of a spoken word. */
export const word = (w: string, n = 0): number => {
  const hits = T.words.filter((x) => x.w === w);
  if (!hits[n]) throw new Error(`word "${w}" #${n} not in timing.json`);
  return hits[n].start;
};
export const wordEnd = (w: string, n = 0): number => T.words.filter((x) => x.w === w)[n].end;
