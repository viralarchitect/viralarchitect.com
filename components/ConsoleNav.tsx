"use client";

import { useEffect, useState } from "react";
import { useConsole } from "@/components/ConsoleProvider";
import { HexCode } from "@/components/HexCode";
import { localStamp, localTimeZoneAbbr } from "@/lib/format";

const LINKS = [
  { n: "01", label: "INIT", href: "#initialize" },
  { n: "02", label: "DEPLOY", href: "#deployments" },
  { n: "03", label: "COMMS", href: "#comms" },
  { n: "04", label: "SPECS", href: "#specs" },
  { n: "05", label: "UPLINK", href: "#uplink" },
];

export function ConsoleNav() {
  const { snd, setSnd, log, blip } = useConsole();
  const [clock, setClock] = useState({ time: "--:--:--", tz: "" });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock({ time: localStamp(now), tz: localTimeZoneAbbr(now) });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  function toggleSnd() {
    const next = !snd;
    setSnd(next);
    blip(1200);
    log("SND", `AUDIO FEEDBACK ${next ? "ENABLED" : "MUTED"}`);
  }

  return (
    <header className="console-nav">
      <span className="nav-mark glitch">VIRAL::ARCHITECT</span>
      <nav className="nav-links" aria-label="Section navigation">
        {LINKS.map((l) => (
          <a key={l.n} href={l.href}>
            <b>{l.n}</b>·{l.label}
          </a>
        ))}
      </nav>
      <div className="nav-status">
        <span className="hexline">
          SYS <HexCode />
        </span>
        {snd ? (
          <button
            type="button"
            className="mini-toggle"
            aria-pressed="true"
            onClick={toggleSnd}
          >
            SND ON
          </button>
        ) : (
          <button
            type="button"
            className="mini-toggle"
            aria-pressed="false"
            onClick={toggleSnd}
          >
            SND OFF
          </button>
        )}
        <span className="nav-clock" suppressHydrationWarning>
          {clock.time}
          {clock.tz ? ` ${clock.tz}` : ""}
        </span>
      </div>
    </header>
  );
}
