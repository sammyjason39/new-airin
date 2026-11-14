import type { ProfileSummary } from "@airin/core";
import type { AgentGroup } from "@airin/core/agent-groups";
import { Tooltip, TooltipContent, TooltipTrigger } from "@airin/ui/tooltip";
import { cn } from "@airin/ui/utils";
import { ContextMenu } from "@base-ui/react/context-menu";
import type { MutableRefObject } from "react";
import type { NavigateFunction } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { GroupAvatar } from "@/components/agent-groups/GroupAvatar";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProfileRailItemMenu } from "@/components/profile-rail-item-menu";
import { PAGE_PATHS } from "@/lib/navigation";
import {
  agentRailHoverLabel,
  ownerAgentSubtitleMessageKey,
} from "@/lib/owner-agent-role-subtitle";

export type ProfileRailItemData =
  | { id: string; kind: "agent"; profile: ProfileSummary }
  | { id: string; kind: "group"; group: AgentGroup };

function railHoverLabel(
  item: ProfileRailItemData,
  t: (key: string) => string
): string {
  if (item.kind !== "agent") {
    return item.group.name;
  }

  const roleKey = ownerAgentSubtitleMessageKey(item.profile);

  return agentRailHoverLabel(
    item.profile,
    roleKey === "owner.agent" ? "" : t(roleKey)
  );
}

export function ProfileRailItem({
  item,
  activeProfileId,
  canEditAgent,
  handleSelectProfile,
  menuItemId,
  menuOpenedAt,
  onNavigate,
  openGroup,
  openGroupId,
  pinnedIds,
  profiles,
  setDeletingGroup,
  setEditingGroup,
  setMenuItemId,
  t,
  togglePin,
  navigate,
}: {
  item: ProfileRailItemData;
  activeProfileId: string | null;
  canEditAgent: (profile: ProfileSummary) => boolean;
  handleSelectProfile: (profileId: string) => void;
  menuItemId: string | null;
  menuOpenedAt: MutableRefObject<number>;
  onNavigate?: () => void;
  openGroup: (groupId: string) => void;
  openGroupId: string | null;
  pinnedIds: Set<string>;
  profiles: ProfileSummary[];
  setDeletingGroup: (group: AgentGroup | null) => void;
  setEditingGroup: (group: AgentGroup | null) => void;
  setMenuItemId: (id: string | null) => void;
  t: (key: string) => string;
  togglePin: (args: { itemId: string; pinned: boolean }) => void;
  navigate: NavigateFunction;
}) {
  const location = useLocation();
  const hoverLabel = railHoverLabel(item, t);
  const pinned = pinnedIds.has(item.id);

  // An open group takes the highlight from the chat agent.
  const active =
    item.kind === "agent"
      ? !openGroupId && item.id === activeProfileId
      : item.id === openGroupId;

  const avatarClass = cn(
    "size-7 rounded-md outline-none transition-all duration-150",
    // Avatar colors identify agents, so inactive ones stay in color.
    active ? "opacity-100" : "opacity-80 group-hover:opacity-100"
  );

  const trigger = (
    <button
      aria-current={active ? "true" : undefined}
      aria-label={hoverLabel}
      className={cn(
        "group relative flex size-7 shrink-0 items-center justify-center rounded-md transition-all duration-150",
        !active && "hover:bg-muted/40"
      )}
      onClick={() => {
        if (Date.now() - menuOpenedAt.current < 700) {
          return;
        }

        if (item.kind === "agent") {
          handleSelectProfile(item.id);

          return;
        }

        // Like an agent: picking the open group keeps its current chat.
        if (item.id !== openGroupId) {
          openGroup(item.id);
        }
      }}
      title={hoverLabel}
      type="button"
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute top-1/2 -left-2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary"
        />
      ) : null}
      {item.kind === "agent" ? (
        <ProfileAvatar
          active={
            active &&
            (location.pathname === PAGE_PATHS.chat ||
              location.pathname.startsWith(`${PAGE_PATHS.chat}/`))
          }
          className={avatarClass}
          profile={item.profile}
          size="sm"
        />
      ) : (
        <GroupAvatar
          className={avatarClass}
          group={item.group}
          profiles={profiles}
        />
      )}
    </button>
  );

  // Right-click, or a long press on touch, opens the item's menu.
  return (
    <ContextMenu.Root
      onOpenChange={(open) => {
        if (open) {
          menuOpenedAt.current = Date.now();
          setMenuItemId(item.id);
        } else if (Date.now() - menuOpenedAt.current > 700) {
          setMenuItemId(null);
        }
      }}
      open={menuItemId === item.id}
    >
      <ContextMenu.Trigger className="flex shrink-0">
        <Tooltip>
          <TooltipTrigger render={trigger} />
          <TooltipContent side="right" sideOffset={8}>
            {hoverLabel}
          </TooltipContent>
        </Tooltip>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner className="isolate z-50 outline-none">
          <ContextMenu.Popup className="z-50 min-w-36 rounded-lg bg-popover p-1 text-popover-foreground shadow-md outline-none ring-1 ring-foreground/10">
            <ProfileRailItemMenu
              canEditAgent={canEditAgent}
              item={item}
              navigate={navigate}
              onNavigate={onNavigate}
              openGroup={openGroup}
              pinned={pinned}
              setDeletingGroup={setDeletingGroup}
              setEditingGroup={setEditingGroup}
              togglePin={togglePin}
            />
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
