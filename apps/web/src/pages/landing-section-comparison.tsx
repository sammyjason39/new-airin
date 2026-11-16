import { CheckmarkCircle02Icon } from "hugeicons-react";
import { useLandingCopy } from "./use-landing-copy";

function ComparisonSection() {
  const { content, m } = useLandingCopy();

  return (
    <section
      aria-labelledby="landing-comparison-title"
      className="landing-section landing-comparison"
    >
      <div className="landing-wrap">
        <div className="landing-section-heading" data-reveal="rise">
          <h2 id="landing-comparison-title">
            {m.comparisonTitleLead}
            <br />
            <em>{m.comparisonTitleEm}</em>
          </h2>
          <p>{m.comparisonBody}</p>
        </div>
        <div className="landing-table-scroll">
          <table className="landing-table">
            <caption className="sr-only">{m.comparisonCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{m.comparisonTopicCol}</th>
                <th scope="col">
                  <img
                    alt=""
                    height={28}
                    loading="lazy"
                    src="/super-agent-light.png"
                    width={28}
                  />
                  AIRIN Superteam
                </th>
                <th scope="col">{m.comparisonChatCol}</th>
              </tr>
            </thead>
            <tbody>
              {content.comparison.map(([topic, airin, chat]) => (
                <tr key={topic}>
                  <th scope="row">{topic}</th>
                  <td>
                    <CheckmarkCircle02Icon aria-hidden />
                    <span>{airin}</span>
                  </td>
                  <td>{chat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export { ComparisonSection };
