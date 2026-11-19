import type {
  TapinallCatalogApp,
  TapinallCatalogCollection,
  TapinallCatalogTool,
} from "@airin/core/contract";
import {
  REQUIRED_GOOGLE_TOOLKIT_SLUGS,
  REQUIRED_GOOGLE_TOOLKIT_TITLES,
  type RequiredGoogleToolkitSlug,
} from "@airin/core/required-google-toolkits";
import { Button } from "@airin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@airin/ui/card";
import { Input } from "@airin/ui/input";
import { Spinner } from "@airin/ui/spinner";
import { cn } from "@airin/ui/utils";
import { useQuery } from "@tanstack/react-query";
import { Search01Icon } from "hugeicons-react";
import {
  type Dispatch,
  type SetStateAction,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useComposioToolkits } from "@/hooks/use-composio";
import { client, formatError } from "@/lib/client";
import { pathForPage } from "@/lib/navigation";

function StatusPill({
  label,
  tone = "muted",
}: {
  label: string;
  tone?: "ok" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 font-medium text-xs",
        tone === "ok"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200"
          : "border-border bg-background text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

function formatMicroUsd(micro: string | null): string | null {
  if (!micro) {
    return null;
  }

  const value = Number(micro);

  if (!Number.isFinite(value)) {
    return null;
  }

  return `$${(value / 1_000_000).toFixed(2)}`;
}

function formatToolPrice(tool: TapinallCatalogTool): string {
  if (tool.free) {
    return "Free";
  }

  const micro = Number(tool.priceMicro);

  if (!Number.isFinite(micro)) {
    return "—";
  }

  const dollars = micro / 1_000_000;

  if (dollars < 0.01) {
    return `from $${dollars.toFixed(4)} / ${tool.priceUnit}`;
  }

  return `from $${dollars.toFixed(3)} / ${tool.priceUnit}`;
}

function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

function useMissingGoogleToolkits() {
  const composio = useComposioToolkits();

  const missing = useMemo((): RequiredGoogleToolkitSlug[] => {
    const connected = new Set<string>();

    for (const connection of composio.data?.userConnections ?? []) {
      if (connection.status === "connected") {
        connected.add(connection.toolkitSlug.trim().toLowerCase());
      }
    }

    const open: RequiredGoogleToolkitSlug[] = [];

    for (const slug of REQUIRED_GOOGLE_TOOLKIT_SLUGS) {
      if (!connected.has(slug)) {
        open.push(slug);
      }
    }

    return open;
  }, [composio.data?.userConnections]);

  return {
    loading: composio.isLoading === true,
    missing,
    ready: missing.length === 0,
  };
}

function filterApps(
  apps: TapinallCatalogApp[],
  collections: TapinallCatalogCollection[],
  category: string | null,
  query: string
): TapinallCatalogApp[] {
  if (!(query || category)) {
    return apps;
  }

  const collectionIds = new Set<string>();

  for (const item of collections) {
    if (category && item.category !== category) {
      continue;
    }

    if (
      !query ||
      matchesQuery(item.label, query) ||
      matchesQuery(item.description, query) ||
      matchesQuery(item.id, query)
    ) {
      collectionIds.add(item.id);
    }
  }

  return apps.filter((app) => {
    const inCategory =
      !category ||
      app.collectionIds.some((collectionId) => {
        const collection = collections.find((item) => item.id === collectionId);

        return collection?.category === category;
      });

    if (!inCategory) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      matchesQuery(app.label, query) ||
      matchesQuery(app.id, query) ||
      app.collectionIds.some((id) => collectionIds.has(id))
    );
  });
}

function filterCollections(
  collections: TapinallCatalogCollection[],
  category: string | null,
  query: string
): TapinallCatalogCollection[] {
  return collections.filter((item) => {
    if (category && item.category !== category) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      matchesQuery(item.label, query) ||
      matchesQuery(item.description, query) ||
      matchesQuery(item.id, query)
    );
  });
}

function GoogleSheetsGateBanner({
  loading,
  missing,
  ready,
}: {
  loading: boolean;
  missing: readonly RequiredGoogleToolkitSlug[];
  ready: boolean;
}) {
  if (loading) {
    return null;
  }

  if (ready) {
    return (
      <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-muted-foreground text-sm">
        Scraped rows write to your Google Sheet workbook{" "}
        <span className="font-medium text-foreground">Airin Research Data</span>
        . Open it in Connectors or ask the agent to add it to Data View.
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-border bg-muted/30 px-3 py-3">
      <p className="text-sm">
        Connect Google first so research data lands in your Drive sheet:
      </p>
      <ul className="list-inside list-disc text-muted-foreground text-sm">
        {missing.map((slug) => (
          <li key={slug}>{REQUIRED_GOOGLE_TOOLKIT_TITLES[slug]}</li>
        ))}
      </ul>
      <Button
        className="h-8"
        render={<Link to={pathForPage("composio")} />}
        size="sm"
      >
        Open Connectors
      </Button>
    </div>
  );
}

export function TapinallCatalogPanel({
  embedded = false,
}: {
  embedded?: boolean;
} = {}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query.trim());
  const searching = deferredQuery.length > 0;
  const google = useMissingGoogleToolkits();

  const statusQuery = useQuery({
    queryFn: () => client.getTapinallStatus(),
    queryKey: ["tapinall", "status"],
    staleTime: 30_000,
  });

  const browseQuery = useQuery({
    enabled: Boolean(statusQuery.data?.configured),
    queryFn: () => client.browseTapinallCatalog(),
    queryKey: ["tapinall", "browse"],
    staleTime: 5 * 60_000,
  });

  const searchQuery = useQuery({
    enabled: Boolean(statusQuery.data?.configured) && searching,
    queryFn: () => client.searchTapinallCatalog(deferredQuery, 40),
    queryKey: ["tapinall", "search", deferredQuery],
    staleTime: 30_000,
  });

  const filteredApps = useMemo(
    () =>
      filterApps(
        browseQuery.data?.apps ?? [],
        browseQuery.data?.collections ?? [],
        category,
        deferredQuery
      ),
    [browseQuery.data, category, deferredQuery]
  );

  const filteredCollections = useMemo(
    () =>
      filterCollections(
        browseQuery.data?.collections ?? [],
        category,
        deferredQuery
      ),
    [browseQuery.data, category, deferredQuery]
  );

  const configured = statusQuery.data?.configured === true;

  const balance = formatMicroUsd(
    statusQuery.data?.availableMicro ?? statusQuery.data?.balanceMicro ?? null
  );

  const errorMessage =
    (statusQuery.error && formatError(statusQuery.error)) ||
    (browseQuery.error && formatError(browseQuery.error)) ||
    (searchQuery.error && formatError(searchQuery.error)) ||
    null;

  return (
    <Card
      className={cn(
        "mb-6 w-full shadow-none",
        !embedded && "mx-auto max-w-3xl"
      )}
    >
      <TapinallCatalogHeader
        balance={balance}
        configured={configured}
        onQueryChange={setQuery}
        query={query}
      />
      <CardContent className="space-y-4 p-4">
        <TapinallCatalogBody
          apps={filteredApps}
          categories={browseQuery.data?.categories ?? []}
          category={category}
          collections={filteredCollections}
          configured={configured}
          deferredQuery={deferredQuery}
          errorMessage={errorMessage}
          google={google}
          loadingStatus={statusQuery.isLoading}
          onCategoryChange={setCategory}
          searching={searching}
          searchLoading={searchQuery.isLoading}
          tools={searchQuery.data?.tools ?? []}
        />
      </CardContent>
    </Card>
  );
}

function TapinallCatalogHeader({
  balance,
  configured,
  onQueryChange,
  query,
}: {
  balance: string | null;
  configured: boolean;
  onQueryChange: (value: string) => void;
  query: string;
}) {
  return (
    <CardHeader className="gap-3 space-y-0 border-border border-b pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-base">Tapinall data</CardTitle>
        <div className="flex items-center gap-2">
          {balance ? (
            <span className="text-muted-foreground text-xs">{balance}</span>
          ) : null}
          <StatusPill
            label={configured ? "Connected" : "Not connected"}
            tone={configured ? "ok" : "muted"}
          />
        </div>
      </div>
      <div className="relative">
        <Search01Icon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Search Tapinall apps and tools"
          className="pl-9"
          disabled={!configured}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search apps or tools"
          value={query}
        />
      </div>
    </CardHeader>
  );
}

function TapinallCatalogBody({
  apps,
  categories,
  category,
  collections,
  configured,
  deferredQuery,
  errorMessage,
  google,
  loadingStatus,
  onCategoryChange,
  searching,
  searchLoading,
  tools,
}: {
  apps: TapinallCatalogApp[];
  categories: { label: string }[];
  category: string | null;
  collections: TapinallCatalogCollection[];
  configured: boolean;
  deferredQuery: string;
  errorMessage: string | null;
  google: ReturnType<typeof useMissingGoogleToolkits>;
  loadingStatus: boolean;
  onCategoryChange: Dispatch<SetStateAction<string | null>>;
  searching: boolean;
  searchLoading: boolean;
  tools: TapinallCatalogTool[];
}) {
  return (
    <>
      {loadingStatus ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Spinner className="size-4" />
          Loading Tapinall…
        </div>
      ) : null}

      {errorMessage ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {errorMessage}
        </p>
      ) : null}

      <GoogleSheetsGateBanner
        loading={google.loading}
        missing={google.missing}
        ready={google.ready}
      />

      {loadingStatus || configured ? null : (
        <p className="text-muted-foreground text-sm">
          Connect the Tapinall MCP server to browse 3,200+ data tools.
        </p>
      )}

      {configured && categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <CategoryChip
            active={category === null}
            label="All"
            onClick={() => onCategoryChange(null)}
          />
          {categories.map((item) => (
            <CategoryChip
              active={category === item.label}
              key={item.label}
              label={item.label}
              onClick={() =>
                onCategoryChange((current) =>
                  current === item.label ? null : item.label
                )
              }
            />
          ))}
        </div>
      ) : null}

      {configured && searching ? (
        <ToolsList loading={searchLoading} tools={tools} />
      ) : null}

      {configured && !searching ? (
        <>
          <AppsList apps={apps} />
          <CollectionsList collections={collections.slice(0, 24)} />
        </>
      ) : null}

      {configured && searching && deferredQuery ? (
        <AppsList apps={apps.slice(0, 24)} />
      ) : null}
    </>
  );
}

function CategoryChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      aria-pressed={active}
      className={cn(
        "h-8 rounded-full px-3 text-xs",
        active && "bg-accent text-foreground"
      )}
      onClick={onClick}
      size="sm"
      type="button"
      variant="outline"
    >
      {label}
    </Button>
  );
}

function AppsList({ apps }: { apps: TapinallCatalogApp[] }) {
  if (apps.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No apps match this filter.
      </p>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {apps.slice(0, 48).map((app) => (
        <li
          className="rounded-md border border-border px-3 py-2 text-sm"
          key={app.id}
        >
          <div className="font-medium">{app.label}</div>
          <div className="text-muted-foreground text-xs">{app.id}</div>
        </li>
      ))}
    </ul>
  );
}

function CollectionsList({
  collections,
}: {
  collections: TapinallCatalogCollection[];
}) {
  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm">Collections</h3>
      <ul className="space-y-2">
        {collections.map((item) => (
          <li
            className="rounded-md border border-border px-3 py-2 text-sm"
            key={item.id}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground text-xs">
                {item.indexedToolCount} tools · {item.category}
              </span>
            </div>
            {item.description ? (
              <p className="mt-1 text-muted-foreground text-xs">
                {item.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToolsList({
  loading,
  tools,
}: {
  loading: boolean;
  tools: TapinallCatalogTool[];
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Spinner className="size-4" />
        Searching tools…
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No tools match this search.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {tools.map((tool) => (
        <li
          className="rounded-md border border-border px-3 py-2 text-sm"
          key={tool.id}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">{tool.name}</span>
            <span className="text-muted-foreground text-xs">
              {formatToolPrice(tool)}
            </span>
          </div>
          <p className="mt-1 text-muted-foreground text-xs">
            {tool.description}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {tool.id}
          </p>
        </li>
      ))}
    </ul>
  );
}
