"""Chrome rounds PDF pages up to whole pixels (115mm comes out as 115.4mm). Set the page boxes to the
exact size, anchored top-left where the artwork starts. Every box gets the full size, bleed included,
because print-upload checkers compare the file size against their bleed size.
Usage: boxes.py file.pdf width_mm height_mm"""
import sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject

path, w, h = sys.argv[1], *(float(v) * 72 / 25.4 for v in sys.argv[2:4])
writer = PdfWriter(clone_from=PdfReader(path))
page = writer.pages[0]
top = float(page.mediabox.top)
full = RectangleObject([0, top - h, w, top])
page.mediabox = page.cropbox = page.bleedbox = page.trimbox = page.artbox = full
writer.write(path)
