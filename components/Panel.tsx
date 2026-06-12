import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Render corner crosshair greebles (default true). */
  crosshairs?: boolean;
};

/** Cut-corner console panel: accent shell + inset inner surface. */
export function Panel({
  children,
  className,
  innerClassName,
  crosshairs = true,
}: PanelProps) {
  return (
    <div className={`panel ${className ?? ""}`.trim()}>
      <div className={`panel-inner ${innerClassName ?? ""}`.trim()}>
        {crosshairs && (
          <>
            <span className="ch ch-tl" aria-hidden="true">
              +
            </span>
            <span className="ch ch-tr" aria-hidden="true">
              +
            </span>
            <span className="ch ch-bl" aria-hidden="true">
              +
            </span>
            <span className="ch ch-br" aria-hidden="true">
              +
            </span>
          </>
        )}
        {children}
      </div>
    </div>
  );
}
