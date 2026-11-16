import type { ProfileSummary } from "@airin/core";
import type {
  AgentGroupMessage,
  AgentGroupRun,
  GroupRoster,
} from "@airin/core/agent-groups";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { mentionMarkdownComponents } from "@/components/agent-groups/group-mentions";
import { GroupMessageRow } from "@/components/agent-groups/group-message-row";
import {
  messageKeys,
  TIME_GAP_MS,
} from "@/components/agent-groups/group-message-time";
import { TypingRow } from "@/components/agent-groups/group-message-typing";
import {
  Conversation,
  ConversationScrollButton,
  ConversationStickinessProvider,
} from "@/components/ai-elements/conversation";
import { useLocale } from "@/context/use-locale";
import { agentNameWithRoleLabel } from "@/lib/owner-agent-role-subtitle";

/** Same threshold as the agent chat list. */
const AT_BOTTOM_PX = 80;

/** The group transcript, laid out and pinned to the bottom like agent chat. */
export function GroupMessageList({
  messages,
  onOpenLive,
  onOpenThread,
  profiles,
  roster,
  run,
  threadRunIds,
}: {
  messages: AgentGroupMessage[];
  onOpenLive: () => void;
  onOpenThread: (messageId: number) => void;
  profiles: ProfileSummary[];
  roster: GroupRoster;
  run: AgentGroupRun | null;
  threadRunIds: number[];
}) {
  const { t } = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const markdownComponents = useMemo(
    () => mentionMarkdownComponents(roster, profiles),
    [roster, profiles]
  );

  const pin = useCallback((behavior: ScrollBehavior) => {
    const scroller = scrollRef.current;
    scroller?.scrollTo({ behavior, top: scroller.scrollHeight });
  }, []);

  // New replies, and markdown or images that finish rendering, grow the list;
  // follow them only while the reader sits at the bottom.
  useEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (stickRef.current) {
        pin("auto");
      }
    });

    observer.observe(content);

    return () => observer.disconnect();
  }, [pin]);

  // Sending a message always brings the reader back down to it; the scroll
  // event then marks the list as at the bottom.
  const lastIsUser = messages.at(-1)?.authorProfileId === null;
  const lastId = messages.at(-1)?.id;

  useEffect(() => {
    if (lastIsUser && lastId !== undefined) {
      stickRef.current = true;
      pin("auto");
    }
  }, [lastId, lastIsUser, pin]);

  const stickiness = useMemo(
    () => ({
      isAtBottom,
      scrollToLatest: () => {
        stickRef.current = true;
        setIsAtBottom(true);
        pin("smooth");
      },
    }),
    [isAtBottom, pin]
  );

  const profileById = useMemo(
    () => new Map(profiles.map((profile) => [profile.id, profile])),
    [profiles]
  );

  const replyingThreads = useMemo(() => new Set(threadRunIds), [threadRunIds]);
  const speaker = profileById.get(run?.speakerProfileId ?? "");
  const keys = messageKeys(messages);

  // A new group starts at a time gap or when the author changes; agents show
  // their avatar and name once per group.
  const rows = useMemo(
    () =>
      messages.map((message, index) => {
        const previous = messages[index - 1];

        const showTime =
          !previous ||
          Date.parse(message.createdAt) - Date.parse(previous.createdAt) >
            TIME_GAP_MS;

        const next = messages[index + 1];

        const nextShowTime =
          next !== undefined &&
          Date.parse(next.createdAt) - Date.parse(message.createdAt) >
            TIME_GAP_MS;

        return {
          endsGroup:
            !next ||
            nextShowTime ||
            next.authorProfileId !== message.authorProfileId,
          message,
          showTime,
          startsGroup:
            showTime || previous?.authorProfileId !== message.authorProfileId,
        };
      }),
    [messages]
  );

  // iMessage marks only the newest message as delivered, and only while it is
  // still the last word.
  const deliveredId =
    messages.at(-1)?.authorProfileId === null && (messages.at(-1)?.id ?? 0) > 0
      ? messages.at(-1)?.id
      : undefined;

  const speakerContinues =
    speaker !== undefined && messages.at(-1)?.authorProfileId === speaker.id;

  return (
    <ConversationStickinessProvider value={stickiness}>
      <Conversation className="min-h-0 flex-1">
        <div
          className="no-scrollbar h-full overflow-y-auto"
          id="agent-group-messages"
          onScroll={(event) => {
            const scroller = event.currentTarget;

            const atBottom =
              scroller.scrollHeight -
                scroller.scrollTop -
                scroller.clientHeight <=
              AT_BOTTOM_PX;

            stickRef.current = atBottom;
            setIsAtBottom(atBottom);
          }}
          ref={scrollRef}
        >
          <div
            className="mx-auto flex w-full max-w-3xl flex-col py-4 max-sm:px-0 sm:px-4"
            ref={contentRef}
          >
            {rows.map(
              ({ endsGroup, message, showTime, startsGroup }, index) => (
                <Fragment key={keys[index]}>
                  <GroupMessageRow
                    deliveredId={deliveredId}
                    endsGroup={endsGroup}
                    index={index}
                    markdownComponents={markdownComponents}
                    message={message}
                    onOpenThread={onOpenThread}
                    profiles={profiles}
                    replying={replyingThreads.has(message.id)}
                    roster={roster}
                    runActive={Boolean(run)}
                    showTime={showTime}
                    startsGroup={startsGroup}
                    t={t}
                  />
                </Fragment>
              )
            )}
            {run ? (
              <TypingRow
                activity={run.activity}
                onOpenLive={onOpenLive}
                speaker={speaker}
                speakerContinues={speakerContinues}
                speakerLabel={speaker ? agentNameWithRoleLabel(speaker, t) : ""}
                stopping={run.stopping}
              />
            ) : null}
          </div>
        </div>
        <ConversationScrollButton />
      </Conversation>
    </ConversationStickinessProvider>
  );
}
