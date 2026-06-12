"use client";

import { useEffect, useRef, useState } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Panel } from "@/components/Panel";
import { HexCode } from "@/components/HexCode";
import { useConsole } from "@/components/ConsoleProvider";
import { pad, seeded } from "@/lib/format";

const BAR_COUNT = 48;
/* deterministic waveform heights — identical on server and client */
const BARS = Array.from({ length: BAR_COUNT }, (_, i) =>
  Math.min(18 + Math.round(Math.abs(Math.sin(i * 0.55)) * 60 + seeded(i) * 22), 100),
);

function WfBar({ height, index }: { height: number; index: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--h", String(height));
    el.style.setProperty("--d", `${(index * 0.045).toFixed(3)}s`);
  }, [height, index]);

  return <span ref={ref} className="wf-bar" />;
}

type PlayerState = "idle" | "connecting" | "playing" | "paused";

export function Comms() {
  const { log, blip } = useConsole();
  const [state, setState] = useState<PlayerState>("idle");
  const [lcd, setLcd] = useState("STANDBY :: EP.000");
  const [elapsed, setElapsed] = useState(0);
  const stateRef = useRef<PlayerState>("idle");

  /* ref mirrors state for async sequences; mutated only in event handlers */
  function transition(next: PlayerState) {
    stateRef.current = next;
    setState(next);
  }

  /* elapsed-time ticker runs only while playing */
  useEffect(() => {
    if (state !== "playing") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  async function pressPlay() {
    blip(800);
    switch (state) {
      case "idle": {
        transition("connecting");
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        for (let d = 0; d < 6; d++) {
          if (stateRef.current !== "connecting") return;
          setLcd(`CONNECTING${".".repeat((d % 3) + 1)}`);
          await new Promise((r) => setTimeout(r, reducedMotion ? 10 : 170));
        }
        if (stateRef.current !== "connecting") return;
        setLcd("▶ LIVE :: CHANGE ADVISORY BOARD");
        transition("playing");
        log("COMMS", "TRANSMISSION LINK ESTABLISHED :: CHANGE ADVISORY BOARD");
        break;
      }
      case "connecting": {
        break; /* ignore mashing during handshake */
      }
      case "playing": {
        transition("paused");
        setLcd("❚❚ TRANSMISSION PAUSED");
        log("COMMS", "TRANSMISSION PAUSED BY OPERATOR");
        break;
      }
      case "paused": {
        transition("playing");
        setLcd("▶ LIVE :: CHANGE ADVISORY BOARD");
        break;
      }
      default: {
        const exhaustive: never = state;
        throw new Error(`Unhandled player state: ${exhaustive}`);
      }
    }
  }

  return (
    <CollapsibleSection
      id="comms"
      ariaLabel="Comms array — podcast"
      title={
        <>
          <span className="slash">{"//"}</span> COMMS ARRAY
        </>
      }
      meta={
        <>
          SEC.04 :: <HexCode /> :: CHANNEL ENCRYPTED
        </>
      }
    >
      <Panel>
        <div className="comms-grid">
          <div className="comms-log">
            <span className="rx">
              RX LOG :: TRANSMISSION CHANNEL <b>CHANGE ADVISORY BOARD</b>
            </span>
            <h3 className="glitch">CHANGE ADVISORY BOARD</h3>
            <p>
              A recurring transmission on change management, IT operations, and
              the humans wedged inside the machine. War stories from the server
              room, process autopsies, and the occasional controlled burn.
            </p>
            <span className="rx">
              CADENCE :: <b>IRREGULAR — MONITOR THIS CHANNEL</b>
            </span>
            <span className="rx">
              CLASSIFICATION :: <b>OPEN BROADCAST / UNREDACTED</b>
            </span>
          </div>
          <div className={`player${state === "playing" ? " playing" : ""}`}>
            <div className="player-top">
              <button
                type="button"
                className="pushbtn play-btn"
                aria-label="Play or pause transmission"
                onClick={pressPlay}
              />
              <div className="player-lcds">
                <span className="lcd player-lcd-main">{lcd}</span>
                <div className="player-meta">
                  <span className="lcd">
                    {pad(Math.floor(elapsed / 60), 2)}:{pad(elapsed % 60, 2)}
                  </span>
                  <span className="hexline">
                    SIG <HexCode />
                  </span>
                </div>
              </div>
            </div>
            <div className="waveform" aria-hidden="true">
              {BARS.map((h, i) => (
                <WfBar key={i} height={h} index={i} />
              ))}
            </div>
            <div className="freq-strip player-footer">
              <span>
                MODE <b>AES-256</b>
              </span>
              <span>
                GAIN <b>+12dB</b>
              </span>
              <span>
                TUNE <b>91.7 MHz</b>
              </span>
              <span className="hexline">
                <HexCode />
              </span>
            </div>
          </div>
        </div>
      </Panel>
    </CollapsibleSection>
  );
}
