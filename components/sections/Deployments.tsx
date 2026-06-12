import Image from "next/image";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Panel } from "@/components/Panel";
import { HexCode } from "@/components/HexCode";
import { TeleBar, UptimeCounter } from "@/components/Telemetry";
import { NodeCommandButton } from "@/components/hardware/controls";
import { DEPLOYMENT_NODES, type DeploymentNode } from "@/content/profile";

function NodeCard({ node }: { node: DeploymentNode }) {
  return (
    <Panel className="node">
      <div className="node-head">
        <div>
          <span className="node-id">
            {node.id} :: {node.flag}
          </span>
          <h3>{node.name}</h3>
          <span className="node-period">{node.period}</span>
        </div>
        <span className={`node-status ${node.statusClass}`}>
          <span className={`dot ${node.dotClass} blink`} />
          {node.status}
        </span>
      </div>
      <div className="node-screen">
        <Image src={node.img} width={800} height={450} alt={node.imgAlt} />
      </div>
      <p className="node-desc">
        <span className="tag">&gt;&gt;</span> {node.desc}
      </p>
      <ul className="node-highlights">
        {node.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="node-tele" aria-hidden="true">
        <span className="tele-cell">
          CPU <TeleBar initial={node.tele[0]} />
        </span>
        <span className="tele-cell">
          MEM <TeleBar initial={node.tele[1]} />
        </span>
        <span className="tele-cell">
          NET <TeleBar initial={node.tele[2]} />
        </span>
      </div>
      <div className="node-foot">
        <span>
          UPTIME <UptimeCounter offset={node.uptimeOffset} />
        </span>
        <NodeCommandButton command={node.command} />
        <span>
          REV <HexCode />
        </span>
      </div>
    </Panel>
  );
}

export function Deployments() {
  const nodeCount = DEPLOYMENT_NODES.length;

  return (
    <CollapsibleSection
      id="deployments"
      ariaLabel="Active deployments — professional experience and projects"
      title={
        <>
          <span className="slash">{"//"}</span> ACTIVE DEPLOYMENTS
        </>
      }
      meta={
        <>
          SEC.03 :: <HexCode /> :: {nodeCount} NODES TRACKED
        </>
      }
    >
      <div className="node-grid">
        {DEPLOYMENT_NODES.map((node) => (
          <NodeCard key={node.id} node={node} />
        ))}
      </div>
    </CollapsibleSection>
  );
}
