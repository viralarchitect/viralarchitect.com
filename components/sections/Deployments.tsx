import { Panel } from "@/components/Panel";
import { FEATURED_WORK } from "@/content/profile";
export function Deployments() {
  return (
    <section className="section" id="deployments" aria-labelledby="work-heading">
      <div className="section-head">
        <h2 id="work-heading">
          <span className="slash">{"//"}</span> SELECTED WORK
        </h2>
        <span className="meta">01 / BUILD</span>
      </div>
      <Panel className="featured-work">
        <div className="project-layout">
          <div>
            <p className="eyebrow">{FEATURED_WORK.category}</p>
            <h3>{FEATURED_WORK.name}</h3>
            <p className="project-summary">{FEATURED_WORK.description}</p>
            <p className="project-stack">{FEATURED_WORK.stack}</p>
            <a className="text-link" href="#uplink">
              Ask me about this project ↗
            </a>
          </div>
          <div className="project-outcomes">
            {FEATURED_WORK.outcomes.map((item) => (
              <div key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </section>
  );
}
