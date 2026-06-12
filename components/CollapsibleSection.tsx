"use client";

import { useEffect, useState, type ReactNode } from "react";

type CollapsibleSectionProps = {
  id: string;
  ariaLabel: string;
  title: ReactNode;
  meta: ReactNode | ((expanded: boolean) => ReactNode);
  defaultExpanded?: boolean;
  expandOnHash?: boolean;
  className?: string;
  children: ReactNode;
};

export function CollapsibleSection({
  id,
  ariaLabel,
  title,
  meta,
  defaultExpanded = true,
  expandOnHash = false,
  className = "",
  children,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const panelId = `${id}-panel`;

  useEffect(() => {
    if (!expandOnHash) return;

    const syncFromHash = () => {
      if (window.location.hash === `#${id}`) {
        setExpanded(true);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [expandOnHash, id]);

  const metaContent = typeof meta === "function" ? meta(expanded) : meta;

  const toggleHead = (
    <>
      <h2>{title}</h2>
      <span className="meta">
        {metaContent}
        <span className="section-toggle-glyph" aria-hidden="true">
          {" "}
          [
          <span className="section-glyph-stack">
            <span className={expanded ? "is-out" : "is-in"}>+</span>
            <span className={expanded ? "is-in" : "is-out"}>−</span>
          </span>
          ]
        </span>
      </span>
    </>
  );

  return (
    <section
      className={`section section-collapsible${expanded ? " is-expanded" : ""}${className ? ` ${className}` : ""}`}
      id={id}
      aria-label={ariaLabel}
    >
      {expanded ? (
        <button
          type="button"
          className="section-head section-head-toggle"
          aria-expanded="true"
          aria-controls={panelId}
          onClick={() => setExpanded(false)}
        >
          {toggleHead}
        </button>
      ) : (
        <button
          type="button"
          className="section-head section-head-toggle"
          aria-expanded="false"
          aria-controls={panelId}
          onClick={() => setExpanded(true)}
        >
          {toggleHead}
        </button>
      )}
      <div
        id={panelId}
        className="section-collapse"
        aria-hidden={!expanded}
        inert={!expanded || undefined}
      >
        <div className="section-collapse-inner">{children}</div>
      </div>
    </section>
  );
}
