import type { AgentGroupMessage } from "@airin/core/agent-groups";

/** A time label shows between messages this far apart. */
export const TIME_GAP_MS = 30 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

/** "Today 8:36 AM", "Yesterday 12:35 PM", else "Oct 18, 12:35 PM". */
export function timeLabel(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY_MS);

  if (days === 0) {
    return `Today ${time}`;
  }

  if (days === 1) {
    return `Yesterday ${time}`;
  }

  const day = date.toLocaleDateString([], { day: "numeric", month: "short" });

  return `${day}, ${time}`;
}

/**
 * A sent message first carries a temporary id, then the server's. Keying user
 * messages by their order keeps the swap from remounting (and flashing) them.
 */
export function messageKeys(messages: AgentGroupMessage[]): string[] {
  let userCount = 0;

  return messages.map((message) =>
    message.authorProfileId === null
      ? `user-${userCount++}`
      : `message-${message.id}`
  );
}
