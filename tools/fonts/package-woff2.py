"""Package VinaDau's export with metrics that contain every Vietnamese stack."""
import argparse
import hashlib
import json
import math
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont


def check(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("source", type=Path)
parser.add_argument("export", type=Path)
parser.add_argument("output", type=Path)
parser.add_argument("report", type=Path)
args = parser.parse_args()
source = TTFont(args.source)
font = TTFont(args.export)
cmap = font.getBestCmap()
for code, name in source.getBestCmap().items():
    check(code in cmap, f"Source character lost: U+{code:04X}")
    check(font["hmtx"][cmap[code]][0] == source["hmtx"][name][0], f"Width changed: U+{code:04X}")
check(font["OS/2"].fsType == source["OS/2"].fsType, "Source embedding flags changed")
# The source sets OS/2 Italic but leaves head.macStyle unset. Keep the web asset consistent.
font["head"].macStyle = (source["head"].macStyle & ~2) | (2 if font["OS/2"].fsSelection & 1 else 0)
font["post"].italicAngle = source["post"].italicAngle

glyphs = font.getGlyphSet()
top, bottom = 0, 0
for glyph in glyphs.values():
    pen = BoundsPen(glyphs)
    glyph.draw(pen)
    if pen.bounds:
        top = max(top, math.ceil(pen.bounds[3]))
        bottom = min(bottom, math.floor(pen.bounds[1]))
font["hhea"].ascent = max(font["hhea"].ascent, top)
font["hhea"].descent = min(font["hhea"].descent, bottom)
font["OS/2"].usWinAscent = max(font["OS/2"].usWinAscent, top)
font["OS/2"].usWinDescent = max(font["OS/2"].usWinDescent, -bottom)
font["OS/2"].sTypoAscender = font["hhea"].ascent
font["OS/2"].sTypoDescender = font["hhea"].descent
font["OS/2"].sTypoLineGap = font["hhea"].lineGap = 0
font.flavor = "woff2"
args.output.parent.mkdir(parents=True, exist_ok=True)
font.save(args.output)
# Reopen the exact web asset, exercising decompression and table parsing.
web = TTFont(args.output, checkChecksums=2)
check(web.getBestCmap() == cmap, "Character map changed during WOFF2 encoding")
report = json.loads(args.report.read_text(encoding="utf-8"))
report["webAsset"] = {
    "file": args.output.name,
    "bytes": args.output.stat().st_size,
    "sha256": hashlib.sha256(args.output.read_bytes()).hexdigest(),
    "sourceCharactersPreserved": len(source.getBestCmap()),
    "ascent": web["hhea"].ascent,
    "descent": web["hhea"].descent,
    "inkTop": top,
    "inkBottom": bottom,
}
args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report["webAsset"]))
