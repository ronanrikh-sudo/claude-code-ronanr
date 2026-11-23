"""BF26 Abandoned Cart, email 1, as a stitched-image email.

Usage: python3 bf26_abandoned_cart_e1.py <current-content.json> <out.json> [template-name]
  current-content.json: the live email content (GET /api/email-content/6afe2100408dfb3c62ef83ae)
  Writes a full Omnisend template/content document to out.json.
"""
import copy, json, sys
from image_email import PAGE, img, stack, FOOTER, html_section, general_settings, hid

CDN = "https://cdn.shopify.com/s/files/1/0643/7358/8030/files/"
V = "?v=1795476967"  # v2 slices (Cube Noir build)
CHECKOUT = "[[event.raw.abandoned_checkout_url]]"
SHOP = "https://www.cagecraftco.com/collections/shop-all"
PRE = "Black Friday is on. Up to 40% off + a free gift with every $50."

src, out = sys.argv[1], sys.argv[2]
name = sys.argv[3] if len(sys.argv) > 3 else "BF26 | Abandoned Cart E1 (image version)"
cur = json.load(open(src))

top = stack([
    img(CDN + "bf26-ac-e1-v2-01-hero.jpg" + V,
        "Your cart's still here. You picked it for a reason. Finish your order and your free gifts are added automatically.",
        CHECKOUT, h=730),
    img(CDN + "bf26-ac-e1-v2-02-cta.jpg" + V, "Complete your order", CHECKOUT, h=129),
    img(CDN + "bf26-ac-e1-v2-03-label.jpg" + V, "Still in your cart", None, h=100),
], preheader=PRE)

bottom = stack([
    img(CDN + "bf26-ac-e1-v2-04-gifts.jpg" + V,
        "Every $50 unlocks a free gift: $50 Kit Bag, $100 Crew Socks, $150 free shipping, $200 Training Towel, "
        "$250 Essentials Tee. A few dollars short? PowerPlay your cart.", SHOP, h=550),
    img(CDN + "bf26-ac-e1-v2-05-close.jpg" + V,
        "Ends Sunday. One step left. Black Friday ends Sunday 29 November, 11:59pm AEDT. Complete my order.", CHECKOUT, h=416),
    img(CDN + "bf26-ac-e1-v2-06-team.jpg" + V,
        "Fight Team & Partners: Daniel Amari, Ali Sharrad, Daniel Morris, Shane Showtime Parker, "
        "Ryan Rook Castle, Lucas Spartan Cannon", None, h=129),
], extra_html=FOOTER)

# Live abandoned-products section, kept from the current email and restyled to sit on the dark page.
prod = copy.deepcopy(next(s for s in cur["sections"] if s.get("type") == "product_cart_recovery"))
prod["styleProperties"].update(backgroundColor=PAGE, paddingTop="4px", paddingBottom="20px")
for row in prod["rows"]:
    for col in row["columns"]:
        for b in col["blocks"]:
            for c in b.get("components", []):
                if c.get("role") == "product_title":
                    c["styleProperties"].update(color="#FFFFFF")
                    c["text"] = c["text"].replace("rgb(255, 255, 255)", "#ffffff")
                if c.get("role") == "product_prices":
                    for pc in c.get("components", []):
                        if pc.get("role") == "product_current_price":
                            pc["styleProperties"]["color"] = "#7FD8CC"
                            pc["text"] = pc["text"].replace("rgb(255, 255, 255)", "#7fd8cc")
                        if pc.get("role") == "product_old_price":
                            pc["styleProperties"]["color"] = "#777777"
                            pc["text"] = pc["text"].replace("rgb(255, 255, 255)", "#777777")
                if c.get("role") == "product_button":
                    c["button"]["text"] = "Complete order"

doc = {
    "name": name,
    "generalSettings": general_settings(cur["generalSettings"]),
    "sections": [html_section(top), prod, html_section(bottom)],
}
json.dump(doc, open(out, "w"))
print("sections:", [s.get("type") or "html" for s in doc["sections"]], "| bytes:", len(json.dumps(doc)))
