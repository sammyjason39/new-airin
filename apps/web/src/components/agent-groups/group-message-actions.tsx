import { Chat01Icon, CheckmarkCircle01Icon, Copy01Icon } from "hugeicons-react";
import { useState } from "react";

const ACTION_BUTTON =
  "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Copy and reply, floated over the card's top right while it is hovered. */
export function MessageActions({
  onReply,
  text,
}: {
  onReply: () => void;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="absolute top-0 right-3 flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-border bg-background p-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
      <button
        aria-label={copied ? "Copied" : "Copy response"}
        className={ACTION_BUTTON}
        onClick={copy}
        title={copied ? "Copied" : "Copy response"}
        type="button"
      >
        {copied ? (
          <CheckmarkCircle01Icon aria-hidden className="size-4" />
        ) : (
          <Copy01Icon aria-hidden className="size-4" />
        )}
      </button>
      <button
        aria-label="Reply in thread"
        className={ACTION_BUTTON}
        onClick={onReply}
        title="Reply in thread"
        type="button"
      >
        <Chat01Icon aria-hidden className="size-4" />
      </button>
    </div>
  );
}

/** Under the text once a thread has replies, or an agent is answering in it. */
export function ThreadLink({
  onClick,
  replies,
  replying,
}: {
  onClick: () => void;
  replies: number;
  replying: boolean;
}) {
  if (replies === 0 && !replying) {
    return null;
  }

  return (
    <button
      className="ml-1 rounded text-left font-medium text-primary text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onClick}
      type="button"
    >
      {replying
        ? "Replying in thread…"
        : `${replies} ${replies === 1 ? "reply" : "replies"} in thread`}
    </button>
  );
}
