import { Button } from "@airin/ui/button";
import { cn } from "@airin/ui/utils";
import { ArrowUpRight01Icon } from "hugeicons-react";
import type { ReactNode } from "react";
import { ComposioToolkitLogo } from "@/components/ComposioToolkitLogo";

export type ConnectorStatus =
  | "connected"
  | "connecting"
  | "error"
  | "not_connected"
  | "coming_soon";

function statusLabel(status: ConnectorStatus): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting…";
    case "error":
      return "Error";
    case "coming_soon":
      return "Coming soon";
    default:
      return "Not connected";
  }
}

function statusDot(status: ConnectorStatus): string {
  switch (status) {
    case "connected":
      return "bg-emerald-500";
    case "connecting":
      return "bg-amber-500";
    case "error":
      return "bg-destructive";
    default:
      return "bg-muted-foreground/40";
  }
}

/**
 * Accio-style connector tile: app icon required, status + Connect action.
 */
export function ConnectorAppCard({
  badge,
  description,
  disabled,
  logoUrl,
  name,
  onConnect,
  status,
  trailing,
}: {
  badge?: string;
  description: string;
  disabled?: boolean;
  logoUrl?: string | null;
  name: string;
  onConnect?: () => void;
  status: ConnectorStatus;
  trailing?: ReactNode;
}) {
  const showConnect =
    onConnect &&
    (status === "not_connected" ||
      status === "connecting" ||
      status === "error");

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <ComposioToolkitLogo
          className="size-11 rounded-xl"
          logoUrl={logoUrl}
          name={name}
        />
        <div className="min-w-0 text-right">
          <p className="flex items-center justify-end gap-1.5 text-muted-foreground text-xs">
            <span
              aria-hidden
              className={cn("size-1.5 rounded-full", statusDot(status))}
            />
            {statusLabel(status)}
          </p>
          {showConnect ? (
            <Button
              className="mt-1 h-auto gap-1 px-0 text-primary"
              disabled={disabled}
              onClick={onConnect}
              size="sm"
              type="button"
              variant="link"
            >
              {status === "connecting" ? "Finish" : "Connect"}
              <ArrowUpRight01Icon aria-hidden className="size-3.5" />
            </Button>
          ) : null}
          {trailing}
        </div>
      </div>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-foreground text-sm">{name}</h3>
          {badge ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-2xs text-muted-foreground">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
          {description}
        </p>
      </div>
    </article>
  );
}
