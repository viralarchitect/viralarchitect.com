import { Panel } from "@/components/Panel";
import { AUTOMATION } from "@/content/reliability";
export function Automation() {
  return (
    <section className="section" id="automation" aria-labelledby="automation-heading">
      <div className="section-head">
        <h2 id="automation-heading">
          <span className="slash">{"//"}</span> AUTOMATION THAT REMOVES TOIL
        </h2>
        <span className="meta">02 / ENGINEERING</span>
      </div>
      <div className="case-study-grid">
        {AUTOMATION.map((item) => (
          <Panel key={item.title} className="case-study">
            <p className="eyebrow">{item.eyebrow}</p>
            <h3>{item.title}</h3>
            <p className="case-outcome">{item.outcome}</p>
            <p>{item.summary}</p>
            <ol className="case-steps">
              {item.steps.map((step) => (
                <li key={step.title}>
                  <h4>{step.title}</h4>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
            <p className="case-impact">{item.impact}</p>
          </Panel>
        ))}
      </div>
    </section>
  );
}
