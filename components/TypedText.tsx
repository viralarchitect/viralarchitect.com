"use client";

import { useEffect, useState } from "react";
import { BOOT_DONE_EVENT } from "@/components/BootOverlay";

type TypedTextProps = {
  text: string;
  /** ms per character */
  speed?: number;
};

/** Types out text after the boot sequence completes (instant under reduced motion). */
export function TypedText({ text, speed = 22 }: TypedTextProps) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    let started = false;

    function start() {
      if (started) return;
      started = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setShown(text);
        return;
      }
      let i = 0;
      timer = setInterval(() => {
        i++;
        setShown(text.slice(0, i));
        if (i >= text.length && timer) clearInterval(timer);
      }, speed);
    }

    let booted = false;
    try {
      booted = sessionStorage.getItem("va-booted") === "1";
    } catch {
      booted = true;
    }

    if (booted) {
      start();
    } else {
      window.addEventListener(BOOT_DONE_EVENT, start, { once: true });
    }
    return () => {
      window.removeEventListener(BOOT_DONE_EVENT, start);
      if (timer) clearInterval(timer);
    };
  }, [text, speed]);

  return <span suppressHydrationWarning>{shown}</span>;
}
