import type { ProfileSummary } from "@airin/core";
import { ProfileAvatar } from "@/components/ProfileAvatar";

/** The typing dots of the agent that is writing. */
export function TypingRow({
  activity,
  onOpenLive,
  speaker,
  speakerContinues,
  speakerLabel,
  stopping,
}: {
  activity: string | null;
  onOpenLive: () => void;
  speaker: ProfileSummary | undefined;
  speakerContinues: boolean;
  speakerLabel: string;
  stopping: boolean;
}) {
  const label = stopping
    ? "Stopping after this reply"
    : activity?.trim() || "Working…";

  return (
    <div className="mt-3 flex items-end gap-2">
      {speaker ? (
        <ProfileAvatar
          active
          activity={stopping ? "idle" : "responding"}
          className="outline-none"
          profile={speaker}
          size="sm"
        />
      ) : (
        <span className="size-7 shrink-0" />
      )}
      <div className="flex flex-col items-start gap-1">
        {speaker && !speakerContinues ? (
          <div className="px-3.5 text-muted-foreground text-xs">
            {speakerLabel}
          </div>
        ) : null}
        <button
          aria-label={
            stopping ? "Stopping, watch live" : `${label}, watch live`
          }
          className="flex min-h-9 cursor-pointer items-center gap-2 rounded-[1.25rem] rounded-bl-md bg-muted px-4 py-2 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onOpenLive}
          type="button"
        >
          <span className="flex items-center gap-1">
            {[0, 1, 2].map((dot) => (
              <span
                className="size-2 animate-bounce rounded-full bg-muted-foreground/60"
                key={dot}
                style={{ animationDelay: `${dot * 150}ms` }}
              />
            ))}
          </span>
          <span className="text-muted-foreground text-xs">{label}</span>
        </button>
      </div>
    </div>
  );
}
