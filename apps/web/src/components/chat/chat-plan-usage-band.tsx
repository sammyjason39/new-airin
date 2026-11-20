import type { OrgPlanUsageResponse } from "@airin/core/contract";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@airin/ui/popover";
import { cn } from "@airin/ui/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/use-auth";
import { client } from "@/lib/client";
import { queryKeys } from "@/lib/query-keys";

function formatUsd(value: number): string {
  if (value < 0.01 && value > 0) {
    return `$${value.toFixed(3)}`;
  }

  return `$${value.toFixed(2)}`;
}

function bandClass(status: OrgPlanUsageResponse["status"]): string {
  if (status === "blocked") {
    return "bg-destructive";
  }

  if (status === "warning") {
    return "bg-amber-500";
  }

  return "bg-foreground/70";
}

function usedRatio(usage: OrgPlanUsageResponse): number {
  if (!(usage.budgetUsd && usage.budgetUsd > 0)) {
    return 0;
  }

  return Math.min(1, usage.spentUsd / usage.budgetUsd);
}

export function ChatPlanUsageBand({ className }: { className?: string }) {
  const { activeOrg } = useAuth();
  const orgId = activeOrg?.id ?? null;

  const { data: usage } = useQuery({
    enabled: Boolean(orgId),
    queryFn: () => client.getOrganizationPlanUsage(orgId as string),
    queryKey: queryKeys.orgs.planUsage(orgId as string),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  if (!(orgId && usage)) {
    return null;
  }

  const ratio = usedRatio(usage);
  const label =
    usage.budgetUsd == null
      ? `${formatUsd(usage.spentUsd)} used`
      : `${formatUsd(usage.remainingUsd ?? 0)} left`;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            aria-label={`Plan usage: ${label}`}
            className={cn(
              "flex h-7 min-w-[5.5rem] max-w-[9rem] flex-col justify-center gap-1 rounded-md px-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              className
            )}
            type="button"
          >
            <span className="truncate text-[10px] tabular-nums leading-none">
              {label}
            </span>
            <span
              aria-hidden
              className="h-1 w-full overflow-hidden rounded-full bg-muted"
            >
              <span
                className={cn(
                  "block h-full rounded-full",
                  bandClass(usage.status)
                )}
                style={{ width: `${Math.round(ratio * 100)}%` }}
              />
            </span>
          </button>
        }
      />
      <PopoverContent
        align="end"
        className="w-72 min-w-72 p-3.5"
        side="top"
        sideOffset={8}
      >
        <PopoverHeader title="Chat plan" />
        <ul className="mt-2 flex flex-col gap-2 text-sm">
          <li className="flex justify-between gap-3">
            <span>Plan</span>
            <span className="text-muted-foreground tabular-nums">
              {usage.planName ?? "—"}
            </span>
          </li>
          <li className="flex justify-between gap-3">
            <span>Used ({usage.month})</span>
            <span className="text-muted-foreground tabular-nums">
              {formatUsd(usage.spentUsd)}
              {usage.budgetUsd == null
                ? ""
                : ` / ${formatUsd(usage.budgetUsd)}`}
            </span>
          </li>
          {usage.remainingUsd == null ? null : (
            <li className="flex justify-between gap-3">
              <span>Left</span>
              <span className="text-muted-foreground tabular-nums">
                {formatUsd(usage.remainingUsd)}
              </span>
            </li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
