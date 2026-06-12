"use client";

/* Client bindings that wire generic hardware widgets to console state.
   These exist so server-rendered sections can embed interactive controls
   without passing functions across the server/client boundary. */

import { useState } from "react";
import { useConsole } from "@/components/ConsoleProvider";
import { ToggleSwitch } from "@/components/hardware/ToggleSwitch";
import { PushButton } from "@/components/hardware/PushButton";

/** TGL-01 — node bus accent: green (nominal) / amber (caution). */
export function AccentControl() {
  const { accent, setAccent, log } = useConsole();
  const amber = accent === "amber";

  return (
    <>
      <ToggleSwitch
        id="tgl-accent"
        caption={"TGL-01\nACCENT MODE"}
        legendOn="AMBER"
        legendOff="GREEN"
        ariaLabel="Console accent mode: green or amber"
        checked={amber}
        onChange={(next) => {
          setAccent(next ? "amber" : "green");
          log("TGL-01", `ACCENT BUS → ${next ? "AMBER / CAUTION" : "GREEN / NOMINAL"}`);
        }}
      />
      <span className="lcd">{amber ? "BUS: CAUTION" : "BUS: NOMINAL"}</span>
    </>
  );
}

/** TGL-02 — background grid projection. */
export function GridControl() {
  const { grid, setGrid, log } = useConsole();

  return (
    <ToggleSwitch
      id="tgl-grid"
      caption={"TGL-02\nGRID SYS"}
      legendOn="ON"
      legendOff="OFF"
      ariaLabel="Background grid system"
      checked={grid}
      onChange={(next) => {
        setGrid(next);
        log("TGL-02", `GRID SYS ${next ? "ENERGIZED" : "DARK"}`);
      }}
    />
  );
}

/** TGL-03 — CRT scanline emissions, gated behind a safety cover. */
export function ScanControl() {
  const { scan, setScan, log } = useConsole();

  return (
    <ToggleSwitch
      id="tgl-scan"
      caption={"TGL-03\nCRT SCAN"}
      legendOn="ON"
      legendOff="OFF"
      ariaLabel="CRT scanline overlay"
      checked={scan}
      covered
      onChange={(next) => {
        setScan(next);
        log("TGL-03", `CRT SCANLINES ${next ? "ACTIVE" : "SUPPRESSED"}`);
      }}
    />
  );
}

type NodeCommand = "ping" | "purge";

/** Per-node command key (PING / PURGE CACHE). */
export function NodeCommandButton({ command }: { command: NodeCommand }) {
  switch (command) {
    case "ping":
      return (
        <PushButton
          id="btn-ping"
          caption="PING"
          ariaLabel="Ping node"
          ledColor="green"
          size="sm"
          layout="row"
          onPress={() =>
            `PING 10.0.0.1 :: REPLY ${8 + Math.floor(Math.random() * 30)}ms :: TTL 64`
          }
        />
      );
    case "purge":
      return (
        <PushButton
          id="btn-purge"
          caption="PURGE"
          ariaLabel="Purge node cache"
          ledColor="amber"
          size="sm"
          layout="row"
          onPress={() => "CACHE PURGED :: 0 BYTES FREED :: ALREADY OPTIMAL"}
        />
      );
    default: {
      const exhaustive: never = command;
      throw new Error(`Unmapped node command: ${exhaustive}`);
    }
  }
}

/** SELF-TEST — chase-flashes its LED bank and reports nominal. */
export function SelfTestUnit() {
  const { log, blip } = useConsole();
  const [run, setRun] = useState(0);

  function press() {
    blip(1000);
    setRun((r) => r + 1);
    log("CMD", "DIAGNOSTIC COMPLETE :: ALL SYSTEMS NOMINAL");
  }

  return (
    <div className="btn-unit row">
      {[0, 1, 2].map((i) => (
        <span
          key={`${run}-${i}`}
          className={run > 0 ? "led chase" : "led"}
          style={{ "--chase": `${i * 0.18}s` } as React.CSSProperties}
        />
      ))}
      <button
        type="button"
        id="btn-test"
        className="pushbtn sm"
        aria-label="Run self test"
        onClick={press}
      />
      <span className="label">SELF-TEST</span>
    </div>
  );
}
