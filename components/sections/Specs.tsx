import Image from "next/image";
import { PROFILE, SKILL_GROUPS, EXPERIENCE } from "@/content/profile";
export function Specs() {
  return (
    <section className="section" id="specs" aria-labelledby="about-heading">
      <div className="section-head">
        <h2 id="about-heading">
          <span className="slash">{"//"}</span> ABOUT & EXPERIENCE
        </h2>
        <span className="meta">02 / BACKGROUND</span>
      </div>
      <div className="about-layout">
        <div className="about-intro">
          <Image
            className="portrait"
            src="/Nicholas-King-Photo.jpg"
            width={160}
            height={160}
            alt={`Portrait of ${PROFILE.name}`}
          />
          <h3>{PROFILE.name}</h3>
          <p>{PROFILE.summary}</p>
          <div className="skill-groups">
            {SKILL_GROUPS.map((group) => (
              <div key={group.title}>
                <h4>{group.title}</h4>
                <p>{group.tools}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="experience-list">
          {EXPERIENCE.map((job) => (
            <article key={job.company}>
              <p className="eyebrow">{job.period}</p>
              <h3>{job.company}</h3>
              <p className="experience-role">{job.role}</p>
              <p>{job.description}</p>
              <p className="skill-hint">Select a skill to see how I used it.</p>
              <ul className="experience-skills" aria-label={`Skills used at ${job.company}`}>
                {job.skills.map((skill) => (
                  <li key={skill.name}>
                    <details>
                      <summary>{skill.name}</summary>
                      <div className="skill-details">
                        {skill.details.map((block, index) =>
                          "text" in block ? (
                            <p key={index}>{block.text}</p>
                          ) : (
                            <ul key={index}>
                              {block.items.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          ),
                        )}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          <p className="education-note">
            B.S. Network Technologies · Western Illinois University
            <br />
            SRE Practitioner · Microsoft Azure Fundamentals
          </p>
        </div>
      </div>
    </section>
  );
}
