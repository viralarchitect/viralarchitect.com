import { EmblemLogo } from "@/components/EmblemLogo";
import { Panel } from "@/components/Panel";
import { HexCode } from "@/components/HexCode";
import { TypedText } from "@/components/TypedText";
import { PROFILE, SOCIAL_LINKS } from "@/content/profile";

export function Initialize() {
  return (
    <section className="section hero-section" id="initialize" aria-label="Initialize — hero">
      <div className="hero-grid">
        <Panel className="emblem-wrap">
          <EmblemLogo />
          <div className="emblem-caption">
            <span>EMBLEM v1.0</span>
            <span className="hexline">
              <HexCode ticking={false} />
            </span>
            <span>1:1 LOCKED</span>
          </div>
        </Panel>
        <div className="hero-copy">
          <p className="hero-tagline">{PROFILE.heroIdentity}</p>
          <p className="hero-role">
            Site Reliability Engineer<span>Production Infrastructure Engineer</span>
          </p>
          <h1>
            <span>VIRAL</span>
            <br />
            <span className="accent">ARCHITECT</span>
          </h1>
          <p className="hero-sub">
            <TypedText text={PROFILE.heroStatement} />
            <span className="blink-cursor" aria-hidden="true">
              _
            </span>
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#reliability">
              See reliability work ↓
            </a>
            <a className="text-link" href="#uplink">
              Contact me ↗
            </a>
          </div>
          <div className="hero-telemetry">
            <a
              className="hexline hero-social-link recruiter-link"
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nicholas King on LinkedIn"
            >
              LINKEDIN ↗
            </a>
            <a
              className="hexline hero-social-link"
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Viral Architect on Facebook"
            >
              FACEBOOK :: <HexCode ticking={false} />
            </a>
            <a
              className="hexline hero-social-link"
              href={SOCIAL_LINKS.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Viral Architect on X"
            >
              X :: <HexCode ticking={false} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
