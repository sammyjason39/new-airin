import { ArrowDown01Icon, ArrowRight01Icon } from "hugeicons-react";
import type { Dispatch, SetStateAction } from "react";
import { TeamWorkbench } from "./landing-workbench";
import { useLandingCopy } from "./use-landing-copy";

function LandingHero({
  active,
  setActive,
}: {
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
}) {
  const { content, m } = useLandingCopy();
  const agent = content.team[active] ?? content.team[0];

  return (
    <section
      aria-labelledby="landing-title"
      className="landing-hero landing-wrap"
    >
      <div className="landing-intro">
        <h1 id="landing-title">
          <span>{m.heroTitleLine1}</span>
          <span>
            {m.heroTitleLine2Prefix}{" "}
            <span className="landing-title-avatar">
              <img
                alt=""
                height={88}
                key={agent.avatar}
                src={`/characters/${agent.avatar}.png`}
                width={88}
              />
            </span>
          </span>
          <em>{m.heroTitleEm}</em>
        </h1>
        <p className="landing-hero-tagline">{m.heroTagline}</p>
        <p>{m.heroBody}</p>
        <div className="landing-actions">
          <a className="landing-button" href="#daftar-tunggu">
            {m.navCta} <ArrowRight01Icon aria-hidden />
          </a>
          <a className="landing-text-link" href="#use-cases">
            {m.heroSeeHow} <ArrowDown01Icon aria-hidden />
          </a>
        </div>
        <div className="landing-hero-team">
          <div aria-hidden>
            {content.team.map((member) => (
              <img
                alt=""
                height={32}
                key={member.avatar}
                src={`/characters/${member.avatar}.png`}
                width={32}
              />
            ))}
          </div>
          <span>{m.heroTeamLine}</span>
        </div>
      </div>
      <TeamWorkbench active={active} setActive={setActive} />
      <a className="landing-scroll-hint" href="#ai-agent">
        <ArrowDown01Icon aria-hidden />
        <span>{m.heroScroll}</span>
      </a>
    </section>
  );
}

export { LandingHero };
