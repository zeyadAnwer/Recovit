"""
Converts the Recovik wordmarks to SVG outlines so the logo files need no font.

    python -m venv .venv && .venv/bin/pip install fonttools brotli uharfbuzz
    .venv/bin/python scripts/brand/outline-wordmarks.py

Shapes text with HarfBuzz (correct Arabic joining and the kasra on «ف»),
instances the variable font at the logo weight, and writes path data plus
advance widths to scripts/brand/wordmarks.json, read by generate-assets.mjs.
Re-run only when the brand name or the wordmark font changes.
"""
import io
import json
import pathlib

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = pathlib.Path(__file__).resolve().parents[2]
FILES = ROOT / 'node_modules/@fontsource-variable/alexandria/files'
OUT = pathlib.Path(__file__).with_name('wordmarks.json')


def load(subset: str, weight: int):
    font = TTFont(FILES / f'alexandria-{subset}-wght-normal.woff2')
    instantiateVariableFont(font, {'wght': weight}, inplace=True)
    buffer = io.BytesIO()
    font.flavor = None
    font.save(buffer)
    data = buffer.getvalue()
    return TTFont(io.BytesIO(data)), hb.Font(hb.Face(data))


def outline(text: str, subset: str, weight: int, size: float, tracking: float = 0.0):
    ft, hbfont = load(subset, weight)
    upem = ft['head'].unitsPerEm
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf)
    glyphset = ft.getGlyphSet()
    order = ft.getGlyphOrder()
    scale = size / upem
    pen = SVGPathPen(glyphset)
    x = 0.0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        # Flip y (fonts are y-up, SVG is y-down) and place on the baseline.
        tpen = TransformPen(pen, (scale, 0, 0, -scale, (x + pos.x_offset) * scale, -pos.y_offset * scale))
        glyphset[name].draw(tpen)
        x += pos.x_advance + tracking * upem
    width = (x - tracking * upem) * scale
    return {'d': pen.getCommands(), 'width': round(width, 2), 'ascent': round(ft['hhea'].ascent * scale, 2)}


data = {
    'latin': outline('Recovik', 'latin', 650, 30, tracking=-0.02),
    'arabic': outline('ريكوفِك', 'arabic', 700, 30),
    'latinSmall': outline('RECOVIK', 'latin', 600, 11, tracking=0.22),
}
OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf8')
print('wrote', OUT)
