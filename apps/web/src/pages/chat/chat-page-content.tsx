import { Button } from "@airin/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@airin/ui/dialog";
import { Spinner } from "@airin/ui/spinner";
import { cn } from "@airin/ui/utils";
import { Settings01Icon } from "hugeicons-react";
import {
  lazy,
  type ReactNode,
  Suspense,
  useMemo,
  useRef,
  useState,
} from "react";
import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { ChatCognitoControl } from "@/components/chat/chat-cognito-control";
import { OwnerAgentSettingsDialog } from "@/components/OwnerAgentSettingsDialog";
import { useUiMode } from "@/context/use-ui-mode";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useChatUsageVisible } from "@/hooks/use-chat-usage-visible";
import { usePostTurnSkillReviewOverlay } from "@/hooks/use-post-turn-skill-review-overlay";
import { sumChatUsage } from "@/lib/chat-usage";
import { shouldShowCognitoControl } from "@/pages/chat/chat-page.shared";
import { ChatPageComposerSection } from "@/pages/chat/chat-page-content-composer";
import { ChatPageEmptyState } from "@/pages/chat/chat-page-content-empty";
import { ChatConversation } from "@/pages/chat/chat-page-conversation";
import {
  ChatHistoryButton,
  ChatStatusButton,
} from "@/pages/chat/chat-status-panel";
import { useOnboarding } from "@/pages/chat/use-chat-onboarding";
import type { ChatPageState } from "@/pages/chat/use-chat-page";

const ProviderSetupForm = lazy(async () => ({
  default: (await import("@/components/ProviderSetupForm")).ProviderSetupForm,
}));

// oxlint-disable-next-line react-doctor/no-high-complexity-react-function -- Owner/Advanced empty vs active chat composition stays in one entry.
export function ChatPageContent({
  below,
  cognitoLocked = false,
  onBtw,
  ...state
}: ChatPageState & {
  below?: ReactNode;
  /** Cognito cannot be turned off here: no toggle, no cognito surface. */
  cognitoLocked?: boolean;
  onBtw?: (question: string) => void;
}) {
  const {
    session,
    messages,
    profileId,
    profiles,
    activeProfile,
    availableSkills,
    chatStatus,
    busy,
    lastSuccessfulTurnAt,
    canStop,
    error,
    composerDraftKey,
    composerEntry,
    queuedMessages,
    editQueuedMessage,
    removeQueuedMessage,
    sendQueuedMessageNow,
    showOfflineHint,
    health,
    providerModelGroups,
    currentModelSelection,
    activeModelSupportsVision,
    thinkingEffortVisible,
    thinkingEffort,
    thinkingEffortDisabled,
    thinkingEffortOptions,
    readOnlySession,
    isEmptyState,
    composerDisabled,
    sessionChannel,
    contextUsage,
    handleProfileSwitch,
    handleModelChange,
    handleThinkingEffortChange,
    renderModelLabel,
    cognito,
    handleCognitoChange,
    sendMessage,
    stopStreaming,
    agentTodos,
    agentQuestionnaire,
    promptHistoryRef,
  } = state;

  const [providerDialogOpen, setProviderDialogOpen] = useState(false);

  const onboarding = useOnboarding({
    cognito,
    cognitoLocked,
    isEmptyState,
    profileId,
    readOnlySession,
  });

  // A locked cognito chat looks like a normal one: it has no other mode.
  const cognitoSurface = cognito && !cognitoLocked;

  const cognitoToggle =
    !cognitoLocked && shouldShowCognitoControl(cognito, isEmptyState) ? (
      <ChatCognitoControl
        cognito={cognito}
        disabled={busy || readOnlySession}
        onCognitoChange={handleCognitoChange}
      />
    ) : null;

  // Pinned to the column's top-right corner, which is the top right of the
  // screen area. The backdrop keeps it readable over a scrolling transcript.
  const cognitoControl = (className?: string, extra?: ReactNode) =>
    cognitoToggle || extra ? (
      <div
        className={cn(
          "absolute top-2 right-3 z-20 rounded-full backdrop-blur sm:right-6",
          className
        )}
      >
        {cognitoToggle}
        {extra}
      </div>
    ) : null;

  const { visible: chatUsageSetting } = useChatUsageVisible();
  const sessionUsage = useMemo(() => sumChatUsage(messages), [messages]);

  const { banner: skillReviewBanner } = usePostTurnSkillReviewOverlay({
    lastSuccessfulTurnAt,
    profile: activeProfile,
    readOnlySession,
    sessionChannel,
    sessionId: session?.id ?? null,
  });

  const modelPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const { uiMode } = useUiMode();
  const ownerMode = uiMode === "owner";
  const showUsage = !ownerMode && chatUsageSetting;
  const [agentSettingsOpen, setAgentSettingsOpen] = useState(false);
  const { navigateToNewChat } = useAppNavigation();

  const startNewChat = () => {
    // Simple stays on one thread until `/new` (or `/new session`) is invoked.
    if (!profileId) {
      return;
    }

    navigateToNewChat(profileId);
  };

  const ownerAgentSettingsButton =
    ownerMode && activeProfile && !isEmptyState ? (
      <Button
        aria-label="Agent settings"
        className="text-muted-foreground"
        onClick={() => setAgentSettingsOpen(true)}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <Settings01Icon aria-hidden className="size-4" />
      </Button>
    ) : null;

  const ownerHistoryButton = ownerMode ? (
    <ChatHistoryButton profileId={profileId} />
  ) : null;

  const composer = (
    <ChatPageComposerSection
      modelPickerTriggerRef={modelPickerTriggerRef}
      onBtw={onBtw}
      onConnectProvider={() => setProviderDialogOpen(true)}
      onNewChat={startNewChat}
      ownerMode={ownerMode}
      skillReviewBanner={skillReviewBanner}
      state={{
        activeModelSupportsVision,
        activeProfile,
        agentQuestionnaire,
        agentTodos,
        availableSkills,
        busy,
        canStop,
        chatStatus,
        composerDisabled,
        composerDraftKey,
        composerEntry,
        contextUsage,
        currentModelSelection,
        editQueuedMessage,
        error,
        handleModelChange,
        handleThinkingEffortChange,
        health,
        isEmptyState,
        profileId,
        promptHistoryRef,
        providerModelGroups,
        queuedMessages,
        readOnlySession,
        removeQueuedMessage,
        renderModelLabel,
        sendMessage,
        sendQueuedMessageNow,
        sessionChannel,
        sessionUsage,
        showOfflineHint,
        stopStreaming,
        thinkingEffort,
        thinkingEffortDisabled,
        thinkingEffortOptions,
        thinkingEffortVisible,
      }}
    />
  );

  const content = isEmptyState ? (
    <ChatPageEmptyState
      below={below}
      cognito={cognito}
      cognitoControl={cognitoControl}
      cognitoSurface={cognitoSurface}
      cognitoToggle={cognitoToggle}
      composer={composer}
      onboarding={onboarding}
      ownerAgentSettingsButton={ownerAgentSettingsButton}
      ownerHistoryButton={ownerHistoryButton}
      ownerMode={ownerMode}
      sessionId={session?.id}
      state={{
        activeProfile,
        busy,
        handleProfileSwitch,
        profileId,
        profiles,
      }}
    />
  ) : (
    <ChatConversation
      below={below}
      // The session bar is hidden on phones, so the status button sits here.
      cognitoControl={cognitoControl(
        "sm:hidden",
        <>
          {ownerHistoryButton}
          {ownerAgentSettingsButton}
          <ChatStatusButton />
        </>
      )}
      cognitoSurface={cognitoSurface}
      cognitoToggle={cognitoToggle}
      composer={composer}
      onSwitchModel={() => modelPickerTriggerRef.current?.click()}
      ownerAgentSettingsButton={ownerAgentSettingsButton}
      ownerHistoryButton={ownerHistoryButton}
      ownerMode={ownerMode}
      showSessionBar={!cognitoLocked}
      showUsage={showUsage}
      state={state}
    />
  );

  return (
    <PromptInputProvider
      initialInput={composerEntry.initialInput}
      key={`${composerDraftKey}:${composerEntry.revision}`}
    >
      {content}
      {activeProfile ? (
        <OwnerAgentSettingsDialog
          onOpenChange={setAgentSettingsOpen}
          open={agentSettingsOpen}
          profile={activeProfile}
        />
      ) : null}
      <Dialog onOpenChange={setProviderDialogOpen} open={providerDialogOpen}>
        <DialogContent className="w-[min(96vw,56rem)] grid-cols-1 sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Connect provider</DialogTitle>
          </DialogHeader>
          <Suspense fallback={<Spinner className="size-6" />}>
            <ProviderSetupForm
              onSuccess={() => setProviderDialogOpen(false)}
              showHeading={false}
              submitLabel="Connect provider"
            />
          </Suspense>
        </DialogContent>
      </Dialog>
    </PromptInputProvider>
  );
}
