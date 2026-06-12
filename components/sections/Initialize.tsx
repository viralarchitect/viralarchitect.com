import Image from "next/image";
import { Panel } from "@/components/Panel";
import { HexCode } from "@/components/HexCode";
import { TypedText } from "@/components/TypedText";

export function Initialize() {
  return (
    <section className="section hero-section" id="initialize" aria-label="Initialize — hero">
      <div className="hero-grid">
        <Panel className="emblem-wrap">
          <Image
            src="/Viral-Architect-Logo.svg"
            width={400}
            height={400}
            alt="Viral Architect logo"
            priority
            unoptimized
          />
          <div className="emblem-caption">
            <span>EMBLEM v1.0</span>
            <span className="hexline">
              <HexCode />
            </span>
            <span>1:1 LOCKED</span>
          </div>
        </Panel>
        <div className="hero-copy">
          <p className="hero-tagline">
            {"// INITIALIZE :: PAYLOAD IDENTITY CONFIRMED"}
          </p>
          <h1>
            <span className="glitch">VIRAL</span>
            <br />
            <span className="accent glitch">ARCHITECT</span>
          </h1>
          <p className="hero-sub">
            <TypedText text="Designing systems that scale, spread, and execute." />
            <span className="blink-cursor" aria-hidden="true">
              _
            </span>
          </p>
          <div className="hero-telemetry">
            <span className="hexline">
              NODE <HexCode /> :: RELAY <HexCode />
            </span>
            <span className="hexline">
              STATUS: <b>NOMINAL</b>
            </span>
            <a className="hero-hw-link" href="#hardware">
              → OPEN CONTROL PLATE
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
