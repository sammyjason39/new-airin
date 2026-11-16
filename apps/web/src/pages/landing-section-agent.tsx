import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  File01Icon,
  Message01Icon,
  UserGroupIcon,
} from "hugeicons-react";
import { useLandingCopy } from "./use-landing-copy";

function AgentSection() {
  const { m } = useLandingCopy();

  return (
    <section
      aria-labelledby="landing-agent-title"
      className="landing-section landing-agent"
      id="ai-agent"
    >
      <div className="landing-wrap landing-agent-layout">
        <div data-reveal="rise">
          <h2 id="landing-agent-title">
            {m.agentTitleLead}
            <br />
            <em>{m.agentTitleEm}</em>
          </h2>
          <p>{m.agentBody}</p>
          <a className="landing-text-link" href="#onboarding">
            {m.agentLink} <ArrowRight01Icon aria-hidden />
          </a>
        </div>
        <div className="landing-flow" data-reveal="assemble">
          <div className="landing-flow-brief">
            <Message01Icon aria-hidden />
            <span>{m.flowBrief}</span>
          </div>
          <div className="landing-flow-handoff">
            <div>
              <img
                alt=""
                height={72}
                loading="lazy"
                src="/characters/dimas.png"
                width={72}
              />
              <strong>Dimas</strong>
              <span>{m.flowDimas}</span>
            </div>
            <ArrowRight01Icon aria-hidden />
            <div>
              <img
                alt=""
                height={72}
                loading="lazy"
                src="/characters/kezia.png"
                width={72}
              />
              <strong>Kezia</strong>
              <span>{m.flowKezia}</span>
            </div>
            <ArrowRight01Icon aria-hidden />
            <div>
              <span className="landing-flow-human">
                <UserGroupIcon aria-hidden />
              </span>
              <strong>{m.flowTeam}</strong>
              <span>{m.flowTeamAction}</span>
            </div>
          </div>
          <div className="landing-flow-result">
            <File01Icon aria-hidden />
            <div>
              <strong>{m.flowResultTitle}</strong>
              <span>{m.flowResultHint}</span>
            </div>
            <CheckmarkCircle02Icon aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}

export { AgentSection };
