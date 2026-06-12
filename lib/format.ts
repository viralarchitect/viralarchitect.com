/** Shared formatting helpers for console readouts. */

export function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

export function randHex(digits: number): string {
  let s = "";
  for (let i = 0; i < digits; i++) {
    s += "0123456789ABCDEF"[Math.floor(Math.random() * 16)];
  }
  return `0x${s}`;
}

export function utcStamp(date: Date): string {
  return `${pad(date.getUTCHours(), 2)}:${pad(date.getUTCMinutes(), 2)}:${pad(
    date.getUTCSeconds(),
    2,
  )}`;
}

export function localStamp(date: Date): string {
  return `${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(
    date.getSeconds(),
    2,
  )}`;
}

export function localTimeZoneAbbr(date: Date): string {
  const part = new Intl.DateTimeFormat(undefined, {
    timeZoneName: "short",
  })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? "LOCAL";
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Deterministic pseudo-random in [0, 1) — safe for SSR + hydration. */
export function seeded(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
