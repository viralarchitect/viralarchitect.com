"use client";

import { useState } from "react";
import { useConsole } from "@/components/ConsoleProvider";

type ToggleSwitchProps = {
  id: string;
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
  id,
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

  return (
    <div className="switch-unit">
      {covered && (
        <button
          type="button"
          className={`safety-cover${coverOpen ? " open" : ""}`}
          aria-expanded={coverOpen}
          aria-label={`Safety cover for ${ariaLabel}`}
          onClick={toggleCover}
        >
          LIFT
        </button>
      )}
      <button
        type="button"
        id={id}
        className="toggle"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        tabIndex={covered && !coverOpen ? -1 : 0}
        onClick={flip}
      >
        <span className="toggle-legend legend-on">{legendOn}</span>
        <span className="toggle-track">
          <span className="toggle-lever" />
        </span>
        <span className="toggle-legend legend-off">{legendOff}</span>
      </button>
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
