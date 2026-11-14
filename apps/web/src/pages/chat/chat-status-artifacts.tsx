import { File01Icon } from "hugeicons-react";
import { useEffect, useMemo, useRef } from "react";
import { useArtifactAttachmentPreviewPanel } from "@/components/chat/use-artifact-attachment-preview-panel";
import { useChatAttachmentPanel } from "@/context/use-chat-attachment-panel";
import {
  type ChatArtifactRef,
  extractTurnArtifacts,
} from "@/lib/chat-artifacts";
import type { ChatListItem } from "@/lib/chat-history";
import { groupMessagesIntoTurns } from "@/lib/chat-message-turns";
import {
  ChatStatusSection,
  useChatStatus,
} from "@/pages/chat/chat-status-panel-shared";

export function artifactKey(artifact: ChatArtifactRef) {
  return `${artifact.ownerProfileId ?? ""}:${artifact.path}`;
}

/** Newest first, one entry per file, read turn by turn like the transcript. */
export function collectArtifacts(messages: ChatListItem[]) {
  const byKey = new Map<string, ChatArtifactRef>();

  for (const turn of groupMessagesIntoTurns(messages).reverse()) {
    if (turn.kind === "user") {
      continue;
    }

    const turnArtifacts = extractTurnArtifacts(
      turn.messages.map(({ message }) => message)
    );

    for (const artifact of turnArtifacts.reverse()) {
      const key = artifactKey(artifact);

      if (!byKey.has(key)) {
        byKey.set(key, artifact);
      }
    }
  }

  return [...byKey.values()];
}

/**
 * Owns the preview of a file picked in Outputs. It lives beside the chat, not
 * in the status panel, so it stays mounted (and keeps loading the file) after
 * the preview replaces the status panel.
 */
export function ChatStatusArtifactOpener() {
  const { clear, data, selection } = useChatStatus();

  if (!selection) {
    return null;
  }

  return (
    <ChatStatusArtifactPreview
      artifact={selection.artifact}
      key={`${artifactKey(selection.artifact)}:${selection.nonce}`}
      onClosed={clear}
      profileId={data.profileId}
    />
  );
}

function ChatStatusArtifactPreview({
  artifact,
  onClosed,
  profileId,
}: {
  artifact: ChatArtifactRef;
  onClosed: () => void;
  profileId: string;
}) {
  const { activeId } = useChatAttachmentPanel();
  const id = `chat-status:${artifactKey(artifact)}`;
  const requestedRef = useRef(false);
  const shownRef = useRef(false);

  const { openPanel } = useArtifactAttachmentPreviewPanel({
    artifact,
    id,
    profileId: artifact.ownerProfileId ?? profileId,
  });

  useEffect(() => {
    if (!requestedRef.current) {
      requestedRef.current = true;
      openPanel();
    }
  });

  // Unmount once the preview is closed or replaced.
  useEffect(() => {
    if (activeId === id) {
      shownRef.current = true;
    } else if (shownRef.current) {
      onClosed();
    }
  }, [activeId, id, onClosed]);

  return null;
}

export function ChatStatusArtifactRow({
  artifact,
}: {
  artifact: ChatArtifactRef;
}) {
  const { select } = useChatStatus();
  const type = artifact.filename.split(".").pop()?.toUpperCase();

  return (
    <li>
      <button
        className="-mx-1.5 flex min-h-7 w-[calc(100%+0.75rem)] items-center gap-2.5 rounded-md px-1.5 text-left text-sm hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => select(artifact)}
        type="button"
      >
        <File01Icon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground"
        />
        <span className="min-w-0 flex-1 truncate">{artifact.filename}</span>
        {type ? (
          <span className="shrink-0 text-muted-foreground text-xs">{type}</span>
        ) : null}
      </button>
    </li>
  );
}

export function ChatStatusOutputsSection({
  artifacts,
}: {
  artifacts: ChatArtifactRef[];
}) {
  return (
    <ChatStatusSection title="Outputs">
      {artifacts.length === 0 ? (
        <li className="text-muted-foreground text-sm">No files yet</li>
      ) : (
        artifacts.map((artifact) => (
          <ChatStatusArtifactRow
            artifact={artifact}
            key={artifactKey(artifact)}
          />
        ))
      )}
    </ChatStatusSection>
  );
}

export function useSettledArtifacts(
  messages: ChatListItem[]
): ChatArtifactRef[] {
  return useMemo(() => collectArtifacts(messages), [messages]);
}
