"use client";

import { useState } from "react";
import { useConsole } from "@/components/ConsoleProvider";

type ToggleSwitchProps = {
  /** Two-line caption under the switch, e.g. "TGL-01\nACCENT MODE". */
  caption: string;
  legendOn: string;
  legendOff: string;
  ariaLabel: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Hazard-striped safety cover that must be lifted before flipping. */
  covered?: boolean;
};

/** Aerospace-style toggle switch with optional safety cover. */
export function ToggleSwitch({
  caption,
  legendOn,
  legendOff,
  ariaLabel,
  checked,
  onChange,
  covered = false,
}: ToggleSwitchProps) {
  const { log, blip } = useConsole();
  const [coverOpen, setCoverOpen] = useState(false);
  const [line1, line2] = caption.split("\n");

  function flip() {
    const next = !checked;
    blip(next ? 1600 : 900);
    onChange(next);
  }

  function toggleCover() {
    const open = !coverOpen;
    setCoverOpen(open);
    blip(open ? 500 : 350);
    log(
      "CVR",
      open ? "SAFETY COVER OPEN — SWITCH ARMED" : "SAFETY COVER CLOSED — SWITCH SAFED",
    );
  }

  const toggleTabIndex = covered && !coverOpen ? -1 : 0;
  const toggleFace = (
    <>
      <span className="toggle-legend legend-on">{legendOn}</span>
      <span className="toggle-track">
        <span className="toggle-lever" />
      </span>
      <span className="toggle-legend legend-off">{legendOff}</span>
    </>
  );

  return (
    <div className="switch-unit">
      {covered &&
        (coverOpen ? (
          <button
            type="button"
            className="safety-cover open"
            aria-expanded="true"
            aria-label={`Safety cover for ${ariaLabel}`}
            onClick={toggleCover}
          >
            LIFT
          </button>
        ) : (
          <button
            type="button"
            className="safety-cover"
            aria-expanded="false"
            aria-label={`Safety cover for ${ariaLabel}`}
            onClick={toggleCover}
          >
            LIFT
          </button>
        ))}
      {checked ? (
        <button
          type="button"
          className="toggle"
          role="switch"
          aria-checked="true"
          aria-label={ariaLabel}
          tabIndex={toggleTabIndex}
          onClick={flip}
        >
          {toggleFace}
        </button>
      ) : (
        <button
          type="button"
          className="toggle"
          role="switch"
          aria-checked="false"
          aria-label={ariaLabel}
          tabIndex={toggleTabIndex}
          onClick={flip}
        >
          {toggleFace}
        </button>
      )}
      <span className="label">
        {line1}
        {line2 && (
          <>
            <br />
            {line2}
          </>
        )}
      </span>
    </div>
  );
}
