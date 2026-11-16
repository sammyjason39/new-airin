import { hasActiveAgentQuestionnaire } from "@airin/core/agent-questionnaire";
import type { ChatUsage } from "@airin/core/contract";
import type { ReactNode } from "react";
import { ChatComposer } from "@/components/chat/chat-composer";
import { formatSessionChannelLabel } from "@/lib/chat-history";
import { extractModelId } from "@/lib/models";
import type { ChatPageState } from "@/pages/chat/use-chat-page";

type ComposerSectionState = Pick<
  ChatPageState,
  | "agentQuestionnaire"
  | "agentTodos"
  | "availableSkills"
  | "activeModelSupportsVision"
  | "busy"
  | "canStop"
  | "chatStatus"
  | "composerDisabled"
  | "composerDraftKey"
  | "composerEntry"
  | "contextUsage"
  | "currentModelSelection"
  | "editQueuedMessage"
  | "error"
  | "handleModelChange"
  | "handleThinkingEffortChange"
  | "health"
  | "isEmptyState"
  | "promptHistoryRef"
  | "providerModelGroups"
  | "queuedMessages"
  | "removeQueuedMessage"
  | "renderModelLabel"
  | "sendMessage"
  | "sendQueuedMessageNow"
  | "sessionChannel"
  | "showOfflineHint"
  | "stopStreaming"
  | "thinkingEffort"
  | "thinkingEffortDisabled"
  | "thinkingEffortOptions"
  | "thinkingEffortVisible"
> & {
  activeProfile: ChatPageState["activeProfile"];
  profileId: ChatPageState["profileId"];
  readOnlySession: boolean;
  sessionUsage: ChatUsage | undefined;
};

export function ChatPageComposerSection({
  ownerMode,
  onBtw,
  onConnectProvider,
  onNewChat,
  modelPickerTriggerRef,
  skillReviewBanner,
  state,
}: {
  ownerMode: boolean;
  onBtw?: (question: string) => void;
  onConnectProvider: () => void;
  onNewChat: () => void;
  modelPickerTriggerRef: React.RefObject<HTMLButtonElement | null>;
  skillReviewBanner: ReactNode;
  state: ComposerSectionState;
}) {
  const {
    busy,
    canStop,
    chatStatus,
    composerDisabled,
    composerDraftKey,
    composerEntry,
    editQueuedMessage,
    error,
    isEmptyState,
    promptHistoryRef,
    queuedMessages,
    removeQueuedMessage,
    sendQueuedMessageNow,
    stopStreaming,
    sendMessage,
    agentTodos,
    agentQuestionnaire,
    readOnlySession,
    sessionChannel,
    activeProfile,
    profileId,
    availableSkills,
    contextUsage,
    currentModelSelection,
    handleModelChange,
    handleThinkingEffortChange,
    health,
    providerModelGroups,
    renderModelLabel,
    sessionUsage,
    showOfflineHint,
    activeModelSupportsVision,
    thinkingEffort,
    thinkingEffortDisabled,
    thinkingEffortOptions,
    thinkingEffortVisible,
  } = state;

  const readOnlyBanner = readOnlySession ? (
    <p className="mb-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-muted-foreground text-sm">
      View-only {formatSessionChannelLabel(sessionChannel)} conversation. Reply
      from {formatSessionChannelLabel(sessionChannel)}.
    </p>
  ) : null;

  const composerClassName =
    isEmptyState && !error
      ? "z-10 py-0 [&>p:first-child]:min-h-0"
      : "z-10 py-0";

  const composerShared = {
    busy,
    canStop,
    chatStatus,
    className: composerClassName,
    disabled: composerDisabled,
    draftStorageKey: composerDraftKey,
    error,
    onEditQueuedMessage: editQueuedMessage,
    onRemoveQueuedMessage: removeQueuedMessage,
    onSendQueuedMessageNow: sendQueuedMessageNow,
    onStop: stopStreaming,
    onSubmit: (text: string, files: Parameters<typeof sendMessage>[1]) => {
      void sendMessage(text, files);
    },
    placeholder: isEmptyState
      ? ownerMode
        ? `Message ${activeProfile?.name ?? "agent"}`
        : composerEntry.placeholder
      : undefined,
    promptHistoryRef,
    queuedMessages,
    todos: hasActiveAgentQuestionnaire(agentQuestionnaire) ? [] : agentTodos,
  } as const;

  if (ownerMode) {
    return (
      <>
        {readOnlyBanner}
        <ChatComposer
          {...composerShared}
          profileId={profileId}
          variant="minimal"
        />
      </>
    );
  }

  return (
    <>
      {readOnlyBanner}
      <ChatComposer
        {...composerShared}
        availableSkills={availableSkills}
        contextUsage={contextUsage}
        currentModelSelection={currentModelSelection}
        headerNotice={skillReviewBanner}
        modelPickerTriggerRef={modelPickerTriggerRef}
        onBtw={onBtw}
        onConnectProvider={onConnectProvider}
        onModelChange={handleModelChange}
        onNewChat={onNewChat}
        onThinkingEffortChange={handleThinkingEffortChange}
        primarySupportsVision={activeModelSupportsVision}
        profileId={profileId}
        profileModelId={extractModelId(currentModelSelection)}
        providerConfigured={health?.providerConfigured}
        providerModelGroups={providerModelGroups}
        renderModelLabel={renderModelLabel}
        sessionUsage={sessionUsage}
        showOfflineHint={showOfflineHint}
        showTips={isEmptyState}
        thinkingEffort={thinkingEffort}
        thinkingEffortDisabled={thinkingEffortDisabled}
        thinkingEffortOptions={thinkingEffortOptions}
        thinkingEffortVisible={thinkingEffortVisible}
      />
    </>
  );
}
