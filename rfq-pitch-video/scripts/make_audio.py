#!/usr/bin/env python3
"""Voice-over + music pipeline for the RFQ pitch video.

1. Synthesises each VO segment with the best available TTS provider:
   ElevenLabs (ELEVENLABS_API_KEY) -> OpenAI (OPENAI_API_KEY) -> Piper -> macOS `say`.
2. Trims and measures every segment with ffprobe.
3. Lays the segments on a 30 s timeline (speech ends <= 29 s, ~1 s silent tail),
   raising the speech rate slightly if the script runs long.
4. Finds clause boundaries inside each segment (detected pauses, snapped from a
   character-proportional estimate) so visuals and captions sync to real speech.
5. Synthesises a subtle pad in code, ducks it under the voice, and masters the
   mix to about -16 LUFS with true peak below -1 dBFS.
6. Writes src/timing.json (drives every scene) and out/rfq-pitch-30s.srt.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import urllib.request
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / ".build" / "audio"
PUBLIC_AUDIO = ROOT / "public" / "audio"
OUT = ROOT / "out"
TIMING_JSON = ROOT / "src" / "timing.json"
VOICES_DIR = ROOT / ".build" / "voices"

FPS = 30
TOTAL_S = 30.0
SR = 48000

LEAD_S = 0.35          # silence before the first word
SPEECH_END_MAX = 28.9  # last word must finish by here (>= ~1 s silent tail)
SPEECH_END_MIN = 27.6  # if we finish earlier than this, gaps are widened
BASE_GAPS = [0.6, 0.45, 0.5, 0.55]  # pauses after S1..S4

# Each segment: display text (captions) and clauses. spoken() respells acronyms so
# every engine says them letter by letter ("R F Q", "P D F's").
SEGMENTS = [
    {
        "id": "S1",
        "clauses": [
            "Two hundred suppliers reply to an RFQ.",
            "PDFs, spreadsheets, prices buried in emails.",
            "Today, that's hours of manual entry.",
        ],
    },
    {"id": "S2", "clauses": ["Now, one prompt."]},
    {
        "id": "S3",
        "clauses": [
            "Claude reads the replies with read-only access,",
            "matches each one to its RFQ,",
            "fills our template to our rules,",
            "and checks every file before it's saved.",
        ],
    },
    {
        "id": "S4",
        "clauses": [
            "You get a folder ready to import,",
            "and a report that flags what needs a human eye.",
        ],
    },
    {
        "id": "S5",
        "clauses": [
            "Hours of data entry become minutes of review.",
            "Let's pilot it on one folio.",
        ],
    },
]

MAX_CAPTION_WORDS = 7


def spoken(text: str) -> str:
    text = re.sub(r"\bRFQ\b", "R F Q", text)
    return re.sub(r"\bPDFs\b", "P D F's", text)


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def ffprobe_duration(path: Path) -> float:
    out = run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", str(path),
    ]).stdout.strip()
    return float(out)


# ---------------------------------------------------------------- TTS providers

def tts_elevenlabs(text: str, dest: Path, rate: float) -> None:
    key = os.environ["ELEVENLABS_API_KEY"]
    # "Charlie" premade voice: natural, warm, Australian male. Override with ELEVENLABS_VOICE_ID.
    voice = os.environ.get("ELEVENLABS_VOICE_ID", "IKne3meq5aSn9XLyUdCD")
    body = json.dumps({
        "text": text,
        "model_id": os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2"),
        "voice_settings": {"stability": 0.55, "similarity_boost": 0.8, "style": 0.15,
                           "use_speaker_boost": True, "speed": max(0.7, min(1.2, rate))},
    }).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_192",
        data=body, headers={"xi-api-key": key, "Content-Type": "application/json"})
    raw = dest.with_suffix(".src.mp3")
    raw.write_bytes(urllib.request.urlopen(req, timeout=120).read())
    to_wav(raw, dest)


def tts_openai(text: str, dest: Path, rate: float) -> None:
    key = os.environ["OPENAI_API_KEY"]
    body = json.dumps({
        "model": os.environ.get("OPENAI_TTS_MODEL", "gpt-4o-mini-tts"),
        "voice": os.environ.get("OPENAI_TTS_VOICE", "ash"),
        "input": text,
        "instructions": "Calm, confident, warm and credible. Neutral or light Australian "
                        "English accent. Professional internal briefing, no hype.",
        "response_format": "wav",
        "speed": rate,
    }).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/audio/speech", data=body,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    raw = dest.with_suffix(".src.wav")
    raw.write_bytes(urllib.request.urlopen(req, timeout=120).read())
    to_wav(raw, dest)


PIPER_VOICE = os.environ.get("PIPER_VOICE", "en-us-ryan-high")


def piper_model() -> Path:
    if os.environ.get("PIPER_MODEL"):
        return Path(os.environ["PIPER_MODEL"])
    model = VOICES_DIR / f"voice-{PIPER_VOICE}" / f"{PIPER_VOICE}.onnx"
    if not model.exists():
        VOICES_DIR.mkdir(parents=True, exist_ok=True)
        url = ("https://github.com/rhasspy/piper/releases/download/v0.0.2/"
               f"voice-{PIPER_VOICE}.tar.gz")
        print(f"  downloading Piper voice {PIPER_VOICE} ...")
        tgz = VOICES_DIR / f"voice-{PIPER_VOICE}.tar.gz"
        urllib.request.urlretrieve(url, tgz)
        with tarfile.open(tgz) as tf:
            tf.extractall(model.parent, filter="data")
        tgz.unlink()
    return model


def tts_piper(text: str, dest: Path, rate: float) -> None:
    raw = dest.with_suffix(".src.wav")
    subprocess.run(
        [sys.executable, "-m", "piper", "-m", str(piper_model()), "-f", str(raw),
         "--length-scale", f"{1.0 / rate:.4f}", "--sentence-silence", "0.12",
         "--noise-scale", "0.6", "--noise-w-scale", "0.6"],
        input=text, text=True, check=True, capture_output=True)
    to_wav(raw, dest)


def tts_say(text: str, dest: Path, rate: float) -> None:
    raw = dest.with_suffix(".src.aiff")
    run(["say", "-r", str(int(175 * rate)), "-o", str(raw), text])
    to_wav(raw, dest)


def piper_available() -> bool:
    try:
        import piper  # noqa: F401
        return True
    except ImportError:
        return False


def pick_provider():
    if os.environ.get("ELEVENLABS_API_KEY"):
        return "ElevenLabs", tts_elevenlabs
    if os.environ.get("OPENAI_API_KEY"):
        return "OpenAI TTS", tts_openai
    if piper_available():
        return f"Piper ({PIPER_VOICE})", tts_piper
    if shutil.which("say"):
        return "macOS say", tts_say
    sys.exit("No TTS available: set ELEVENLABS_API_KEY / OPENAI_API_KEY or `pip install piper-tts`.")


def to_wav(src: Path, dest: Path) -> None:
    """48 kHz mono float wav, leading/trailing silence trimmed, light polish EQ."""
    trim = ("silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,"
            "areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.04,"
            "areverse")
    polish = "highpass=f=70,equalizer=f=250:t=q:w=1.2:g=-1.5,equalizer=f=4500:t=q:w=1.5:g=1.5"
    run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-af", f"{trim},{polish}",
         "-ac", "1", "-ar", str(SR), "-c:a", "pcm_f32le", str(dest)])


def read_wav(path: Path) -> np.ndarray:
    proc = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le",
                           "-ac", "1", "-ar", str(SR), "-"], check=True, capture_output=True)
    return np.frombuffer(proc.stdout, dtype=np.float32).copy()


def write_wav(path: Path, data: np.ndarray, channels: int = 1) -> None:
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ac", str(channels),
                    "-ar", str(SR), "-i", "-", "-c:a", "pcm_s24le", str(path)],
                   input=data.astype(np.float32).tobytes(), check=True)


# ------------------------------------------------------------ clause detection

def detect_pauses(path: Path) -> list[tuple[float, float]]:
    proc = subprocess.run(["ffmpeg", "-v", "info", "-i", str(path), "-af",
                           "silencedetect=noise=-38dB:d=0.07", "-f", "null", "-"],
                          capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", proc.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", proc.stderr)]
    return list(zip(starts, ends))


def clause_bounds(seg_text: list[str], dur: float, pauses) -> list[tuple[float, float]]:
    """Relative (start, end) for each clause inside a segment."""
    weights = [len(re.sub(r"[^A-Za-z0-9]", "", spoken(c))) + 3 for c in seg_text]
    total = sum(weights)
    bounds = [0.0]
    acc = 0
    used = set()
    for w in weights[:-1]:
        acc += w
        est = dur * acc / total
        best = None
        for i, (s, e) in enumerate(pauses):
            mid = (s + e) / 2
            if i in used or not (0.2 < mid < dur - 0.2):
                continue
            if abs(mid - est) < 0.55 and (best is None or abs(mid - est) < abs(best[1] - est)):
                best = (i, mid, s, e)
        if best:
            used.add(best[0])
            bounds.append((best[2], best[3]))
        else:
            bounds.append((est, est))
    bounds.append((dur, dur))
    out = []
    for i in range(len(seg_text)):
        start = 0.0 if i == 0 else bounds[i][1]
        end = dur if i == len(seg_text) - 1 else bounds[i + 1][0]
        out.append((start, end))
    return out


def split_caption(text: str, start: float, end: float):
    words = text.split()
    if len(words) <= MAX_CAPTION_WORDS:
        return [(text, start, end)]
    n = -(-len(words) // MAX_CAPTION_WORDS)
    per = -(-len(words) // n)
    chunks = [" ".join(words[i:i + per]) for i in range(0, len(words), per)]
    lens = [len(c) for c in chunks]
    out, t = [], start
    for c, l in zip(chunks, lens):
        d = (end - start) * l / sum(lens)
        out.append((c, t, t + d))
        t += d
    return out


def srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


# -------------------------------------------------------------------- music pad

def midi_hz(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def one_pole_lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    from scipy.signal import butter, sosfilt
    sos = butter(2, cutoff, btype="low", fs=SR, output="sos")
    return sosfilt(sos, x)


def synth_pad(scene_starts: list[float], voice: np.ndarray) -> np.ndarray:
    """Soft stereo pad in D, chord changes on scene beats, ducked under the voice."""
    n = int(TOTAL_S * SR)
    t = np.arange(n) / SR
    # Chords (MIDI): S1 Bm9 (unresolved), S2 Gmaj7 sparse, S3 Dadd9, S4 Gmaj9, S5 Dmaj9 resolve
    chords = [
        [47, 54, 57, 61, 62],
        [43, 50, 54, 59],
        [38, 50, 54, 57, 64],
        [43, 50, 54, 57, 62],
        [38, 50, 54, 57, 61, 64],
    ]
    rng = np.random.default_rng(7)
    left = np.zeros(n)
    right = np.zeros(n)
    xf = 0.9  # crossfade seconds
    for ci, chord in enumerate(chords):
        a = scene_starts[ci]
        b = scene_starts[ci + 1] if ci + 1 < len(scene_starts) else TOTAL_S
        env = np.clip((t - (a - xf / 2)) / xf, 0, 1) * np.clip(((b + xf / 2) - t) / xf, 0, 1)
        env = np.sin(env * np.pi / 2) ** 2
        if not env.any():
            continue
        for note in chord:
            f = midi_hz(note)
            for det, pan in ((-0.07, 0.25), (0.0, 0.5), (0.08, 0.75)):
                ff = f * 2 ** (det / 12)
                ph = rng.uniform(0, 2 * np.pi)
                vib = 0.0015 * np.sin(2 * np.pi * 0.18 * t + ph)
                tone = (np.sin(2 * np.pi * ff * t * (1 + vib) + ph)
                        + 0.18 * np.sin(2 * np.pi * 2 * ff * t + ph * 1.3)
                        + 0.06 * np.sin(2 * np.pi * 3 * ff * t + ph * 0.7))
                w = env / (1 + 0.012 * (f - 100))  # tame the upper voices
                left += tone * w * (1 - pan)
                right += tone * w * pan
    # Breath: lowpassed noise bed
    noise = one_pole_lowpass(rng.standard_normal(n), 900) * 0.25
    left += noise
    right += np.roll(noise, 1700)
    left = one_pole_lowpass(left, 2400)
    right = one_pole_lowpass(right, 2400)
    swell = 0.82 + 0.18 * np.sin(2 * np.pi * 0.11 * t - 1.2)
    master = np.clip(t / 1.6, 0, 1) * np.clip((TOTAL_S - t) / 1.4, 0, 1) * swell
    # Duck ~5 dB while the voice is talking (smoothed envelope follower)
    win = int(0.25 * SR)
    venv = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
    talk = np.clip(venv / (venv.max() * 0.15 + 1e-9), 0, 1)
    talk = np.convolve(talk, np.ones(win) / win, mode="same")
    duck = 1 - 0.44 * talk
    left *= master * duck
    right *= master * duck
    peak = max(np.abs(left).max(), np.abs(right).max())
    return np.stack([left, right], axis=1) / peak


def rms_db(x: np.ndarray) -> float:
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


def loudnorm(src: Path, dest: Path, target=-16.0, tp=-1.5) -> dict:
    first = subprocess.run(["ffmpeg", "-v", "info", "-i", str(src), "-af",
                            f"loudnorm=I={target}:TP={tp}:LRA=11:print_format=json",
                            "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(first[first.rindex("{"):first.rindex("}") + 1])
    af = (f"loudnorm=I={target}:TP={tp}:LRA=11:linear=true:"
          f"measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:"
          f"offset={m['target_offset']}:print_format=json")
    second = subprocess.run(["ffmpeg", "-y", "-v", "info", "-i", str(src), "-af", af,
                             "-ar", str(SR), "-c:a", "pcm_s24le", str(dest)],
                            capture_output=True, text=True, check=True).stderr
    return json.loads(second[second.rindex("{"):second.rindex("}") + 1])


# ------------------------------------------------------------------------- main

def main() -> None:
    for d in (BUILD, PUBLIC_AUDIO, OUT):
        d.mkdir(parents=True, exist_ok=True)
    name, tts = pick_provider()
    print(f"TTS provider: {name}")

    rate = float(os.environ.get("VO_RATE", "1.0"))
    for attempt in range(8):
        durs = []
        for i, seg in enumerate(SEGMENTS):
            dest = BUILD / f"s{i + 1}.wav"
            tts(spoken(" ".join(seg["clauses"])), dest, rate)
            durs.append(ffprobe_duration(dest))
        end = LEAD_S + sum(durs) + sum(BASE_GAPS)
        print(f"  rate {rate:.3f}: segments {[round(d, 3) for d in durs]} -> speech ends {end:.2f}s")
        if end <= SPEECH_END_MAX:
            break
        need = (end - LEAD_S - sum(BASE_GAPS)) / (SPEECH_END_MAX - 0.15 - LEAD_S - sum(BASE_GAPS))
        rate *= min(1.04, max(1.012, need))
        if rate > 1.12:  # beyond this it stops sounding natural
            break
    else:
        sys.exit("Could not fit the script inside 29 s without exceeding a natural rate.")

    gaps = list(BASE_GAPS)
    if end < SPEECH_END_MIN:  # breathe a little more rather than leave a long tail
        extra = (SPEECH_END_MIN - end) / len(gaps)
        gaps = [g + min(extra, 0.35) for g in gaps]

    # Timeline
    voice = np.zeros(int(TOTAL_S * SR), dtype=np.float32)
    t = LEAD_S
    segments_out, captions = [], []
    for i, seg in enumerate(SEGMENTS):
        path = BUILD / f"s{i + 1}.wav"
        audio = read_wav(path)
        a = int(round(t * SR))
        voice[a:a + len(audio)] += audio
        dur = durs[i]
        clauses = clause_bounds(seg["clauses"], dur, detect_pauses(path))
        cl_out = []
        for text, (cs, ce) in zip(seg["clauses"], clauses):
            cl_out.append({"text": text, "start": round(t + cs, 3), "end": round(t + ce, 3)})
            captions.extend(split_caption(text, t + cs, t + ce))
        segments_out.append({"id": seg["id"], "start": round(t, 3), "end": round(t + dur, 3),
                             "duration": round(dur, 3), "clauses": cl_out})
        t += dur + (gaps[i] if i < len(gaps) else 0)
    speech_end = segments_out[-1]["end"]

    # Scene starts land on VO beats (a couple of frames ahead of the first word).
    scene_starts = [0.0] + [s["start"] - 0.1 for s in segments_out[1:]]
    # Check ticks during S3 clause 4 (shared by visuals and the tick SFX)
    c4 = segments_out[2]["clauses"][3]
    span = c4["end"] - c4["start"]
    ticks = [round(c4["start"] + 0.12 + k * (span - 0.25) / 3.4, 3) for k in range(4)]

    # SFX: soft ticks for the validation checklist
    sfx = np.zeros_like(voice)
    tt = np.arange(int(0.09 * SR)) / SR
    blip = (np.sin(2 * np.pi * 1320 * tt) + 0.4 * np.sin(2 * np.pi * 1980 * tt)) * np.exp(-tt * 55)
    for k, tick in enumerate(ticks):
        a = int(tick * SR)
        sfx[a:a + len(blip)] += blip * (0.9 + 0.05 * k)

    pad = synth_pad(scene_starts, voice)
    voice_st = np.stack([voice, voice], axis=1)
    sfx_st = np.stack([sfx, sfx], axis=1)
    # Pad sits ~19 dB under the voice (RMS over speech), ticks ~22 dB under.
    v_rms = rms_db(voice[voice != 0]) if voice.any() else -20
    pad_gain = 10 ** ((v_rms - 19 - rms_db(pad)) / 20)
    sfx_gain = 10 ** ((v_rms - 14 - rms_db(blip)) / 20)
    mix = voice_st + pad * pad_gain + sfx_st * sfx_gain
    write_wav(BUILD / "voice.wav", voice)
    write_wav(BUILD / "mix_raw.wav", mix, channels=2)
    stats = loudnorm(BUILD / "mix_raw.wav", PUBLIC_AUDIO / "mix.wav")
    print(f"  mix: {stats['output_i']} LUFS, true peak {stats['output_tp']} dBTP")

    # Captions / SRT
    with open(OUT / "rfq-pitch-30s.srt", "w") as f:
        for k, (text, s, e) in enumerate(captions, 1):
            f.write(f"{k}\n{srt_time(s)} --> {srt_time(e)}\n{text}\n\n")

    timing = {
        "provider": name,
        "rate": round(rate, 4),
        "fps": FPS,
        "totalSeconds": TOTAL_S,
        "speechEnd": speech_end,
        "segments": segments_out,
        "sceneStarts": [round(s, 3) for s in scene_starts],
        "checkTicks": ticks,
        "captions": [{"text": c, "start": round(s, 3), "end": round(e, 3)} for c, s, e in captions],
        "mix": {"lufs": float(stats["output_i"]), "truePeak": float(stats["output_tp"])},
    }
    TIMING_JSON.write_text(json.dumps(timing, indent=2) + "\n")
    print(f"  speech ends at {speech_end:.2f}s; wrote {TIMING_JSON.relative_to(ROOT)}")
    for s in segments_out:
        print(f"  {s['id']}: {s['start']:6.2f} -> {s['end']:6.2f}  ({s['duration']:.2f}s)")
        for c in s["clauses"]:
            print(f"        {c['start']:6.2f} -> {c['end']:6.2f}  {c['text']}")


if __name__ == "__main__":
    main()
