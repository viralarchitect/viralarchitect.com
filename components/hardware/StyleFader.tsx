"use client";

import { useEffect, useRef } from "react";
import { clamp, pad } from "@/lib/format";

/** Serializable readout formats (server components can't pass functions). */
export type FaderFormat = "percent" | "hex";

function formatValue(format: FaderFormat, v: number): string {
  switch (format) {
    case "percent":
      return `${pad(v, 3)}%`;
    case "hex":
      return `0x${Math.round((v / 100) * 0xffff)
        .toString(16)
        .toUpperCase()
        .padStart(4, "0")}`;
    default: {
      const exhaustive: never = format;
      throw new Error(`Unhandled fader format: ${exhaustive}`);
    }
  }
}

type StyleFaderProps = {
  id: string;
  caption: string;
  ariaLabel: string;
  /** Controlled value, 0–100. */
  value: number;
  /** LCD readout format. Falls back to `displayValue` when provided. */
  format?: FaderFormat;
  /** Override LCD text (e.g. live chroma hex swatch code). */
  displayValue?: string;
  /** Spectrum track for hue/chroma; default intensity track. */
  track?: "intensity" | "spectrum";
  /** Optional secondary loadbar bound to the value. */
  showBar?: boolean;
  /** Live updates while dragging. */
  onValue: (v: number) => void;
  /** Fires once when the operator releases the fader. */
  onRelease?: (v: number) => void;
};

/** Horizontal console fader — native range input, touch + keyboard friendly. */
export function StyleFader({
  id,
  caption,
  ariaLabel,
  value,
  format = "percent",
  displayValue,
  track = "intensity",
  showBar = false,
  onValue,
  onRelease,
}: StyleFaderProps) {
  const loadbarRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const rounded = Math.round(clamp(value, 0, 100));
  const readout = displayValue ?? formatValue(format, rounded);

  useEffect(() => {
    loadbarRef.current?.style.setProperty("--w", `${rounded}%`);
    fillRef.current?.style.setProperty("--w", `${rounded}%`);
  }, [rounded]);

  function commit(raw: number) {
    onValue(Math.round(clamp(raw, 0, 100)));
  }

  return (
    <div className={`fader-unit${track === "spectrum" ? " spectrum" : ""}`}>
      <div className="fader-meta">
        <span className="label">{caption}</span>
        <span className="lcd" data-fader-lcd={id}>
          {readout}
        </span>
      </div>
      <div className="fader-track-wrap">
        <span
          ref={fillRef}
          className={`fader-fill${track === "spectrum" ? " spectrum" : ""}`}
          aria-hidden="true"
        />
        <input
          id={id}
          type="range"
          className={`fader-range${track === "spectrum" ? " spectrum" : ""}`}
          min={0}
          max={100}
          step={1}
          value={rounded}
          aria-label={ariaLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rounded}
          aria-valuetext={readout}
          onChange={(e) => commit(Number(e.target.value))}
          onPointerUp={(e) => {
            onRelease?.(Math.round(Number(e.currentTarget.value)));
          }}
          onKeyUp={(e) => {
            if (
              e.key === "ArrowLeft" ||
              e.key === "ArrowRight" ||
              e.key === "ArrowUp" ||
              e.key === "ArrowDown" ||
              e.key === "Home" ||
              e.key === "End" ||
              e.key === "PageUp" ||
              e.key === "PageDown"
            ) {
              onRelease?.(Math.round(Number(e.currentTarget.value)));
            }
          }}
        />
      </div>
      {showBar && (
        <span className="loadbar" ref={loadbarRef}>
          <span className="loadbar-fill" />
        </span>
      )}
    </div>
  );
}
