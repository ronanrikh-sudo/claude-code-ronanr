"""BF26 E8: PowerPlay your cart (dark-locked). Writes out/e8-body.html and out/e8-style.css."""
from pathlib import Path
from darklock import (PAGE, CARD, TEAL, BEBAS, BARLOW, COND, bg, txt, accent, line, hline, framed,
                      button, pill, COLOR_SCHEME, FONTS, MOBILE_CSS)

SHOP = "https://www.cagecraftco.com"
CDN = "https://cdn.shopify.com/s/files/1/0643/7358/8030/files/"
PRE = "One tap tops up your cart and unlocks the gift. Black Friday ends Sunday."


def eyebrow(text, container=PAGE, mb="10px"):
    return (f'<span style="display:inline-block;font-size:11px;font-weight:600;letter-spacing:4px;'
            f'text-transform:uppercase;margin-bottom:{mb};{COND}">{accent(text, container)}</span>')


def section_head(eye, white, teal, pad="40px 40px 14px", after=""):
    return (f'<div class="section" style="padding:{pad};text-align:center;{bg(PAGE)}">{eyebrow(eye)}'
            f'<p class="section-headline" style="font-size:34px;color:#FFF;letter-spacing:1px;margin:0;line-height:1.05;{BEBAS}">'
            f'{txt(white)}<br>{accent(teal)}</p>{after}</div>')


def cart_row(name, price, last=False):
    pad = "7px 0 12px" if last else "7px 0"
    st = f"padding:{pad};font-size:14px;color:#CCC;{BARLOW}"
    return (f'<tr><td class="c-item" style="{st}">{txt(name)}</td>'
            f'<td class="c-item" style="{st}text-align:right;white-space:nowrap;">{txt(price)}</td></tr>')


def step(num, head, desc, last=False):
    row = (f'<tr><td class="s-num" width="64" style="width:64px;padding:18px 0 16px 22px;font-size:34px;line-height:1;'
           f'vertical-align:top;{BEBAS}">{accent(num, CARD)}</td>'
           f'<td class="s-pad" style="padding:18px 22px 16px 6px;vertical-align:top;">'
           f'<span class="s-head" style="display:block;font-size:22px;line-height:1.05;letter-spacing:1px;color:#FFF;{BEBAS}">{txt(head)}</span>'
           f'<span style="display:block;font-size:14px;color:#999;line-height:1.6;margin-top:5px;{BARLOW}">{txt(desc)}</span></td></tr>')
    return row if last else row + line("#1f1f1f", 2)


def tier(amount, gift, last=False):
    row = (f'<tr><td class="l-amt" width="120" style="padding:14px 0 14px 24px;font-size:32px;line-height:1;{BEBAS}">'
           f'{accent(amount, CARD)}</td>'
           f'<td class="l-gift" style="padding:14px 24px 14px 0;font-size:21px;line-height:1.1;letter-spacing:1px;color:#FFF;'
           f'text-align:right;{BEBAS}">{txt(gift)}</td></tr>')
    return row if last else row + line("#1f1f1f", 2)


def product(handle, img, name, price, was):
    return (f'<td class="p-cell" width="50%" style="width:50%;padding:0 6px 12px;vertical-align:top;">'
            f'<a href="{SHOP}/products/{handle}" style="text-decoration:none;display:block;{bg("#1f1f1f")}padding:1px;">'
            f'<span style="display:block;{bg(CARD)}">'
            f'<span style="display:block;{bg("#c9c9c9")}"><img src="{CDN}{img}&amp;width=560&amp;height=560&amp;crop=center" '
            f'alt="{name}" width="270" style="display:block;width:100%;height:auto;border:0;"></span>'
            f'<span class="p-pad" style="display:block;padding:12px 14px 14px;">'
            f'<span class="p-name" style="display:block;font-size:20px;line-height:1.05;letter-spacing:1px;color:#FFF;{BEBAS}">{txt(name.upper())}</span>'
            f'<span style="display:block;margin-top:6px;font-size:14px;{BARLOW}">{accent(price, CARD)} '
            f'<span style="color:#777;text-decoration:line-through;">{txt(was)}</span></span>'
            f'</span></span></a></td>')


def cat(label, handle):
    return (f'<a class="cat" href="{SHOP}/collections/{handle}" style="display:inline-block;text-decoration:none;'
            f'margin:0 3px 8px;border-radius:2px;{bg("#2a2a2a")}padding:1px;">'
            f'<span style="display:block;{bg("#0f0f0f")}padding:9px 14px;font-size:14px;letter-spacing:2px;color:#FFF;'
            f'text-transform:uppercase;border-radius:2px;{BEBAS}">{txt(label)}</span></a>')


def social(label, href):
    return (f'<a href="{href}" style="display:inline-block;font-size:13px;font-weight:600;letter-spacing:2px;color:#AAA;'
            f'text-decoration:none;text-transform:uppercase;margin:0 12px;{COND}">{txt(label)}</a>')


cart = (
    f'<tr><td class="c-pad" style="padding:18px 22px 6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">'
    + cart_row("Fight Jersey Diamond", "$55.96")
    + cart_row("Walkout Hoodie Diamond", "$82.46")
    + cart_row("Monarch Long Sleeve Rashguard", "$59.46")
    + cart_row("Boxer Oversized Tee Diamond", "$48.71", last=True)
    + line("#1f1f1f", 2)
    + f'<tr><td style="padding:12px 0 4px;font-size:20px;letter-spacing:1px;color:#FFF;{BEBAS}">{txt("CART")}</td>'
      f'<td style="padding:12px 0 4px;font-size:20px;letter-spacing:1px;color:#FFF;text-align:right;{BEBAS}">{txt("$246.59")}</td></tr>'
    + '</table></td></tr>'
    + f'<tr><td class="c-pad" style="padding:10px 22px 4px;"><p style="font-size:13px;color:#AAA;margin:0 0 8px;text-align:center;{BARLOW}">'
      f'{txt("$3.41 left for Free Essentials Tee")}</p>'
      f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;"><tr>'
      f'<td width="98%" style="width:98%;height:8px;font-size:1px;line-height:8px;border-radius:4px 0 0 4px;{bg(TEAL)}">&nbsp;</td>'
      f'<td width="2%" style="width:2%;height:8px;font-size:1px;line-height:8px;border-radius:0 4px 4px 0;{bg("#2a2a2a")}">&nbsp;</td>'
      f'</tr></table></td></tr>'
    + f'<tr><td class="c-pad" style="padding:16px 22px 20px;">'
    + framed(
        f'<tr><td width="34" style="width:34px;padding:14px 0 14px 16px;font-size:24px;line-height:1;vertical-align:middle;">&#9889;</td>'
        f'<td style="padding:14px 8px;vertical-align:middle;">'
        f'<span class="pp-title" style="display:block;font-size:22px;line-height:1.05;letter-spacing:1px;color:#FFF;{BEBAS}">{txt("POWERPLAY YOUR CART")}</span>'
        f'<span style="display:block;font-size:12px;color:#AAA;margin-top:4px;{BARLOW}">{txt("Unlock a free Essentials Tee now")}</span></td>'
        f'<td style="padding:14px 16px 14px 4px;vertical-align:middle;text-align:right;white-space:nowrap;">{pill("+$3.42", "BOOST")}</td></tr>',
        frame=TEAL, fill="#0b1716")
    + '</td></tr>'
)

unlocked = framed(
    f'<tr><td width="42%" style="width:42%;padding:0;vertical-align:middle;{bg("#c9c9c9")}">'
    f'<a href="{SHOP}/products/essentials-training-tee-2-0" style="text-decoration:none;display:block;">'
    f'<img src="{CDN}cagecraft-essentials-training-tee-2-0-front.jpg?v=1795128984&amp;width=480" alt="Essentials Training Tee 2.0" '
    f'width="220" style="display:block;width:100%;max-width:240px;height:auto;border:0;"></a></td>'
    f'<td class="u-pad" style="padding:20px 22px;vertical-align:middle;">'
    f'<span style="display:block;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;{COND}">{accent("Unlocked", CARD)}</span>'
    f'<span class="u-name" style="display:block;font-size:30px;line-height:1;letter-spacing:1px;color:#FFF;{BEBAS}">{txt("FREE ESSENTIALS TRAINING TEE 2.0")}</span>'
    f'<span style="display:block;margin-top:10px;font-size:14px;color:#FFF;{BARLOW}">{txt("$0.00")} '
    f'<span style="color:#777;text-decoration:line-through;">{txt("$29.97")}</span></span>'
    f'<span style="display:block;margin-top:10px;font-size:13px;color:#999;line-height:1.5;{BARLOW}">'
    f'{txt("On top of the kit bag, crew socks, towel and free shipping the cart had already unlocked. New total: $250.01.")}</span></td></tr>',
    frame=TEAL)

steps = framed(
    step("01", "SHOP THE SALE", "Up to 40% off, and every $50 you spend unlocks another free gift.")
    + step("02", "COME UP A FEW DOLLARS SHORT", "The PowerPlay button lights up in your cart and shows exactly what it adds before you tap.")
    + step("03", "TAP IT. GIFT UNLOCKED.", "A small PowerPlay Boost takes your cart just past the line and the gift drops in. "
           "Change your cart and the boost comes off.", last=True))

ladder = framed(
    tier("$50", "FREE KIT BAG") + tier("$100", "FREE CREW SOCKS") + tier("$150", "FREE SHIPPING")
    + tier("$200", "FREE TRAINING TOWEL") + tier("$250", "FREE ESSENTIALS TEE", last=True))

products = (
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;"><tr>'
    + product("walkout-hoodie-diamond", "TIFFANYHOODIEFLATLAY.jpg?v=1778203852", "Walkout Hoodie Diamond", "$82.46", "$109.95")
    + product("fight-jersey-2-0-diamond", "FRONT.png?v=1769143961", "Fight Jersey Diamond", "$55.96", "$79.95")
    + '</tr><tr>'
    + product("monarch-2-in-1-hybrid-mma-shorts", "cagecraft-monarch-2-in-1-hybrid-mma-shorts-flat-lay-front.jpg?v=1795128397",
              "Monarch 2-in-1 Shorts", "$62.96", "$89.95")
    + product("boxer-oversized-tee-tiffany", "cagecraft-boxer-oversized-tee-tiffany-front.jpg?v=1794605054",
              "Boxer Oversized Tee Diamond", "$48.71", "$64.95")
    + '</tr></table>')

para = lambda html, size="17px", color="#CCC", mw="440px", mb="26px": (
    f'<p class="section-text" style="font-size:{size};color:{color};line-height:1.6;max-width:{mw};margin:0 auto {mb};{BARLOW}">{txt(html)}</p>')

body = f"""{FONTS}{COLOR_SCHEME}
<div class="email-wrapper" style="padding:0;width:100%;{bg(PAGE)}">
<div class="preheader" style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#080808">{PRE}</div>
<div class="email-container" style="max-width:600px;margin:0 auto;{bg(PAGE)}">
<div class="announcement" style="text-align:center;padding:10px 20px;font-size:11px;font-weight:600;letter-spacing:2px;color:#AAA;text-transform:uppercase;{COND}{bg("#111111")}">{txt("Black Friday | Ends Sun 29 Nov, 11:59pm AEDT")}</div>
{hline("#1a1a1a")}
<div class="header" style="text-align:center;padding:22px 40px 18px;{bg(PAGE)}"><a href="{SHOP}" style="text-decoration:none"><span class="logo-text" style="font-size:40px;letter-spacing:7px;color:#FFF;display:block;line-height:1;{BEBAS}">{txt("CAGECRAFT")}</span><span style="display:block;font-size:10px;letter-spacing:4px;color:#777;text-transform:uppercase;margin-top:4px;{COND}">{txt("FIGHTWEAR CO.")}</span></a></div>
{hline("#1a1a1a")}
<div style="{bg(PAGE)}"><div class="hero-in" style="text-align:center;padding:44px 40px 30px;background-image:radial-gradient(ellipse at 50% 0%,#0d1c1b 0%,#080808 70%);">
<span style="display:inline-block;font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;{COND}">&#9889; {accent("New | PowerPlay your cart")}</span>
<p class="hero-headline" style="font-size:68px;line-height:0.95;color:#FFF;letter-spacing:2px;margin:0 0 20px;{BEBAS}">{txt("$3.41 AWAY FROM")}<br>{accent("A FREE TEE?", extra="margin:-0.16em 0 -0.1em;")}</p>
{para("Don&#39;t add another item. <strong style='color:#FFF;font-weight:500'>PowerPlay it.</strong> One tap tops up the difference and the free gift drops straight into your cart.")}
{button("Shop the sale", SHOP)}
</div></div>
{section_head("A real cart", "$246.59 IN.", "$3.41 SHORT OF THE TEE.", pad="26px 40px 16px")}
<div class="grid-wrap" style="padding:0 24px;{bg(PAGE)}">
{framed(cart)}
<p style="text-align:center;margin:0;padding:14px 0;font-size:13px;font-weight:600;letter-spacing:4px;text-transform:uppercase;{COND}">{accent("&#9660;&nbsp; One tap &nbsp;&#9660;")}</p>
{unlocked}
</div>
{section_head("How it works", "NO FILLER ITEMS.", "NO MISSED GIFTS.")}
<div class="grid-wrap" style="padding:0 24px;{bg(PAGE)}">{steps}</div>
{section_head("Works on every tier", "UP TO 40% OFF", "+ A FREE GIFT WITH EVERY $50", pad="40px 40px 18px",
              after=f'<p class="section-text" style="font-size:14px;color:#999;line-height:1.8;max-width:440px;margin:12px auto 0;{BARLOW}">{txt("Gifts drop into your cart automatically, while stocks last. Short of the next one? PowerPlay it.")}</p>')}
<div class="grid-wrap" style="padding:0 24px;{bg(PAGE)}">{ladder}</div>
{section_head("Best sellers", "STILL IN STOCK.", "NOT FOR LONG.", pad="40px 40px 18px")}
<div class="grid-wrap" style="padding:0 18px;{bg(PAGE)}">{products}</div>
<div class="section" style="padding:30px 40px 0;text-align:center;{bg(PAGE)}">{para("Black Friday ends <strong style='color:#FFF;font-weight:500'>Sunday 29 November, 11:59pm AEDT</strong>. Build your cart, and if you come up short, PowerPlay it.", size="15px", mw="420px", mb="22px")}{button("Shop the sale", SHOP)}</div>
<div class="section" style="padding:30px 40px 0;text-align:center;{bg(PAGE)}"><p style="font-size:11px;color:#888;line-height:1.7;max-width:460px;margin:0 auto;{BARLOW}">{txt("PowerPlay is available on Australian orders during the sale. The boost is the amount you&#39;re short plus 1c, so your cart lands just past the gift. It comes off automatically if your cart changes. Free gifts while stocks last.")}</p></div>
<div class="section" style="padding:30px 40px 40px;text-align:center;{bg(PAGE)}"><p style="font-size:13px;color:#888;font-style:italic;line-height:1.8;max-width:440px;margin:0 auto;{BARLOW}">{txt("See you at checkout.<br>The CAGECRAFT Team")}</p></div>
{hline("#1a1a1a")}
<div class="social-block" style="padding:30px 24px 28px;text-align:center;{bg("#0f0f0f")}"><div style="font-size:10px;font-weight:600;letter-spacing:4px;color:#777;text-transform:uppercase;margin-bottom:14px;{COND}">{txt("Shop by category")}</div><div>{cat("Hoodies", "hoodies")} {cat("Tees", "tees")} {cat("Fight Jerseys", "fight-jerseys")} {cat("Fightwear", "fightwear")}</div><div style="margin-top:14px">{social("Instagram", "https://www.instagram.com/cagecraftco")}{social("TikTok", "https://www.tiktok.com/@cagecraftco")}{social("Website", SHOP)}</div></div>
{hline("#111111")}
<div class="footer" style="padding:24px 40px 32px;text-align:center;{bg(PAGE)}"><div style="font-size:22px;letter-spacing:6px;margin-bottom:12px;{BEBAS}">{accent("CAGECRAFT", color="#333333")}</div><p style="font-size:11px;color:#888;line-height:1.8;margin:0 0 4px;{BARLOW}">{txt("CAGECRAFT | Sydney, Australia | cagecraftco.com")}</p><p style="font-size:11px;color:#888;line-height:1.8;margin:0 0 4px;{BARLOW}"><a href="[[preference_link]]" style="color:#999;text-decoration:underline">{txt("Edit preferences")}</a> {txt("|")} <a href="[[unsubscribe_link]]" style="color:#999;text-decoration:underline">{txt("Unsubscribe")}</a> {txt("|")} <a href="{SHOP}/policies/privacy-policy" style="color:#999;text-decoration:underline">{txt("Privacy Policy")}</a></p><p style="font-size:10px;color:#777;line-height:1.8;margin:12px 0 4px;{BARLOW}">{txt("This email was sent to [[contact.email]] because you have subscribed on our site or made a purchase.")}</p></div>
</div>
</div>"""

out = Path(__file__).parent / "out"
out.mkdir(exist_ok=True)
(out / "e8-body.html").write_text(body)
(out / "e8-style.css").write_text(MOBILE_CSS)
print(f"body {len(body):,} bytes")
