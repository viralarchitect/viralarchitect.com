"use client";
import { useRef, useState } from "react";
import { Panel } from "@/components/Panel";
import { TurnstileWidget, resetTurnstileWidget } from "@/components/TurnstileWidget";
import { UPLINK } from "@/content/profile";
import { UPLINK_EMAIL_RE, UPLINK_MAX_CALLSIGN, UPLINK_MAX_MESSAGE } from "@/lib/uplink-validation";

type Status = { kind: "idle" | "sending" | "sent" | "error"; message: string };
export function Uplink() {
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });
  const [token, setToken] = useState("");
  const busy = useRef(false);
  function clearToken() {
    setToken("");
    resetTurnstileWidget();
  }
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const callsign = String(data.get("callsign") ?? "").trim();
    const freq = String(data.get("freq") ?? "").trim();
    const msg = String(data.get("msg") ?? "").trim();
    if (!callsign || !freq || !msg) {
      setStatus({ kind: "error", message: "Please fill in your name, email, and message." });
      return;
    }
    if (!UPLINK_EMAIL_RE.test(freq)) {
      setStatus({ kind: "error", message: "Please enter a valid email address." });
      return;
    }
    if (callsign.length > UPLINK_MAX_CALLSIGN || msg.length > UPLINK_MAX_MESSAGE) {
      setStatus({ kind: "error", message: "Please shorten your name or message and try again." });
      return;
    }
    if (!token) {
      setStatus({
        kind: "error",
        message: "Please complete the spam check, or use the email link above.",
      });
      return;
    }
    busy.current = true;
    setStatus({ kind: "sending", message: "Sending your message…" });
    try {
      const response = await fetch("/api/uplink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callsign,
          freq,
          msg,
          turnstileToken: token,
          _checksum: String(data.get("_checksum") ?? ""),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ack) {
        setStatus({
          kind: "error",
          message:
            response.status === 403
              ? "The spam check expired. Please try it again, or email me directly."
              : "Your message could not be sent. Please try again, or email me directly.",
        });
      } else {
        setStatus({ kind: "sent", message: "Message sent. Thanks for getting in touch." });
        form.reset();
      }
    } catch {
      setStatus({
        kind: "error",
        message: "Could not connect. Please try again, or email me directly.",
      });
    } finally {
      busy.current = false;
      clearToken();
    }
  }
  return (
    <section className="section" id="uplink" aria-labelledby="contact-heading">
      <div className="section-head">
        <h2 id="contact-heading">
          <span className="slash">{"//"}</span> CONTACT
        </h2>
        <span className="meta">05 / CONNECT</span>
      </div>
      <Panel className="uplink-panel">
        <div className="contact-layout">
          <div>
            <h3>Let’s talk.</h3>
            <p>Have a project, a systems challenge, or a question about my work?</p>
            <a className="contact-email" href={`mailto:${UPLINK.displayEmail}`}>
              {UPLINK.displayEmail} ↗
            </a>
          </div>
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
              <label htmlFor="f-callsign">Name</label>
              <input
                id="f-callsign"
                name="callsign"
                autoComplete="name"
                maxLength={UPLINK_MAX_CALLSIGN}
                required
              />
            </div>
            <div className="prompt-line">
              <label htmlFor="f-freq">Email</label>
              <input id="f-freq" name="freq" type="email" autoComplete="email" required />
            </div>
            <div className="prompt-line">
              <label htmlFor="f-msg">Message</label>
              <textarea id="f-msg" name="msg" maxLength={UPLINK_MAX_MESSAGE} required />
            </div>
            <TurnstileWidget onToken={setToken} onError={clearToken} onExpire={clearToken} />
            <div className="uplink-actions">
              <button
                className="execute-btn"
                type="submit"
                disabled={!token || status.kind === "sending"}
              >
                {status.kind === "sending" ? "Sending…" : "Send message ↗"}
              </button>
            </div>
            {!token && status.kind !== "sent" && (
              <p className="form-help">
                Waiting for spam verification. You can also email me directly.
              </p>
            )}
            <p className={`form-status ${status.kind}`} role="status">
              {status.message}
            </p>
          </form>
        </div>
      </Panel>
    </section>
  );
}
