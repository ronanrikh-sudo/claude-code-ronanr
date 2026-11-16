# Builds black silhouette PNGs (alpha only) from the cutouts' alpha channel, used as separate shadow elements.
# No garment colour pixels are carried over: RGB is pure black, alpha is the cutout mask at full size.
import sys
from PIL import Image
lib = sys.argv[1]
for slug, f in [("rashguard-legacy", "flat-front"), ("shorts-legacy", "flat-front"), ("rashguard-legacy", "flat-back"), ("shorts-legacy", "flat-back")]:
    im = Image.open(f"{lib}/cut/{slug}/{f}.png").convert("RGBA")
    a = im.getchannel("A")
    out = Image.new("RGBA", im.size, (0, 0, 0, 0)); out.putalpha(a)
    out.save(f"shadow/{slug}_{f}_mask.png", optimize=True)
    print(slug, f, im.size)
