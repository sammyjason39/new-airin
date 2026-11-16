import type { ProfileSummary } from "@airin/core";
import type { AgentGroupMessage, GroupRoster } from "@airin/core/agent-groups";
import { cn } from "@airin/ui/utils";
import { File01Icon } from "hugeicons-react";
import type { ComponentProps } from "react";
import {
  MentionText,
  markMentions,
} from "@/components/agent-groups/group-mentions";
import {
  MessageActions,
  ThreadLink,
} from "@/components/agent-groups/group-message-actions";
import {
  GroupMessageArtifacts,
  GroupMessageImage,
  GroupMessageMemoryChanges,
} from "@/components/agent-groups/group-message-files";
import { timeLabel } from "@/components/agent-groups/group-message-time";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { shortenSharedPaths } from "@/lib/agent-group-panels";
import type { MessageKey } from "@/lib/i18n";
import { agentNameWithRoleLabel } from "@/lib/owner-agent-role-subtitle";

export function GroupMessageRow({
  deliveredId,
  endsGroup,
  index,
  markdownComponents,
  message,
  onOpenThread,
  profiles,
  replying,
  roster,
  runActive,
  showTime,
  startsGroup,
  t,
}: {
  deliveredId: number | undefined;
  endsGroup: boolean;
  index: number;
  markdownComponents: ComponentProps<typeof MessageResponse>["components"];
  message: AgentGroupMessage;
  onOpenThread: (messageId: number) => void;
  profiles: ProfileSummary[];
  replying: boolean;
  roster: GroupRoster;
  runActive: boolean;
  showTime: boolean;
  startsGroup: boolean;
  t: (key: MessageKey) => string;
}) {
  const spacing = index === 0 ? "" : startsGroup ? "mt-3" : "mt-0.5";

  return (
    <>
      {showTime ? (
        <div
          className={cn(
            "text-center text-muted-foreground text-xs",
            index === 0 ? "pb-3" : "py-4"
          )}
        >
          {timeLabel(message.createdAt)}
        </div>
      ) : null}
      {message.authorProfileId === null ? (
        <UserGroupMessage
          delivered={!runActive && message.id === deliveredId}
          endsGroup={endsGroup}
          message={message}
          profiles={profiles}
          roster={roster}
          spacing={spacing}
        />
      ) : (
        <AgentGroupMessageBubble
          endsGroup={endsGroup}
          markdownComponents={markdownComponents}
          message={message}
          onOpenThread={onOpenThread}
          profiles={profiles}
          replying={replying}
          roster={roster}
          spacing={spacing}
          startsGroup={startsGroup}
          t={t}
        />
      )}
    </>
  );
}

function UserGroupMessage({
  delivered,
  endsGroup,
  message,
  profiles,
  roster,
  spacing,
}: {
  delivered: boolean;
  endsGroup: boolean;
  message: AgentGroupMessage;
  profiles: ProfileSummary[];
  roster: GroupRoster;
  spacing: string;
}) {
  return (
    <div className={cn("flex flex-col items-end", spacing)}>
      {message.images?.map((path) => (
        <div className="mb-1 max-w-[75%]" key={path}>
          <GroupMessageImage path={path} />
        </div>
      ))}
      {message.files || message.content ? (
        <div
          className={cn(
            "[&_span]:!text-white w-fit max-w-[75%] whitespace-pre-wrap rounded-[1.25rem] bg-[#0b84fe] px-3.5 py-2 text-white",
            endsGroup && "rounded-br-md"
          )}
        >
          {message.files?.map((filename) => (
            <div
              className="flex items-center gap-1.5 font-medium text-sm"
              key={filename}
            >
              <File01Icon aria-hidden className="size-4 shrink-0" />
              <span className="truncate">{filename}</span>
            </div>
          ))}
          {message.content ? (
            <MentionText
              profiles={profiles}
              roster={roster}
              text={message.content}
            />
          ) : null}
        </div>
      ) : null}
      {delivered ? (
        <span className="mt-0.5 pr-1 text-muted-foreground text-xs">
          Delivered
        </span>
      ) : null}
    </div>
  );
}

function AgentGroupMessageBubble({
  endsGroup,
  markdownComponents,
  message,
  onOpenThread,
  profiles,
  replying,
  roster,
  spacing,
  startsGroup,
  t,
}: {
  endsGroup: boolean;
  markdownComponents: ComponentProps<typeof MessageResponse>["components"];
  message: AgentGroupMessage;
  onOpenThread: (messageId: number) => void;
  profiles: ProfileSummary[];
  replying: boolean;
  roster: GroupRoster;
  spacing: string;
  startsGroup: boolean;
  t: (key: MessageKey) => string;
}) {
  const author = profiles.find(
    (profile) => profile.id === message.authorProfileId
  );

  return (
    <div className={cn("group flex items-end gap-2", spacing)}>
      {endsGroup && author ? (
        <ProfileAvatar
          className="outline-none"
          profile={author}
          size="sm"
          squareMoodstone
        />
      ) : (
        <span className="size-7 shrink-0" />
      )}
      <div className="flex min-w-0 max-w-[75%] flex-col items-start gap-1">
        {startsGroup ? (
          <div className="px-3.5 text-muted-foreground text-xs">
            {author ? agentNameWithRoleLabel(author, t) : "Unavailable agent"}
          </div>
        ) : null}
        {message.content ? (
          <div
            className={cn(
              "relative max-w-full rounded-[1.25rem] bg-muted px-3.5 py-2",
              endsGroup && "rounded-bl-md"
            )}
          >
            <Message
              className="mr-0 ml-0 max-w-full items-start justify-start"
              from="assistant"
            >
              <MessageContent className="ml-0 w-full max-w-full gap-1 group-[.is-user]:ml-0">
                <MessageResponse components={markdownComponents}>
                  {markMentions(shortenSharedPaths(message.content), roster)}
                </MessageResponse>
              </MessageContent>
            </Message>
            <MessageActions
              onReply={() => onOpenThread(message.id)}
              text={message.content}
            />
          </div>
        ) : null}
        <GroupMessageMemoryChanges changes={message.memoryChanges} />
        {message.authorProfileId ? (
          <GroupMessageArtifacts
            content={message.content}
            messageId={message.id}
            profileId={message.authorProfileId}
          />
        ) : null}
        <ThreadLink
          onClick={() => onOpenThread(message.id)}
          replies={message.threadReplies}
          replying={replying}
        />
      </div>
    </div>
  );
}
