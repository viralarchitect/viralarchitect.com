import Image from "next/image";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Panel } from "@/components/Panel";
import { HexCode } from "@/components/HexCode";
import { UptimeYears } from "@/components/Telemetry";
import { PROFILE, SPEC_ROWS } from "@/content/profile";

export function Specs() {
  return (
    <CollapsibleSection
      id="specs"
      ariaLabel="System specs — background and resume"
      title={
        <>
          <span className="slash">{"//"}</span> SYSTEM SPECS
        </>
      }
      meta={
        <>
          SEC.05 :: <HexCode /> :: SPEC SHEET v16
        </>
      }
    >
      <Panel>
        <div className="specs-grid">
          <div className="bio-badge">
            <div className="bio-frame">
              <Image
                src="/Nicholas-King-Photo.jpg"
                width={200}
                height={200}
                alt={`Portrait of ${PROFILE.name}`}
              />
              <span className="bio-scan" aria-hidden="true" />
            </div>
            <div className="bio-data">
              SUBJECT :: <b>{PROFILE.name.toUpperCase()}</b>
              <br />
              ROLE :: <b>{PROFILE.role.toUpperCase()}</b>
              <br />
              CLEARANCE :: <b>LEVEL-5 / ROOT</b>
              <br />
              BADGE :: <b>{PROFILE.badge}</b>
              <br />
              SCAN :: <b>VERIFIED ✓</b>
            </div>
          </div>
          <div>
            <p className="spec-intro">{PROFILE.summary}</p>
            <table className="spec-table">
              <tbody>
                {SPEC_ROWS.map((row) => (
                  <tr key={row.k}>
                    <th scope="row">{row.k}</th>
                    <td>
                      {row.v}
                      {row.k === "UPTIME" ? (
                        <UptimeYears startYear={PROFILE.careerStartYear} />
                      ) : (
                        <small>{row.sub}</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="micro-readouts">
              <span aria-hidden="true">
                CORE TEMP <b>36.8°C</b>
              </span>
              <span aria-hidden="true">
                VOLTAGE <b>3.3V OK</b>
              </span>
              <span aria-hidden="true">
                FAN <b>2400 RPM</b>
              </span>
              <span className="hexline" aria-hidden="true">
                <HexCode />
              </span>
            </div>
          </div>
        </div>
      </Panel>
    </CollapsibleSection>
  );
}
