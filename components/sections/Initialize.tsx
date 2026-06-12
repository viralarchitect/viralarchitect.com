import Image from "next/image";
import { Panel } from "@/components/Panel";
import { HexCode } from "@/components/HexCode";
import { TypedText } from "@/components/TypedText";
import { SOCIAL_LINKS } from "@/content/profile";

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
            <TypedText text={"15 years keeping enterprise lights on.\nBuilding automation that kills toil.\nShipping SaaS that earns revenue."} />
            <span className="blink-cursor" aria-hidden="true">
              _
            </span>
          </p>
          <div className="hero-telemetry">
            <a
              className="hexline hero-social-link"
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Viral Architect on Facebook"
            >
              UPLINK :: FACEBOOK :: <HexCode />
            </a>
            <a
              className="hexline hero-social-link"
              href={SOCIAL_LINKS.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Viral Architect on X"
            >
              RELAY :: X :: <HexCode />
            </a>
            <a
              className="hexline hero-social-link"
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nicholas King on LinkedIn"
            >
              STATUS :: LINKEDIN :: <b>ONLINE</b>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
