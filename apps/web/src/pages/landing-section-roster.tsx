import { ArrowRight01Icon, CheckmarkCircle02Icon } from "hugeicons-react";
import { useLandingCopy } from "./use-landing-copy";

function RosterSection() {
  const { content, m } = useLandingCopy();

  return (
    <section
      aria-labelledby="landing-roster-title"
      className="landing-section landing-roster"
      id="ai-team"
    >
      <div className="landing-wrap">
        <div className="landing-section-heading" data-reveal="rise">
          <h2 id="landing-roster-title">
            {m.rosterTitleLead}
            <br />
            <em>{m.rosterTitleEm}</em>
          </h2>
          <div>
            <span className="landing-trained">
              <CheckmarkCircle02Icon aria-hidden />
              {m.rosterTrained}
            </span>
            <p>{m.rosterBody}</p>
          </div>
        </div>
        <ul className="landing-roster-grid">
          {content.featuredAgents.map((agent) => (
            <li data-reveal="rise" key={agent.avatar}>
              <div className="landing-roster-portrait">
                <img
                  alt=""
                  height={160}
                  loading="lazy"
                  src={`/characters/${agent.avatar}.png`}
                  width={160}
                />
              </div>
              <div>
                <h3>{agent.name}</h3>
                <span>{agent.role}</span>
                <p>{agent.task}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="landing-roster-more">
          <span>{m.rosterMore}</span>
          <a className="landing-text-link" href="#daftar-tunggu">
            {m.rosterLink} <ArrowRight01Icon aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}

export { RosterSection };
