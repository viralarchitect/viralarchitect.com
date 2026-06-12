"use client";

import { useEffect, useRef, useState } from "react";
import { pad } from "@/lib/format";

/** Decorative loadbar that drifts to random values. */
export function TeleBar({ initial }: { initial: number }) {
  const [w, setW] = useState(initial);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    fillRef.current?.style.setProperty("--w", `${w}%`);
  }, [w]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(
      () => setW(Math.floor(10 + Math.random() * 80)),
      1800,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <span className="loadbar">
      <span ref={fillRef} className="loadbar-fill" />
    </span>
  );
}

/** Decorative node uptime ticker, seeded with an offset in seconds. */
export function UptimeCounter({ offset }: { offset: number }) {
  const [s, setS] = useState(offset);

  useEffect(() => {
    const t0 = Date.now();
    const t = setInterval(
      () => setS(offset + Math.floor((Date.now() - t0) / 1000)),
      1000,
    );
    return () => clearInterval(t);
  }, [offset]);

  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return (
    <b suppressHydrationWarning>
      {pad(d, 3)}:{pad(h, 2)}:{pad(m, 2)}:{pad(s % 60, 2)}
    </b>
  );
}

/** Years since the system came online (2011). Computed at render;
    suppressHydrationWarning covers the rare year-boundary mismatch. */
export function UptimeYears() {
  const years = new Date().getUTCFullYear() - 2011;
  return (
    <small suppressHydrationWarning>≈ {years} YRS CONTINUOUS OPERATION</small>
  );
}
