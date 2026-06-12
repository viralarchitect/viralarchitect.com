/** HSL ↔ RGB helpers for live console theming. */

export type Rgb = { r: number; g: number; b: number };

export function hslToRgb(h: number, s: number, l: number): Rgb {
  const sat = s / 100;
  const lit = l / 100;
  const c = (1 - Math.abs(2 * lit - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lit - c / 2;

  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

export function rgbString({ r, g, b }: Rgb): string {
  return `${r}, ${g}, ${b}`;
}

/** Map dial 0–100 across a full phosphor spectrum (lime → cyan → violet → amber). */
export function chromaHue(value: number): number {
  const t = value / 100;
  /* piecewise sweep for operator-friendly color stops */
  if (t <= 0.33) return 115 + t * 3 * 55; /* 115° lime → 170° cyan */
  if (t <= 0.66) return 170 + (t - 0.33) * 3 * 95; /* 170° → 265° violet */
  return 265 + (t - 0.66) * 3 * 80; /* 265° → 345° magenta-amber */
}

export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  const mix = Math.min(1, Math.max(0, t));
  return {
    r: Math.round(a.r + (b.r - a.r) * mix),
    g: Math.round(a.g + (b.g - a.g) * mix),
    b: Math.round(a.b + (b.b - a.b) * mix),
  };
}
