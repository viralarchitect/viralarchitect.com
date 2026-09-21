import { Panel } from "@/components/Panel";
import { RELIABILITY, MONITORING } from "@/content/reliability";
import { PRODUCT_LINKS } from "@/content/profile";
export function Reliability() {
  return (
    <section className="section" id="reliability" aria-labelledby="reliability-heading">
      <div className="section-head">
        <h2 id="reliability-heading">
          <span className="slash">{"//"}</span> RELIABILITY ENGINEERING
        </h2>
        <span className="meta">01 / PRODUCTION</span>
      </div>
      <p className="section-intro">
        Service ownership, incident response, and controlled change across enterprise infrastructure
        and a production SaaS product.
      </p>
      <div className="evidence-grid">
        {RELIABILITY.map((item) => (
          <Panel key={item.title} className="evidence-card">
            <p className="evidence-metric">{item.metric}</p>
            <p className="evidence-label">{item.label}</p>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <details className="evidence-detail">
              <summary>How I operate</summary>
              <p>{item.detail}</p>
            </details>
          </Panel>
        ))}
      </div>
      <div className="monitoring-block">
        <div className="monitoring-heading">
          <h3>Monitoring & operational diagnosis</h3>
          <a className="text-link" href={PRODUCT_LINKS.status}>
            EquipQR public status ↗
          </a>
        </div>
        <div className="monitoring-grid">
          {MONITORING.map((item) => (
            <div key={item.title}>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
