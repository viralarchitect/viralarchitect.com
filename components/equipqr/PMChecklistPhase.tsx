import { useRef, useState, useEffect, useMemo } from "react";

import { gsap, useGSAP } from "./gsap";
import { Check } from "lucide-react";
import { PM_CHECKLIST_SECTIONS, ALL_PM_ITEMS, EXPORT_TARGETS } from "./pmChecklistData";

interface PMChecklistPhaseProps {
  /** 'left' = map on left 50%, checklist on right 50%
   *  'right' = map on right 50%, checklist on left 50% */
  slideDirection: "left" | "right";
  /**
   * Chosen dot's X position as a percentage of the full stage width.
   * Computed by HeroAnimation after accounting for the 50% map container.
   */
  dotStageX: number;
  /**
   * Chosen dot's Y position as a percentage of the full stage height.
   * Computed with the letterbox correction:
   *   dotStageY = 25 + (dot.cy / 100) * 50
   * so it reflects the actual rendered pixel position of the dot.
   */
  dotStageY: number;
  exportSeed: number;
  onComplete: () => void;
}

const ITEM_CHECK_INTERVAL = 0.25; // seconds between checkmarks
const PANEL_GAP = 1; // % of stage between map edge and checklist box

/**
 * Phase 5 work-order overlay.
 *
 * Layout:
 *   - Full-stage SVG carries the connector line that originates exactly at
 *     the chosen dot's stage-level position (dotStageX%, dotStageY%).
 *   - Checklist panel is ALWAYS vertically centered in its half of the stage
 *     so the button is always in view regardless of the dot's Y position.
 *   - Export button is always rendered; it becomes fully opaque only after
 *     the last checklist item is checked.
 */
export default function PMChecklistPhase({
  slideDirection,
  dotStageX,
  dotStageY,
  exportSeed,
  onComplete,
}: PMChecklistPhaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const exportTarget = useMemo(
    () => EXPORT_TARGETS[Math.abs(exportSeed) % EXPORT_TARGETS.length],
    [exportSeed],
  );

  const isLastItemChecked = checkedItems.size >= ALL_PM_ITEMS.length;

  // Sequential checkmarks via setTimeout — React state drives the check marks.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    ALL_PM_ITEMS.forEach((item, i) => {
      timers.push(
        setTimeout(
          () => setCheckedItems((prev) => new Set([...prev, item.id])),
          // 1.1 s to let line + box expand; then stagger checks
          1100 + i * ITEM_CHECK_INTERVAL * 1000,
        ),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // 5b: line grows FROM the dot outward toward the checklist panel.
      const farEdge = slideDirection === "left" ? "98%" : "2%";
      tl.fromTo(
        lineRef.current,
        { attr: { x2: `${dotStageX}%` } },
        { attr: { x2: farEdge }, duration: 0.5, ease: "power2.out" },
      );

      // 5c: checklist box expands from height-0
      tl.fromTo(
        boxRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.45, ease: "power2.out" },
        "-=0.1",
      );

      // 5f: button press simulation after all checks complete
      const allChecksMs = 1100 + ALL_PM_ITEMS.length * ITEM_CHECK_INTERVAL * 1000;
      const buttonPressDelay = allChecksMs / 1000 + 0.5;

      tl.to(btnRef.current, {
        scale: 0.94,
        duration: 0.12,
        ease: "power1.in",
        delay: buttonPressDelay,
      });
      tl.to(btnRef.current, { scale: 1, duration: 0.12, ease: "power1.out" });

      // 5f cont: fade out entire overlay.
      // Include lineRef explicitly so the connector line fades on the same
      // timeline as the box — relying solely on the container's CSS opacity
      // sometimes left the SVG line visible during the parent's stage fade.
      tl.to(
        [containerRef.current, lineRef.current],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power1.in",
          onComplete,
        },
        "+=0.3",
      );
    },
    { scope: containerRef, dependencies: [slideDirection, dotStageX, onComplete] },
  );

  // Checklist panel occupies the non-map 50% of the stage.
  const MAP_WIDTH = 50;
  const panelLeft = slideDirection === "left" ? `${MAP_WIDTH + PANEL_GAP}%` : `${PANEL_GAP}%`;
  const panelRight = slideDirection === "left" ? `${PANEL_GAP}%` : `${MAP_WIDTH + PANEL_GAP}%`;

  return (
    <div ref={containerRef} className="eq-checklist-overlay" data-testid="pm-checklist-phase">
      {/* Full-stage connector line — x1 fixed at dot, x2 animates outward */}
      <svg className="eq-connector" aria-hidden="true" overflow="visible">
        <line
          ref={lineRef}
          x1={`${dotStageX}%`}
          y1={`${dotStageY}%`}
          x2={`${dotStageX}%`}
          y2={`${dotStageY}%`}
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.7}
        />
      </svg>

      {/* Checklist panel — always vertically centered so the button is always visible */}
      <div
        className="eq-checklist-slot"
        style={{
          left: panelLeft,
          right: panelRight,
          top: 0,
          bottom: 0,
        }}
      >
        <div ref={boxRef} className="eq-checklist-card" style={{ height: 0, opacity: 0 }}>
          <p className="eq-order-title">Work Order</p>

          {PM_CHECKLIST_SECTIONS.map((section) => (
            <div key={section.title} className="eq-checklist-section">
              <p className="eq-checklist-heading">{section.title}</p>
              {section.items.map((item) => {
                const isChecked = checkedItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="eq-checklist-item"
                    data-testid={`checklist-item-${item.id}`}
                  >
                    <div
                      className={["eq-checkbox", isChecked ? "eq-checked" : "eq-unchecked"].join(
                        " ",
                      )}
                    >
                      {isChecked && <Check className="eq-checkmark" strokeWidth={3} aria-hidden />}
                    </div>
                    <span className="eq-item-label">{item.title}</span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Export button — always rendered; becomes active after last check */}
          <div
            ref={btnRef}
            className={[
              "eq-export",
              "eq-export-transition",
              isLastItemChecked ? "eq-export-ready" : "eq-export-waiting",
            ].join(" ")}
            data-testid="export-button"
          >
            <exportTarget.icon className="eq-export-icon" aria-hidden />
            {exportTarget.label}
          </div>
        </div>
      </div>
    </div>
  );
}
