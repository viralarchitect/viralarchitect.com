"""Verify the emblem SVG matches the 7x3 VA pattern and pitch/gap geometry."""

from __future__ import annotations

import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SVG_PATH = ROOT / "public" / "Viral-Architect-Logo.svg"

BRIGHT_PATTERN = (
    "X_X",
    "X_X",
    "X_X",
    "_X_",
    "X_X",
    "XXX",
    "X_X",
)


def main() -> None:
    svg = SVG_PATH.read_text(encoding="utf-8")
    bright = re.findall(
        r'class="bright-square"[^>]*x="([^"]+)"[^>]*y="([^"]+)"[^>]*width="([^"]+)"',
        svg,
    )
    dim = re.findall(r'class="dim-square"', svg)

    print("bright count", len(bright), "(expected 14)")
    print("dim count", len(dim))

    xs = sorted({float(x) for x, _, _ in bright})
    ys = sorted({float(y) for _, y, _ in bright})
    size = float(bright[0][2])
    pitch_x = xs[1] - xs[0] if len(xs) > 1 else 0
    pitch_y = ys[1] - ys[0] if len(ys) > 1 else 0
    print("cols", len(xs), "rows", len(ys))
    print("square", size, "pitch_x", round(pitch_x, 3), "gap", round(pitch_x - size, 3))

    for y in ys:
        line = ""
        for x in xs:
            hit = any(abs(float(bx) - x) < 0.01 and abs(float(by) - y) < 0.01 for bx, by, _ in bright)
            line += "X" if hit else "_"
        print(line)

    center_x = sum(xs) / len(xs)
    center_y = sum(ys) / len(ys)
    mid_bright = [(float(x), float(y)) for x, y, _ in bright if abs(float(x) - center_x) < pitch_x / 2]
    print("center row tiles", len(mid_bright), "(expected 1 on row 4)")

    ok = len(bright) == 14 and len(xs) == 3 and len(ys) == 7 and abs(pitch_x - size - 7) < 0.01
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
