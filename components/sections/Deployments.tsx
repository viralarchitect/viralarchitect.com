import { Panel } from "@/components/Panel";
import { FEATURED_WORK, PRODUCT_LINKS } from "@/content/profile";
export function Deployments() {
  return (
    <section className="section" id="deployments" aria-labelledby="work-heading">
      <div className="section-head">
        <h2 id="work-heading">
          <span className="slash">{"//"}</span> SELECTED WORK
        </h2>
        <span className="meta">03 / SOFTWARE</span>
      </div>
      <Panel className="featured-work">
        <div className="project-layout">
          <div>
            <p className="eyebrow">{FEATURED_WORK.category}</p>
            <h3>{FEATURED_WORK.name}</h3>
            <p className="project-summary">{FEATURED_WORK.description}</p>
            <p className="project-stack">{FEATURED_WORK.stack}</p>
            <div className="project-links">
              <a className="text-link" href={PRODUCT_LINKS.app}>
                Visit EquipQR ↗
              </a>
              <a className="text-link" href={PRODUCT_LINKS.status}>
                Public status ↗
              </a>
            </div>
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
