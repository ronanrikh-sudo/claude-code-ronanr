#!/usr/bin/env python3
"""PowerPlay story mix: voice-over + word timing + brand music edit + SFX -> mastered mix + timing.json.

  python3 scripts/make_mix.py

Inputs
  assets/vo/voiceover.mp3          chosen ElevenLabs take (one continuous read)
  assets/vo/voiceover.words.json   its forced-alignment word times (scripts/align_words.py)
  script.json                      segments/clauses, music file, SFX cues (anchored to spoken words)
Outputs
  public/audio/mix.wav             -16 LUFS integrated, <= -1.5 dBTP
  src/timing.json                  segments -> clauses -> words (absolute seconds), captions, marks
  out/<output>.srt

Music: CAGECRAFT's ElevenLabs track (140 BPM, beat grid at 0 s). Bars 0-1 are the quiet intro, the
groove starts on bar 2, bar 9 leads into the final hit on bar 10. The edit is cut on bar lines only:
  intro under S1 -> bar 2 drops on "Now" -> bars 2-8, 3-8, 9 -> final hit (bar 10) after the last word.
"""
import json, math, re, subprocess
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
CFG = json.loads((ROOT / "script.json").read_text())
LEAD_S = 0.22                     # ad: the voice starts almost at once (hook text is on screen from frame 2)
BAR = 4 * 60 / 140                # 1.714 s
END_HOLD = 1.6                    # end card holds after the music's final hit
SPLIT = {"powerplay": 2, "powerplays": 2, "t-shirt": 2, "forty-one": 2, "sportsbet": 2, "cagecraft": 2, "twenty-nine": 2}


def decode(path, channels=1):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", str(channels), "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64)
    return x.reshape(-1, channels) if channels > 1 else x


def place(buf, clip, t, gain=1.0):
    i = int(round(t * SR))
    if i < 0:
        clip, i = clip[-i:], 0
    n = min(len(clip), len(buf) - i)
    if n > 0:
        buf[i:i + n] += clip[:n] * gain


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(np.square(x))) + 1e-12)


def loudnorm(src, dest, target=-16.0, tp=-1.5):
    first = subprocess.run(["ffmpeg", "-v", "info", "-i", str(src), "-af",
                            f"loudnorm=I={target}:TP={tp}:LRA=11:print_format=json", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
    m = json.loads(first[first.rindex("{"):first.rindex("}") + 1])
    af = (f"loudnorm=I={target}:TP={tp}:LRA=11:linear=true:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:print_format=json")
    second = subprocess.run(["ffmpeg", "-y", "-v", "info", "-i", str(src), "-af", af, "-ar", str(SR), "-c:a", "pcm_s24le", str(dest)],
                            capture_output=True, text=True, check=True).stderr
    return json.loads(second[second.rindex("{"):second.rindex("}") + 1])


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "-c:a", "pcm_f32le", str(path)],
                   input=x.astype(np.float32).tobytes(), check=True)


def srt_t(s):
    ms = int(round(s * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s_, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s_:02d},{ms:03d}"


def main():
    (ROOT / ".build").mkdir(exist_ok=True); (ROOT / "public/audio").mkdir(parents=True, exist_ok=True); (ROOT / "out").mkdir(exist_ok=True)
    voice_raw = decode(ROOT / "assets/vo/voiceover.mp3")
    aligned = json.loads((ROOT / "assets/vo/voiceover.words.json").read_text())

    # ---- clause + word times from the alignment (script tokens -> aligned words, in order)
    k = 0
    segments = []
    for s in CFG["segments"]:
        clauses = []
        for text in s["clauses"]:
            words = []
            for tok in re.findall(r"[A-Za-z0-9][A-Za-z0-9'\-]*[.,]?", text):
                n = SPLIT.get(tok.strip(".,").lower(), 1)
                part = aligned[k:k + n]; k += n
                words.append({"w": tok.strip(".,"), "start": round(LEAD_S + part[0]["start"], 3), "end": round(LEAD_S + part[-1]["end"], 3)})
            clauses.append({"text": text, "start": words[0]["start"], "end": words[-1]["end"], "words": words})
        segments.append({"id": s["id"], "start": clauses[0]["start"], "end": clauses[-1]["end"], "clauses": clauses})
    assert k == len(aligned), f"alignment has {len(aligned)} words, script consumed {k}"
    allw = [w for s in segments for c in s["clauses"] for w in c["words"]]

    def word_at(word, after=0.0):
        for w in allw:
            if w["w"].lower() == word.lower() and w["start"] >= after:
                return w
        raise KeyError(word)

    # ---- music edit on bar lines
    track = decode(ROOT / CFG["music"]["file"], 2)
    speech_end = segments[-1]["end"]
    # ad edit: the groove (bar 2) hits on frame 0 for the hook; bars 2-8, then 3-8 again as needed, then 9;
    # the final hit (bar 10) lands on the first bar line after the CTA.
    t_now = 0.0
    n_bars = math.floor((speech_end + 0.25) / BAR)
    t_bar2 = speech_end + 0.25 - n_bars * BAR                     # drop lands within the first bar...
    cycle = list(range(2, 9)) + list(range(3, 9)) * 3
    bars = cycle[: n_bars - 1] + [9]
    t_hit = t_bar2 + len(bars) * BAR                              # ...so the final hit lands 0.25 s after the CTA
    total = math.ceil((t_hit + END_HOLD) * 10) / 10
    n = int(total * SR)
    music = np.zeros((n, 2))
    xf = int(0.012 * SR)
    def bar_clip(a_bar, n_bars=1):
        a, b = int(a_bar * BAR * SR), int((a_bar + n_bars) * BAR * SR) + xf
        c = track[a:b].copy()
        c[:xf] *= np.linspace(0, 1, xf)[:, None]; c[-xf:] *= np.linspace(1, 0, xf)[:, None]
        return c
    if t_bar2 > 0:                                                # the end of the intro as a pickup into the drop
        place(music, track[int((2 * BAR - t_bar2) * SR): int(2 * BAR * SR)].copy(), 0.0)
    for i, bi in enumerate(bars):
        place(music, bar_clip(bi), t_bar2 + i * BAR)
    place(music, track[int(10 * BAR * SR):], t_hit)               # final hit + ring-out
    tt = np.arange(n) / SR
    music *= np.clip(tt / 0.01, 0, 1)[:, None] * np.clip((total - tt) / 0.6, 0, 1)[:, None]

    # ---- voice on the timeline, light clean-up
    voice = np.zeros(n)
    place(voice, voice_raw, LEAD_S)
    v_rms = rms_db(voice[np.abs(voice) > 1e-4])

    # ---- duck the music under the voice
    win = int(0.2 * SR)
    env = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
    talk = np.clip(env / (env.max() * 0.12 + 1e-9), 0, 1)
    duck = 1 - 0.5 * np.convolve(talk, np.ones(win * 2) / (win * 2), mode="same")
    m_gain = 10 ** ((v_rms + CFG["music"].get("level_db", -15) - rms_db(music[music != 0])) / 20)
    music *= (duck * m_gain)[:, None]

    # ---- SFX anchored to words
    sfx = np.zeros((n, 2))
    sfx_marks = []
    for cue in CFG.get("sfx", []):
        clip = decode(ROOT / cue["file"], 2)
        at = cue["at"] if "at" in cue else word_at(cue["word"])["start"] + cue.get("offset", 0.0)
        place(sfx, clip, at, 10 ** ((v_rms + cue.get("db", -14) - rms_db(clip)) / 20))
        sfx_marks.append({"word": cue.get("word", "-"), "at": round(at, 3)})

    mix = np.stack([voice, voice], axis=1) + music + sfx
    write_wav(ROOT / ".build/mix_raw.wav", mix)
    stats = loudnorm(ROOT / ".build/mix_raw.wav", ROOT / "public/audio/mix.wav")

    # ---- captions: short phrases (<= 3 words), broken at punctuation
    captions = []
    for s in segments:
        for c in s["clauses"]:
            chunk = []
            for w in c["words"]:
                chunk.append(w)
                if len(chunk) == 3 or w is c["words"][-1]:
                    captions.append({"text": " ".join(x["w"] for x in chunk), "start": chunk[0]["start"], "end": chunk[-1]["end"]})
                    chunk = []
    with open(ROOT / "out" / f"{CFG['output']}.srt", "w") as f:
        for i, c in enumerate(captions, 1):
            f.write(f"{i}\n{srt_t(c['start'])} --> {srt_t(c['end'])}\n{c['text']}\n\n")

    (ROOT / "src/timing.json").write_text(json.dumps({
        "provider": "elevenlabs:" + CFG["voice"]["elevenlabs_voice_name"], "fps": 30, "totalSeconds": total,
        "speechEnd": speech_end, "segments": segments, "ticks": [], "captions": captions,
        "marks": {"bar2": t_bar2, "hit": t_hit, "bar": BAR, "sfx": sfx_marks},
        "mix": {"lufs": float(stats["output_i"]), "truePeak": float(stats["output_tp"])},
    }, indent=1) + "\n")
    print(f"video {total:.1f}s | speech ends {speech_end:.2f}s | {len(bars)} bars | final hit {t_hit:.2f}s | "
          f"mix {stats['output_i']} LUFS, {stats['output_tp']} dBTP")
    for s in segments:
        for c in s["clauses"]:
            print(f"  {s['id']} {c['start']:6.2f} -> {c['end']:6.2f}  {c['text']}")


if __name__ == "__main__":
    main()
