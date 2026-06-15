#!/usr/bin/env python3
"""Generate the Viral Architect emblem SVG from a mathematical grid model."""

from __future__ import annotations

import math
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "public" / "Viral-Architect-Logo.svg"

VIEWBOX = 1009
SQUARE = 50
PITCH = 57  # 50px square + 7px gap
GAP = PITCH - SQUARE

BRIGHT_FILL = "#00e5ff"
DIM_FILL = "#126894"
BG_FILL = "#050705"

# Line 4 (_X_) is the emblem center; X = always-on VA tiles, _ = intentional void.
BRIGHT_PATTERN = (
    "X_X",
    "X_X",
    "X_X",
    "_X_",
    "X_X",
    "XXX",
    "X_X",
)
PATTERN_ROWS = len(BRIGHT_PATTERN)
PATTERN_COLS = len(BRIGHT_PATTERN[0])
CENTER_COL = 1
CENTER_ROW = 3

MIN_DIM_OPACITY = 0.012
MAX_DIM_OPACITY = 0.16
FALLOFF_POWER = 2.1
MAX_FALLOFF_DIST = VIEWBOX * 0.52


def pattern_origin() -> tuple[float, float]:
    """Place the 7x3 VA grid so the center tile (_X_) sits on the canvas center."""
    origin_x = VIEWBOX / 2 - CENTER_COL * PITCH - SQUARE / 2
    origin_y = VIEWBOX / 2 - CENTER_ROW * PITCH - SQUARE / 2
    return origin_x, origin_y


def emblem_center(origin_x: float, origin_y: float) -> tuple[float, float]:
    return (
        origin_x + CENTER_COL * PITCH + SQUARE / 2,
        origin_y + CENTER_ROW * PITCH + SQUARE / 2,
    )


def in_pattern(pr: int, pc: int) -> bool:
    return 0 <= pr < PATTERN_ROWS and 0 <= pc < PATTERN_COLS


def dim_opacity(
    cell_center_x: float,
    cell_center_y: float,
    center_x: float,
    center_y: float,
    grid_col: int,
    grid_row: int,
) -> float:
    distance = math.hypot(cell_center_x - center_x, cell_center_y - center_y)
    t = max(0.0, 1.0 - distance / MAX_FALLOFF_DIST)
    base = MIN_DIM_OPACITY + (MAX_DIM_OPACITY - MIN_DIM_OPACITY) * (t**FALLOFF_POWER)
    # Deterministic shimmer so the outer field feels organic, not a flat gradient.
    shimmer = 0.82 + ((grid_col * 17 + grid_row * 31) % 23) / 100
    return base * shimmer


def iter_grid(origin_x: float, origin_y: float):
    min_col = math.floor((0 - SQUARE - origin_x) / PITCH)
    max_col = math.ceil((VIEWBOX - origin_x) / PITCH)
    min_row = math.floor((0 - SQUARE - origin_y) / PITCH)
    max_row = math.ceil((VIEWBOX - origin_y) / PITCH)

    for row in range(min_row, max_row + 1):
        for col in range(min_col, max_col + 1):
            x = origin_x + col * PITCH
            y = origin_y + row * PITCH
            if x + SQUARE <= 0 or y + SQUARE <= 0 or x >= VIEWBOX or y >= VIEWBOX:
                continue
            yield col, row, x, y


def build_svg() -> str:
    origin_x, origin_y = pattern_origin()
    center_x, center_y = emblem_center(origin_x, origin_y)

    bright: list[tuple[float, float]] = []
    dim: list[tuple[float, float, float]] = []

    for col, row, x, y in iter_grid(origin_x, origin_y):
        pr = row
        pc = col
        if in_pattern(pr, pc):
            if BRIGHT_PATTERN[pr][pc] == "X":
                bright.append((x, y))
            continue

        cell_center_x = x + SQUARE / 2
        cell_center_y = y + SQUARE / 2
        opacity = dim_opacity(cell_center_x, cell_center_y, center_x, center_y, col, row)
        if opacity >= MIN_DIM_OPACITY:
            dim.append((x, y, opacity))

    svg_ns = "http://www.w3.org/2000/svg"
    ET.register_namespace("", svg_ns)
    root = ET.Element(
        f"{{{svg_ns}}}svg",
        {
            "viewBox": f"0 0 {VIEWBOX} {VIEWBOX}",
            "width": str(VIEWBOX),
            "height": str(VIEWBOX),
        },
    )

    ET.SubElement(
        root,
        f"{{{svg_ns}}}rect",
        {"width": str(VIEWBOX), "height": str(VIEWBOX), "fill": BG_FILL},
    )

    dim_group = ET.SubElement(root, f"{{{svg_ns}}}g", {"id": "dim-grid"})
    bright_group = ET.SubElement(root, f"{{{svg_ns}}}g", {"id": "bright-letters"})

    for x, y, opacity in sorted(dim):
        ET.SubElement(
            dim_group,
            f"{{{svg_ns}}}rect",
            {
                "class": "dim-square",
                "x": f"{x:.3f}",
                "y": f"{y:.3f}",
                "width": str(SQUARE),
                "height": str(SQUARE),
                "fill": DIM_FILL,
                "opacity": f"{opacity:.3f}",
            },
        )

    for x, y in sorted(bright):
        ET.SubElement(
            bright_group,
            f"{{{svg_ns}}}rect",
            {
                "class": "bright-square",
                "x": f"{x:.3f}",
                "y": f"{y:.3f}",
                "width": str(SQUARE),
                "height": str(SQUARE),
                "fill": BRIGHT_FILL,
            },
        )

    xml = ET.tostring(root, encoding="unicode")
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f"<!-- Mathematical emblem: {SQUARE}px squares, {PITCH}px pitch ({GAP}px gap). -->\n"
        + xml
        + "\n"
    )


def main() -> None:
    svg = build_svg()
    OUT_PATH.write_text(svg, encoding="utf-8")
    origin_x, origin_y = pattern_origin()
    bright_count = sum(line.count("X") for line in BRIGHT_PATTERN)
    print(f"Wrote {OUT_PATH}")
    print(f"  bright VA tiles: {bright_count} ({PATTERN_ROWS}x{PATTERN_COLS} core)")
    print(f"  pitch: {PITCH}px  square: {SQUARE}px  gap: {GAP}px")
    print(f"  center tile: row {CENTER_ROW + 1}, col {CENTER_COL + 1}")
    print(f"  pattern origin: ({origin_x:.1f}, {origin_y:.1f})")


if __name__ == "__main__":
    main()
