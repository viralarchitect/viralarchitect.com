import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const alt = "Nicholas King — Site Reliability Engineer / Production Infrastructure Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public", "Viral-Architect-Logo.svg"));
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#0b0c10",
        color: "#e2e9ef",
        padding: 54,
        alignItems: "center",
        borderTop: "8px solid #00bcff",
      }}
    >
      {/* A source-owned SVG embedded in the generated social PNG; no remote image dependency. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/svg+xml;base64,${logo.toString("base64")}`}
        alt=""
        width={280}
        height={280}
      />
      <div style={{ display: "flex", flexDirection: "column", paddingLeft: 44, flex: 1 }}>
        <div style={{ color: "#00bcff", fontSize: 20, letterSpacing: 3 }}>VIRAL::ARCHITECT</div>
        <div style={{ fontSize: 62, fontWeight: 700, marginTop: 24 }}>Nicholas King</div>
        <div style={{ fontSize: 37, color: "#00bcff", marginTop: 16 }}>
          Site Reliability Engineer
        </div>
        <div style={{ fontSize: 24, marginTop: 8 }}>Production Infrastructure Engineer</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 23,
            color: "#b4c0cb",
            marginTop: 36,
            lineHeight: 1.6,
          }}
        >
          15+ years · Production reliability
          <br />
          Incident response · Automation · Software
        </div>
        <div style={{ fontSize: 18, color: "#b4c0cb", marginTop: 30 }}>viralarchitect.com</div>
      </div>
    </div>,
    size,
  );
}
