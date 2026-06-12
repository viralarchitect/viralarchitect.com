"use client";

import { useRef, useState } from "react";
import { useConsole } from "@/components/ConsoleProvider";

type PushButtonProps = {
  id: string;
  caption: string;
  ariaLabel: string;
  ledColor: "green" | "amber";
  size?: "md" | "sm";
  layout?: "column" | "row";
  /** Returns the ops-log message to print when pressed. */
  onPress: () => string;
};

/** Chunky recessed command key with status LED flash feedback. */
export function PushButton({
  id,
  caption,
  ariaLabel,
  ledColor,
  size = "md",
  layout = "column",
  onPress,
}: PushButtonProps) {
  const { log, blip } = useConsole();
  const [flashing, setFlashing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function press() {
    blip(1000);
    const msg = onPress();
    log("CMD", msg);
    setFlashing(false);
    /* restart LED animation on rapid presses */
    requestAnimationFrame(() => setFlashing(true));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlashing(false), 1000);
  }

  const ledClass = flashing
    ? ledColor === "amber"
      ? "led flash-amber"
      : "led flash-green"
    : "led";

  return (
    <div className={`btn-unit${layout === "row" ? " row" : ""}`}>
      <span className={ledClass} data-led={id} />
      <button
        type="button"
        id={id}
        className={`pushbtn${size === "sm" ? " sm" : ""}`}
        aria-label={ariaLabel}
        onClick={press}
      />
      <span className="label">{caption}</span>
    </div>
  );
}
