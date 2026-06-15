const BRIGHT_USE_IDS = new Set(["A", "V", "V Bottom / A Top"]);
const DIM_SQUARE_CLASS = "dim-square";
const BRIGHT_SQUARE_CLASS = "bright-square";
const BLINK_CLASS = "dim-square-blink";

type SvgElement = SVGElement & {
  dataset: DOMStringMap & {
    defaultOpacity?: string;
    defaultFill?: string;
  };
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
    // Blue phosphor dim tiles (#126894) stay dim; cyan bright tiles stay bright.
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

function markBright(el: SvgElement): void {
  el.classList.add(BRIGHT_SQUARE_CLASS);
}

function markDim(el: SvgElement): void {
  el.classList.add(DIM_SQUARE_CLASS);
  el.dataset.defaultOpacity = String(getElementOpacity(el));
  const fill = el.getAttribute("fill");
  if (fill) el.dataset.defaultFill = fill;
}

/** Classify SVG squares by opacity/fill; respects pre-tagged rects from generated SVG. */
export function classifyEmblemSquares(svg: SVGSVGElement): void {
  svg.querySelectorAll<SVGRectElement>("rect").forEach((rect) => {
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
    const isBackgroundLayer =
      use.id.startsWith("Layer") || /block/i.test(use.id);

    if (isBackgroundLayer || opacity < 0.95) {
      markDim(use);
    }
  });
}

export function attachEmblemHover(container: HTMLElement, svg: SVGSVGElement): () => void {
  const timeouts = new Set<number>();
  let intervalId: number | null = null;

  const dimSquares = (): SvgElement[] =>
    Array.from(svg.querySelectorAll<SvgElement>(`.${DIM_SQUARE_CLASS}`));

  const restoreSquare = (el: SvgElement): void => {
    el.classList.remove(BLINK_CLASS);
    if (el.dataset.defaultOpacity !== undefined) {
      el.style.opacity = el.dataset.defaultOpacity;
    } else {
      el.style.removeProperty("opacity");
    }
    if (el.dataset.defaultFill !== undefined) {
      el.setAttribute("fill", el.dataset.defaultFill);
    }
  };

  const restoreAll = (): void => {
    dimSquares().forEach(restoreSquare);
  };

  const pulseRandom = (): void => {
    const squares = dimSquares();
    if (!squares.length) return;

    const active = squares.filter((el) => el.classList.contains(BLINK_CLASS)).length;
    const maxConcurrent = 6;
    if (active >= maxConcurrent) return;

    const batch = Math.min(3, maxConcurrent - active);
    for (let i = 0; i < batch; i += 1) {
      const el = squares[Math.floor(Math.random() * squares.length)];
      if (el.classList.contains(BLINK_CLASS)) continue;

      const baseOpacity = parseOpacity(el.dataset.defaultOpacity);
      // Keep pulses local: small opacity lift, never full cyan wash.
      const boosted = Math.min(baseOpacity + 0.05 + Math.random() * 0.07, 0.28);
      if (boosted <= baseOpacity + 0.02) continue;

      el.classList.add(BLINK_CLASS);
      el.style.opacity = String(boosted);

      const timeout = window.setTimeout(() => {
        restoreSquare(el);
        timeouts.delete(timeout);
      }, 180 + Math.random() * 220);
      timeouts.add(timeout);
    }
  };

  const stopHover = (): void => {
    container.classList.remove("is-hovering");
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    timeouts.forEach((timeout) => window.clearTimeout(timeout));
    timeouts.clear();
    restoreAll();
  };

  const startHover = (): void => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    container.classList.add("is-hovering");
    pulseRandom();
    intervalId = window.setInterval(pulseRandom, 140);
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
    container.removeEventListener("mouseenter", startHover);
    container.removeEventListener("mouseleave", stopHover);
    container.removeEventListener("focusin", startHover);
    container.removeEventListener("focusout", onFocusOut);
  };
}
