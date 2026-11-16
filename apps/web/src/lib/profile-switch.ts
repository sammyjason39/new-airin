import {
  buildChatBasePath,
  buildChatPath,
  buildNewChatPath,
  isChatSessionPath,
  isProfilesPath,
} from "@/lib/chat-history";
import { PAGE_PATHS, profilePath } from "@/lib/navigation";

/** What picking an agent does; "select" and "navigate" both make it live. */
export type ProfileSwitch =
  | { kind: "stay" }
  | { kind: "select" }
  | { kind: "navigate"; replace: boolean; to: string };

/**
 * Picking an agent is page-aware: Profiles, Files, Automations and the draft
 * chat swap the agent in place, every other page opens a fresh chat with it.
 * Owner mode resumes the agent's last stored session when one exists.
 */
export function resolveProfileSwitch(input: {
  activeProfileId: string | null;
  pathname: string;
  profileId: string;
  search: string;
  storedSessionId?: string | null;
  uiMode?: "advanced" | "owner";
}): ProfileSwitch {
  const {
    activeProfileId,
    pathname,
    profileId,
    search,
    storedSessionId = null,
    uiMode = "advanced",
  } = input;

  const onProfilesPage = isProfilesPath(pathname, PAGE_PATHS.profiles);

  // Files / Automations swap the agent in place. Draft /chat and session
  // routes remount via ?new=1 so the previous chat does not stay on screen.
  const swapsInPlace =
    pathname === PAGE_PATHS.files || pathname === PAGE_PATHS.automations;

  const onChat =
    pathname === buildChatBasePath() || isChatSessionPath(pathname);

  // On Profiles the URL names the open agent. It can be one the rail does not
  // list (a blocked deep link), and picking any listed agent leaves it.
  const openProfileId = onProfilesPage
    ? (new URLSearchParams(search).get("profile") ?? activeProfileId)
    : activeProfileId;

  // Outside chat (Settings, Skills, ...) the rail still highlights the active
  // agent, so picking it opens its chat instead of doing nothing.
  if (
    profileId === openProfileId &&
    (onProfilesPage || swapsInPlace || onChat)
  ) {
    return { kind: "stay" };
  }

  if (onProfilesPage) {
    if (pathname !== PAGE_PATHS.profiles) {
      return { kind: "navigate", replace: false, to: profilePath(profileId) };
    }

    const params = new URLSearchParams(search);
    params.set("profile", profileId);

    return {
      kind: "navigate",
      replace: true,
      to: `${PAGE_PATHS.profiles}?${params.toString()}`,
    };
  }

  if (swapsInPlace) {
    return { kind: "select" };
  }

  // Owner: keep the last chat for this agent; /new starts a blank one.
  if (uiMode === "owner") {
    if (storedSessionId) {
      return {
        kind: "navigate",
        replace: onChat,
        to: buildChatPath(profileId, storedSessionId),
      };
    }

    if (onChat && pathname === buildChatBasePath()) {
      return { kind: "select" };
    }

    if (onChat) {
      return {
        kind: "navigate",
        replace: true,
        to: buildChatBasePath(),
      };
    }
  }

  // Carry the agent in ?new=1 so ChatPage clears the previous transcript.
  return {
    kind: "navigate",
    replace: onChat,
    to: buildNewChatPath(profileId),
  };
}
