"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { loadAnimation } from "./loadAnimation";
import "./equipqr.css";

export function EquipQRModel() {
  const region = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const [paused, setPaused] = useState(false);
  const [Animation, setAnimation] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = region.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const preload = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "300px",
    });
    const playback = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    preload.observe(node);
    playback.observe(node);
    const onVisibility = () => setForeground(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    return () => {
      preload.disconnect();
      playback.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!near || reduced || paused || failed) return;
    let cancelled = false;
    loadAnimation()
      .then((component) => {
        if (!cancelled) setAnimation(() => component);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [near, reduced, paused, failed]);

  const running = visible && foreground && !reduced && !paused && Animation;
  return (
    <figure className="equipqr-model" ref={region} aria-label="EquipQR product demonstration">
      <figcaption className="eq-model-heading">
        <span>EQUIPQR / SYSTEM MODEL</span>
        {!reduced && !failed && (
          <button
            type="button"
            className="eq-motion-toggle"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
          >
            {paused ? "Play animation" : "Pause animation"}
          </button>
        )}
      </figcaption>
      <p className="sr-only">
        EquipQR tracks QR-coded equipment. The demonstration shows a QR code being scanned,
        equipment represented geographically, and the equipment record flowing into work-order and
        operational workflows.
      </p>
      <div
        className="equipqr-stage"
        aria-hidden="true"
        data-playback={running ? "running" : "static"}
      >
        {running ? (
          <Animation />
        ) : (
          // A native SVG image keeps the full map data out of the initial JavaScript bundle.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/equipqr/static-composite.svg"
            alt=""
            width="384"
            height="384"
            loading="lazy"
            className="eq-static"
          />
        )}
      </div>
      <p className="eq-model-caption">QR scan → equipment record → work order → export</p>
    </figure>
  );
}
