const BRIGHT_USE_IDS = new Set(["A", "V", "V Bottom / A Top"]);
const DIM_SQUARE_CLASS = "dim-square";
const BRIGHT_SQUARE_CLASS = "bright-square";
const TENDRIL_CLASS = "dim-square-tendril";

const VIEWBOX = 1009;
const SQUARE = 50;
const PITCH = 57;
const CENTER_COL = 1;
const CENTER_ROW = 3;
const GRID_ORIGIN_X = VIEWBOX / 2 - CENTER_COL * PITCH - SQUARE / 2;
const GRID_ORIGIN_Y = VIEWBOX / 2 - CENTER_ROW * PITCH - SQUARE / 2;
const CANVAS_CENTER_X = VIEWBOX / 2;
const CANVAS_CENTER_Y = VIEWBOX / 2;

const NEIGHBOR_DIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

type SvgElement = SVGElement & {
  dataset: DOMStringMap & {
    defaultOpacity?: string;
    defaultFill?: string;
    gridCol?: string;
    gridRow?: string;
  };
};

type GridCell = {
  col: number;
  row: number;
  el: SVGRectElement;
  baseOpacity: number;
  baseFill: string;
};

type WaveNode = {
  col: number;
  row: number;
  intensity: number;
  parentCol: number;
  parentRow: number;
};

type TendrilWave = {
  frontier: WaveNode[];
  visited: Set<string>;
  age: number;
};

type TendrilSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  intensity: number;
};

function parseOpacity(value: string | null | undefined): number {
  if (!value) return 1;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 1;
}

function getElementOpacity(el: SvgElement): number {
  const attr = el.getAttribute("opacity");
  if (attr) return parseOpacity(attr);
  return parseOpacity(el.style.opacity);
}

function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "");
  if (normalized.length === 3) {
    return {
      r: Number.parseInt(normalized[0] + normalized[0], 16),
      g: Number.parseInt(normalized[1] + normalized[1], 16),
      b: Number.parseInt(normalized[2] + normalized[2], 16),
    };
  }
  if (normalized.length === 6) {
    return {
      r: Number.parseInt(normalized.slice(0, 2), 16),
      g: Number.parseInt(normalized.slice(2, 4), 16),
      b: Number.parseInt(normalized.slice(4, 6), 16),
    };
  }
  return null;
}

function relativeLuminance(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function isDimFill(fill: string | null): boolean {
  if (!fill || fill === "none" || fill === "transparent") return true;
  if (fill.startsWith("#")) {
    const rgb = parseHexColor(fill);
    if (!rgb) return true;
    if (rgb.b > rgb.g && rgb.b > rgb.r) return relativeLuminance(rgb.r, rgb.g, rgb.b) < 0.35;
    return relativeLuminance(rgb.r, rgb.g, rgb.b) < 0.45;
  }
  const rgbMatch = fill.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    if (b > g && b > r) return relativeLuminance(r, g, b) < 0.35;
    return relativeLuminance(r, g, b) < 0.45;
  }
  return true;
}

function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

function parseCellKey(key: string): [number, number] {
  const [col, row] = key.split(",").map(Number);
  return [col, row];
}

function gridCoord(x: number, y: number): [number, number] {
  return [
    Math.round((x - GRID_ORIGIN_X) / PITCH),
    Math.round((y - GRID_ORIGIN_Y) / PITCH),
  ];
}

function cellCenter(col: number, row: number): [number, number] {
  return [
    GRID_ORIGIN_X + col * PITCH + SQUARE / 2,
    GRID_ORIGIN_Y + row * PITCH + SQUARE / 2,
  ];
}

function distanceFromCenter(col: number, row: number): number {
  const [cx, cy] = cellCenter(col, row);
  return Math.hypot(cx - CANVAS_CENTER_X, cy - CANVAS_CENTER_Y);
}

function markBright(el: SvgElement): void {
  el.classList.add(BRIGHT_SQUARE_CLASS);
}

function markDim(el: SvgElement): void {
  el.classList.add(DIM_SQUARE_CLASS);
  el.dataset.defaultOpacity = String(getElementOpacity(el));
  const fill = el.getAttribute("fill");
  if (fill) el.dataset.defaultFill = fill;
}

function indexRect(rect: SVGRectElement): [number, number] {
  const x = Number.parseFloat(rect.getAttribute("x") ?? "0");
  const y = Number.parseFloat(rect.getAttribute("y") ?? "0");
  const [col, row] = gridCoord(x, y);
  rect.dataset.gridCol = String(col);
  rect.dataset.gridRow = String(row);
  return [col, row];
}

function buildGrid(svg: SVGSVGElement): {
  dimGrid: Map<string, GridCell>;
  brightKeys: Set<string>;
  spawnSeeds: Array<[number, number]>;
} {
  const dimGrid = new Map<string, GridCell>();
  const brightKeys = new Set<string>();

  svg.querySelectorAll<SVGRectElement>("rect").forEach((rect) => {
    if (rect.getAttribute("fill") === "#050705") return;

    const [col, row] = indexRect(rect);
    const key = cellKey(col, row);

    if (rect.classList.contains(BRIGHT_SQUARE_CLASS)) {
      brightKeys.add(key);
      return;
    }

    if (!rect.classList.contains(DIM_SQUARE_CLASS)) return;

    dimGrid.set(key, {
      col,
      row,
      el: rect,
      baseOpacity: parseOpacity(rect.dataset.defaultOpacity ?? rect.getAttribute("opacity")),
      baseFill: rect.dataset.defaultFill ?? rect.getAttribute("fill") ?? "#126894",
    });
  });

  const spawnSeeds: Array<[number, number]> = [];
  const seen = new Set<string>();
  for (const key of brightKeys) {
    const [col, row] = parseCellKey(key);
    for (const [dc, dr] of NEIGHBOR_DIRS) {
      const nextKey = cellKey(col + dc, row + dr);
      if (!dimGrid.has(nextKey) || seen.has(nextKey)) continue;
      seen.add(nextKey);
      spawnSeeds.push(parseCellKey(nextKey));
    }
  }

  if (spawnSeeds.length === 0) {
    spawnSeeds.push([CENTER_COL, CENTER_ROW - 1], [CENTER_COL, CENTER_ROW + 1]);
  }

  return { dimGrid, brightKeys, spawnSeeds };
}

/** Classify SVG squares by opacity/fill; respects pre-tagged rects from generated SVG. */
export function classifyEmblemSquares(svg: SVGSVGElement): void {
  svg.querySelectorAll<SVGRectElement>("rect").forEach((rect) => {
    if (rect.getAttribute("fill") === "#050705") return;

    if (rect.classList.contains(DIM_SQUARE_CLASS)) {
      if (!rect.dataset.defaultOpacity) {
        rect.dataset.defaultOpacity = String(getElementOpacity(rect));
      }
      if (!rect.dataset.defaultFill) {
        const fill = rect.getAttribute("fill");
        if (fill) rect.dataset.defaultFill = fill;
      }
      return;
    }
    if (rect.classList.contains(BRIGHT_SQUARE_CLASS)) return;

    const opacity = getElementOpacity(rect);
    const fill = rect.getAttribute("fill");
    if (opacity >= 0.85 && !isDimFill(fill)) {
      markBright(rect);
      return;
    }
    markDim(rect);
  });

  svg.querySelectorAll<SVGUseElement>("use").forEach((use) => {
    if (BRIGHT_USE_IDS.has(use.id)) {
      markBright(use);
      return;
    }

    const opacity = getElementOpacity(use);
    const isBackgroundLayer = use.id.startsWith("Layer") || /block/i.test(use.id);

    if (isBackgroundLayer || opacity < 0.95) {
      markDim(use);
    }
  });
}

function branchCount(): number {
  const roll = Math.random();
  if (roll < 0.25) return 1;
  if (roll < 0.7) return 2;
  return 3;
}

function createWave(seed: [number, number], parent: [number, number]): TendrilWave {
  const [col, row] = seed;
  const [parentCol, parentRow] = parent;
  return {
    frontier: [{ col, row, intensity: 0.95, parentCol, parentRow }],
    visited: new Set([cellKey(col, row)]),
    age: 0,
  };
}

function expandWave(
  wave: TendrilWave,
  dimGrid: Map<string, GridCell>,
  segments: TendrilSegment[],
  glowMap: Map<string, number>,
): void {
  const nextFrontier: WaveNode[] = [];

  for (const node of wave.frontier) {
    const candidates: Array<{ col: number; row: number; score: number }> = [];

    for (const [dc, dr] of NEIGHBOR_DIRS) {
      const col = node.col + dc;
      const row = node.row + dr;
      const key = cellKey(col, row);
      if (!dimGrid.has(key) || wave.visited.has(key)) continue;

      const outward = distanceFromCenter(col, row) - distanceFromCenter(node.col, node.row);
      candidates.push({
        col,
        row,
        score: outward + Math.random() * 0.65,
      });
    }

    candidates.sort((a, b) => b.score - a.score);
    const branches = candidates.slice(0, branchCount());

    for (const candidate of branches) {
      const key = cellKey(candidate.col, candidate.row);
      wave.visited.add(key);

      const intensity = node.intensity * (0.74 + Math.random() * 0.16);
      if (intensity < 0.07) continue;

      const [x1, y1] = cellCenter(node.col, node.row);
      const [x2, y2] = cellCenter(candidate.col, candidate.row);
      segments.push({ x1, y1, x2, y2, intensity });

      glowMap.set(key, Math.max(glowMap.get(key) ?? 0, intensity));
      nextFrontier.push({
        col: candidate.col,
        row: candidate.row,
        intensity,
        parentCol: node.col,
        parentRow: node.row,
      });
    }
  }

  wave.frontier = nextFrontier;
  wave.age += 1;
}

function applyGlows(glowMap: Map<string, number>, dimGrid: Map<string, GridCell>): void {
  for (const cell of dimGrid.values()) {
    cell.el.classList.remove(TENDRIL_CLASS);
    cell.el.style.opacity = String(cell.baseOpacity);
    cell.el.setAttribute("fill", cell.baseFill);
  }

  for (const [key, intensity] of glowMap) {
    const cell = dimGrid.get(key);
    if (!cell) continue;

    const t = Math.min(1, intensity);
    const opacity = Math.min(0.72, cell.baseOpacity + t * (0.58 - cell.baseOpacity));
    cell.el.style.opacity = String(opacity);
    cell.el.classList.add(TENDRIL_CLASS);

    if (t > 0.42) {
      cell.el.setAttribute("fill", "#00e5ff");
    }
  }
}

function renderSegments(trailLayer: SVGGElement, segments: TendrilSegment[]): void {
  while (trailLayer.firstChild) trailLayer.removeChild(trailLayer.firstChild);

  for (const segment of segments) {
    if (segment.intensity < 0.04) continue;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", segment.x1.toFixed(2));
    line.setAttribute("y1", segment.y1.toFixed(2));
    line.setAttribute("x2", segment.x2.toFixed(2));
    line.setAttribute("y2", segment.y2.toFixed(2));
    line.setAttribute("stroke", "#00e5ff");
    line.setAttribute("stroke-width", String(1.4 + segment.intensity * 1.6));
    line.setAttribute("opacity", String(Math.min(0.85, segment.intensity * 0.9)));
    line.setAttribute("stroke-linecap", "round");
    trailLayer.appendChild(line);
  }
}

export function attachEmblemHover(container: HTMLElement, svg: SVGSVGElement): () => void {
  const { dimGrid, spawnSeeds } = buildGrid(svg);
  const trailLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  trailLayer.setAttribute("id", "tendril-trails");
  svg.appendChild(trailLayer);

  const glowMap = new Map<string, number>();
  const segments: TendrilSegment[] = [];
  const waves: TendrilWave[] = [];
  let tickId: number | null = null;
  let lastSpawnAt = 0;

  const restoreAll = (): void => {
    for (const cell of dimGrid.values()) {
      cell.el.classList.remove(TENDRIL_CLASS);
      cell.el.style.opacity = String(cell.baseOpacity);
      cell.el.setAttribute("fill", cell.baseFill);
    }
    while (trailLayer.firstChild) trailLayer.removeChild(trailLayer.firstChild);
    glowMap.clear();
    segments.length = 0;
    waves.length = 0;
  };

  const tick = (now: number): void => {
    if (now - lastSpawnAt > 340 && waves.length < 5) {
      const seed = spawnSeeds[Math.floor(Math.random() * spawnSeeds.length)];
      const parent: [number, number] = [CENTER_COL, CENTER_ROW];
      const [x1, y1] = cellCenter(parent[0], parent[1]);
      const [x2, y2] = cellCenter(seed[0], seed[1]);
      segments.push({ x1, y1, x2, y2, intensity: 0.95 });
      glowMap.set(cellKey(seed[0], seed[1]), 0.95);
      waves.push(createWave(seed, parent));
      lastSpawnAt = now;
    }

    for (const wave of waves) {
      if (wave.frontier.length === 0 || wave.age > 14) continue;
      expandWave(wave, dimGrid, segments, glowMap);
    }

    for (let i = segments.length - 1; i >= 0; i -= 1) {
      segments[i].intensity *= 0.9;
      if (segments[i].intensity < 0.035) segments.splice(i, 1);
    }

    for (const [key, intensity] of glowMap) {
      const next = intensity * 0.91;
      if (next < 0.03) glowMap.delete(key);
      else glowMap.set(key, next);
    }

    if (segments.length > 120) segments.splice(0, segments.length - 120);

    waves.splice(
      0,
      waves.length,
      ...waves.filter((wave) => wave.frontier.length > 0 && wave.age <= 16),
    );

    applyGlows(glowMap, dimGrid);
    renderSegments(trailLayer, segments);
  };

  const stopHover = (): void => {
    container.classList.remove("is-hovering");
    if (tickId !== null) {
      window.clearInterval(tickId);
      tickId = null;
    }
    restoreAll();
  };

  const startHover = (): void => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    container.classList.add("is-hovering");
    lastSpawnAt = 0;
    tick(performance.now());
    tickId = window.setInterval(() => tick(performance.now()), 70);
  };

  const onFocusOut = (event: FocusEvent): void => {
    if (container.contains(event.relatedTarget as Node)) return;
    stopHover();
  };

  container.addEventListener("mouseenter", startHover);
  container.addEventListener("mouseleave", stopHover);
  container.addEventListener("focusin", startHover);
  container.addEventListener("focusout", onFocusOut);

  return () => {
    stopHover();
    trailLayer.remove();
    container.removeEventListener("mouseenter", startHover);
    container.removeEventListener("mouseleave", stopHover);
    container.removeEventListener("focusin", startHover);
    container.removeEventListener("focusout", onFocusOut);
  };
}
