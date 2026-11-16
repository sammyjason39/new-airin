import type { SessionSummary } from "@airin/core/contract";
import { Button } from "@airin/ui/button";
import { cn } from "@airin/ui/utils";
import { Clock04Icon, PencilEdit02Icon } from "hugeicons-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useChatAttachmentPanel } from "@/context/use-chat-attachment-panel";
import { useLocale } from "@/context/use-locale";
import { useUiMode } from "@/context/use-ui-mode";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useHistorySessionsQuery } from "@/hooks/use-resource-mutations";
import { buildChatPath } from "@/lib/chat-history";

const CHAT_HISTORY_PANEL_ID = "chat-history";

/**
 * Owner right panel: earlier chats for this agent, plus New chat.
 */
export function ChatHistoryButton({ profileId }: { profileId: string }) {
  const { activeId, hide, show } = useChatAttachmentPanel();
  const { t } = useLocale();
  const open = activeId === CHAT_HISTORY_PANEL_ID;

  return (
    <Button
      aria-label={t("owner.history")}
      aria-pressed={open}
      className={cn(
        "text-muted-foreground",
        open && "bg-accent text-foreground"
      )}
      onClick={() =>
        open
          ? hide(CHAT_HISTORY_PANEL_ID)
          : show({
              bodyClassName: "flex min-h-0 flex-1 flex-col gap-3 p-3",
              content: <ChatHistoryBody profileId={profileId} />,
              fixedWidth: 340,
              id: CHAT_HISTORY_PANEL_ID,
              title: t("owner.history"),
            })
      }
      size="icon-sm"
      title={t("owner.history")}
      type="button"
      variant="ghost"
    >
      <Clock04Icon aria-hidden className="size-4" />
    </Button>
  );
}

function ChatHistoryBody({ profileId }: { profileId: string }) {
  const { t } = useLocale();
  const { uiMode } = useUiMode();
  const { navigateToNewChat } = useAppNavigation();
  const { hide } = useChatAttachmentPanel();
  const location = useLocation();
  const list = useHistorySessionsQuery(profileId);
  const sessions = list.data ?? [];
  const pinned = sessions.filter((session) => session.pinned);
  const recent = sessions.filter((session) => !session.pinned);
  const continuousSimple = uiMode === "owner";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {continuousSimple ? null : (
        <Button
          className="w-full justify-start gap-2"
          onClick={() => {
            hide(CHAT_HISTORY_PANEL_ID);
            navigateToNewChat(profileId);
          }}
          size="sm"
          type="button"
          variant="outline"
        >
          <PencilEdit02Icon aria-hidden className="size-4" />
          {t("owner.newChat")}
        </Button>
      )}
      <ChatHistorySection
        empty={t("owner.historyEmpty")}
        loading={list.isLoading}
        sessions={recent}
        title={t("owner.resumeConversations")}
      >
        {(session) => {
          const href = buildChatPath(profileId, session.id);
          const current = location.pathname === href;

          return (
            <Link
              aria-current={current ? "page" : undefined}
              className={cn(
                "block truncate rounded-md px-2 py-1.5 text-sm hover:bg-accent/60",
                current && "bg-accent text-foreground"
              )}
              key={session.id}
              onClick={() => hide(CHAT_HISTORY_PANEL_ID)}
              to={href}
            >
              {session.title?.trim() || t("owner.newChat")}
            </Link>
          );
        }}
      </ChatHistorySection>
      {pinned.length > 0 ? (
        <ChatHistorySection
          empty={null}
          loading={false}
          sessions={pinned}
          title={t("owner.pin")}
        >
          {(session) => {
            const href = buildChatPath(profileId, session.id);
            const current = location.pathname === href;

            return (
              <Link
                aria-current={current ? "page" : undefined}
                className={cn(
                  "block truncate rounded-md px-2 py-1.5 text-sm hover:bg-accent/60",
                  current && "bg-accent text-foreground"
                )}
                key={session.id}
                onClick={() => hide(CHAT_HISTORY_PANEL_ID)}
                to={href}
              >
                {session.title?.trim() || t("owner.newChat")}
              </Link>
            );
          }}
        </ChatHistorySection>
      ) : null}
    </div>
  );
}

function ChatHistorySection({
  children,
  empty,
  loading,
  sessions,
  title,
}: {
  children: (session: SessionSummary) => ReactNode;
  empty: string | null;
  loading: boolean;
  sessions: SessionSummary[];
  title: string;
}) {
  return (
    <section className="flex min-h-0 flex-col gap-1.5">
      <h2 className="px-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {title}
      </h2>
      <div className="no-scrollbar min-h-0 overflow-y-auto">
        {loading ? (
          <p className="px-2 py-1.5 text-muted-foreground text-xs">…</p>
        ) : null}
        {!(loading || sessions.length > 0) && empty ? (
          <p className="px-2 py-1.5 text-muted-foreground text-xs">{empty}</p>
        ) : null}
        {sessions.map((session) => children(session))}
      </div>
    </section>
  );
}
