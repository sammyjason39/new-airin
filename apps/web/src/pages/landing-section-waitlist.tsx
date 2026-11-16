import { WaitlistForm } from "./landing-waitlist";
import { useLandingCopy } from "./use-landing-copy";

function WaitlistSection() {
  const { content, m } = useLandingCopy();

  return (
    <section
      aria-labelledby="waitlist-title"
      className="landing-waitlist"
      id="daftar-tunggu"
    >
      <div className="landing-wrap landing-waitlist-layout">
        <div data-reveal="rise">
          <h2 id="waitlist-title">
            {m.waitlistTitleLead}
            <br />
            <em>{m.waitlistTitleEm}</em>
          </h2>
          <p className="landing-waitlist-lead">{m.waitlistLead}</p>
          <p>{m.waitlistBody}</p>
          <div aria-hidden className="landing-waitlist-team">
            {content.team.map((member) => (
              <img
                alt=""
                height={130}
                key={member.avatar}
                loading="lazy"
                src={`/characters/${member.avatar}.png`}
                width={130}
              />
            ))}
          </div>
        </div>
        <WaitlistForm />
      </div>
    </section>
  );
}

export { WaitlistSection };
