import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  UserGroupIcon,
} from "hugeicons-react";
import { useLandingCopy } from "./use-landing-copy";

function GroupsOnboardingSections() {
  const { m } = useLandingCopy();

  const groupMessages = [
    { avatar: "jovan", name: "Jovan", text: m.groupMsgJovan },
    { avatar: "dimas", name: "Dimas", text: m.groupMsgDimas },
    { avatar: "kezia", name: "Kezia", text: m.groupMsgKezia },
  ];

  return (
    <>
      <section
        aria-labelledby="landing-groups-title"
        className="landing-section landing-groups"
        id="agent-groups"
      >
        <div className="landing-wrap landing-groups-layout">
          <div data-reveal="rise">
            <h2 id="landing-groups-title">
              {m.groupTitleLead}
              <br />
              <em>{m.groupTitleEm}</em>
            </h2>
            <p>{m.groupBody1}</p>
            <p>{m.groupBody2}</p>
            <a className="landing-button" href="#daftar-tunggu">
              {m.groupCta} <ArrowRight01Icon aria-hidden />
            </a>
          </div>
          <div className="landing-group-demo" data-reveal="assemble">
            <div className="landing-group-header">
              <div className="landing-group-avatars">
                {["jovan", "dimas", "kezia"].map((avatar) => (
                  <img
                    alt=""
                    height={44}
                    key={avatar}
                    loading="lazy"
                    src={`/characters/${avatar}.png`}
                    width={44}
                  />
                ))}
              </div>
              <div>
                <strong>{m.groupName}</strong>
                <span>{m.groupMembers}</span>
              </div>
              <UserGroupIcon aria-hidden />
            </div>
            <div className="landing-group-messages">
              <div className="landing-group-owner">
                <span>{m.groupOwnerLabel}</span>
                <p>{m.groupOwnerText}</p>
              </div>
              {groupMessages.map((message) => (
                <div className="landing-group-message" key={message.avatar}>
                  <img
                    alt=""
                    height={36}
                    loading="lazy"
                    src={`/characters/${message.avatar}.png`}
                    width={36}
                  />
                  <div>
                    <strong>{message.name}</strong>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="landing-group-summary">
              <CheckmarkCircle02Icon aria-hidden />
              <span>{m.groupSummary}</span>
            </div>
            <p className="landing-group-disclaimer">{m.groupDisclaimer}</p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="landing-onboarding-title"
        className="landing-section landing-onboarding"
        id="onboarding"
      >
        <div className="landing-wrap">
          <h2 data-reveal="rise" id="landing-onboarding-title">
            {m.onboardingTitleLead}
            <br />
            <em>{m.onboardingTitleEm}</em>
          </h2>
          <ol className="landing-onboarding-steps">
            <li data-reveal="assemble">
              <div>
                <span>1</span>
                <img
                  alt=""
                  height={120}
                  loading="lazy"
                  src="/characters/hana.png"
                  width={120}
                />
              </div>
              <h3>{m.onboarding1Title}</h3>
              <p>{m.onboarding1Body}</p>
            </li>
            <li data-reveal="assemble">
              <div>
                <span>2</span>
                <img
                  alt=""
                  height={120}
                  loading="lazy"
                  src="/characters/dimas.png"
                  width={120}
                />
              </div>
              <h3>{m.onboarding2Title}</h3>
              <p>{m.onboarding2Body}</p>
            </li>
            <li data-reveal="assemble">
              <div>
                <span>3</span>
                <img
                  alt=""
                  height={120}
                  loading="lazy"
                  src="/characters/kezia.png"
                  width={120}
                />
              </div>
              <h3>{m.onboarding3Title}</h3>
              <p>{m.onboarding3Body}</p>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}

export { GroupsOnboardingSections };
