import type { ProfileSummary } from "@airin/core";
import type { AgentGroup } from "@airin/core/agent-groups";
import { DropdownMenuItem } from "@airin/ui/dropdown-menu";
import {
  Delete02Icon,
  PencilEdit02Icon,
  PinIcon,
  PinOffIcon,
  PlusSignSquareIcon,
} from "hugeicons-react";
import type { NavigateFunction } from "react-router-dom";
import type { ProfileRailItemData } from "@/components/profile-rail-item";
import { profilePath } from "@/lib/navigation";

export function ProfileRailItemMenu({
  canEditAgent,
  item,
  navigate,
  onNavigate,
  openGroup,
  pinned,
  setDeletingGroup,
  setEditingGroup,
  togglePin,
}: {
  canEditAgent: (profile: ProfileSummary) => boolean;
  item: ProfileRailItemData;
  navigate: NavigateFunction;
  onNavigate?: () => void;
  openGroup: (groupId: string) => void;
  pinned: boolean;
  setDeletingGroup: (group: AgentGroup | null) => void;
  setEditingGroup: (group: AgentGroup | null) => void;
  togglePin: (args: { itemId: string; pinned: boolean }) => void;
}) {
  return (
    <>
      <DropdownMenuItem
        onClick={() => togglePin({ itemId: item.id, pinned: !pinned })}
      >
        {pinned ? <PinOffIcon /> : <PinIcon />}
        {pinned ? "Unpin" : "Pin to top"}
      </DropdownMenuItem>
      {item.kind === "group" ? (
        <>
          <DropdownMenuItem onClick={() => openGroup(item.id)}>
            <PlusSignSquareIcon />
            New chat
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditingGroup(item.group)}>
            <PencilEdit02Icon />
            Edit group
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeletingGroup(item.group)}
            variant="destructive"
          >
            <Delete02Icon />
            Delete group
          </DropdownMenuItem>
        </>
      ) : canEditAgent(item.profile) ? (
        <DropdownMenuItem
          onClick={() => {
            onNavigate?.();
            navigate(profilePath(item.id));
          }}
        >
          <PencilEdit02Icon />
          Edit agent
        </DropdownMenuItem>
      ) : null}
    </>
  );
}
