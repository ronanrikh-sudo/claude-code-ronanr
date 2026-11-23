#!/usr/bin/env python3
"""Voice-over + music pipeline. Everything the visuals need comes out of here.

Reads script.json (segments -> clauses) and:
1. Gets ONE continuous voice-over take (natural flow beats stitched segments):
   - assets/vo/voiceover.mp3 (or VO_FILE) if present, e.g. a take generated with
     the ElevenLabs connector
   - else ElevenLabs API (ELEVENLABS_API_KEY) -> OpenAI TTS (OPENAI_API_KEY)
     -> Piper (local) -> macOS `say`
2. Trims and measures it with ffprobe, then aligns every clause boundary to a real
   pause with dynamic programming.
3. Sizes the video to the speech (speech + ~1.5 s tail, minimum MIN_TOTAL_S).
4. Synthesises a soft pad (chord change per segment), ducks it under the voice,
   adds optional UI ticks, and masters to -16 LUFS / -1.5 dBTP.
5. Writes src/timing.json and out/<output>.srt.
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
SCRIPT = json.loads((ROOT / "script.json").read_text())
BUILD = ROOT / ".build" / "audio"
PUBLIC_AUDIO = ROOT / "public" / "audio"
OUT = ROOT / "out"
TIMING_JSON = ROOT / "src" / "timing.json"
VOICES_DIR = ROOT / ".build" / "voices"
DEFAULT_TAKE = ROOT / "assets" / "vo" / "voiceover.mp3"

FPS = 30
SR = 48000
LEAD_S = 0.4
TAIL_S = 1.5
MIN_TOTAL_S = float(os.environ.get("MIN_TOTAL_S", "15"))
MAX_CAPTION_WORDS = 7
SEGMENTS = SCRIPT["segments"]
TEXT = "\n\n".join(" ".join(s["clauses"]) for s in SEGMENTS)
VOICE = SCRIPT.get("voice", {})


def respell(text: str) -> str:
    """Respellings for basic engines that slur acronyms (neural engines get plain text)."""
    for word, spoken in SCRIPT.get("respell", {}).items():
        text = re.sub(rf"\b{re.escape(word)}\b", spoken, text)
    return text


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def ffprobe_duration(path: Path) -> float:
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                      "-of", "default=nw=1:nk=1", str(path)]).stdout.strip())


# ---------------------------------------------------------------- TTS providers

def tts_elevenlabs(text: str, raw: Path) -> None:
    voice = os.environ.get("ELEVENLABS_VOICE_ID", VOICE.get("elevenlabs_voice_id", "hpp4J3VqNfWAUOO0d1Us"))
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
        "instructions": "Warm, natural, confident narrator. Calm and credible, no hype.",
        "response_format": "wav",
    }).encode()
    req = urllib.request.Request("https://api.openai.com/v1/audio/speech", data=body, headers={
        "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}", "Content-Type": "application/json"})
    raw.write_bytes(urllib.request.urlopen(req, timeout=180).read())


PIPER_VOICE = os.environ.get("PIPER_VOICE", VOICE.get("piper_voice", "en-us-lessac-medium"))


def piper_model() -> Path:
    if os.environ.get("PIPER_MODEL"):
        return Path(os.environ["PIPER_MODEL"])
    model = VOICES_DIR / f"voice-{PIPER_VOICE}" / f"{PIPER_VOICE}.onnx"
    if not model.exists():
        # GitHub-hosted release (HuggingFace is often blocked by egress proxies).
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
                    "--sentence-silence", "0.3"], input=respell(text), text=True, check=True, capture_output=True)


def tts_say(text: str, raw: Path) -> None:
    run(["say", "-o", str(raw), respell(text)])


def _has_module(name: str) -> bool:
    try:
        __import__(name)
        return True
    except ImportError:
        return False


def get_take() -> tuple[str, Path]:
    take = Path(os.environ.get("VO_FILE", DEFAULT_TAKE))
    if take.exists():
        return f"pre-generated take ({take.name})", take
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
    raw = BUILD / f"take_source{ext}"
    if fn in (tts_piper, tts_say):
        # Basic engines barely pause between sentences, which leaves nothing to align
        # on. Voice each segment on its own and join them with a clear 0.5 s gap.
        parts = []
        for i, seg in enumerate(SEGMENTS):
            part = BUILD / f"seg{i}_source{ext}"
            fn(" ".join(seg["clauses"]), part)
            trimmed = BUILD / f"seg{i}.wav"
            to_wav(part, trimmed)
            parts += [read_wav(trimmed), np.zeros(int(0.5 * SR), dtype=np.float32)]
        raw = BUILD / "take_source.wav"
        write_wav(raw, np.concatenate(parts[:-1]))
    else:
        fn(TEXT, raw)
    return name, raw


def to_wav(src: Path, dest: Path) -> None:
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
                    "-i", "-", "-c:a", "pcm_s24le", str(path)], input=data.astype(np.float32).tobytes(), check=True)


# ------------------------------------------------------------ clause alignment

def detect_pauses(path: Path) -> list[tuple[float, float]]:
    proc = subprocess.run(["ffmpeg", "-v", "info", "-i", str(path), "-af",
                           "silencedetect=noise=-35dB:d=0.05", "-f", "null", "-"], capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", proc.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", proc.stderr)]
    return list(zip(starts, ends))


def clause_times(clauses: list[str], dur: float, pauses) -> list[tuple[float, float]]:
    """Align clause boundaries to real pauses (DP): speaking time ~ text share,
    sentence ends prefer longer pauses than commas. Greedy snapping goes wrong as soon
    as a comma inside a clause makes its own pause, so don't 'simplify' this."""
    weights = [len(re.sub(r"[^A-Za-z0-9]", "", c)) + 4 for c in clauses]
    sentence_end = [c.rstrip().endswith((".", "?", "!")) for c in clauses]
    P = [(s, e) for s, e in pauses if 0.05 < s and e < dur - 0.05]
    M, K = len(P), len(clauses)
    if K == 1:
        return [(0.0, dur)]
    if M < K - 1:
        sys.exit(f"Take has {M} pauses but needs {K - 1}: add punctuation or a slower read.")
    rate = (dur - sum(e - s for s, e in P)) / sum(weights)
    # Sentence ends should sit on this take's longer pauses. "Long" is relative to the take:
    # neural voices pause ~0.5 s between sentences, Piper only ~0.2 s.
    n_sent = max(1, sum(sentence_end[:-1]))
    longest = sorted((e - s for s, e in P), reverse=True)
    ref = longest[min(n_sent, len(longest)) - 1]
    cum = [0.0]
    for s, e in P:
        cum.append(cum[-1] + (e - s))

    def talk(a: int, b: int) -> float:
        t0 = 0.0 if a < 0 else P[a][1]
        t1 = dur if b >= M else P[b][0]
        return (t1 - t0) - (cum[b] - cum[a + 1] if b > a + 1 else 0.0)

    def cost(k: int, a: int, b: int) -> float:
        exp = weights[k] * rate
        c = ((talk(a, b) - exp) / exp) ** 2
        if k < K - 1:
            norm = (P[b][1] - P[b][0]) / ref
            c += 0.6 * max(0.0, 1 - norm) if sentence_end[k] else (0.25 if norm > 1.6 else 0.0)
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
    chosen = [min(range(K - 2, M), key=lambda j: dp[K - 2][j] + cost(K - 1, j, M))]
    for k in range(K - 2, 0, -1):
        chosen.append(back[k][chosen[-1]])
    chosen.reverse()
    return [(0.0 if k == 0 else P[chosen[k - 1]][1], dur if k == K - 1 else P[chosen[k]][0]) for k in range(K)]


def split_caption(text: str, start: float, end: float):
    words = text.split()
    if len(words) <= MAX_CAPTION_WORDS:
        return [(text, start, end)]
    n = -(-len(words) // MAX_CAPTION_WORDS)
    per = -(-len(words) // n)
    chunks = [" ".join(words[i:i + per]) for i in range(0, len(words), per)]
    out, t, total = [], start, sum(len(c) for c in chunks)
    for c in chunks:
        d = (end - start) * len(c) / total
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

def lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, cutoff, btype="low", fs=SR, output="sos"), x)


# Pad moods (script.json -> "music": {"mood": ..., "level_db": -19}). Each is a list of
# chords (MIDI notes); the last chord is the resolve used on the final segment, the rest
# cycle across the earlier segments. Pick the mood from the art direction.
MOODS = {
    "warm":    [[47, 54, 57, 61, 62], [43, 50, 54, 59], [38, 50, 54, 57, 64], [43, 50, 54, 57, 62], [38, 50, 54, 57, 61, 64]],  # D major, tension -> resolve
    "bright":  [[45, 52, 57, 61, 64], [41, 48, 53, 57, 64], [43, 50, 55, 59, 62], [48, 55, 60, 64, 67]],                       # lifted, optimistic
    "dark":    [[40, 47, 52, 55, 59], [36, 43, 48, 52, 55], [38, 45, 50, 53, 57], [40, 47, 52, 55, 59, 62]],                   # E minor, cinematic
    "minimal": [[38, 45, 50], [38, 45, 52], [38, 45, 50, 57]],                                                               # open fifths, editorial/luxury
}
MUSIC = SCRIPT.get("music", {})
MOOD = MUSIC.get("mood", "warm")
PAD_LEVEL_DB = float(MUSIC.get("level_db", -19))


def synth_pad(total_s: float, starts: list[float], voice: np.ndarray) -> np.ndarray:
    n = int(total_s * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(7)
    left, right = np.zeros(n), np.zeros(n)
    xf = 0.9
    chords = MOODS[MOOD]
    for ci, a in enumerate(starts):
        chord = chords[-1] if ci == len(starts) - 1 else chords[ci % (len(chords) - 1)]
        b = starts[ci + 1] if ci + 1 < len(starts) else total_s
        env = np.clip((t - (a - xf / 2)) / xf, 0, 1) * np.clip(((b + xf / 2) - t) / xf, 0, 1)
        env = np.sin(env * np.pi / 2) ** 2
        for note in chord:
            f = 440.0 * 2 ** ((note - 69) / 12)
            for det, pan in ((-0.07, 0.25), (0.0, 0.5), (0.08, 0.75)):
                ff = f * 2 ** (det / 12)
                ph = rng.uniform(0, 2 * np.pi)
                tone = (np.sin(2 * np.pi * ff * t * (1 + 0.0015 * np.sin(2 * np.pi * 0.18 * t + ph)) + ph)
                        + 0.18 * np.sin(2 * np.pi * 2 * ff * t + ph * 1.3) + 0.06 * np.sin(2 * np.pi * 3 * ff * t + ph * 0.7))
                w = env / (1 + 0.012 * (f - 100))
                left += tone * w * (1 - pan)
                right += tone * w * pan
    noise = lowpass(rng.standard_normal(n), 900) * 0.25
    left, right = lowpass(left + noise, 2400), lowpass(right + np.roll(noise, 1700), 2400)
    master = np.clip(t / 1.6, 0, 1) * np.clip((total_s - t) / 1.6, 0, 1) * (0.82 + 0.18 * np.sin(2 * np.pi * 0.11 * t - 1.2))
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
    provider, raw = get_take()
    print(f"Voice-over: {provider}")
    take = BUILD / "take.wav"
    to_wav(raw, take)
    dur = ffprobe_duration(take)
    times = clause_times([c for s in SEGMENTS for c in s["clauses"]], dur, detect_pauses(take))
    total_s = max(MIN_TOTAL_S, math.ceil(LEAD_S + dur + TAIL_S))

    voice = np.zeros(int(total_s * SR), dtype=np.float32)
    audio = read_wav(take)
    a = int(LEAD_S * SR)
    voice[a:a + len(audio)] = audio[: len(voice) - a]

    segments_out, captions, k = [], [], 0
    for seg in SEGMENTS:
        cl = []
        for text in seg["clauses"]:
            s, e = times[k]
            k += 1
            cl.append({"text": text, "start": round(LEAD_S + s, 3), "end": round(LEAD_S + e, 3)})
            captions.extend(split_caption(text, LEAD_S + s, LEAD_S + e))
        segments_out.append({"id": seg["id"], "start": cl[0]["start"], "end": cl[-1]["end"], "clauses": cl})

    # One UI tick per clause of the chosen segment (checklists etc.), shared by visuals and SFX.
    ticks: list[float] = []
    tick_cfg = SCRIPT.get("ticks")
    if tick_cfg:
        seg = next(s for s in segments_out if s["id"] == tick_cfg["segment"])
        ticks = [round(c["start"] + 0.2, 3) for c in seg["clauses"]]
    sfx = np.zeros_like(voice)
    tt = np.arange(int(0.09 * SR)) / SR
    blip = (np.sin(2 * np.pi * 1320 * tt) + 0.4 * np.sin(2 * np.pi * 1980 * tt)) * np.exp(-tt * 55)
    for tick in ticks:
        i = int(tick * SR)
        sfx[i:i + len(blip)] += blip

    v_rms = rms_db(voice[np.abs(voice) > 1e-4])
    if MOOD == "none":
        pad, pad_gain = np.zeros((len(voice), 2)), 0.0
    else:
        pad = synth_pad(total_s, [0.0] + [s["start"] - 0.1 for s in segments_out[1:]], voice)
        pad_gain = 10 ** ((v_rms + PAD_LEVEL_DB - rms_db(pad)) / 20)  # default ~19 dB under the voice
    sfx_gain = 10 ** ((v_rms - 14 - rms_db(blip)) / 20)
    mix = np.stack([voice, voice], axis=1) + pad * pad_gain + np.stack([sfx, sfx], axis=1) * sfx_gain
    write_wav(BUILD / "mix_raw.wav", mix, channels=2)
    stats = loudnorm(BUILD / "mix_raw.wav", PUBLIC_AUDIO / "mix.wav")

    srt = OUT / f"{SCRIPT.get('output', 'video')}.srt"
    with open(srt, "w") as f:
        for i, (text, s, e) in enumerate(captions, 1):
            f.write(f"{i}\n{srt_time(s)} --> {srt_time(e)}\n{text}\n\n")

    TIMING_JSON.write_text(json.dumps({
        "provider": provider, "fps": FPS, "totalSeconds": total_s, "speechEnd": segments_out[-1]["end"],
        "segments": segments_out, "ticks": ticks,
        "captions": [{"text": c, "start": round(s, 3), "end": round(e, 3)} for c, s, e in captions],
        "mix": {"lufs": float(stats["output_i"]), "truePeak": float(stats["output_tp"])},
    }, indent=2) + "\n")
    print(f"  take {dur:.2f}s -> video {total_s:.0f}s | mix {stats['output_i']} LUFS, {stats['output_tp']} dBTP")
    for s in segments_out:
        for c in s["clauses"]:
            print(f"  {s['id']} {c['start']:6.2f} -> {c['end']:6.2f}  {c['text']}")


if __name__ == "__main__":
    main()
