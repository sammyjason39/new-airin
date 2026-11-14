import type {
  AgentChannel,
  McpServerSummary,
  ProfileSummary,
} from "@airin/core/contract";
import { cn } from "@airin/ui/utils";
import { ArrowDown01Icon } from "hugeicons-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ChatArtifactRef } from "@/lib/chat-artifacts";
import type { ChatContextUsage } from "@/lib/chat-context-usage";
import type { ChatListItem } from "@/lib/chat-history";

/** One card of the status panel. The title toggles the body. */
export function ChatStatusSection({
  aside,
  children,
  defaultOpen = true,
  title,
}: {
  aside?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  title: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-xl border border-border px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <button
          aria-expanded={open}
          className="-mx-1 flex items-center gap-1 rounded-md px-1 font-medium text-sm hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          {title}
          <ArrowDown01Icon
            aria-hidden
            className={cn(
              "size-3.5 text-muted-foreground transition-transform",
              !open && "-rotate-90"
            )}
          />
        </button>
        {aside}
      </div>
      {open ? <ul className="mt-2 flex flex-col gap-0.5">{children}</ul> : null}
    </section>
  );
}

export function ChatStatusRow({
  children,
  icon,
  trailing,
}: {
  children: ReactNode;
  icon: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <li className="flex min-h-7 items-center gap-2.5 text-sm">
      <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </li>
  );
}

export function mcpStatusDotClass(server: McpServerSummary) {
  if (!server.enabled) {
    return "bg-muted-foreground/40";
  }

  if (server.status === "connected") {
    return "bg-emerald-500";
  }

  return server.status === "error"
    ? "bg-destructive"
    : "bg-muted-foreground/40";
}

/** Chat state the status panel shows. */
export interface ChatStatusData {
  busy: boolean;
  channel: AgentChannel;
  contextUsage: ChatContextUsage | null;
  messages: ChatListItem[];
  modelLabel: ReactNode;
  profile: ProfileSummary | undefined;
  profileId: string;
}

interface ChatStatusSelection {
  artifact: ChatArtifactRef;
  /** Bumped on every click, so a second click on the same file opens it again. */
  nonce: number;
}

interface ChatStatusContextValue {
  clear: () => void;
  data: ChatStatusData;
  select: (artifact: ChatArtifactRef) => void;
  selection: ChatStatusSelection | null;
}

const ChatStatusContext = createContext<ChatStatusContextValue | null>(null);

export function useChatStatus(): ChatStatusContextValue {
  const context = useContext(ChatStatusContext);

  if (!context) {
    throw new Error("useChatStatus must be used within ChatStatusProvider");
  }

  return context;
}

/**
 * Gives the status panel live chat state. It wraps the attachment panel
 * provider, so the panel body reads it directly instead of being re-sent.
 */
export function ChatStatusProvider({
  children,
  data,
}: {
  children: ReactNode;
  data: ChatStatusData;
}) {
  const [selection, setSelection] = useState<ChatStatusSelection | null>(null);
  const clear = useCallback(() => setSelection(null), []);

  const select = useCallback(
    (artifact: ChatArtifactRef) =>
      setSelection((current) => ({
        artifact,
        nonce: (current?.nonce ?? 0) + 1,
      })),
    []
  );

  const value = useMemo(
    () => ({ clear, data, select, selection }),
    [clear, data, select, selection]
  );

  return (
    <ChatStatusContext.Provider value={value}>
      {children}
    </ChatStatusContext.Provider>
  );
}
