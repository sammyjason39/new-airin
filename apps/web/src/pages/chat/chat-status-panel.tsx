import { Button } from "@airin/ui/button";
import { cn } from "@airin/ui/utils";
import { useQuery } from "@tanstack/react-query";
import {
  AiBrain01Icon,
  Message01Icon,
  Plug01Icon,
  TaskDaily01Icon,
} from "hugeicons-react";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useAuth } from "@/context/use-auth";
import { useChatAttachmentPanel } from "@/context/use-chat-attachment-panel";
import { useProfileQuery } from "@/hooks/use-app-queries";
import {
  profileComposioToolkitsQueryOptions,
  useComposioToolkits,
} from "@/hooks/use-composio";
import {
  contextUsageRatio,
  contextUsageSegments,
  formatTokenCountDetailed,
} from "@/lib/chat-context-usage";
import { formatSessionChannelLabel } from "@/lib/chat-history";
import { canManageAgent } from "@/lib/profiles";
import {
  ChatStatusOutputsSection,
  useSettledArtifacts,
} from "@/pages/chat/chat-status-artifacts";
import {
  ChatStatusRow,
  ChatStatusSection,
  mcpStatusDotClass,
  useChatStatus,
} from "@/pages/chat/chat-status-panel-shared";

export { ChatStatusArtifactOpener } from "@/pages/chat/chat-status-artifacts";

export { ChatHistoryButton } from "@/pages/chat/chat-status-history";

export type { ChatStatusData } from "@/pages/chat/chat-status-panel-shared";

export { ChatStatusProvider } from "@/pages/chat/chat-status-panel-shared";

const CHAT_STATUS_PANEL_ID = "chat-status";

/**
 * Opens the chat status in the right side panel: agent, model and channel,
 * context use, MCP servers and files the agent made.
 */
export function ChatStatusButton() {
  const { activeId, hide, show } = useChatAttachmentPanel();
  const open = activeId === CHAT_STATUS_PANEL_ID;

  return (
    <Button
      aria-label="Chat status"
      aria-pressed={open}
      className={cn(
        "text-muted-foreground",
        open && "bg-accent text-foreground"
      )}
      onClick={() =>
        open
          ? hide(CHAT_STATUS_PANEL_ID)
          : show({
              bodyClassName: "flex flex-col gap-2 p-3",
              content: <ChatStatusBody />,
              fixedWidth: 340,
              id: CHAT_STATUS_PANEL_ID,
              title: "Status",
            })
      }
      size="icon-sm"
      variant="ghost"
    >
      <TaskDaily01Icon aria-hidden className="size-4" />
    </Button>
  );
}

/**
 * The agent's Composio apps and whether this user has signed in to each.
 * Members who cannot manage the agent get no list, so they see only MCP.
 */
function useAgentComposioApps(profileId: string, canManage: boolean) {
  // The agent's app list is manager-only; members would get a 403.
  const assignments =
    useQuery({
      ...profileComposioToolkitsQueryOptions(profileId),
      enabled: canManage,
    }).data?.assignments ?? [];

  const composio = useComposioToolkits({
    enabled: assignments.length > 0,
  }).data;

  return assignments.map((assignment) => {
    const orgToolkit = composio?.orgToolkits.find(
      (item) => item.id === assignment.toolkitId
    );

    const catalogItem = composio?.catalog.find(
      (item) => item.slug === assignment.toolkitSlug
    );

    return {
      connected:
        composio?.userConnections.some(
          (item) =>
            item.toolkitId === assignment.toolkitId &&
            item.status === "connected"
        ) ?? false,
      id: assignment.toolkitId,
      logoUrl: catalogItem?.logoUrl,
      name:
        catalogItem?.name ?? orgToolkit?.displayName ?? assignment.toolkitSlug,
    };
  });
}

/** The agent's MCP servers and Composio apps. */
function ChatStatusConnectors({ profileId }: { profileId: string }) {
  const { activeOrg, user } = useAuth();
  const detail = useProfileQuery(profileId);
  const servers = detail.data?.mcpServers ?? [];

  const apps = useAgentComposioApps(
    profileId,
    canManageAgent(detail.data, user, activeOrg?.role === "admin")
  );

  return (
    <ChatStatusSection title="Connectors">
      {servers.length === 0 && apps.length === 0 ? (
        <li className="text-muted-foreground text-sm">
          {detail.isPending ? "Loading…" : "No connectors"}
        </li>
      ) : null}
      {apps.map((app) => (
        <ChatStatusRow
          icon={
            app.logoUrl ? (
              <img
                alt=""
                className="size-4 object-contain"
                decoding="async"
                src={app.logoUrl}
              />
            ) : (
              <Plug01Icon aria-hidden className="size-4" />
            )
          }
          key={app.id}
          trailing={
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                app.connected ? "bg-emerald-500" : "bg-muted-foreground/40"
              )}
              title={app.connected ? "connected" : "not connected"}
            />
          }
        >
          {app.name}
        </ChatStatusRow>
      ))}
      {servers.length === 0
        ? null
        : servers.map((server) => (
            <ChatStatusRow
              icon={<Plug01Icon aria-hidden className="size-4" />}
              key={server.id}
              trailing={
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    mcpStatusDotClass(server)
                  )}
                  title={server.enabled ? server.status : "disabled"}
                />
              }
            >
              {server.name}
            </ChatStatusRow>
          ))}
    </ChatStatusSection>
  );
}

function ChatStatusBody() {
  const {
    data: { channel, contextUsage, messages, modelLabel, profile, profileId },
  } = useChatStatus();

  const artifacts = useSettledArtifacts(messages);
  const ratio = contextUsage ? contextUsageRatio(contextUsage) : 0;

  return (
    <>
      <ChatStatusSection title="Environment">
        <ChatStatusRow
          icon={profile ? <ProfileAvatar profile={profile} size="xxs" /> : null}
        >
          {profile?.name ?? "Agent"}
        </ChatStatusRow>
        <ChatStatusRow icon={<AiBrain01Icon aria-hidden className="size-4" />}>
          {modelLabel}
        </ChatStatusRow>
        <ChatStatusRow icon={<Message01Icon aria-hidden className="size-4" />}>
          {formatSessionChannelLabel(channel)}
        </ChatStatusRow>
      </ChatStatusSection>

      {contextUsage ? (
        <ChatStatusSection
          aside={
            <span className="flex items-center gap-2 text-muted-foreground text-xs tabular-nums">
              {Math.round(ratio * 100)}%
              <span
                aria-hidden
                className="h-1.5 w-10 overflow-hidden rounded-full bg-muted"
              >
                <span
                  className={cn(
                    "block h-full rounded-full",
                    ratio >= 0.9
                      ? "bg-destructive"
                      : ratio >= 0.75
                        ? "bg-amber-500"
                        : "bg-primary"
                  )}
                  style={{ width: `${Math.max(ratio * 100, 4)}%` }}
                />
              </span>
            </span>
          }
          defaultOpen={false}
          title="Context"
        >
          {contextUsageSegments(contextUsage).map((segment) => (
            <ChatStatusRow
              icon={
                <span
                  aria-hidden
                  className={cn("size-2.5 rounded-[3px]", segment.colorClass)}
                />
              }
              key={segment.id}
              trailing={
                <span className="text-muted-foreground text-xs tabular-nums">
                  {formatTokenCountDetailed(segment.tokens)}
                </span>
              }
            >
              {segment.label}
            </ChatStatusRow>
          ))}
        </ChatStatusSection>
      ) : null}

      <ChatStatusConnectors profileId={profileId} />

      <ChatStatusOutputsSection artifacts={artifacts} />
    </>
  );
}
