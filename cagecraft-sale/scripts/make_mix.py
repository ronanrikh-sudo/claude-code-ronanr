#!/usr/bin/env python3
"""CAGECRAFT mix: voice-over edit -> word timing -> music edit -> SFX -> duck -> master.

Reads script.json (timeline, captions, music, sfx cues) plus the chosen ElevenLabs take and its
forced-alignment word times, and writes:
  public/audio/mix.wav   mastered stereo mix (-16 LUFS integrated, <= -1.5 dBTP)
  src/timing.json        every time the visuals use (words, captions, hook marks, music marks)
  out/<output>.srt       one-word captions

The take is cut only inside its own pauses, so the read stays natural; extra silence is added
after "Ever.", "gifts." and "only." to give the visuals room and to land the music's final hit
right after "Shop now". The music is cut on bar lines only.

  python3 scripts/make_mix.py
"""
import json, math, re, subprocess, sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
CFG = json.loads((ROOT / "script.json").read_text())
TL = CFG["timeline"]


def decode(path, channels=2):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", str(channels), "-ar", str(SR),
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, channels).copy()


def place(buf, clip, t, gain=1.0):
    i = int(round(t * SR))
    if i < 0:
        clip, i = clip[-i:], 0
    n = min(len(clip), len(buf) - i)
    if n > 0:
        buf[i:i + n] += clip[:n] * gain


def fade(x, fin=0.003, fout=0.003):
    x = x.copy()
    a, b = int(fin * SR), int(fout * SR)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x


def resample(x, rate):
    """Varispeed: rate < 1 plays slower and lower, like a slowed tape."""
    if abs(rate - 1) < 1e-6:
        return x
    n = int(len(x) / rate)
    src = np.arange(n) * rate
    return np.stack([np.interp(src, np.arange(len(x)), x[:, c]) for c in range(x.shape[1])], 1).astype(np.float32)


def db(v):
    return 10 ** (v / 20)


# ---------------------------------------------------------------- voice-over: cut in pauses, re-space
vo = decode(ROOT / CFG["voice"]["take"])
words = json.loads((ROOT / CFG["voice"]["words"]).read_text())
for w in words:
    w["w"] = re.sub(r"\(\d+\)$", "", w["w"])
lead = TL["vo_lead"]
gaps = TL["gaps_after"]

pieces, shift, cur = [], 0.0, 0.0
timeline_words = []
for k, w in enumerate(words):
    timeline_words.append({"w": w["w"], "start": round(w["start"] + lead + shift, 3), "end": round(w["end"] + lead + shift, 3)})
    if w["w"] in gaps and k + 1 < len(words):
        cut = (w["end"] + words[k + 1]["start"]) / 2  # middle of the pause after the word
        pieces.append((cur, cut, lead + cur + shift))
        shift += gaps[w["w"]]
        cur = cut
pieces.append((cur, len(vo) / SR, lead + cur + shift))

speech_end = timeline_words[-1]["end"]
W = {}
for w in timeline_words:  # first occurrence of each word
    W.setdefault(w["w"], w)

# ---------------------------------------------------------------- music: drop, tape-stop, re-entry, bar cut
bar = 4 * 60 / CFG["music"]["bpm"]
music = decode(ROOT / CFG["music"]["file"])
hook = TL["hook"]
snap = hook["snap"]
stop_t = W["stop"]["start"]
big_t = W["biggest"]["start"]
final_t = big_t + 8 * bar  # bar 1 at "biggest", bar 2 cut, final hit is bar 10
total = math.ceil((final_t + TL["tail_after_final_hit"]) * TL["fps"]) / TL["fps"]
N = int(round(total * SR))

mus = np.zeros((N, 2), np.float32)
a_len = stop_t - snap
place(mus, fade(music[: int(a_len * SR)], 0.002, 0.0), snap)
# tape stop: playback rate falls 1 -> 0 over ts seconds (consumes ts/2 of source)
ts = 0.55
t = np.arange(int(ts * SR)) / SR
src_idx = a_len * SR + (t - t * t / (2 * ts)) * SR
tape = np.stack([np.interp(src_idx, np.arange(len(music)), music[:, c]) for c in range(2)], 1)
tape *= np.linspace(1, 0, len(tape))[:, None] ** 0.6
place(mus, tape.astype(np.float32), stop_t)
# bar 1 on "biggest", then bars 3.. (bar 2 cut). 8 ms equal-power crossfade at the splice.
xf = int(0.008 * SR)
segB = music[int(bar * SR): int(2 * bar * SR) + xf].copy()
segC = music[int(3 * bar * SR):].copy()
segB[-xf:] *= np.cos(np.linspace(0, np.pi / 2, xf))[:, None]
segC[:xf] *= np.sin(np.linspace(0, np.pi / 2, xf))[:, None]
place(mus, fade(segB, 0.002, 0.0), big_t)
place(mus, segC, big_t + bar)
endfade = int(0.5 * SR)
mus[-endfade:] *= np.linspace(1, 0, endfade)[:, None]

# ---------------------------------------------------------------- ducking under the voice
voice = np.zeros((N, 2), np.float32)
for s0, s1, at in pieces:
    place(voice, fade(vo[int(s0 * SR): int(s1 * SR)], 0.02, 0.02), at)
ctl = 100  # control rate (Hz)
hop = SR // ctl
env = np.sqrt(np.mean(voice[: len(voice) // hop * hop, 0].reshape(-1, hop) ** 2, 1))
act = np.clip((20 * np.log10(env + 1e-9) + 45) / 15, 0, 1)  # 0 below -45 dBFS, 1 above -30
g = np.empty_like(act)
lvl = 0.0
for i, a in enumerate(act):  # attack 30 ms, release 300 ms
    coef = 1 - math.exp(-1 / (ctl * (0.03 if a > lvl else 0.3)))
    lvl += (a - lvl) * coef
    g[i] = lvl
duck = 1 - (1 - db(CFG["music"]["duck_db"])) * g
duck = np.interp(np.arange(N), np.arange(len(duck)) * hop, duck).astype(np.float32)
mus *= (duck * db(CFG["music"]["level_db"]))[:, None]

# ---------------------------------------------------------------- sound design
marks = {"hook." + k: v for k, v in hook.items()}
marks.update({"word." + k: v["start"] for k, v in W.items()})
marks["music.final"] = final_t
sfx = np.zeros((N, 2), np.float32)
for cue in CFG["sfx"]:
    clip = resample(decode(ROOT / "assets/sfx" / f"{cue['file']}.mp3"), cue.get("rate", 1.0))
    clip = clip / (np.abs(clip).max() + 1e-9) * db(-1)
    at = marks[cue["at"]] + cue.get("offset", 0.0)
    if cue.get("align") == "peak":
        at -= np.argmax(np.abs(clip).max(1)) / SR
    if "until" in cue:
        keep = int((marks[cue["until"]] - at) * SR)
        clip = fade(clip[:keep], 0.0, cue.get("fade_out", 0.1))
    place(sfx, fade(clip, 0.002, 0.01), at, db(cue.get("db", 0)))

mix = voice + mus + sfx


# ---------------------------------------------------------------- master: gain to -16 LUFS, true-peak limit
def measure(x):
    p = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                        "-af", "loudnorm=print_format=json", "-f", "null", "-"],
                       input=x.astype(np.float32).tobytes(), capture_output=True)
    s = p.stderr.decode()
    j = json.loads(s[s.rindex("{"): s.rindex("}") + 1])
    return float(j["input_i"]), float(j["input_tp"])


def limit(x, ceiling_db):
    p = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                        "-af", f"alimiter=limit={db(ceiling_db):.5f}:attack=1:release=80:level=false:asc=1",
                        "-f", "f32le", "-"], input=x.astype(np.float32).tobytes(), capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).reshape(-1, 2)[: len(x)]


out = mix
for _ in range(4):
    lufs, tp = measure(out)
    if abs(lufs + 16) <= 0.2 and tp <= -1.5:
        break
    out = limit(out * db(-16 - lufs), -2.3)
lufs, tp = measure(out)

dst = ROOT / "public/audio/mix.wav"
dst.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-c:a", "pcm_s24le", str(dst)], input=out.astype(np.float32).tobytes(), check=True)

# ---------------------------------------------------------------- timing.json + srt
seq = [w for w in timeline_words]
captions, i = [], 0
for text, src in CFG["captions"]:
    toks = src.split()
    while seq[i]["w"] != toks[0]:
        i += 1
    s, e = seq[i]["start"], seq[i + len(toks) - 1]["end"]
    captions.append({"text": text, "start": s, "end": e})
    i += len(toks)

timing = {
    "fps": TL["fps"], "totalSeconds": total, "voLead": lead, "speechEnd": speech_end,
    "words": timeline_words, "captions": captions,
    "marks": {**{k: round(v, 3) for k, v in hook.items()}, "freeze": round(stop_t, 3), "biggest": round(big_t, 3),
              "finalHit": round(final_t, 3), "bar": round(bar, 6), "musicStart": snap},
    "voice": CFG["voice"]["elevenlabs_voice_name"],
    "mix": {"lufs": round(lufs, 2), "truePeak": round(tp, 2)},
}
(ROOT / "src/timing.json").write_text(json.dumps(timing, indent=1) + "\n")


def srt_t(s):
    ms = int(round(s * 1000)); return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


(ROOT / "out").mkdir(exist_ok=True)
lines = []
for k, c in enumerate(captions):
    end = min(c["end"] + 0.25, captions[k + 1]["start"]) if k + 1 < len(captions) else c["end"] + 1.0
    lines += [str(k + 1), f"{srt_t(c['start'])} --> {srt_t(end)}", c["text"], ""]
(ROOT / "out" / f"{CFG['output']}.srt").write_text("\n".join(lines))

print(f"total {total:.3f}s  speech {lead:.2f}-{speech_end:.2f}s  snap {snap}  freeze {stop_t:.2f}  "
      f"biggest {big_t:.2f}  final hit {final_t:.2f}")
print(f"mix {lufs:.2f} LUFS  {tp:.2f} dBTP -> {dst.relative_to(ROOT)}")
for c in captions:
    print(f"  {c['start']:6.2f} {c['end']:6.2f}  {c['text']}")
