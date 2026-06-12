"use client";

import { useId, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, KeyboardEvent } from "react";
import { useConsole } from "@/components/ConsoleProvider";
import { clamp, pad } from "@/lib/format";

/** Serializable readout formats (server components can't pass functions). */
export type DialFormat = "percent" | "hex" | "mhz";

function formatValue(format: DialFormat, v: number): string {
  switch (format) {
    case "percent":
      return `${pad(v, 3)}%`;
    case "hex":
      return `0x${Math.round((v / 100) * 0xffff)
        .toString(16)
        .toUpperCase()
        .padStart(4, "0")}`;
    case "mhz":
      return `${(87.5 + (v / 100) * 20.5).toFixed(1)} MHz`;
    default: {
      const exhaustive: never = format;
      throw new Error(`Unhandled dial format: ${exhaustive}`);
    }
  }
}

type RotaryDialProps = {
  id: string;
  caption: string;
  ariaLabel: string;
  /** Initial value, 0–100 (uncontrolled mode). */
  initial?: number;
  /** Controlled value, 0–100. */
  value?: number;
  /** LCD readout format. */
  format: DialFormat;
  /** Optional secondary loadbar bound to the value. */
  showBar?: boolean;
  size?: "md" | "sm";
  /** Row layout puts LCD/readouts beside the dial instead of below. */
  layout?: "column" | "row";
  /** Live updates while dragging. */
  onValue?: (v: number) => void;
  /** Fires once when the operator releases the dial. */
  onRelease?: (v: number) => void;
};

/** Rotary control: pointer-drag, scroll wheel, and arrow keys. */
export function RotaryDial({
  id,
  caption,
  ariaLabel,
  initial = 50,
  value: controlled,
  format,
  showBar = false,
  size = "md",
  layout = "column",
  onValue,
  onRelease,
}: RotaryDialProps) {
  const { log, blip } = useConsole();
  const gradId = useId();
  const [internal, setInternal] = useState(initial);
  const drag = useRef<{ startY: number; startVal: number } | null>(null);
  const value = controlled ?? internal;

  function commit(v: number) {
    const next = clamp(v, 0, 100);
    if (controlled === undefined) {
      setInternal(next);
    }
    onValue?.(Math.round(next));
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    drag.current = { startY: e.clientY, startVal: value };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    commit(drag.current.startVal + (drag.current.startY - e.clientY) * 0.55);
  }

  function onPointerUp() {
    if (!drag.current) return;
    drag.current = null;
    const rounded = Math.round(value);
    blip(700 + value * 8);
    if (onRelease) {
      onRelease(rounded);
    } else {
      log(
        "DIAL",
        `${ariaLabel.toUpperCase()} SET → ${formatValue(format, rounded)}`,
      );
    }
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    commit(value + (e.deltaY < 0 ? 3 : -3));
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight":
        commit(value + 2);
        e.preventDefault();
        break;
      case "ArrowDown":
      case "ArrowLeft":
        commit(value - 2);
        e.preventDefault();
        break;
      case "Home":
        commit(0);
        e.preventDefault();
        break;
      case "End":
        commit(100);
        e.preventDefault();
        break;
      default:
        break;
    }
  }

  const rounded = Math.round(value);
  const deg = -135 + (value / 100) * 270;

  const dial = (
    <div
      id={id}
      className={`dial${size === "sm" ? " sm" : ""}`}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={rounded}
      aria-valuetext={formatValue(format, rounded)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="rgba(138,139,140,0.35)"
          strokeWidth="2"
          strokeDasharray="2 6"
        />
        <circle cx="50" cy="50" r="38" fill="#0a0c10" stroke="#1f242b" strokeWidth="2" />
        <g className="dial-knob" style={{ transform: `rotate(${deg}deg)` }}>
          <circle
            cx="50"
            cy="50"
            r="30"
            fill={`url(#${gradId})`}
            stroke="#06070a"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="5"
            strokeDasharray="1.5 4.5"
          />
          <rect x="48" y="22" width="4" height="16" rx="2" fill="var(--accent)" />
        </g>
        <defs>
          <radialGradient id={gradId} cx="0.38" cy="0.3" r="0.9">
            <stop offset="0%" stopColor="#3b424b" />
            <stop offset="100%" stopColor="#181b20" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );

  const readouts = (
    <>
      <span className="lcd" data-dial-lcd={id}>
        {formatValue(format, rounded)}
      </span>
      {showBar && (
        <span className="loadbar">
          <span
            className="loadbar-fill"
            style={{ "--w": `${rounded}%` } as React.CSSProperties}
          />
        </span>
      )}
      <span className="label">{caption}</span>
    </>
  );

  if (layout === "row") {
    return (
      <div className="dial-unit row">
        {dial}
        <span className="dial-readouts">{readouts}</span>
      </div>
    );
  }
  return (
    <div className="dial-unit">
      {dial}
      {readouts}
    </div>
  );
}
