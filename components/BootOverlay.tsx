"use client";

import { useEffect, useRef, useState } from "react";
import { HexCode } from "@/components/HexCode";

const LINES = ["ESTABLISHING SECURE CONNECTION...", "LOADING VIRAL PAYLOAD..."];
const SESSION_KEY = "va-booted";
export const BOOT_DONE_EVENT = "va:boot-done";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function alreadyBooted(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/** Terminal boot sequence. Skippable; never replays within a session. */
export function BootOverlay() {
  const [killed, setKilled] = useState(false);
  const [done, setDone] = useState(false);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [granted, setGranted] = useState(false);
  const finished = useRef(false);
  const progressFillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    function finish() {
      if (finished.current) return;
      finished.current = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* private mode */
      }
      setDone(true);
      window.dispatchEvent(new Event(BOOT_DONE_EVENT));
      setTimeout(() => setKilled(true), 300);
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (alreadyBooted() || reducedMotion) {
      finished.current = true;
      /* deferred so hydration completes against the SSR markup first */
      const skip = setTimeout(() => {
        setDone(true);
        setKilled(true);
        window.dispatchEvent(new Event(BOOT_DONE_EVENT));
      }, 0);
      return () => clearTimeout(skip);
    }

    const onKey = () => finish();
    document.addEventListener("keydown", onKey);

    (async () => {
      for (let li = 0; li < LINES.length; li++) {
        for (let ci = 0; ci <= LINES[li].length; ci++) {
          if (cancelled || finished.current) return;
          const doneLines = LINES.slice(0, li).join("\n");
          setText(
            `${doneLines}${li ? "\n" : ""}${LINES[li].slice(0, ci)}█`,
          );
          await sleep(16);
        }
        setText(LINES.slice(0, li + 1).join("\n"));
        await sleep(180);
      }
      for (let p = 0; p <= 100; p += 5) {
        if (cancelled || finished.current) return;
        setProgress(p);
        await sleep(28);
      }
      if (cancelled || finished.current) return;
      setGranted(true);
      await sleep(750);
      finish();
    })();

    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    progressFillRef.current?.style.setProperty("--boot-w", `${progress}%`);
  }, [progress]);

  if (killed) return null;

  return (
    <div
      className={`boot-overlay${done ? " done" : ""}`}
      role="status"
      aria-live="polite"
      onPointerDown={() => {
        if (!finished.current) {
          finished.current = true;
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* private mode */
          }
          setDone(true);
          window.dispatchEvent(new Event(BOOT_DONE_EVENT));
          setTimeout(() => setKilled(true), 300);
        }
      }}
    >
      <div className="boot-term">
        <div className="boot-term-bar">
          <span>VA-TERM v3.1.7 // SECURE SHELL</span>
          <span className="hexline">
            <HexCode />
          </span>
        </div>
        <pre className="boot-text">{text}</pre>
        <div className="boot-progress" aria-hidden="true">
          <div ref={progressFillRef} className="boot-progress-fill" />
        </div>
        <div className={`boot-granted${granted ? " show" : ""}`}>
          ACCESS GRANTED
        </div>
        <div className="boot-hint">[ PRESS ANY KEY TO SKIP ]</div>
      </div>
    </div>
  );
}
