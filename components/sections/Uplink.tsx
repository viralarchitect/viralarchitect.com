"use client";

import { useRef, useState } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Panel } from "@/components/Panel";
import { HexCode } from "@/components/HexCode";
import { useConsole } from "@/components/ConsoleProvider";
import { randHex } from "@/lib/format";

const CONTACT = "contact@viralarchitect.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LogState =
  | { kind: "empty" }
  | { kind: "error"; msg: string }
  | { kind: "transmitting"; lines: string[] }
  | { kind: "sent"; lines: string[]; mailto: string };

export function Uplink() {
  const { log, blip } = useConsole();
  const [logState, setLogState] = useState<LogState>({ kind: "empty" });
  const busy = useRef(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current) return;
    blip(1100);

    const form = e.currentTarget;
    const data = new FormData(form);
    const callsign = String(data.get("callsign") ?? "").trim();
    const freq = String(data.get("freq") ?? "").trim();
    const msg = String(data.get("msg") ?? "").trim();

    if (!callsign || !freq || !msg) {
      setLogState({
        kind: "error",
        msg: "ERROR :: TRANSMISSION INCOMPLETE — ALL FIELDS REQUIRED",
      });
      return;
    }
    if (!EMAIL_RE.test(freq)) {
      setLogState({
        kind: "error",
        msg: "ERROR :: RETURN FREQ MALFORMED — EXPECTED OPERATOR@DOMAIN.TLD",
      });
      return;
    }

    busy.current = true;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const sequence = [
      "VALIDATING PAYLOAD........... OK",
      "ENCRYPTING PAYLOAD [AES-256]. OK",
      "ROUTING VIA RELAY-07......... OK",
      `TRANSMISSION QUEUED :: ACK ${randHex(4)}`,
    ];
    const lines: string[] = [];
    for (const line of sequence) {
      lines.push(line);
      setLogState({ kind: "transmitting", lines: [...lines] });
      await new Promise((r) => setTimeout(r, reducedMotion ? 10 : 260));
    }
    const subject = encodeURIComponent(`[UPLINK] Transmission from ${callsign}`);
    const body = encodeURIComponent(`${msg}\n\n// RETURN FREQ: ${freq}`);
    setLogState({
      kind: "sent",
      lines,
      mailto: `mailto:${CONTACT}?subject=${subject}&body=${body}`,
    });
    log("TX", `UPLINK SEQUENCE COMPLETE :: OPERATOR ${callsign.toUpperCase()}`);
    busy.current = false;
  }

  return (
    <CollapsibleSection
      id="uplink"
      ariaLabel="Secure uplink — contact"
      title={
        <>
          <span className="slash">{"//"}</span> SECURE UPLINK
        </>
      }
      meta={
        <>
          SEC.06 :: <HexCode /> :: TX READY<span className="blink-cursor">_</span>
        </>
      }
    >
      <Panel className="uplink-panel" innerClassName="black">
        <p className="hexline uplink-lede">
          UPLINK TERMINAL :: ALL TRAFFIC ENCRYPTED :: <HexCode />
          <span className="blink-cursor">_</span>
        </p>
        <form className="uplink-form" onSubmit={onSubmit} noValidate>
            <div className="prompt-line">
              <label htmlFor="f-callsign">CALLSIGN:</label>
              <input
                id="f-callsign"
                name="callsign"
                type="text"
                autoComplete="name"
                spellCheck={false}
                placeholder="OPERATOR NAME"
              />
            </div>
            <div className="prompt-line">
              <label htmlFor="f-freq">RETURN FREQ:</label>
              <input
                id="f-freq"
                name="freq"
                type="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="OPERATOR@DOMAIN.TLD"
              />
            </div>
            <div className="prompt-line">
              <label htmlFor="f-msg">ENTER TRANSMISSION:</label>
              <textarea
                id="f-msg"
                name="msg"
                spellCheck={false}
                placeholder="MESSAGE PAYLOAD..."
              />
            </div>
            <div className="uplink-actions">
              <button className="execute-btn" type="submit">
                [ EXECUTE ]
              </button>
              <span className="hexline">
                ROUTE :: RELAY-07 :: <HexCode />
              </span>
            </div>
            <pre className="uplink-log" aria-live="polite">
              {logState.kind === "error" && (
                <span className="err">{logState.msg}</span>
              )}
              {(logState.kind === "transmitting" || logState.kind === "sent") &&
                logState.lines.join("\n")}
              {logState.kind === "sent" && (
                <>
                  {"\n\nNOTE :: UPLINK RELAY IS IN DRY-RUN MODE.\nFIRE DIRECT CHANNEL → "}
                  <a href={logState.mailto}>{CONTACT.toUpperCase()}</a>
                </>
              )}
            </pre>
        </form>
      </Panel>
    </CollapsibleSection>
  );
}
