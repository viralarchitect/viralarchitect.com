"use client";

import { useEffect, useRef } from "react";
import { attachEmblemHover, classifyEmblemSquares } from "@/lib/emblem-hover";

const LOGO_SRC = "/Viral-Architect-Logo.svg";

export function EmblemLogo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let detachHover: (() => void) | undefined;
    let cancelled = false;

    fetch(LOGO_SRC)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load emblem (${response.status})`);
        return response.text();
      })
      .then((svgMarkup) => {
        if (cancelled) return;
        container.innerHTML = svgMarkup;

        const svg = container.querySelector("svg");
        if (!svg) return;

        svg.setAttribute("role", "presentation");
        svg.setAttribute("aria-hidden", "true");
        svg.classList.add("emblem-svg");

        classifyEmblemSquares(svg);
        detachHover = attachEmblemHover(container, svg);
      })
      .catch(() => {
        if (cancelled || !container) return;
        container.innerHTML = `<img src="${LOGO_SRC}" width="400" height="400" alt="" />`;
      });

    return () => {
      cancelled = true;
      detachHover?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="emblem-logo"
      role="img"
      aria-label="Viral Architect logo"
      tabIndex={0}
    />
  );
}
