"use client";

import { useEffect, useState } from "react";
import { useConsole } from "@/components/ConsoleProvider";
import { HexCode } from "@/components/HexCode";
import { utcStamp } from "@/lib/format";

const LINKS = [
  { n: "01", label: "INIT", href: "#initialize" },
  { n: "02", label: "DEPLOY", href: "#deployments" },
  { n: "03", label: "COMMS", href: "#comms" },
  { n: "04", label: "SPECS", href: "#specs" },
  { n: "05", label: "UPLINK", href: "#uplink" },
];

export function ConsoleNav() {
  const { snd, setSnd, log, blip } = useConsole();
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const tick = () => setClock(utcStamp(new Date()));
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
      <span className="nav-mark glitch">VA::CONSOLE</span>
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
        <button
          type="button"
          className="mini-toggle"
          aria-pressed={snd}
          onClick={toggleSnd}
        >
          SND {snd ? "ON" : "OFF"}
        </button>
        <span className="nav-clock" suppressHydrationWarning>
          {clock} UTC
        </span>
      </div>
    </header>
  );
}
