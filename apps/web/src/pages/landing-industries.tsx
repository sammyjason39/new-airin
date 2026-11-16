import {
  ArrowRight01Icon,
  Link01Icon,
  Message01Icon,
  UserGroupIcon,
} from "hugeicons-react";
import { useState } from "react";
import { CampaignPoster } from "./landing-poster";
import { useLandingCopy } from "./use-landing-copy";

function Integrations() {
  const { content, m } = useLandingCopy();
  const { integrations } = content;

  return (
    <section
      aria-labelledby="landing-integrations-title"
      className="landing-integrations"
    >
      <div className="landing-wrap">
        <h2 id="landing-integrations-title">
          {m.integrationsTitleLead}
          <br />
          <em>{m.integrationsTitleEm}</em>
        </h2>
      </div>
      <div className="landing-app-rows">
        {[
          integrations.slice(0, Math.ceil(integrations.length / 2)),
          integrations.slice(Math.ceil(integrations.length / 2)),
        ].map((row, rowIndex) => (
          <div className="landing-marquee" key={row[0]?.name ?? rowIndex}>
            <div
              className={`landing-marquee-track landing-marquee-row-${rowIndex}`}
            >
              {[false, true].map((duplicate) => (
                <ul
                  aria-hidden={duplicate || undefined}
                  key={String(duplicate)}
                >
                  {row.map((app) => (
                    <li key={app.name}>
                      <img
                        alt=""
                        height={28}
                        loading="lazy"
                        src={`/icons/${app.icon}`}
                        width={28}
                      />
                      <span>{app.name}</span>
                      <Link01Icon aria-hidden />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="landing-integration-note">{m.integrationsNote}</p>
    </section>
  );
}

function IndustryExamples() {
  const { content, m } = useLandingCopy();
  const { industries } = content;
  const [industryId, setIndustryId] = useState(industries[0]?.id ?? "laundry");

  const industry =
    industries.find((item) => item.id === industryId) ?? industries[0];

  return (
    <section
      aria-labelledby="landing-use-cases-title"
      className="landing-section landing-industries"
      id="use-cases"
    >
      <div className="landing-wrap">
        <div className="landing-section-heading" data-reveal="rise">
          <h2 id="landing-use-cases-title">
            {m.industriesTitleLead}
            <br />
            <em>{m.industriesTitleEm}</em>
          </h2>
          <p>{m.industriesBody}</p>
        </div>
        <div
          aria-label={m.industriesPickAria}
          className="landing-industry-switch"
          role="group"
        >
          {industries.map((item) => (
            <button
              aria-pressed={item.id === industry?.id}
              key={item.id}
              onClick={() => setIndustryId(item.id)}
              type="button"
            >
              <img
                alt=""
                height={64}
                loading="lazy"
                src={`/landing/${item.id}.webp`}
                width={64}
              />
              <span>{item.label}</span>
              <ArrowRight01Icon aria-hidden />
            </button>
          ))}
        </div>
        {industry ? (
          <div
            aria-live="polite"
            className={`landing-industry-panel landing-industry-${industry.id}`}
            key={industry.id}
          >
            <div className="landing-industry-copy">
              <h3>{industry.title}</h3>
              <p>{industry.job}</p>
              <div className="landing-industry-brief">
                <Message01Icon aria-hidden />
                <p>“{industry.task}”</p>
              </div>
              <div className="landing-human-role">
                <UserGroupIcon aria-hidden />
                <p>{industry.owner}</p>
              </div>
            </div>
            <div className="landing-industry-gallery" data-reveal="spread">
              <div className="landing-campaign-secondary">
                <span>{industry.brand}</span>
                <strong>{industry.detail}</strong>
                <div aria-hidden className="landing-campaign-mark">
                  <ArrowRight01Icon />
                </div>
                <span>{m.industriesSocialConcept}</span>
              </div>
              <CampaignPoster industry={industry} />
              <span className="landing-design-note">{m.designNote}</span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { IndustryExamples, Integrations };
