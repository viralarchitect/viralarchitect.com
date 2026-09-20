"use client";
import { useEffect, useState } from "react";
type TypedTextProps = { text: string; speed?: number };
export function TypedText({ text, speed = 22 }: TypedTextProps) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let index = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setInterval(
      () => {
        index = reduced ? text.length : index + 1;
        setShown(text.slice(0, index));
        if (index >= text.length) clearInterval(timer);
      },
      reduced ? 1 : speed,
    );
    return () => clearInterval(timer);
  }, [text, speed]);
  return (
    <span className="typed-text">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
