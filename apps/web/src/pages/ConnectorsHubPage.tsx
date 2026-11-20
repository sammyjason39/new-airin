import { Button } from "@airin/ui/button";
import { Input } from "@airin/ui/input";
import { Spinner } from "@airin/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { Add01Icon, Search01Icon } from "hugeicons-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ConnectorAppCard,
  type ConnectorStatus,
} from "@/components/library-hub/ConnectorAppCard";
import { LibraryHubFrame } from "@/components/library-hub/LibraryHubTabs";
import { useAuth } from "@/context/use-auth";
import { useMcpServersQuery } from "@/hooks/use-app-queries";
import {
  useComposioToolkits,
  useConnectComposioToolkit,
  useEnableComposioToolkit,
} from "@/hooks/use-composio";
import { client, formatError } from "@/lib/client";
import {
  buildToolkitRows,
  searchToolkitRows,
  type ToolkitRowModel,
} from "@/lib/composio-toolkit-rows";
import { PAGE_PATHS } from "@/lib/navigation";

function composioStatus(row: ToolkitRowModel): ConnectorStatus {
  if (row.orgToolkit?.status !== "enabled") {
    return "not_connected";
  }

  switch (row.userConnection?.status) {
    case "connected":
      return "connected";
    case "oauth_in_progress":
      return "connecting";
    case "error":
      return "error";
    default:
      return "not_connected";
  }
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Accio-style Connectors hub: app icons for Composio + Airin Library + custom
 * connectors (never called MCP in the UI).
 */
// oxlint-disable-next-line react-doctor/no-high-complexity-react-function -- Composio, Airin Library, and custom connector grids share one hub.
export function ConnectorsHubPage() {
  const { activeOrg } = useAuth();
  const isOrgAdmin = activeOrg?.role === "admin";
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search.trim().toLowerCase());
  const toolkits = useComposioToolkits();
  const connect = useConnectComposioToolkit();
  const enable = useEnableComposioToolkit();
  const mcp = useMcpServersQuery();

  const tapinallStatus = useQuery({
    queryFn: () => client.getTapinallStatus(),
    queryKey: ["tapinall", "status"],
    staleTime: 30_000,
  });

  const tapinallBrowse = useQuery({
    enabled: Boolean(tapinallStatus.data?.configured),
    queryFn: () => client.browseTapinallCatalog(),
    queryKey: ["tapinall", "browse"],
    staleTime: 5 * 60_000,
  });

  const rows = useMemo(
    () => (toolkits.data ? buildToolkitRows(toolkits.data) : []),
    [toolkits.data]
  );

  const logoByKey = useMemo(() => {
    const map = new Map<string, string>();

    for (const item of toolkits.data?.catalog ?? []) {
      if (!item.logoUrl) {
        continue;
      }

      map.set(normalizeKey(item.slug), item.logoUrl);
      map.set(normalizeKey(item.name), item.logoUrl);
    }

    return map;
  }, [toolkits.data?.catalog]);

  const visible = useMemo(() => {
    if (!deferred) {
      return rows.filter(
        (row) =>
          row.orgToolkit?.status === "enabled" ||
          row.userConnection?.status === "connected" ||
          isOrgAdmin
      );
    }

    return searchToolkitRows({
      isOrgAdmin: Boolean(isOrgAdmin),
      query: deferred,
      rows,
    });
  }, [deferred, isOrgAdmin, rows]);

  const libraryApps = useMemo(() => {
    const apps = tapinallBrowse.data?.apps ?? [];
    const q = deferred;

    return apps
      .filter((app) => !q || app.label.toLowerCase().includes(q))
      .slice(0, 48);
  }, [deferred, tapinallBrowse.data?.apps]);

  const customConnectors = useMemo(() => {
    const servers = mcp.data ?? [];
    const q = deferred;

    return servers.filter((server) => {
      const label =
        server.name.trim().toLowerCase() === "tapinall"
          ? "airin library"
          : server.name.toLowerCase();

      return !q || label.includes(q);
    });
  }, [deferred, mcp.data]);

  const busy = connect.isPending || enable.isPending;
  const libraryConfigured = tapinallStatus.data?.configured === true;

  const error =
    (toolkits.error && formatError(toolkits.error)) ||
    (mcp.error && formatError(mcp.error)) ||
    (tapinallStatus.error && formatError(tapinallStatus.error)) ||
    null;

  return (
    <LibraryHubFrame
      toolbar={
        <>
          <div className="relative w-full sm:w-64">
            <Search01Icon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Search connectors"
              className="pl-9"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search connectors"
              value={search}
            />
          </div>
          {isOrgAdmin ? (
            <Button
              nativeButton={false}
              render={<Link to={PAGE_PATHS.mcp} />}
              size="sm"
              type="button"
              variant="outline"
            >
              <Add01Icon aria-hidden className="size-4" />
              Custom connector
            </Button>
          ) : null}
        </>
      }
    >
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-medium text-muted-foreground text-sm">
          Airin Library
        </h2>
        {tapinallStatus.isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Spinner className="size-4" />
            Loading Airin Library…
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <li>
              <ConnectorAppCard
                badge="Library"
                description="Built-in data connectors for research, sheets, and more."
                logoUrl={null}
                name="Airin Library"
                status={libraryConfigured ? "connected" : "not_connected"}
              />
            </li>
            {libraryApps.map((app) => (
              <li key={app.id}>
                <ConnectorAppCard
                  badge="Library"
                  description={`Use ${app.label} through Airin Library.`}
                  logoUrl={
                    logoByKey.get(normalizeKey(app.id)) ??
                    logoByKey.get(normalizeKey(app.label)) ??
                    null
                  }
                  name={app.label}
                  status={libraryConfigured ? "connected" : "not_connected"}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium text-muted-foreground text-sm">Apps</h2>
        {toolkits.isLoading && rows.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Spinner className="size-4" />
            Loading apps…
          </div>
        ) : null}
        {visible.length === 0 && !toolkits.isLoading ? (
          <p className="text-muted-foreground text-sm">No apps match.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((row) => {
              const status = composioStatus(row);
              const enabled = row.orgToolkit?.status === "enabled";

              return (
                <li key={row.catalog.slug}>
                  <ConnectorAppCard
                    description={
                      row.catalog.description?.trim() ||
                      `Connect ${row.catalog.name} to your agents.`
                    }
                    disabled={busy}
                    logoUrl={row.catalog.logoUrl}
                    name={row.catalog.name}
                    onConnect={
                      enabled
                        ? () => void connect.mutateAsync(row.catalog.slug)
                        : isOrgAdmin
                          ? () => void enable.mutateAsync(row.catalog.slug)
                          : undefined
                    }
                    status={status}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium text-muted-foreground text-sm">
          Custom connectors
        </h2>
        {mcp.isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Spinner className="size-4" />
            Loading…
          </div>
        ) : null}
        {customConnectors.length === 0 && !mcp.isLoading ? (
          <p className="text-muted-foreground text-sm">
            No custom connectors yet.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customConnectors.map((server) => {
              const name =
                server.name.trim().toLowerCase() === "tapinall"
                  ? "Airin Library"
                  : server.name;

              const status: ConnectorStatus =
                server.status === "connected"
                  ? "connected"
                  : server.status === "needs_auth"
                    ? "connecting"
                    : server.status === "error"
                      ? "error"
                      : "not_connected";

              return (
                <li key={server.id}>
                  <ConnectorAppCard
                    badge="Custom"
                    description={`${server.toolCount} tool${server.toolCount === 1 ? "" : "s"} available to assigned agents.`}
                    logoUrl={logoByKey.get(normalizeKey(server.name)) ?? null}
                    name={name}
                    onConnect={() => {
                      window.location.assign(PAGE_PATHS.mcp);
                    }}
                    status={status}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </LibraryHubFrame>
  );
}
