import type { AgentChannel, AutomationDeliveryChannel } from "@airin/core";
import type { AgentRequest } from "./chat";

type MessagingChannelPromptConfig = {
  label: string;
  supportsGroupAudience: boolean;
  /** How the channel renders text. Also applied to automation reports. */
  format: readonly string[];
  /** Live-chat behavior only; skipped for automation reports. */
  chat?: readonly string[];
};

export const MESSAGING_CHANNEL_PROMPT = {
  automation: null,
  cli: null,
  discord: {
    chat: [
      "For work that needs tools, send a brief status line first (what you are about to do), then use tools, then send a short outcome when finished.",
    ],
    format: [
      "Discord supports a Markdown subset: **bold**, *italic*, __underline__, ~~strikethrough~~, inline code, fenced code blocks, and headings.",
      "Avoid tables and very long code blocks; keep messages compact for chat.",
    ],
    label: "Discord",
    supportsGroupAudience: true,
  },
  slack: {
    format: [
      "Write in normal Markdown; Slack renders **bold**, *italic*, ~~strikethrough~~, links, lists, inline code, and fenced code blocks.",
      "Avoid tables and very long code blocks; keep messages compact for chat.",
    ],
    label: "Slack",
    supportsGroupAudience: true,
  },
  subagent: null,
  task: null,
  teams: {
    format: [
      "Use simple Markdown and keep responses suitable for a personal Teams chat. File delivery is not available on this connection.",
    ],
    label: "Microsoft Teams",
    supportsGroupAudience: false,
  },
  telegram: {
    chat: [
      "When you save an artifact, Airin posts a share link after your reply. When the user asks to send or attach the file (or uses /attach), Airin sends a Telegram document — do not say you cannot attach or send files, and do not redirect them only to the Artifacts tab for that request.",
    ],
    format: [
      "Write in normal Markdown when formatting helps; Telegram delivery will render a safe rich subset.",
      "Use simple Markdown: **bold**, *italic*, __underline__, inline code, fenced code blocks, headings, links, and short lists.",
      "Avoid raw HTML, Markdown tables, deeply nested lists, and very long code blocks because Telegram is best for compact chat messages.",
    ],
    label: "Telegram",
    supportsGroupAudience: true,
  },
  web: null,
  whatsapp: {
    chat: [
      "WhatsApp /attach resends the most recent saved artifact without an agent turn. Saving a file alone does not upload it.",
    ],
    format: [
      "WhatsApp only supports simple *bold* and _italic_ formatting.",
      "Do not use markdown headings, bullet lists, numbered lists, tables, or ``` code fences.",
    ],
    label: "WhatsApp",
    supportsGroupAudience: true,
  },
} as const satisfies Record<AgentChannel, MessagingChannelPromptConfig | null>;

/**
 * The channels that get a messaging style, read back off the map above instead
 * of hand-written beside it. The map is total over `AgentChannel`, so a new
 * channel fails the typecheck there and has to say whether it is one of these.
 */
type MessagingChannel = {
  [K in AgentChannel]: (typeof MESSAGING_CHANNEL_PROMPT)[K] extends null
    ? never
    : K;
}[AgentChannel];

const SHARED_MESSAGING_STYLE = [
  "Write like texting a friend: short paragraphs and a conversational tone.",
  "Prefer one to three brief paragraphs unless the user asks for detail.",
  "If you must share code or commands, put them on their own line as plain text without backticks.",
  "Do not mention tools, JSON, or internal steps in the user-visible reply.",
] as const;

export const AUTOMATION_REPORT_STYLE =
  'Your final reply is read as a message from a person. Write plainly, lead with the result, and skip openers like "Here is your report" or "Task completed".';

export function isMessagingChannel(
  channel: AgentRequest["channel"] | undefined
): channel is MessagingChannel {
  return channel !== undefined && MESSAGING_CHANNEL_PROMPT[channel] !== null;
}

export function appendMessagingChannelPrompt(
  sections: string[],
  channel: MessagingChannel,
  chatKind: "private" | "group"
): void {
  const config: MessagingChannelPromptConfig =
    MESSAGING_CHANNEL_PROMPT[channel];

  const audienceLine =
    chatKind === "group" && config.supportsGroupAudience
      ? `You are replying in a ${config.label} channel. Everyone in the channel can see your messages.`
      : `You are replying in a private ${config.label} chat.`;

  sections.push(
    "",
    audienceLine,
    ...config.format,
    ...(config.chat ?? []),
    ...SHARED_MESSAGING_STYLE
  );
}

export function appendAutomationDeliveryPrompt(
  sections: string[],
  deliveryChannel: AutomationDeliveryChannel | undefined
): void {
  sections.push("", AUTOMATION_REPORT_STYLE);

  if (deliveryChannel && deliveryChannel !== "email") {
    const config: MessagingChannelPromptConfig =
      MESSAGING_CHANNEL_PROMPT[deliveryChannel];

    sections.push(
      `Your final reply is sent to ${config.label} as the run report.`,
      ...config.format
    );
  }
}
