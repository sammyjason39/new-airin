import type { ProfileSummary } from "@airin/core";
import type { AgentGroup } from "@airin/core/agent-groups";
import type { AcpAgentPresetSummary, ToolSummary } from "@airin/core/contract";
import { ConfirmDialog } from "@airin/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GroupDialog } from "@/components/agent-groups/group-dialog";
import { ProfileAdminPlusButton } from "@/components/ProfileAdminPlusButton";
import { ProfileCreateDialog } from "@/components/ProfileCreateDialog";
import {
  ProfileRailItem,
  type ProfileRailItemData,
} from "@/components/profile-rail-item";
import { useActiveChatProfile } from "@/context/use-active-chat-profile";
import { useAuth } from "@/context/use-auth";
import { useLocale } from "@/context/use-locale";
import {
  useAgentGroupsQuery,
  useDeleteGroup,
  useRailPinsQuery,
  useToggleRailPin,
} from "@/hooks/use-agent-groups";
import { useSelectProfile } from "@/hooks/use-select-profile";
import {
  groupPath,
  groupRouteFromPath,
  PAGE_PATHS,
  pathForPage,
  profilePath,
} from "@/lib/navigation";
import { markLogoSrc } from "@/lib/theme";

// Members create plain agents; tools and host-run agents stay with admins.
const NO_PRESETS: AcpAgentPresetSummary[] = [];

const NO_TOOLS: ToolSummary[] = [];

type RailItem = ProfileRailItemData;

function RailDivider() {
  return (
    <div aria-hidden="true" className="my-0.5 h-px w-5 shrink-0 bg-border" />
  );
}

export function ProfileRail({ onNavigate }: { onNavigate?: () => void } = {}) {
  const { activeProfileId, onProfilesPage, profiles, selectProfile } =
    useSelectProfile();

  const { user, activeOrg } = useAuth();
  const { syncForOrg } = useActiveChatProfile();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const { data: groups = [] } = useAgentGroupsQuery();
  const { data: pins = [] } = useRailPinsQuery();
  const togglePin = useToggleRailPin();
  // A long press opens the pin menu, and lifting the finger then fires a
  // click; for a moment that click neither navigates nor closes the menu.
  const menuOpenedAt = useRef(0);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<AgentGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<AgentGroup | null>(null);
  const deleteGroup = useDeleteGroup();
  const openGroupId = groupRouteFromPath(location.pathname)?.groupId ?? null;

  useEffect(() => {
    if (profiles.length === 0) {
      return;
    }

    syncForOrg({ orgId: activeOrg?.id ?? null, profiles });
  }, [activeOrg?.id, profiles, syncForOrg]);

  const logoSrc = markLogoSrc();

  const orderedProfiles = profiles.toSorted(
    (left, right) => Number(right.isSuper) - Number(left.isSuper)
  );

  function handleSelectProfile(profileId: string) {
    onNavigate?.();
    selectProfile(profileId);
  }

  /** Same rule as the server: admins edit any agent, members their own. */
  function canEditAgent(profile: ProfileSummary): boolean {
    return (
      user?.isPlatformAdmin === true ||
      activeOrg?.role === "admin" ||
      (!profile.isSuper && profile.ownerUserId === user?.id)
    );
  }

  function openGroup(groupId: string) {
    onNavigate?.();
    navigate(groupPath(groupId));
  }

  const allItems: RailItem[] = [
    ...orderedProfiles.map((profile) => ({
      id: profile.id,
      kind: "agent" as const,
      profile,
    })),
    ...groups.map((group) => ({ group, id: group.id, kind: "group" as const })),
  ];

  // Pinned agents and groups lead the rail, latest pin first.
  const pinnedItems = pins.flatMap(
    (id) => allItems.find((item) => item.id === id) ?? []
  );

  const pinnedIds = new Set(pins);

  const agentItems = allItems.filter(
    (item) => item.kind === "agent" && !pinnedIds.has(item.id)
  );

  const groupItems = allItems.filter(
    (item) => item.kind === "group" && !pinnedIds.has(item.id)
  );

  const railItemProps = {
    activeProfileId,
    canEditAgent,
    handleSelectProfile,
    menuItemId,
    menuOpenedAt,
    navigate,
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
  };

  return (
    <div
      aria-label="Profiles"
      className="flex h-full w-14 shrink-0 flex-col items-center gap-2 border-border/50 border-r bg-sidebar/60 py-3"
    >
      <Link
        aria-label="Airin"
        className="flex size-7 shrink-0 items-center justify-center"
        to={PAGE_PATHS.chat}
      >
        <img
          alt=""
          className="size-6 object-contain"
          height={24}
          src={logoSrc}
          width={24}
        />
      </Link>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col items-center gap-1.5 overflow-y-auto px-2 py-1">
        {pinnedItems.map((item) => (
          <ProfileRailItem item={item} key={item.id} {...railItemProps} />
        ))}
        {pinnedItems.length > 0 && agentItems.length + groupItems.length > 0 ? (
          <RailDivider />
        ) : null}
        {agentItems.map((item) => (
          <ProfileRailItem item={item} key={item.id} {...railItemProps} />
        ))}
        {groupItems.length > 0 && agentItems.length > 0 ? (
          <RailDivider />
        ) : null}
        {groupItems.map((item) => (
          <ProfileRailItem item={item} key={item.id} {...railItemProps} />
        ))}

        <ProfileRailCreateButton
          isPlatformAdmin={user?.isPlatformAdmin === true}
          onCreateAgent={() => setCreateOpen(true)}
          onNavigate={onNavigate}
          onProfilesPage={onProfilesPage}
        />
      </div>

      {user?.isPlatformAdmin ? null : (
        <ProfileCreateDialog
          agentPresets={NO_PRESETS}
          onCreated={(profileId) => {
            onNavigate?.();
            navigate(profilePath(profileId));
          }}
          onOpenChange={setCreateOpen}
          open={createOpen}
          tools={NO_TOOLS}
        />
      )}

      {editingGroup ? (
        <GroupDialog
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
        />
      ) : null}
      {deletingGroup ? (
        <ConfirmDialog
          description={`Delete "${deletingGroup.name}" with all its chats? This cannot be undone.`}
          onClose={() => setDeletingGroup(null)}
          onConfirm={async () => {
            await deleteGroup.mutateAsync(deletingGroup.id);

            if (openGroupId === deletingGroup.id) {
              navigate(PAGE_PATHS.groups);
            }
          }}
          title="Delete group?"
        />
      ) : null}
    </div>
  );
}

function ProfileRailCreateButton({
  isPlatformAdmin,
  onCreateAgent,
  onNavigate,
  onProfilesPage,
}: {
  isPlatformAdmin: boolean;
  onCreateAgent: () => void;
  onNavigate?: () => void;
  onProfilesPage: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isPlatformAdmin) {
    return <ProfileAdminPlusButton label="New agent" onClick={onCreateAgent} />;
  }

  return (
    <ProfileAdminPlusButton
      label={onProfilesPage ? "New profile" : "Manage profiles"}
      onClick={() => {
        onNavigate?.();

        if (!onProfilesPage) {
          navigate(pathForPage("profiles"));

          return;
        }

        if (location.pathname !== PAGE_PATHS.profiles) {
          navigate(`${PAGE_PATHS.profiles}?create=1`);

          return;
        }

        const params = new URLSearchParams(location.search);
        params.set("create", "1");
        navigate(`${PAGE_PATHS.profiles}?${params.toString()}`);
      }}
    />
  );
}
