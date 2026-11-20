#!/usr/bin/env python3
"""Cut a lime-green studio backdrop out of a portrait.

Usage:
  python scripts/cutout-portrait.py path/to/source.jpg public/portrait/digvijay.png

Pixels that are clearly green-dominant become transparent. The edge is
feathered so the cutout sits cleanly on the dark hero. Replace the source
with the real photograph, keep the output path, and the hero updates.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageFilter

# Sampled from the studio sweep on the supplied portrait.
KEY = (202, 255, 69)


def chroma(src: Path, dest: Path) -> None:
    image = Image.open(src).convert("RGBA")
    width, height = image.size
    src_px = image.load()
    out = Image.new("RGBA", image.size)
    dst = out.load()
    kr, kg, kb = KEY
    for y in range(height):
        for x in range(width):
            r, g, b, a = src_px[x, y]
            dist = ((r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2) ** 0.5
            if dist < 58:
                alpha = 0
            elif dist < 108:
                alpha = int((dist - 58) / 50 * 255)
            else:
                alpha = a
            dst[x, y] = (r, g, b, max(0, min(255, alpha)))
    # Shrink the matte by a pixel so the lime fringe does not survive, then anti-alias.
    alpha = out.getchannel("A").filter(ImageFilter.MinFilter(3))
    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=0.45))
    out.putalpha(alpha)
    px = out.load()
    for y in range(height):
        for x in range(width):
            r, g, b, a = px[x, y]
            if a < 230 and g > max(r, b):
                cap = max(r, b)
                px[x, y] = (r, cap, b, a)
    bbox = out.getchannel("A").point(lambda p: 255 if p > 12 else 0).getbbox()
    if bbox:
        pad = 8
        left = max(0, bbox[0] - pad)
        top = max(0, bbox[1] - pad)
        right = min(width, bbox[2] + pad)
        bottom = min(height, bbox[3] + pad)
        out = out.crop((left, top, right, bottom))
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest)
    print(f"wrote {dest} {out.size}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: cutout-portrait.py SOURCE DEST.png")
    chroma(Path(sys.argv[1]), Path(sys.argv[2]))
