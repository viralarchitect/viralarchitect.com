"use client";

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
    <section className="section" id="hardware" aria-label="Interactive hardware">
      <div className="section-head">
        <h2>
          <span className="slash">{"//"}</span> INTERACTIVE HARDWARE
        </h2>
        <span className="meta">
          SEC.02 :: <HexCode /> :: TACTILE BUS ONLINE
        </span>
      </div>
      <Panel className="hw-plate">
        <div className="hw-head">
          <span className="hexline">
            CONTROL PLATE MK-III :: CHROMATIC BUS :: <HexCode />
          </span>
          <ResetControl />
        </div>

        <ChromaticPreview />

        <div className="hw-grid">
          <div className="hw-group">
            <span className="label">SWITCH BANK</span>
            <div className="hw-row switches">
              <div className="switch-slot">
                <AccentControl />
              </div>
              <div className="switch-slot">
                <GridControl />
              </div>
              <div className="switch-slot">
                <ScanControl />
              </div>
            </div>
            <AccentBusStatus />
          </div>

          <div className="hw-group hw-group-wide">
            <span className="label">ROTARY CONTROL — LIVE COLOR BUS</span>
            <div className="hw-row dials">
              <StyleDialControls />
            </div>
            <p className="hw-hint">
              DRAG · SCROLL · ARROW KEYS — DIALS REPAINT THE CONSOLE IN REAL TIME
            </p>
          </div>

          <div className="hw-group">
            <span className="label">COMMAND KEYS</span>
            <div className="hw-row">
              <CommandKeys />
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}
