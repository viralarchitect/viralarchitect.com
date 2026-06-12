"use client";

import { useRef, useState } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Panel } from "@/components/Panel";
import { HexCode } from "@/components/HexCode";
import { useConsole } from "@/components/ConsoleProvider";
import { TurnstileWidget, resetTurnstileWidget } from "@/components/TurnstileWidget";
import { randHex } from "@/lib/format";
import {
  UPLINK_EMAIL_RE,
  UPLINK_MAX_CALLSIGN,
  UPLINK_MAX_MESSAGE,
} from "@/lib/uplink-validation";

type LogState =
  | { kind: "empty" }
  | { kind: "error"; msg: string }
  | { kind: "transmitting"; lines: string[] }
  | { kind: "sent"; lines: string[]; ack: string };

export function Uplink() {
  const { log, blip } = useConsole();
  const [logState, setLogState] = useState<LogState>({ kind: "empty" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const busy = useRef(false);

  function clearTurnstile() {
    setTurnstileToken("");
    resetTurnstileWidget();
  }

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
    if (!UPLINK_EMAIL_RE.test(freq)) {
      setLogState({
        kind: "error",
        msg: "ERROR :: RETURN FREQ MALFORMED — EXPECTED OPERATOR@DOMAIN.TLD",
      });
      return;
    }
    if (callsign.length > UPLINK_MAX_CALLSIGN) {
      setLogState({
        kind: "error",
        msg: "ERROR :: CALLSIGN EXCEEDS MAX LENGTH",
      });
      return;
    }
    if (msg.length > UPLINK_MAX_MESSAGE) {
      setLogState({
        kind: "error",
        msg: "ERROR :: MESSAGE PAYLOAD EXCEEDS MAX LENGTH",
      });
      return;
    }
    if (!turnstileToken) {
      setLogState({
        kind: "error",
        msg: "ERROR :: BOT CHECK INCOMPLETE — RETRY CHALLENGE",
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

    let res: Response;
    try {
      res = await fetch("/api/uplink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callsign,
          freq,
          msg,
          turnstileToken,
          _checksum: String(data.get("_checksum") ?? ""),
        }),
      });
    } catch {
      setLogState({
        kind: "error",
        msg: "ERROR :: RELAY FAILURE — CHANNEL BUSY",
      });
      clearTurnstile();
      busy.current = false;
      return;
    }

    const payload = (await res.json().catch(() => null)) as {
      ack?: string;
      error?: string;
    } | null;

    if (!res.ok || !payload?.ack) {
      setLogState({
        kind: "error",
        msg:
          payload?.error ??
          (res.status === 403
            ? "ERROR :: BOT CHECK FAILED — RETRY CHALLENGE"
            : "ERROR :: RELAY FAILURE — CHANNEL BUSY"),
      });
      clearTurnstile();
      busy.current = false;
      return;
    }

    setLogState({
      kind: "sent",
      lines,
      ack: payload.ack,
    });
    log("TX", `UPLINK SEQUENCE COMPLETE :: OPERATOR ${callsign.toUpperCase()}`);
    clearTurnstile();
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
          <input
            className="uplink-honeypot"
            type="text"
            name="_checksum"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
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
          <TurnstileWidget
            onToken={setTurnstileToken}
            onError={clearTurnstile}
            onExpire={clearTurnstile}
          />
          <div className="uplink-actions">
            <button
              className="execute-btn"
              type="submit"
              disabled={!turnstileToken}
            >
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
                {"\n\nTRANSMISSION DELIVERED :: ACK "}
                {logState.ack}
              </>
            )}
          </pre>
        </form>
      </Panel>
    </CollapsibleSection>
  );
}
