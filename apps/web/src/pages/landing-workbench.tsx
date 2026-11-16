import {
  CheckmarkCircle02Icon,
  File01Icon,
  UserGroupIcon,
} from "hugeicons-react";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { CampaignPoster } from "./landing-poster";
import { useLandingCopy } from "./use-landing-copy";

function TeamWorkbench({
  active,
  setActive,
}: {
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
}) {
  const { content, m } = useLandingCopy();
  const { industries, team } = content;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const workbench = useRef<HTMLDivElement>(null);
  const agent = team[active] ?? team[0];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => setVisible(entry?.isIntersecting ?? false),
            { threshold: 0.15 }
          );

    if (workbench.current) {
      observer?.observe(workbench.current);
    }

    return () => {
      preference.removeEventListener("change", update);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || hovered || focused || !visible) {
      return;
    }

    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setActive((current) => (current + 1) % team.length);
      }
    }, 6500);

    return () => window.clearInterval(timer);
  }, [reducedMotion, hovered, focused, visible, setActive, team.length]);

  if (!agent) {
    return null;
  }

  return (
    <div
      className="landing-workbench"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
      onFocus={() => setFocused(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={workbench}
    >
      <div className="landing-agent-stage">
        <div className="landing-active-agent" key={agent.avatar}>
          <img
            alt={agent.name}
            height={160}
            src={`/characters/${agent.avatar}.png`}
            width={160}
          />
          <div className="landing-agent-badge">
            <span className="landing-status-dot" />
            <strong>{agent.name}</strong>
            <span>{agent.role}</span>
          </div>
        </div>
        <div
          aria-label={m.workbenchPickerAria}
          className="landing-team-picker"
          role="group"
        >
          {team.map((member, index) => (
            <button
              aria-pressed={active === index}
              className="landing-team-choice"
              key={member.name}
              onClick={() => setActive(index)}
              type="button"
            >
              {member.name}
            </button>
          ))}
        </div>
      </div>
      <div className="landing-workspace">
        <div className="landing-workspace-bar">
          <span>
            <span className="landing-status-dot" />
            {m.workbenchTeam}
          </span>
          <span>{m.workbenchDemoTask}</span>
        </div>
        <div
          className="landing-workspace-scene"
          data-agent={agent.avatar}
          key={agent.avatar}
        >
          <div className="landing-brief">
            <span>{m.workbenchYou}</span>
            <p>{agent.task}</p>
          </div>
          <div className="landing-agent-response">
            <img
              alt=""
              height={44}
              src={`/characters/${agent.avatar}.png`}
              width={44}
            />
            <div>
              <strong>
                {agent.name}
                <span>{agent.role}</span>
              </strong>
              <p>{agent.reply}</p>
            </div>
          </div>
          {agent.kind === "support" && (
            <div className="landing-task-output landing-message-output">
              <div>
                <img alt="" height={24} src="/icons/whatsapp.svg" width={24} />
                <strong>{m.workbenchDraftTitle}</strong>
                <span>#LD-208</span>
              </div>
              <p>{m.workbenchDraftBody}</p>
              <span>
                <CheckmarkCircle02Icon aria-hidden />
                {m.workbenchAwaiting}
              </span>
            </div>
          )}
          {agent.kind === "finance" && (
            <div className="landing-task-output landing-finance-output">
              <div>
                <span>{m.workbenchSalesLabel}</span>
                <strong>{m.workbenchSalesValue}</strong>
              </div>
              <div aria-hidden className="landing-mini-bars">
                {[38, 62, 48, 75, 56, 92, 68].map((height, index) => (
                  <i key={`bar-${index}`} style={{ height: `${height}%` }}>
                    <span>{m.workbenchWeekdays[index]}</span>
                  </i>
                ))}
              </div>
              <p>
                <File01Icon aria-hidden />
                {m.workbenchInvoices}
              </p>
            </div>
          )}
          {agent.kind === "marketing" && industries[2] ? (
            <div className="landing-task-output landing-marketing-output">
              <CampaignPoster compact industry={industries[2]} />
              <div>
                <strong>{m.workbenchCaptionTitle}</strong>
                <p>{m.workbenchCaptionBody}</p>
                <span>{m.workbenchCaptionMeta}</span>
              </div>
            </div>
          ) : null}
          <div className="landing-deliverable">
            <File01Icon aria-hidden />
            <span>{agent.file}</span>
            <span>{m.workbenchReady}</span>
          </div>
        </div>
        <div className="landing-workspace-bottom">
          <span>{m.workbenchFooter}</span>
          <UserGroupIcon aria-hidden />
        </div>
      </div>
      <div aria-hidden className="landing-workbench-note">
        <img alt="" height={28} src={`/icons/${agent.app}`} width={28} />
        <span>{m.workbenchNote}</span>
        <CheckmarkCircle02Icon />
      </div>
    </div>
  );
}

export { TeamWorkbench };
