#!/usr/bin/env python3
"""Generate rect-based emblem SVG from the source PSD (blue squares only)."""

from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path

import numpy as np
from psd_tools import PSDImage

ROOT = Path(__file__).resolve().parents[1]
PSD_PATH = ROOT / "tmp" / "Viral Architect Logo.psd"
OUT_PATH = ROOT / "public" / "Viral-Architect-Logo.svg"

CANVAS = 1200
VIEWBOX = 1009
CELL = 60
GRID_OFFSET_X = 23
GRID_OFFSET_Y = 9

BRIGHT_FILL = "#00e5ff"
DIM_FILL = "#126894"
BG_FILL = "#050705"

BRIGHT_LAYERS = ("V", "A", "V Bottom / A Top")
DIM_LAYERS = (
    "Darkest Blocks",
    "Darker Blocks",
    "Dark Blocks",
    "Light Blocks",
    "Lighter Blocks",
)
SKIP_LAYERS = {"V-A (Green)", "V-A (Red)"}


def layer_cells(layer, threshold: int = 64) -> dict[tuple[int, int], float]:
    if not layer.visible or layer.name in SKIP_LAYERS:
        return {}

    arr = np.array(layer.composite().convert("RGBA"))
    origin_x, origin_y = layer.bbox[:2]
    layer_opacity = layer.opacity / 255.0
    height, width = arr.shape[:2]
    cells: dict[tuple[int, int], float] = {}

    for row in range((height + CELL - 1) // CELL):
        for col in range((width + CELL - 1) // CELL):
            y0 = row * CELL
            x0 = col * CELL
            patch = arr[y0 : y0 + CELL, x0 : x0 + CELL]
            if patch.size == 0:
                continue

            alpha = patch[:, :, 3].astype(float)
            if alpha.max() <= threshold:
                continue

            global_x = origin_x + x0
            global_y = origin_y + y0
            grid_col = round((global_x - GRID_OFFSET_X) / CELL)
            grid_row = round((global_y - GRID_OFFSET_Y) / CELL)
            snapped_x = GRID_OFFSET_X + grid_col * CELL
            snapped_y = GRID_OFFSET_Y + grid_row * CELL

            if not (0 <= snapped_x <= CANVAS - CELL and 0 <= snapped_y <= CANVAS - CELL):
                continue

            strength = layer_opacity * (alpha.mean() / 255.0)
            key = (snapped_x, snapped_y)
            cells[key] = max(cells.get(key, 0.0), strength)

    return cells


def scale(value: float) -> float:
    return round(value * VIEWBOX / CANVAS, 3)


def build_svg(bright: set[tuple[int, int]], dim: dict[tuple[int, int], float]) -> str:
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
        {
            "width": str(VIEWBOX),
            "height": str(VIEWBOX),
            "fill": BG_FILL,
        },
    )

    size = scale(CELL)
    dim_group = ET.SubElement(root, f"{{{svg_ns}}}g", {"id": "dim-grid"})
    bright_group = ET.SubElement(root, f"{{{svg_ns}}}g", {"id": "bright-letters"})

    for (x, y), opacity in sorted(dim.items()):
        ET.SubElement(
            dim_group,
            f"{{{svg_ns}}}rect",
            {
                "class": "dim-square",
                "x": str(scale(x)),
                "y": str(scale(y)),
                "width": str(size),
                "height": str(size),
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
                "x": str(scale(x)),
                "y": str(scale(y)),
                "width": str(size),
                "height": str(size),
                "fill": BRIGHT_FILL,
            },
        )

    xml = ET.tostring(root, encoding="unicode")
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f"<!-- Generated from {PSD_PATH.name}; blue squares only (no green composite). -->\n"
        + xml
        + "\n"
    )


def main() -> None:
    if not PSD_PATH.exists():
        raise SystemExit(f"PSD not found: {PSD_PATH}")

    psd = PSDImage.open(PSD_PATH)
    layers = {layer.name: layer for layer in psd}

    bright: set[tuple[int, int]] = set()
    for name in BRIGHT_LAYERS:
        layer = layers.get(name)
        if layer is None:
            continue
        bright.update(layer_cells(layer, threshold=128).keys())

    dim: dict[tuple[int, int], float] = {}
    for name in DIM_LAYERS:
        layer = layers.get(name)
        if layer is None:
            continue
        for key, value in layer_cells(layer, threshold=32).items():
            if key in bright:
                continue
            dim[key] = max(dim.get(key, 0.0), value)

    svg = build_svg(bright, dim)
    OUT_PATH.write_text(svg, encoding="utf-8")
    print(f"Wrote {OUT_PATH}")
    print(f"  bright squares: {len(bright)}")
    print(f"  dim squares: {len(dim)}")


if __name__ == "__main__":
    main()
