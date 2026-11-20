import { agentCharacterPublicPath } from "@airin/core/agent-marketplace";

/** Design hero portrait — Hana from the Airin agent roster. */
const DESIGN_HERO_CHARACTER = "hana" as const;

export function DesignFlower({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" fill="#60a5fa" r="4.2" />
      <circle cx="16" cy="6.5" fill="#93c5fd" r="4" />
      <circle cx="16" cy="25.5" fill="#93c5fd" r="4" />
      <circle cx="6.5" cy="16" fill="#93c5fd" r="4" />
      <circle cx="25.5" cy="16" fill="#93c5fd" r="4" />
      <circle cx="9.2" cy="9.2" fill="#bfdbfe" r="3.4" />
      <circle cx="22.8" cy="9.2" fill="#bfdbfe" r="3.4" />
      <circle cx="9.2" cy="22.8" fill="#bfdbfe" r="3.4" />
      <circle cx="22.8" cy="22.8" fill="#bfdbfe" r="3.4" />
      <circle cx="16" cy="16" fill="#eff6ff" r="2.1" />
    </svg>
  );
}

export function DesignMascot({ className }: { className?: string }) {
  return (
    <img
      alt=""
      className={className}
      decoding="async"
      src={agentCharacterPublicPath(DESIGN_HERO_CHARACTER)}
    />
  );
}
