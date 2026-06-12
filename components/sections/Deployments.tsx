import Image from "next/image";
import { Panel } from "@/components/Panel";
import { HexCode } from "@/components/HexCode";
import { TeleBar, UptimeCounter } from "@/components/Telemetry";
import { AccentControl, NodeCommandButton } from "@/components/hardware/controls";

type Node = {
  id: string;
  flag: string;
  name: string;
  status: string;
  statusClass: "online" | "rnd";
  dotClass: "green" | "amber";
  img: string;
  imgAlt: string;
  desc: string;
  uptimeOffset: number;
  command: "ping" | "purge";
  tele: [number, number, number];
};

const NODES: Node[] = [
  {
    id: "NODE-01",
    flag: "FLAGSHIP",
    name: "EQUIPQR",
    status: "[ONLINE]",
    statusClass: "online",
    dotClass: "green",
    img: "https://placehold.co/800x450/050705/00FF41/png?text=EQUIPQR+::+LIVE+FEED",
    imgAlt: "EquipQR deployment screenshot placeholder",
    desc: "Flagship deployment. Asset management and tracking architecture.",
    uptimeOffset: 10166400,
    command: "ping",
    tele: [34, 51, 67],
  },
  {
    id: "NODE-02",
    flag: "R&D",
    name: "COLUMBIA CLOUDWORKS LLC",
    status: "[ACTIVE - R&D LAB]",
    statusClass: "rnd",
    dotClass: "amber",
    img: "https://placehold.co/800x450/050705/FFB000/png?text=COLUMBIA+CLOUDWORKS+::+R%26D+LAB",
    imgAlt: "Columbia Cloudworks LLC screenshot placeholder",
    desc: "Sole-proprietor development architecture for small business infrastructure.",
    uptimeOffset: 4153000,
    command: "purge",
    tele: [22, 44, 31],
  },
];

function NodeCard({ node }: { node: Node }) {
  return (
    <Panel className="node">
      <div className="node-head">
        <div>
          <span className="node-id">
            {node.id} :: {node.flag}
          </span>
          <h3>{node.name}</h3>
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
  return (
    <section className="section" id="deployments" aria-label="Active deployments — projects">
      <div className="section-head">
        <h2>
          <span className="slash">{"//"}</span> ACTIVE DEPLOYMENTS
        </h2>
        <span className="meta">
          SEC.02 :: <HexCode /> :: 2 NODES TRACKED
        </span>
      </div>
      <div className="ctrl-strip">
        <span className="screw tl" aria-hidden="true" />
        <span className="screw br" aria-hidden="true" />
        <AccentControl />
        <span className="strip-desc">
          NODE BUS ACCENT CONTROL :: FLIP TO RE-THEME THE CONSOLE FROM{" "}
          <b>GREEN / NOMINAL</b> TO <b>AMBER / CAUTION</b>. NON-CRITICAL CIRCUIT —
          OPERATOR DISCRETION.
        </span>
      </div>
      <div className="node-grid">
        {NODES.map((node) => (
          <NodeCard key={node.id} node={node} />
        ))}
      </div>
    </section>
  );
}
