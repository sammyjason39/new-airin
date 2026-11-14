import type { ReactNode } from "react";
import { ChatAttachmentPanelProvider } from "@/context/chat-attachment-panel-context";
import { emptyStateControlClass } from "@/pages/chat/chat-page.shared";
import {
  EmptyChatBody,
  NewChatTopBar,
} from "@/pages/chat/chat-page-conversation";
import { ChatPageColumn, ChatWelcome } from "@/pages/chat/chat-page-layout";
import type { Onboarding } from "@/pages/chat/use-chat-onboarding";
import type { ChatPageState } from "@/pages/chat/use-chat-page";

export function ChatPageEmptyState({
  below,
  cognito,
  cognitoControl,
  cognitoSurface,
  cognitoToggle,
  composer,
  onboarding,
  ownerAgentSettingsButton,
  ownerHistoryButton,
  ownerMode,
  sessionId,
  state,
}: {
  below?: ReactNode;
  cognito: boolean;
  cognitoControl: (className?: string, extra?: ReactNode) => ReactNode;
  cognitoSurface: boolean;
  cognitoToggle: ReactNode;
  composer: ReactNode;
  onboarding: Onboarding;
  ownerAgentSettingsButton: ReactNode;
  ownerHistoryButton: ReactNode;
  ownerMode: boolean;
  sessionId: string | undefined;
  state: Pick<
    ChatPageState,
    "activeProfile" | "busy" | "handleProfileSwitch" | "profileId" | "profiles"
  >;
}) {
  const { activeProfile, busy, handleProfileSwitch, profileId, profiles } =
    state;

  return (
    <ChatAttachmentPanelProvider below={below} key={sessionId ?? "new"}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {cognitoSurface ? null : (
          <NewChatTopBar
            actions={
              <>
                {ownerHistoryButton}
                {ownerAgentSettingsButton}
              </>
            }
            toggle={cognitoToggle}
          />
        )}
        <ChatPageColumn
          centered
          cognito={cognitoSurface}
          wallpaper={ownerMode && !cognitoSurface}
        >
          {cognitoControl(
            emptyStateControlClass(cognitoSurface),
            ownerMode ? (
              <>
                {ownerHistoryButton}
                {ownerAgentSettingsButton}
              </>
            ) : undefined
          )}
          <div className="mx-auto mb-12 flex w-full max-w-3xl flex-col gap-1">
            <EmptyChatBody onboarding={onboarding}>
              <ChatWelcome
                cognito={cognito}
                onProfileSwitch={handleProfileSwitch}
                ownerMode={ownerMode}
                profile={activeProfile}
                profileId={profileId}
                profileSwitchDisabled={busy}
                profiles={profiles}
              />
              {composer}
            </EmptyChatBody>
          </div>
        </ChatPageColumn>
      </div>
    </ChatAttachmentPanelProvider>
  );
}
