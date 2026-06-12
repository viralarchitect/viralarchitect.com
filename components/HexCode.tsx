"use client";

import { useEffect, useState } from "react";
import { randHex } from "@/lib/format";

/* One shared interval mutates a random subscriber every 400ms —
   dozens of greebles, a single timer. */
type Subscriber = (hex: string) => void;
const subscribers = new Set<Subscriber>();
let ticker: ReturnType<typeof setInterval> | null = null;
let reducedMotion = false;

function subscribe(
  fn: Subscriber,
  digits: number,
  ticking: boolean,
): () => void {
  /* seed asynchronously so SSR markup (zeros) hydrates cleanly */
  const seed = setTimeout(() => fn(randHex(digits)), 0);
  if (ticking) {
    subscribers.add(fn);
    if (!ticker && !reducedMotion) {
      reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (!reducedMotion) {
        ticker = setInterval(() => {
          const all = Array.from(subscribers);
          const target = all[Math.floor(Math.random() * all.length)];
          if (target) target(randHex(digits));
        }, 400);
      }
    }
  }
  return () => {
    clearTimeout(seed);
    subscribers.delete(fn);
    if (subscribers.size === 0 && ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  };
}

type HexCodeProps = {
  digits?: number;
  /** When false, randomizes once on mount but never ticks. */
  ticking?: boolean;
};

/** Decorative hex readout. Renders zeros on the server, randomizes on mount. */
export function HexCode({ digits = 4, ticking = true }: HexCodeProps) {
  const [hex, setHex] = useState(`0x${"0".repeat(digits)}`);

  useEffect(() => subscribe(setHex, digits, ticking), [digits, ticking]);

  return <b suppressHydrationWarning>{hex}</b>;
}
