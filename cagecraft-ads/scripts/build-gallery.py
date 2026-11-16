#!/usr/bin/env python3
"""Build the creative review gallery from ads/*/brief.json.

  python3 -I scripts/build-gallery.py        -> gallery/index.html + gallery/media/*

Stills are copied as web-sized JPGs, videos as 720p previews (full-quality masters stay in ads/<id>/out/)."""
import glob, html, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "gallery"); MEDIA = os.path.join(OUT, "media")
os.makedirs(MEDIA, exist_ok=True)

# What each build recreates and why that format was picked (Meta Ad Library, pulled 16 Nov 2026).
SOURCE = {
    "01": ("Front + back on a clean ground, no text", "Shadow Rolls 369 days active (template reused at 257 and 154 days); BaddieCat mesh jersey 321 days"),
    "02": ("\"Most wanted\" hoodie colourway grid", "Realism 350gsm hoodie grid, 273 days under 2 ad IDs"),
    "03": ("\"Build your rotation\" range infographic", "Kaizen 160 days under 2 ad IDs; Shadow Rolls range sheet 257 days"),
    "04": ("Arrowed feature callouts", "Snobodi (AU) 82 days across multiple ads; callouts recur at 5+ unrelated brands"),
    "05": ("Photo collage with one text block", "FUJI 534 days (longest-running fightwear static); Rogue hero + macros 381 days"),
    "06": ("Feature icons + five-star customer quote", "Muscle Nation (AU) 74 days across multiple ads"),
    "07": ("Taped paper note", "RUNNR 67 days; post-it is the #1 apparel format by hit rate (Motion 2026 benchmark)"),
    "08": ("Text-message thread", "RUNNR 67 days; text message is #4 in apparel by spend efficiency (Motion 2026)"),
    "09": ("\"Three purchases → one\" comparison card", "RUNNR 66 days, part of a 10-concept family"),
    "10": ("Kit flat-lay on a textured floor", "Format on 13 of 17 XMartial ads; Engage's current drop creative"),
    "11": ("Typography-only poster", "Most duplicated creative on the largest AU fightwear account (32 of 53 Engage ads sampled); text-only is the #1 asset type (Motion 2026)"),
    "12": ("Single on-model brand static", "Ryderwear 497 days; Battlegend 354 days; Darc Sport 119 days and first-listed"),
    "13": ("Product-detail carousel", "Bangtao Fightstore 152 days"),
    "14": ("15-second product ticker", "FUJI 534 days: the longest-running fightwear video found"),
    "15": ("Colour-swap motion graphic", "Raven Fight Wear (AU) 140 days; half of a four-ad account"),
    "16": ("One-word-per-cut montage", "FUJI 173 days, 3 variants; Mary Wyatt hoodie cut 123 days"),
    "17": ("Annotated explainer", "OverRip 343 days: the top-ranked hoodie video found"),
    "18": ("Checklist card over footage", "Hilyfe 104 days; Gymreapers 125 days"),
    "19": ("Creator POV clip with one caption sticker", "Battlegend 382 days: the oldest active fightwear-apparel ad in the AU feed"),
    "20": ("\"Most wanted\" hoodie video, AI b-roll hook", "Mary Wyatt 123 days"),
}

def run(*a): subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
def probe(p):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", p], capture_output=True, text=True).stdout
    j = json.loads(o); s = j["streams"][0]; return s["width"], s["height"], float(j["format"].get("duration", 0) or 0)

def as_text(v):
    if v is None: return ""
    if isinstance(v, str): return v
    if isinstance(v, (list, tuple)): return "\n".join(as_text(x) for x in v)
    if isinstance(v, dict): return "\n".join(f"{k}: {as_text(x)}" for k, x in v.items())
    return str(v)

ads = []
for bf in sorted(glob.glob(os.path.join(ROOT, "ads", "*", "brief.json"))):
    d = os.path.dirname(bf); aid = os.path.basename(d); num = aid.split("-")[0]
    try: b = json.load(open(bf))
    except Exception as e: print("bad brief", aid, e); continue
    outd = os.path.join(d, "out")
    files = [f for f in sorted(glob.glob(os.path.join(outd, "*"))) if re.search(r"\.(jpg|mp4)$", f) and not re.search(r"(\.sheet|_sheet|contact|\.silent)", os.path.basename(f))]
    media = []
    for f in files:
        name = os.path.splitext(os.path.basename(f))[0]
        if f.endswith(".mp4"):
            w, h, dur = probe(f); dst = f"{aid}__{name}.mp4"; poster = f"{aid}__{name}.poster.jpg"
            tw = 720 if w >= h else 1080; scale = f"scale={tw}:-2" if w <= h else "scale=-2:720"
            src_m = os.path.getmtime(f); dp = os.path.join(MEDIA, dst)
            if not os.path.exists(dp) or os.path.getmtime(dp) < src_m:
                run("ffmpeg", "-y", "-i", f, "-vf", scale, "-c:v", "libx264", "-crf", "25", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", dp)
                run("ffmpeg", "-y", "-ss", str(min(1.2, dur / 3)), "-i", f, "-frames:v", "1", "-vf", scale, "-q:v", "4", os.path.join(MEDIA, poster))
            media.append({"kind": "video", "src": "media/" + dst, "poster": "media/" + poster, "w": w, "h": h, "seconds": round(dur, 1), "label": name.replace(aid, "").strip("_-") or "video", "master": os.path.relpath(f, ROOT)})
        else:
            w, h, _ = probe(f); dst = f"{aid}__{name}.jpg"; dp = os.path.join(MEDIA, dst)
            if not os.path.exists(dp) or os.path.getmtime(dp) < os.path.getmtime(f):
                run("ffmpeg", "-y", "-i", f, "-vf", "scale='min(1080,iw)':-2", "-q:v", "3", dp)
            media.append({"kind": "image", "src": "media/" + dst, "w": w, "h": h, "label": name.replace(aid, "").strip("_-") or "still", "master": os.path.relpath(f, ROOT)})
    if not media: print("no media for", aid); continue
    is_video = any(m["kind"] == "video" for m in media)
    ai = b.get("ai_generated") or []
    ai_text = as_text(ai).strip()
    fmt, why = SOURCE.get(num, (as_text(b.get("recreates")), ""))
    ads.append({
        "id": aid, "num": num, "title": as_text(b.get("title")) or aid, "type": "video" if is_video else "static",
        "product": as_text(b.get("product")), "format": fmt, "evidence": why, "recreates": as_text(b.get("recreates")),
        "hook": as_text(b.get("hook")), "primary_text": as_text(b.get("primary_text")), "headline": as_text(b.get("headline")), "cta": as_text(b.get("cta")),
        "garment_source": as_text(b.get("garment_source")), "ai": ai_text if ai_text and ai_text.lower() not in ("[]", "none", "n/a") else "",
        "fidelity": as_text(b.get("fidelity")), "notes": as_text(b.get("notes_for_owner")), "media": media,
    })

tpl = open(os.path.join(ROOT, "scripts", "gallery.template.html")).read()
page = tpl.replace("/*__DATA__*/[]", json.dumps(ads, ensure_ascii=False).replace("</", "<\\/"))
open(os.path.join(OUT, "index.html"), "w").write(page)
n_img = sum(1 for a in ads for m in a["media"] if m["kind"] == "image"); n_vid = sum(1 for a in ads for m in a["media"] if m["kind"] == "video")
size = sum(os.path.getsize(os.path.join(MEDIA, f)) for f in os.listdir(MEDIA)) / 1e6
print(f"{len(ads)} creatives ({sum(a['type']=='static' for a in ads)} static, {sum(a['type']=='video' for a in ads)} video), {n_img} stills, {n_vid} videos, media {size:.1f} MB")
