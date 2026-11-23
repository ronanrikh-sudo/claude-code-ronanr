#!/usr/bin/env python3
"""Score ElevenLabs takes against the script and force-align word times (pocketsphinx).
  python3 scripts/align_words.py assets/vo/takes/take1.mp3 [...]
Prints a recognition score per take; writes <take>.words.json with [{w, start, end}] (seconds, take-relative).
"""
import json, re, subprocess, sys
from pathlib import Path
from pocketsphinx import Decoder

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = json.loads((ROOT / "script.json").read_text())
# words the dictionary doesn't know, spoken as two dictionary words
SPLIT = {"powerplay": "power play", "sportsbet": "sports bet", "cagecraft": "cage craft",
         "twenty-nine": "twenty nine", "you're": "you're"}

def words_of(text):
    out = []
    for w in re.findall(r"[A-Za-z][A-Za-z'\-]*", text.lower()):
        out.extend(SPLIT.get(w, w).split())
    return out

def pcm(path):
    return subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                          capture_output=True, check=True).stdout

text = " ".join(c for s in SCRIPT["segments"] for c in s["clauses"])
ref = words_of(text)
for take in sys.argv[1:]:
    audio = pcm(take)
    # 1) free recognition -> overlap score
    d = Decoder(samprate=16000)
    d.start_utt(); d.process_raw(audio, full_utt=True); d.end_utt()
    hyp = (d.hyp().hypstr if d.hyp() else "").split()
    hits = sum(1 for w in set(hyp) if w in set(ref))
    # 2) forced alignment to the script
    a = Decoder(samprate=16000, bestpath=False)
    a.set_align_text(" ".join(ref))
    a.start_utt(); a.process_raw(audio, full_utt=True); a.end_utt()
    a.set_alignment(); a.start_utt(); a.process_raw(audio, full_utt=True); a.end_utt()
    words = [{"w": seg.name.lower(), "start": round(seg.start / 100, 3), "end": round((seg.start + seg.duration) / 100, 3)}
             for seg in a.get_alignment() if seg.name not in ("<sil>", "<s>", "</s>", "[NOISE]")]
    Path(str(take).rsplit(".", 1)[0] + ".words.json").write_text(json.dumps(words, indent=1))
    print(f"{take}: recognised {hits}/{len(set(ref))} script words | aligned {len(words)}/{len(ref)} words | "
          f"first '{words[0]['w']}' {words[0]['start']}s, last '{words[-1]['w']}' {words[-1]['end']}s")
