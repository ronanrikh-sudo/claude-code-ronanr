"""Dark-lock helpers for CAGECRAFT's dark HTML emails (Omnisend htmlCode blocks).

Goal: the email looks the same whether the phone is in light or dark mode.

Why emails break in dark mode
  * Gmail (iOS) does a full colour inversion: it flips background colours, text colours and
    border colours, so a dark email is forced light, and anything it can't flip (background
    images, gradients) stays dark with now-dark text on top -> unreadable.
  * Outlook apps / Outlook.com / Gmail Android do partial inversion (light backgrounds and
    dark text get flipped).
  * Apple Mail leaves emails with explicit backgrounds alone, but honours prefers-color-scheme
    rules, so any dark-mode CSS must not change colours.

Rules used here (no client-specific CSS needed, because Omnisend prefixes every rule in the
block's style with an ID, which breaks the usual `u + .body` Gmail selectors):
  1. bg(c): every background is a background-color PLUS a one-colour linear-gradient. Gmail
     doesn't recolour gradients, so the background stays exactly as designed.
  2. No CSS borders (Gmail flips border colours). Lines are 1px rows/padding painted with bg().
  3. txt(html): white/grey text sits inside two blend-mode spans (screen, then difference)
     with black backgrounds. In normal rendering they are a no-op. When Gmail inverts the
     text and the black backgrounds, the difference blend inverts it straight back.
  4. accent(html): coloured (teal) text is drawn as locked white text, then tinted with a
     multiply layer over a locked teal backdrop, so the colour survives any inversion.
  5. button(label): teal button with dark label built the same way (white -> difference over
     locked white -> multiply over locked teal), so buttons don't flip either.
  6. Emoji stay outside the blend spans (Gmail never recolours emoji glyphs).
  Clients without mix-blend-mode (mainly Outlook for Windows) fall back gracefully: text is
  readable, accent text shows white, buttons show a dark label chip on teal.
"""

PAGE = "#080808"
CARD = "#111111"
TEAL = "#7fd8cc"

BEBAS = "font-family:Bebas Neue,Impact,Arial,sans-serif !important;"
BARLOW = "font-family:Barlow,Arial,sans-serif !important;"
COND = "font-family:Barlow Condensed,Arial,sans-serif !important;"


def bg(c):
    return f"background-color:{c};background-image:linear-gradient({c},{c});"


def txt(html):
    """Lock white/grey text (its colour comes from the parent)."""
    return ('<span style="background-color:#000;mix-blend-mode:screen;">'
            '<span style="background-color:#000;mix-blend-mode:difference;">'
            f'{html}</span></span>')


def accent(html, container=PAGE, color=TEAL, line_height="1.25", extra=""):
    """Lock coloured text. Locked white text is multiplied onto a locked colour backdrop (teal text
    on black), and the whole thing is screened onto whatever is behind it, so black drops out and
    no box shows on any dark background. `container` is kept for API compatibility."""
    return (f'<span style="display:inline-block;mix-blend-mode:screen;line-height:{line_height};{extra}">'
            f'<span style="display:inline-block;vertical-align:top;{bg(color)}">'
            f'<span style="display:inline-block;vertical-align:top;{bg("#000000")}mix-blend-mode:multiply;color:#fff;">'
            f'{txt(html)}</span></span></span>')


def line(c="#1f1f1f", colspan=1):
    """A 1px separator row for tables (replaces border-bottom)."""
    return (f'<tr><td colspan="{colspan}" style="height:1px;line-height:1px;font-size:1px;padding:0;{bg(c)}">'
            '&nbsp;</td></tr>')


def hline(c="#1a1a1a"):
    """A 1px full-width divider (replaces border-top/bottom on divs)."""
    return f'<div style="height:1px;line-height:1px;font-size:1px;{bg(c)}">&nbsp;</div>'


def framed(inner_html, frame="#1f1f1f", fill=CARD, margin="0", cls="", inner_style=""):
    """A card with a locked 1px frame (replaces border:1px solid)."""
    return (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
            f'style="width:100%;border-collapse:separate;margin:{margin};{bg(frame)}"><tr>'
            f'<td style="padding:1px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
            f'class="{cls}" style="width:100%;border-collapse:collapse;{bg(fill)}{inner_style}">'
            f'{inner_html}</table></td></tr></table>')


def button(label, href, size="20px", pad="14px 40px", spacing="2px"):
    """Teal button with a near-black label that stays put in every dark mode."""
    return (f'<a href="{href}" class="btn" style="display:inline-block;text-decoration:none;{bg(TEAL)}'
            f'padding:{pad};border-radius:2px;{BEBAS}font-size:{size};letter-spacing:{spacing};'
            f'line-height:1.25;text-transform:uppercase;">'
            f'<span style="display:inline-block;{bg("#ffffff")}mix-blend-mode:multiply;">'
            f'<span style="display:inline-block;{bg("#000000")}mix-blend-mode:difference;color:#fff;">'
            f'{txt(label)}</span></span></a>')


def pill(top, bottom):
    """Small teal +$X.XX BOOST pill (same locking as button)."""
    return (f'<span style="display:inline-block;{bg(TEAL)}border-radius:4px;padding:5px 12px;text-align:center;">'
            f'<span style="display:inline-block;{bg("#ffffff")}mix-blend-mode:multiply;">'
            f'<span style="display:inline-block;{bg("#000000")}mix-blend-mode:difference;color:#fff;">'
            f'<span style="display:block;font-size:22px;line-height:1.25;letter-spacing:1px;{BEBAS}">{txt(top)}</span>'
            f'<span style="display:block;font-size:10px;line-height:1.4;letter-spacing:2px;font-weight:700;{COND}">{txt(bottom)}</span>'
            f'</span></span></span>')


# Makes Apple Mail / Outlook for Mac render exactly as authored (no auto dark mode).
COLOR_SCHEME = ('<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">'
                '<style>:root{color-scheme:light only;supported-color-schemes:light only;}</style>')

FONTS = ('<link rel="preconnect" href="https://fonts.gstatic.com"><link href="https://fonts.googleapis.com/css2?'
         'family=Bebas+Neue&amp;family=Barlow+Condensed:wght@400;600;700&amp;family=Barlow:wght@300;400;500&amp;display=swap" '
         'rel="stylesheet">')

# Block style: mobile layout only. Deliberately NO prefers-color-scheme rules, so dark mode
# can't change anything.
MOBILE_CSS = """@media only screen and (max-width: 600px) {
.email-container { width: 100% !important; }
.announcement { font-size: 10px !important; padding: 8px 12px !important; letter-spacing: 1px !important; }
.header { padding: 18px 24px 16px !important; }
.logo-text { font-size: 34px !important; letter-spacing: 5px !important; }
.hero-in { padding: 32px 20px 26px !important; }
.hero-headline { font-size: 50px !important; }
.section { padding-left: 20px !important; padding-right: 20px !important; }
.section-headline { font-size: 28px !important; }
.grid-wrap { padding: 0 12px !important; }
.l-amt { font-size: 26px !important; padding-left: 14px !important; }
.l-gift { font-size: 17px !important; padding-right: 14px !important; }
.cat { display: block !important; margin: 0 0 8px !important; }
.c-pad { padding-left: 14px !important; padding-right: 14px !important; }
.c-item { font-size: 13px !important; }
.pp-title { font-size: 18px !important; }
.u-pad { padding: 14px 14px !important; }
.u-name { font-size: 22px !important; }
.s-num { width: 44px !important; padding-left: 14px !important; font-size: 28px !important; }
.s-pad { padding-right: 14px !important; }
.s-head { font-size: 19px !important; }
.p-cell { padding-left: 4px !important; padding-right: 4px !important; }
.p-pad { padding: 10px 10px 12px !important; }
.p-name { font-size: 17px !important; min-height: 34px !important; }
}"""
