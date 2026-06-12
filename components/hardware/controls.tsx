"use client";

/* Client bindings that wire generic hardware widgets to console state.
   These exist so server-rendered sections can embed interactive controls
   without passing functions across the server/client boundary. */

import { useState } from "react";
import {
  DEFAULT_STYLE_DIALS,
  useConsole,
  type StyleDials,
} from "@/components/ConsoleProvider";
import { RotaryDial } from "@/components/hardware/RotaryDial";
import { ToggleSwitch } from "@/components/hardware/ToggleSwitch";
import { PushButton } from "@/components/hardware/PushButton";
import { chromaHue, hslToRgb, rgbString } from "@/lib/color";

/** TGL-01 — node bus accent: green (nominal) / amber (caution). */
export function AccentControl() {
  const { accent, setAccent, log } = useConsole();
  const amber = accent === "amber";

  return (
    <div className="switch-cluster">
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
    </div>
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

type DialKey = keyof StyleDials;

const DIAL_CONFIG: Array<{
  key: DialKey;
  id: string;
  caption: string;
  ariaLabel: string;
  format: "percent" | "hex";
  tag: string;
}> = [
  {
    key: "chroma",
    id: "dial-chroma",
    caption: "DIAL-A · CHROMA",
    ariaLabel: "Chroma hue dial",
    format: "hex",
    tag: "CHROMA",
  },
  {
    key: "phosphor",
    id: "dial-phosphor",
    caption: "DIAL-B · PHOSPHOR",
    ariaLabel: "Phosphor glow dial",
    format: "percent",
    tag: "PHOSPHOR",
  },
  {
    key: "cyanAux",
    id: "dial-cyan",
    caption: "DIAL-C · CYAN AUX",
    ariaLabel: "Cyan auxiliary dial",
    format: "percent",
    tag: "CYAN AUX",
  },
  {
    key: "ambient",
    id: "dial-ambient",
    caption: "DIAL-D · AMBIENT",
    ariaLabel: "Ambient wash dial",
    format: "percent",
    tag: "AMBIENT",
  },
];

function dialReadout(key: DialKey, value: number): string {
  switch (key) {
    case "chroma": {
      const rgb = hslToRgb(chromaHue(value), 100, 50);
      return `#${[rgb.r, rgb.g, rgb.b]
        .map((c) => c.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()}`;
    }
    case "phosphor":
      return `${value}%`;
    case "cyanAux":
      return `${value}%`;
    case "ambient":
      return `${value}%`;
    default: {
      const exhaustive: never = key;
      throw new Error(`Unhandled dial key: ${exhaustive}`);
    }
  }
}

/** Style dials — live color bus controls wired to ConsoleProvider. */
export function StyleDialControls() {
  const { styleDials, setStyleDial, log } = useConsole();

  return (
    <>
      {DIAL_CONFIG.map((dial) => (
        <RotaryDial
          key={dial.id}
          id={dial.id}
          caption={dial.caption}
          ariaLabel={dial.ariaLabel}
          value={styleDials[dial.key]}
          format={dial.format}
          showBar={dial.key === "phosphor"}
          size="sm"
          onValue={(v) => {
            setStyleDial(dial.key, v);
          }}
          onRelease={(v) => {
            log("DIAL", `${dial.tag} LOCKED → ${dialReadout(dial.key, v)}`);
          }}
        />
      ))}
    </>
  );
}

/** Chromatic preview strip — live swatches for each style bus. */
export function ChromaticPreview() {
  const { styleDials, accent } = useConsole();

  const accentRgb =
    accent === "amber"
      ? { r: 255, g: 176, b: 0 }
      : hslToRgb(chromaHue(styleDials.chroma), 100, 50);
  const cyanRgb = hslToRgb(186, 100, 35 + (styleDials.cyanAux / 100) * 25);
  const washRgb = hslToRgb(
    chromaHue(styleDials.chroma),
    55,
    8 + (styleDials.ambient / 100) * 14,
  );
  const glowAlpha = 0.15 + (styleDials.phosphor / 100) * 0.85;

  const swatches = [
    { label: "ACCENT", rgb: accentRgb },
    { label: "CYAN", rgb: cyanRgb },
    { label: "WASH", rgb: washRgb },
    {
      label: "GLOW",
      rgb: {
        r: Math.round(accentRgb.r * glowAlpha + 11 * (1 - glowAlpha)),
        g: Math.round(accentRgb.g * glowAlpha + 12 * (1 - glowAlpha)),
        b: Math.round(accentRgb.b * glowAlpha + 16 * (1 - glowAlpha)),
      },
    },
  ];

  return (
    <div className="chroma-preview" aria-label="Live chromatic bus preview">
      {swatches.map((swatch) => (
        <div key={swatch.label} className="chroma-swatch">
          <span
            className="chroma-fill"
            style={{
              background: `rgb(${rgbString(swatch.rgb)})`,
              boxShadow: `0 0 18px rgba(${rgbString(swatch.rgb)}, ${glowAlpha * 0.65})`,
            }}
          />
          <span className="label">{swatch.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Factory reset — restores all switches and style dials to nominal. */
export function ResetControl() {
  const { resetAll, blip, styleDials, accent, grid, scan } = useConsole();
  const [armed, setArmed] = useState(false);

  const isDefault =
    accent === "green" &&
    grid &&
    scan &&
    (Object.keys(DEFAULT_STYLE_DIALS) as DialKey[]).every(
      (key) => styleDials[key] === DEFAULT_STYLE_DIALS[key],
    );

  function press() {
    if (!armed) {
      setArmed(true);
      blip(420);
      return;
    }
    resetAll();
    setArmed(false);
    blip(220);
  }

  return (
    <div className="reset-unit">
      <button
        type="button"
        id="btn-reset"
        className={`reset-btn${armed ? " armed" : ""}${isDefault ? " nominal" : ""}`}
        aria-label={
          armed
            ? "Confirm factory reset of all style elements"
            : "Arm factory reset"
        }
        onClick={press}
        onBlur={() => setArmed(false)}
      >
        <span className="reset-guard" aria-hidden="true" />
        <span className="reset-face">
          {armed ? "CONFIRM" : isDefault ? "NOMINAL" : "RESET"}
        </span>
      </button>
      <span className="label">
        {armed ? "PRESS AGAIN TO RESTORE DEFAULTS" : "FACTORY RESET"}
      </span>
    </div>
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

/** Command keys for the hardware plate. */
export function CommandKeys() {
  return (
    <>
      <PushButton
        id="btn-hw-ping"
        caption="PING"
        ariaLabel="Ping network"
        ledColor="green"
        onPress={() =>
          `PING 10.0.0.1 :: REPLY ${8 + Math.floor(Math.random() * 30)}ms :: TTL 64`
        }
      />
      <PushButton
        id="btn-hw-purge"
        caption={"PURGE\nCACHE"}
        ariaLabel="Purge cache"
        ledColor="amber"
        onPress={() => "CACHE PURGED :: 0 BYTES FREED :: ALREADY OPTIMAL"}
      />
      <SelfTestUnit />
    </>
  );
}
