import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Shield01Icon,
} from "hugeicons-react";
import { CampaignPoster } from "./landing-poster";
import { useLandingCopy } from "./use-landing-copy";

function FeatureSection() {
  const { content, m } = useLandingCopy();
  const { industries, team } = content;

  return (
    <section
      aria-labelledby="landing-features-title"
      className="landing-section landing-features"
      id="fitur"
    >
      <div className="landing-wrap">
        <div className="landing-section-heading" data-reveal="rise">
          <h2 id="landing-features-title">
            {m.featuresTitleLead}
            <br />
            <em>{m.featuresTitleEm}</em>
          </h2>
          <p>{m.featuresBody}</p>
        </div>
        <div className="landing-feature-grid">
          <article className="landing-feature-team" data-reveal="assemble">
            <div className="landing-feature-copy">
              <h3>
                {m.knowBusinessTitleLead}
                <br />
                {m.knowBusinessTitleEm}
              </h3>
              <p>{m.knowBusinessBody}</p>
            </div>
            <div className="landing-role-cards">
              {team.map((member) => (
                <div key={member.avatar}>
                  <img
                    alt=""
                    height={130}
                    loading="lazy"
                    src={`/characters/${member.avatar}.png`}
                    width={130}
                  />
                  <strong>{member.name}</strong>
                  <span>{member.role}</span>
                  <small>
                    <CheckmarkCircle02Icon aria-hidden />
                    {m.briefReceived}
                  </small>
                </div>
              ))}
            </div>
          </article>
          <article className="landing-feature-schedule" data-reveal="rise">
            <div className="landing-feature-copy">
              <Calendar03Icon aria-hidden />
              <h3>{m.scheduleTitle}</h3>
              <p>{m.scheduleBody}</p>
            </div>
            <div className="landing-schedule">
              <div>
                {m.scheduleDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div>
                {m.scheduleDates.map((date) => (
                  <span key={date}>{date}</span>
                ))}
              </div>
              <ul className="landing-schedule-list">
                {m.scheduleItems.map(([label, time]) => (
                  <li key={label}>
                    <span className="landing-status-dot" />
                    <strong>{label}</strong>
                    <span>{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
          <article className="landing-feature-access" data-reveal="rise">
            <div className="landing-feature-copy">
              <Shield01Icon aria-hidden />
              <h3>{m.accessTitle}</h3>
              <p>{m.accessBody}</p>
            </div>
            <div className="landing-access-list">
              {(
                [
                  ["whatsapp.svg", "WhatsApp", team[0]?.name ?? "Hana"],
                  [
                    "google-sheets.svg",
                    "Google Sheets",
                    team[1]?.name ?? "Dimas",
                  ],
                  ["gmail.svg", "Gmail", team[2]?.name ?? "Kezia"],
                ] as const
              ).map(([icon, name, agent]) => (
                <div key={name}>
                  <img
                    alt=""
                    height={26}
                    loading="lazy"
                    src={`/icons/${icon}`}
                    width={26}
                  />
                  <span>{name}</span>
                  <span>{agent}</span>
                  <CheckmarkCircle02Icon aria-hidden />
                </div>
              ))}
            </div>
          </article>
          <article className="landing-feature-design" data-reveal="spread">
            <div className="landing-feature-copy">
              <h3>
                {m.designTitleLead}
                <br />
                {m.designTitleEm}
              </h3>
              <p>{m.designBody}</p>
              <a className="landing-text-link" href="#use-cases">
                {m.designLink} <ArrowRight01Icon aria-hidden />
              </a>
            </div>
            <div className="landing-feature-posters">
              <CampaignPoster compact industry={industries[0]} />
              <CampaignPoster compact industry={industries[2]} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export { FeatureSection };
