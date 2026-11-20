import {
  type AgentCharacterId,
  agentCharacterPublicPath,
  isAgentCharacterId,
  resolveAgentCharacterId,
} from "@airin/core/agent-marketplace";
import { Button } from "@airin/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@airin/ui/dialog";
import { Input } from "@airin/ui/input";
import { cn } from "@airin/ui/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search01Icon } from "hugeicons-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AgentCharacterPicker } from "@/components/AgentCharacterPicker";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useAuth } from "@/context/use-auth";
import { useProfilesQuery } from "@/hooks/use-app-queries";
import { useUploadProfileAvatarMutation } from "@/hooks/use-resource-mutations";
import { characterIdToImageAttachment } from "@/lib/agent-character-avatar";
import { client, formatError } from "@/lib/client";
import { PAGE_PATHS, profilePath } from "@/lib/navigation";

function characterSrc(characterId: string, marketplaceId: string): string {
  const id: AgentCharacterId = isAgentCharacterId(characterId)
    ? characterId
    : resolveAgentCharacterId({ marketplaceId });

  return agentCharacterPublicPath(id);
}

type MarketplaceTab = "mine" | "market";

// oxlint-disable-next-line react-doctor/no-giant-component -- My agents and marketplace install flow share one Agents page.
export function MarketplacePage() {
  const { activeOrg } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<MarketplaceTab>("market");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [installingId, setInstallingId] = useState<string | null>(null);

  const [pickedCharacterId, setPickedCharacterId] =
    useState<AgentCharacterId | null>(null);

  const uploadAvatar = useUploadProfileAvatarMutation();
  const profiles = useProfilesQuery();

  const catalog = useQuery({
    queryFn: () => client.listAgentMarketplace(),
    queryKey: ["agent-marketplace", activeOrg?.id],
  });

  const install = useMutation({
    mutationFn: async ({
      catalogId,
      characterId,
    }: {
      catalogId: string;
      characterId: AgentCharacterId;
    }) => {
      const result = await client.installAgentMarketplaceAgent(catalogId);
      const profileId = result.profile.profile.id;
      const attachment = await characterIdToImageAttachment(characterId);
      await uploadAvatar.mutateAsync({
        attachment,
        profileId,
      });

      return result;
    },
    onError: (failure) => {
      setError(formatError(failure));
    },
    onSuccess: async () => {
      setError(null);
      setInstallingId(null);
      setPickedCharacterId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["agent-marketplace"] }),
        queryClient.invalidateQueries({ queryKey: ["profiles"] }),
      ]);
    },
  });

  const agents = catalog.data?.agents;
  const canInstall = activeOrg?.role === "admin";

  const installingAgent = (agents ?? []).find(
    (agent) => agent.id === installingId
  );

  const needle = search.trim().toLowerCase();

  const myAgents = useMemo(() => {
    const list = profiles.data ?? [];

    if (!needle) {
      return list;
    }

    return list.filter((profile) =>
      profile.name.toLowerCase().includes(needle)
    );
  }, [needle, profiles.data]);

  const marketAgents = useMemo(() => {
    const list = agents ?? [];

    if (!needle) {
      return list;
    }

    return list.filter((agent) =>
      `${agent.name} ${agent.description} ${agent.category}`
        .toLowerCase()
        .includes(needle)
    );
  }, [agents, needle]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <nav
          aria-label="Agents"
          className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-muted/40 p-1"
        >
          {(
            [
              { id: "mine", label: "My agents" },
              { id: "market", label: "Marketplace" },
            ] as const
          ).map((item) => (
            <button
              aria-current={tab === item.id ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-medium text-sm transition-colors",
                tab === item.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              key={item.id}
              onClick={() => setTab(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="relative ml-auto w-full sm:w-64">
          <Search01Icon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label={tab === "mine" ? "Search agents" : "Search marketplace"}
            className="pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              tab === "mine" ? "Search agents" : "Search marketplace"
            }
            value={search}
          />
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {tab === "mine" ? (
        <>
          {profiles.isLoading ? (
            <p className="text-muted-foreground text-sm">Loading agents…</p>
          ) : null}
          {myAgents.length === 0 && !profiles.isLoading ? (
            <p className="text-muted-foreground text-sm">No agents yet.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {myAgents.map((profile) => (
                <li
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
                  key={profile.id}
                >
                  <div className="flex items-start gap-3">
                    <ProfileAvatar
                      className="size-14 rounded-2xl"
                      profile={profile}
                      size="lg"
                    />
                    <div className="min-w-0 space-y-1">
                      <h2 className="font-semibold text-base text-foreground">
                        {profile.name}
                      </h2>
                      <p className="line-clamp-2 text-muted-foreground text-sm">
                        {profile.model ?? "Your agent"}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="mt-auto w-fit"
                    nativeButton={false}
                    render={<Link to={profilePath(profile.id)} />}
                    size="sm"
                    variant="outline"
                  >
                    Open
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          {catalog.isLoading ? (
            <p className="text-muted-foreground text-sm">Loading agents…</p>
          ) : null}
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {marketAgents.map((agent) => (
              <li
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
                key={agent.id}
              >
                <div className="flex items-start gap-3">
                  <img
                    alt=""
                    className="size-14 shrink-0 rounded-2xl object-cover outline outline-1 outline-black/10 -outline-offset-1 dark:outline-white/10"
                    height={56}
                    src={characterSrc(agent.characterId, agent.id)}
                    width={56}
                  />
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-2xs text-muted-foreground uppercase tracking-wide">
                      {agent.category}
                    </p>
                    <h2 className="font-semibold text-base text-foreground">
                      {agent.name}
                    </h2>
                    <p className="line-clamp-3 text-muted-foreground text-sm">
                      {agent.description}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex items-center gap-2">
                  {agent.installed ? (
                    <Button
                      nativeButton={false}
                      render={<Link to={PAGE_PATHS.chat} />}
                      size="sm"
                      variant="outline"
                    >
                      Open chat
                    </Button>
                  ) : (
                    <Button
                      disabled={!canInstall || install.isPending}
                      onClick={() => {
                        setError(null);
                        setInstallingId(agent.id);
                        setPickedCharacterId(
                          isAgentCharacterId(agent.characterId)
                            ? agent.characterId
                            : resolveAgentCharacterId({
                                marketplaceId: agent.id,
                              })
                        );
                      }}
                      size="sm"
                      type="button"
                    >
                      Install
                    </Button>
                  )}
                  {canInstall || agent.installed ? null : (
                    <span className="text-muted-foreground text-xs">
                      Ask an admin to install
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setInstallingId(null);
            setPickedCharacterId(null);
          }
        }}
        open={installingAgent !== undefined}
      >
        <DialogContent className="max-w-md gap-4">
          <DialogHeader>
            <DialogTitle>Add {installingAgent?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Pick a photo for this agent, then install.
          </p>
          <AgentCharacterPicker
            busy={install.isPending}
            onSelect={setPickedCharacterId}
            selectedId={pickedCharacterId}
          />
          <DialogFooter>
            <Button
              disabled={install.isPending}
              onClick={() => {
                setInstallingId(null);
                setPickedCharacterId(null);
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={
                install.isPending ||
                !installingAgent ||
                pickedCharacterId === null
              }
              onClick={() => {
                if (!(installingAgent && pickedCharacterId)) {
                  return;
                }

                install.mutate({
                  catalogId: installingAgent.id,
                  characterId: pickedCharacterId,
                });
              }}
              type="button"
            >
              {install.isPending ? "Installing…" : "Install"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
