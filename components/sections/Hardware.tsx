"use client";

import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Panel } from "@/components/Panel";
import { HexCode } from "@/components/HexCode";
import {
  AccentBusStatus,
  AccentControl,
  ChromaticPreview,
  CommandKeys,
  GridControl,
  ResetControl,
  ScanControl,
  StyleDialControls,
} from "@/components/hardware/controls";

export function Hardware() {
  return (
    <CollapsibleSection
      id="hardware"
      ariaLabel="Interactive hardware"
      defaultExpanded={false}
      expandOnHash
      title={
        <>
          <span className="slash">{"//"}</span> INTERACTIVE HARDWARE
        </>
      }
      meta={(expanded) => (
        <>
          SEC.02 :: <HexCode /> :: {expanded ? "TACTILE BUS ONLINE" : "PLATE STOWED"}
        </>
      )}
    >
      <Panel className="hw-plate">
        <div className="hw-head">
          <span className="hexline">
            CONTROL PLATE MK-III :: CHROMATIC BUS :: <HexCode />
          </span>
          <ResetControl />
        </div>

        <ChromaticPreview />

        <div className="hw-grid">
          <div className="hw-group hw-group-switches">
            <span className="label">SWITCH BANK</span>
            <div className="hw-row switches">
              <div className="switch-slot">
                <AccentControl />
              </div>
              <div className="switch-slot">
                <GridControl />
              </div>
              <div className="switch-slot switch-slot-covered">
                <ScanControl />
              </div>
            </div>
            <AccentBusStatus />
          </div>

          <div className="hw-controls-row">
            <div className="hw-group hw-group-dials">
              <span className="label">ROTARY CONTROL — LIVE COLOR BUS</span>
              <div className="hw-row dials">
                <StyleDialControls />
              </div>
              <p className="hw-hint">
                DRAG · SCROLL · ARROW KEYS — DIALS REPAINT THE CONSOLE IN REAL TIME
              </p>
            </div>

            <div className="hw-group hw-group-keys">
              <span className="label">COMMAND KEYS</span>
              <div className="hw-row keys">
                <CommandKeys />
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </CollapsibleSection>
  );
}
