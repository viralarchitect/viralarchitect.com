import Image from "next/image";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Panel } from "@/components/Panel";
import { HexCode } from "@/components/HexCode";
import { UptimeYears } from "@/components/Telemetry";

const SPEC_ROWS: Array<{ k: string; v: string; sub: string }> = [
  {
    k: "UPTIME",
    v: "SYSTEM ACTIVE SINCE 2011",
    sub: "", // rendered via <UptimeYears />
  },
  {
    k: "CORE INFRASTRUCTURE",
    v: "WINDOWS SERVER & ACTIVE DIRECTORY ADMINISTRATION",
    sub: "IDENTITY, GPO, DNS/DHCP, VIRTUALIZATION, PATCH ORCHESTRATION",
  },
  {
    k: "ARCHITECTURE",
    v: "B.S. NETWORK TECHNOLOGIES, INFORMATION SYSTEMS",
    sub: "FORMAL SCHEMATIC :: NETWORK + SYSTEMS DESIGN",
  },
  {
    k: "CURRENT DEPLOYMENT",
    v: "ENTERPRISE-LEVEL AD / SERVER ADMIN OPS",
    sub: "PRODUCTION ENVIRONMENT :: 24/7 DUTY CYCLE",
  },
];

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
          SEC.05 :: <HexCode /> :: SPEC SHEET v15
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
                alt="Portrait of Nicholas King"
              />
              <span className="bio-scan" aria-hidden="true" />
            </div>
            <div className="bio-data">
              SUBJECT :: <b>KING, NICHOLAS</b>
              <br />
              ROLE :: <b>SYSTEMS ARCHITECT</b>
              <br />
              CLEARANCE :: <b>LEVEL-5 / ROOT</b>
              <br />
              BADGE :: <b>VA-2011-NK</b>
              <br />
              SCAN :: <b>VERIFIED ✓</b>
            </div>
          </div>
          <div>
            <table className="spec-table">
              <tbody>
                {SPEC_ROWS.map((row) => (
                  <tr key={row.k}>
                    <th scope="row">{row.k}</th>
                    <td>
                      {row.v}
                      {row.k === "UPTIME" ? <UptimeYears /> : <small>{row.sub}</small>}
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
