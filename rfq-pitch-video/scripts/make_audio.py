#!/usr/bin/env python3
"""Voice-over + music pipeline for the RFQ pitch video.

1. Gets one continuous voice-over take (natural flow beats stitched segments):
   - assets/vo/voiceover.mp3 (or VO_FILE) if present: a take generated in ElevenLabs
   - else ElevenLabs API (ELEVENLABS_API_KEY) -> OpenAI TTS (OPENAI_API_KEY)
     -> Piper -> macOS `say`
2. Trims it, measures it with ffprobe, and finds every clause boundary from the
   real pauses (snapped from a speech-time-proportional estimate).
3. Sizes the video to the speech (minimum 30 s, ~1.5 s silent tail).
4. Synthesises a subtle pad in code, ducks it under the voice, and masters the
   mix to about -16 LUFS with true peak below -1 dBFS.
5. Writes src/timing.json (drives every scene) and out/rfq-pitch.srt.
"""
from __future__ import annotations

import json
import math
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
DEFAULT_TAKE = ROOT / "assets" / "vo" / "voiceover.mp3"
SRT_NAME = "rfq-pitch.srt"

FPS = 30
SR = 48000
LEAD_S = 0.4         # silence before the first word
TAIL_S = 1.5         # minimum silent tail after the last word
MIN_TOTAL_S = 30.0

# Display text. Each segment is a paragraph of the take; clauses drive visual beats.
SEGMENTS = [
    {"id": "S1", "clauses": [
        "Two hundred suppliers reply to an RFQ.",
        "PDFs, spreadsheets, prices buried in emails.",
        "Today, that's hours of manual entry.",
    ]},
    {"id": "S2", "clauses": ["Now, one prompt."]},
    {"id": "S3", "clauses": [
        "Claude reads every reply in Outlook with read-only access,",
        "enters the data into our Excel template,",
        "flags any notes or errors,",
        "and gets it ready for CM integration.",
    ]},
    {"id": "S4", "clauses": [
        "You get a folder that's ready to integrate straight into CM,",
        "and a report that flags what needs a human eye for a further check.",
    ]},
    {"id": "S5", "clauses": [
        "Hours of data entry become minutes of review.",
        "All by using Claude Code to automate repeat processes.",
    ]},
]
SCRIPT = "\n\n".join(" ".join(s["clauses"]) for s in SEGMENTS)
MAX_CAPTION_WORDS = 7


def respell_for_basic_tts(text: str) -> str:
    """Older engines slur acronyms; neural engines (ElevenLabs/OpenAI) get the plain text."""
    text = re.sub(r"\bRFQ\b", "R F Q", text)
    text = re.sub(r"\bCM\b", "C M", text)
    return re.sub(r"\bPDFs\b", "P D F's", text)


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def ffprobe_duration(path: Path) -> float:
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                      "-of", "default=nw=1:nk=1", str(path)]).stdout.strip())


# ---------------------------------------------------------------- TTS providers

def tts_elevenlabs(text: str, raw: Path) -> None:
    # "Bella - Professional, Bright, Warm": ElevenLabs' most-used female voice. Override with ELEVENLABS_VOICE_ID.
    voice = os.environ.get("ELEVENLABS_VOICE_ID", "hpp4J3VqNfWAUOO0d1Us")
    body = json.dumps({
        "text": text,
        "model_id": os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2"),
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.2, "use_speaker_boost": True},
    }).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_192",
        data=body, headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
    raw.write_bytes(urllib.request.urlopen(req, timeout=180).read())


def tts_openai(text: str, raw: Path) -> None:
    body = json.dumps({
        "model": os.environ.get("OPENAI_TTS_MODEL", "gpt-4o-mini-tts"),
        "voice": os.environ.get("OPENAI_TTS_VOICE", "nova"),
        "input": text,
        "instructions": "Warm, natural, confident female narrator. Professional internal briefing, no hype.",
        "response_format": "wav",
    }).encode()
    req = urllib.request.Request("https://api.openai.com/v1/audio/speech", data=body, headers={
        "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}", "Content-Type": "application/json"})
    raw.write_bytes(urllib.request.urlopen(req, timeout=180).read())


PIPER_VOICE = os.environ.get("PIPER_VOICE", "en-us-lessac-medium")


def piper_model() -> Path:
    if os.environ.get("PIPER_MODEL"):
        return Path(os.environ["PIPER_MODEL"])
    model = VOICES_DIR / f"voice-{PIPER_VOICE}" / f"{PIPER_VOICE}.onnx"
    if not model.exists():
        VOICES_DIR.mkdir(parents=True, exist_ok=True)
        tgz = VOICES_DIR / f"voice-{PIPER_VOICE}.tar.gz"
        urllib.request.urlretrieve(
            f"https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-{PIPER_VOICE}.tar.gz", tgz)
        with tarfile.open(tgz) as tf:
            tf.extractall(model.parent, filter="data")
        tgz.unlink()
    return model


def tts_piper(text: str, raw: Path) -> None:
    subprocess.run([sys.executable, "-m", "piper", "-m", str(piper_model()), "-f", str(raw),
                    "--sentence-silence", "0.3"],
                   input=respell_for_basic_tts(text), text=True, check=True, capture_output=True)


def tts_say(text: str, raw: Path) -> None:
    run(["say", "-o", str(raw), respell_for_basic_tts(text)])


def _has_module(name: str) -> bool:
    try:
        __import__(name)
        return True
    except ImportError:
        return False


def get_take(raw_dir: Path) -> tuple[str, Path]:
    take = Path(os.environ.get("VO_FILE", DEFAULT_TAKE))
    if take.exists():
        return f"ElevenLabs take ({take.name})", take
    if os.environ.get("ELEVENLABS_API_KEY"):
        name, fn, ext = "ElevenLabs API", tts_elevenlabs, ".mp3"
    elif os.environ.get("OPENAI_API_KEY"):
        name, fn, ext = "OpenAI TTS", tts_openai, ".wav"
    elif _has_module("piper"):
        name, fn, ext = f"Piper ({PIPER_VOICE})", tts_piper, ".wav"
    elif shutil.which("say"):
        name, fn, ext = "macOS say", tts_say, ".aiff"
    else:
        sys.exit("No voice-over: add assets/vo/voiceover.mp3, set an API key, or `pip install piper-tts`.")
    raw = raw_dir / f"take{ext}"
    fn(SCRIPT, raw)
    return name, raw


def to_wav(src: Path, dest: Path) -> None:
    """48 kHz mono float wav with leading/trailing silence trimmed and a light polish EQ."""
    trim = ("silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,"
            "areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse")
    polish = "highpass=f=70,equalizer=f=220:t=q:w=1.2:g=-1"
    run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-af", f"{trim},{polish}",
         "-ac", "1", "-ar", str(SR), "-c:a", "pcm_f32le", str(dest)])


def read_wav(path: Path) -> np.ndarray:
    proc = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1",
                           "-ar", str(SR), "-"], check=True, capture_output=True)
    return np.frombuffer(proc.stdout, dtype=np.float32).copy()


def write_wav(path: Path, data: np.ndarray, channels: int = 1) -> None:
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ac", str(channels), "-ar", str(SR),
                    "-i", "-", "-c:a", "pcm_s24le", str(path)],
                   input=data.astype(np.float32).tobytes(), check=True)


# ------------------------------------------------------------ clause detection

def detect_pauses(path: Path) -> list[tuple[float, float]]:
    proc = subprocess.run(["ffmpeg", "-v", "info", "-i", str(path), "-af",
                           "silencedetect=noise=-40dB:d=0.1", "-f", "null", "-"],
                          capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", proc.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", proc.stderr)]
    return list(zip(starts, ends))


def clause_times(clauses: list[str], dur: float, pauses) -> list[tuple[float, float]]:
    """(start, end) of every clause in the take.

    Aligns clause boundaries to real pauses with dynamic programming: each clause's
    speaking time should match its share of the text, and sentence ends should sit
    on longer pauses than commas.
    """
    weights = [len(re.sub(r"[^A-Za-z0-9]", "", c)) + 4 for c in clauses]
    sentence_end = [c.rstrip().endswith((".", "?", "!")) for c in clauses]
    P = [(s, e) for s, e in pauses if 0.05 < s and e < dur - 0.05]
    M, K = len(P), len(clauses)
    if M < K - 1:
        raise SystemExit("Not enough pauses in the take to place every clause.")
    talk_total = dur - sum(e - s for s, e in P)
    rate = talk_total / sum(weights)
    cum = [0.0]  # cumulative pause time, to measure talk time between two points
    for s, e in P:
        cum.append(cum[-1] + (e - s))

    def talk(a_idx: int, b_idx: int) -> float:
        """Talk time from the end of pause a_idx (-1 = start) to the start of pause b_idx (M = end)."""
        t0 = 0.0 if a_idx < 0 else P[a_idx][1]
        t1 = dur if b_idx >= M else P[b_idx][0]
        inner = cum[b_idx] - cum[a_idx + 1] if b_idx > a_idx + 1 else 0.0
        return (t1 - t0) - inner

    def cost(k: int, a_idx: int, b_idx: int) -> float:
        expected = weights[k] * rate
        c = ((talk(a_idx, b_idx) - expected) / expected) ** 2
        if k < K - 1:
            plen = P[b_idx][1] - P[b_idx][0]
            c += (0.6 if plen < 0.32 else 0.0) if sentence_end[k] else (0.25 if plen > 0.7 else 0.0)
        return c

    INF = float("inf")
    dp = [[INF] * M for _ in range(K - 1)]
    back = [[-1] * M for _ in range(K - 1)]
    for j in range(M):
        dp[0][j] = cost(0, -1, j)
    for k in range(1, K - 1):
        for j in range(k, M):
            for i in range(k - 1, j):
                v = dp[k - 1][i] + cost(k, i, j)
                if v < dp[k][j]:
                    dp[k][j], back[k][j] = v, i
    best_j = min(range(K - 2, M), key=lambda j: dp[K - 2][j] + cost(K - 1, j, M))
    chosen = [best_j]
    for k in range(K - 2, 0, -1):
        chosen.append(back[k][chosen[-1]])
    chosen.reverse()
    out = []
    for k in range(K):
        start = 0.0 if k == 0 else P[chosen[k - 1]][1]
        end = dur if k == K - 1 else P[chosen[k]][0]
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


def lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, cutoff, btype="low", fs=SR, output="sos"), x)


def synth_pad(total_s: float, chord_starts: list[float], voice: np.ndarray) -> np.ndarray:
    """Soft stereo pad in D, chord changes on scene beats, ducked under the voice."""
    n = int(total_s * SR)
    t = np.arange(n) / SR
    chords = [  # Bm9 (tension) -> Gmaj7 -> Dadd9 -> Gmaj9 -> Dmaj9 (resolve)
        [47, 54, 57, 61, 62], [43, 50, 54, 59], [38, 50, 54, 57, 64],
        [43, 50, 54, 57, 62], [38, 50, 54, 57, 61, 64],
    ]
    rng = np.random.default_rng(7)
    left, right = np.zeros(n), np.zeros(n)
    xf = 0.9
    for ci, chord in enumerate(chords):
        a = chord_starts[ci]
        b = chord_starts[ci + 1] if ci + 1 < len(chord_starts) else total_s
        env = np.clip((t - (a - xf / 2)) / xf, 0, 1) * np.clip(((b + xf / 2) - t) / xf, 0, 1)
        env = np.sin(env * np.pi / 2) ** 2
        for note in chord:
            f = midi_hz(note)
            for det, pan in ((-0.07, 0.25), (0.0, 0.5), (0.08, 0.75)):
                ff = f * 2 ** (det / 12)
                ph = rng.uniform(0, 2 * np.pi)
                vib = 0.0015 * np.sin(2 * np.pi * 0.18 * t + ph)
                tone = (np.sin(2 * np.pi * ff * t * (1 + vib) + ph)
                        + 0.18 * np.sin(2 * np.pi * 2 * ff * t + ph * 1.3)
                        + 0.06 * np.sin(2 * np.pi * 3 * ff * t + ph * 0.7))
                w = env / (1 + 0.012 * (f - 100))
                left += tone * w * (1 - pan)
                right += tone * w * pan
    noise = lowpass(rng.standard_normal(n), 900) * 0.25
    left += noise
    right += np.roll(noise, 1700)
    left, right = lowpass(left, 2400), lowpass(right, 2400)
    swell = 0.82 + 0.18 * np.sin(2 * np.pi * 0.11 * t - 1.2)
    master = np.clip(t / 1.6, 0, 1) * np.clip((total_s - t) / 1.6, 0, 1) * swell
    win = int(0.25 * SR)
    venv = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
    talk = np.clip(venv / (venv.max() * 0.15 + 1e-9), 0, 1)
    duck = 1 - 0.44 * np.convolve(talk, np.ones(win) / win, mode="same")
    left *= master * duck
    right *= master * duck
    return np.stack([left, right], axis=1) / max(np.abs(left).max(), np.abs(right).max())


def rms_db(x: np.ndarray) -> float:
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


def loudnorm(src: Path, dest: Path, target=-16.0, tp=-1.5) -> dict:
    first = subprocess.run(["ffmpeg", "-v", "info", "-i", str(src), "-af",
                            f"loudnorm=I={target}:TP={tp}:LRA=11:print_format=json", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
    m = json.loads(first[first.rindex("{"):first.rindex("}") + 1])
    af = (f"loudnorm=I={target}:TP={tp}:LRA=11:linear=true:measured_I={m['input_i']}:"
          f"measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
          f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:print_format=json")
    second = subprocess.run(["ffmpeg", "-y", "-v", "info", "-i", str(src), "-af", af, "-ar", str(SR),
                             "-c:a", "pcm_s24le", str(dest)], capture_output=True, text=True, check=True).stderr
    return json.loads(second[second.rindex("{"):second.rindex("}") + 1])


# ------------------------------------------------------------------------- main

def main() -> None:
    for d in (BUILD, PUBLIC_AUDIO, OUT):
        d.mkdir(parents=True, exist_ok=True)
    provider, raw = get_take(BUILD)
    print(f"Voice-over: {provider}")
    take = BUILD / "take.wav"
    to_wav(raw, take)
    dur = ffprobe_duration(take)
    pauses = detect_pauses(take)

    all_clauses = [c for s in SEGMENTS for c in s["clauses"]]
    times = clause_times(all_clauses, dur, pauses)
    total_s = max(MIN_TOTAL_S, math.ceil(LEAD_S + dur + TAIL_S))

    voice = np.zeros(int(total_s * SR), dtype=np.float32)
    audio = read_wav(take)
    a = int(LEAD_S * SR)
    voice[a:a + len(audio)] = audio[: len(voice) - a]

    segments_out, captions, k = [], [], 0
    for seg in SEGMENTS:
        cl_out = []
        for text in seg["clauses"]:
            s, e = times[k]
            k += 1
            cl_out.append({"text": text, "start": round(LEAD_S + s, 3), "end": round(LEAD_S + e, 3)})
            captions.extend(split_caption(text, LEAD_S + s, LEAD_S + e))
        segments_out.append({"id": seg["id"], "start": cl_out[0]["start"], "end": cl_out[-1]["end"],
                             "duration": round(cl_out[-1]["end"] - cl_out[0]["start"], 3), "clauses": cl_out})
    speech_end = segments_out[-1]["end"]

    chord_starts = [0.0] + [s["start"] - 0.1 for s in segments_out[1:]]
    c4 = segments_out[2]["clauses"][3]
    span = c4["end"] - c4["start"]
    ticks = [round(c4["start"] + 0.1 + i * (span - 0.2) / 3.6, 3) for i in range(4)]

    sfx = np.zeros_like(voice)
    tt = np.arange(int(0.09 * SR)) / SR
    blip = (np.sin(2 * np.pi * 1320 * tt) + 0.4 * np.sin(2 * np.pi * 1980 * tt)) * np.exp(-tt * 55)
    for tick in ticks:
        i = int(tick * SR)
        sfx[i:i + len(blip)] += blip

    pad = synth_pad(total_s, chord_starts, voice)
    v_rms = rms_db(voice[np.abs(voice) > 1e-4])
    pad_gain = 10 ** ((v_rms - 19 - rms_db(pad)) / 20)
    sfx_gain = 10 ** ((v_rms - 14 - rms_db(blip)) / 20)
    mix = np.stack([voice, voice], axis=1) + pad * pad_gain + np.stack([sfx, sfx], axis=1) * sfx_gain
    write_wav(BUILD / "mix_raw.wav", mix, channels=2)
    stats = loudnorm(BUILD / "mix_raw.wav", PUBLIC_AUDIO / "mix.wav")
    print(f"  mix: {stats['output_i']} LUFS, true peak {stats['output_tp']} dBTP")

    with open(OUT / SRT_NAME, "w") as f:
        for i, (text, s, e) in enumerate(captions, 1):
            f.write(f"{i}\n{srt_time(s)} --> {srt_time(e)}\n{text}\n\n")

    timing = {
        "provider": provider,
        "fps": FPS,
        "totalSeconds": total_s,
        "speechEnd": speech_end,
        "segments": segments_out,
        "checkTicks": ticks,
        "captions": [{"text": c, "start": round(s, 3), "end": round(e, 3)} for c, s, e in captions],
        "mix": {"lufs": float(stats["output_i"]), "truePeak": float(stats["output_tp"])},
    }
    TIMING_JSON.write_text(json.dumps(timing, indent=2) + "\n")
    print(f"  take {dur:.2f}s, speech ends {speech_end:.2f}s, video {total_s:.0f}s")
    for s in segments_out:
        print(f"  {s['id']}: {s['start']:6.2f} -> {s['end']:6.2f}")
        for c in s["clauses"]:
            print(f"        {c['start']:6.2f} -> {c['end']:6.2f}  {c['text']}")


if __name__ == "__main__":
    main()
