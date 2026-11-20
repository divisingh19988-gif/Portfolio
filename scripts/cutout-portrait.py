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


def chroma(src: Path, dest: Path) -> None:
    image = Image.open(src).convert("RGBA")
    pixels = image.getdata()
    out = []
    for r, g, b, a in pixels:
        green = g > 140 and g > r + 35 and g > b + 35
        # Soft edge: how far the pixel is from a hard key.
        score = (g - max(r, b)) / 255
        if green and score > 0.18:
            alpha = 0
        elif score > 0.08 and g > r and g > b:
            alpha = int(max(0, min(a, (0.22 - score) / 0.14 * 255)))
        else:
            alpha = a
        out.append((r, g, b, alpha))
    image.putdata(out)
    alpha = image.getchannel("A").filter(ImageFilter.GaussianBlur(radius=0.6))
    image.putalpha(alpha)
    dest.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest)
    print(f"wrote {dest}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: cutout-portrait.py SOURCE DEST.png")
    chroma(Path(sys.argv[1]), Path(sys.argv[2]))
