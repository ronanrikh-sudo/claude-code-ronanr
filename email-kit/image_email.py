"""Image-sliced ("stitched") email builder for Omnisend.

Images never get recoloured by email apps in dark mode, so the design is rendered to JPG slices
(see email-kit/designs/*.html, rendered at 2x with Playwright) and stacked here with zero gaps.
Only things that must be live stay as HTML/native blocks: Omnisend's dynamic product sections
and the legal footer. Those use neutral colours that read fine whether or not a client inverts them.

build_sections(slices_top, live_sections, slices_bottom) returns Omnisend `sections` JSON.
"""
import secrets

PAGE = "#050506"  # Cube Noir black (matches the image slices)


def hid():
    return secrets.token_hex(12)


def img(src, alt, href=None, w=600, h=None):
    style = ("display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;"
             "color:#ffffff;font-family:Arial,sans-serif;font-size:16px;line-height:1.4;"
             f"background-color:{PAGE};")
    tag = f'<img src="{src}" width="{w}" alt="{alt}" style="{style}">'
    if href:
        tag = f'<a href="{href}" target="_blank" style="display:block;text-decoration:none;border:0;">{tag}</a>'
    return tag


def stack(images, preheader=None, extra_html=""):
    pre = ""
    if preheader:
        pre = ('<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;'
               f'color:{PAGE};opacity:0;">{preheader}</div>')
    return (f'{pre}<div style="margin:0;padding:0;background-color:{PAGE};font-size:0;line-height:0;">'
            + "".join(images) + f"</div>{extra_html}")


FOOTER = (
    '<div style="padding:22px 24px 30px;text-align:center;font-family:Arial,sans-serif;font-size:12px;'
    'line-height:1.8;color:#8a8a8a;">'
    '<p style="margin:0 0 8px;"><a href="https://www.instagram.com/cagecraftco" target="_blank" style="color:#8a8a8a;text-decoration:underline;">Instagram</a>'
    ' &nbsp;·&nbsp; <a href="https://www.tiktok.com/@cagecraftco" target="_blank" style="color:#8a8a8a;text-decoration:underline;">TikTok</a>'
    ' &nbsp;·&nbsp; <a href="https://www.cagecraftco.com" target="_blank" style="color:#8a8a8a;text-decoration:underline;">cagecraftco.com</a></p>'
    '<p style="margin:0 0 8px;">CAGECRAFT® · Sydney, Australia</p>'
    '<p style="margin:0;"><a href="[[preference_link]]" target="_blank" style="color:#8a8a8a;text-decoration:underline;">Update preferences</a>'
    ' · <a href="[[unsubscribe_link]]" target="_blank" style="color:#8a8a8a;text-decoration:underline;">Unsubscribe</a>'
    ' · <a href="https://www.cagecraftco.com/policies/privacy-policy" target="_blank" style="color:#8a8a8a;text-decoration:underline;">Privacy Policy</a></p>'
    '</div>')


def html_section(body):
    return {
        "id": hid(),
        "visibility": {"isMobileVisible": True, "isDesktopVisible": True},
        "styleProperties": {"paddingLeft": "0px", "paddingRight": "0px", "paddingTop": "0px",
                            "paddingBottom": "0px", "backgroundColor": PAGE},
        "rows": [{"id": hid(), "columns": [{"id": hid(), "width": "600px", "blocks": [
            {"id": hid(), "type": "htmlCode", "htmlCode": {"body": body, "style": ""},
             "styleProperties": {"padding": "0px"}}]}]}],
    }


def general_settings(base):
    """Keep the account's presets but set the page to the email's dark colour and teal buttons."""
    gs = dict(base)
    gs["body"] = {"backgroundColor": PAGE}
    gs["content"] = dict(base.get("content", {}), backgroundColor=PAGE, width="600px")
    presets = []
    for p in base.get("buttonPresets", []):
        p = dict(p, styles=dict(p.get("styles", {})))
        if p["id"] == "primary_button":
            p["styles"].update(backgroundColor="#7fd8cc", color="#071312", borderRadius="3px",
                               fontFamily="Arial, sans-serif", fontSize="15px")
        presets.append(p)
    gs["buttonPresets"] = presets
    return gs
