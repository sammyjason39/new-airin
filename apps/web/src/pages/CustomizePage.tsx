import type { ProfileSummary, SkillSummary } from "@airin/core/contract";
import { BUNDLED_SKILL_NAMES } from "@airin/core/skills/bundled-names";
import { Button } from "@airin/ui/button";
import { Card, CardContent } from "@airin/ui/card";
import { Input } from "@airin/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Add01Icon, ArrowRight01Icon, File01Icon } from "hugeicons-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LibraryHubFrame } from "@/components/library-hub/LibraryHubTabs";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useAuth } from "@/context/use-auth";
import { useOrgPlugins } from "@/hooks/use-plugins";
import { client, formatError } from "@/lib/client";
import {
  enabledPluginNavEntries,
  integrationSectionPath,
  navHrefForPage,
  pluginIcon,
  profilePath,
  skillDetailPath,
  visibleIntegrationSections,
  visibleNavGroups,
} from "@/lib/navigation";
import { queryKeys } from "@/lib/query-keys";

const bundledSkillNames = new Set<string>(BUNDLED_SKILL_NAMES);

const skillSourceOrder = new Map([
  ["Agent-created", 1],
  ["Built-in", 0],
  ["User-added", 2],
]);

function skillSourceLabel(skill: SkillSummary): string {
  if (skill.pluginId) {
    return `Plugin: ${skill.pluginId}`;
  }

  if (skill.createdBy === "agent") {
    return "Agent-created";
  }

  if (skill.createdBy === "bundled" && bundledSkillNames.has(skill.name)) {
    return "Built-in";
  }

  return "User-added";
}

export function CustomizePage() {
  const { user, activeOrg } = useAuth();
  const { data: plugins = [], isLoading, error } = useOrgPlugins();

  const items = visibleNavGroups({
    isPlatformAdmin: user?.isPlatformAdmin === true,
    orgRole: activeOrg?.role,
  }).flatMap((group) => group.items);

  const sections = [
    {
      pages: [
        "organization",
        "files",
        "usage",
        "workers",
        "google-meet",
        "settings",
      ],
      title: "Workspace",
    },
    {
      pages: ["providers", "tools", "composio"],
      title: "Agent tools",
    },
  ].map(({ title, pages }) => ({
    items: pages.flatMap((page) => {
      const item = items.find((entry) => entry.id === page);

      return item
        ? [
            {
              href: navHrefForPage(item.id),
              icon: item.icon,
              label: item.label,
            },
          ]
        : [];
    }),
    title,
  }));

  sections.push({
    items: visibleIntegrationSections(
      user?.isPlatformAdmin === true,
      activeOrg?.role
    ).map((item) => ({
      href: integrationSectionPath(item.id),
      icon: item.icon,
      label: item.label,
    })),
    title: "Integrations",
  });
  sections.push({
    items: enabledPluginNavEntries(plugins).map((entry) => ({
      href: entry.href,
      icon: pluginIcon(entry.pluginId),
      label: entry.label,
    })),
    title: "Installed plugins",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {sections.flatMap((section) =>
        section.items.length > 0
          ? [
              <section
                aria-label={section.title}
                className="space-y-3"
                key={section.title}
              >
                <h2 className="type-section-title font-medium text-muted-foreground">
                  {section.title}
                </h2>
                <Card className="w-full overflow-hidden shadow-none">
                  <CardContent className="p-0">
                    <nav
                      aria-label={section.title}
                      className="divide-y divide-border"
                    >
                      {section.items.map(({ href, icon: Icon, label }) => (
                        <Link
                          className="flex min-w-0 items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
                          key={href}
                          to={href}
                        >
                          <Icon
                            aria-hidden="true"
                            className="size-4 shrink-0 text-muted-foreground"
                            strokeWidth={1.75}
                          />
                          <span className="min-w-0 flex-1 truncate font-normal">
                            {label}
                          </span>
                          <ArrowRight01Icon
                            aria-hidden="true"
                            className="size-4 shrink-0 text-muted-foreground"
                            strokeWidth={1.75}
                          />
                        </Link>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </section>,
            ]
          : []
      )}
      {isLoading && (
        <p className="mt-4 text-muted-foreground text-sm" role="status">
          Loading plugins…
        </p>
      )}
      {error && (
        <p className="mt-4 text-muted-foreground text-sm" role="status">
          Couldn’t load plugins.
        </p>
      )}
    </div>
  );
}

export function SkillsPage() {
  const { activeOrg } = useAuth();
  const orgId = activeOrg?.id;
  const [search, setSearch] = useState("");

  const {
    data: skills = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    enabled: Boolean(orgId),
    queryFn: async () => (await client.listSkills(orgId)).skills,
    queryKey: [...queryKeys.skills.all, "organization", orgId],
  });

  const query = search.trim().toLowerCase();

  const {
    data: profiles,
    error: profilesError,
    refetch: refetchProfiles,
  } = useQuery({
    enabled: Boolean(orgId),
    queryFn: async () => {
      const { profiles: summaries } = await client.listProfiles(orgId);

      return Promise.all(
        summaries.map(
          async (profile) =>
            (await client.getProfile(profile.id, orgId)).profile
        )
      );
    },
    queryKey: [...queryKeys.profiles.all, "skill-assignments", orgId],
  });

  const profilesBySkill = new Map<string, ProfileSummary[]>();

  for (const profile of profiles ?? []) {
    for (const skill of profile.skills) {
      const assigned = profilesBySkill.get(skill.id) ?? [];
      assigned.push(profile);
      profilesBySkill.set(skill.id, assigned);
    }
  }

  const filtered = skills
    .filter(
      (skill) =>
        Boolean(orgId) && (skill.orgId === null || skill.orgId === orgId)
    )
    .filter((skill) =>
      `${skill.name} ${skill.description} ${skillSourceLabel(skill)}`
        .toLowerCase()
        .includes(query)
    )
    .sort(
      (left, right) =>
        (skillSourceOrder.get(skillSourceLabel(left)) ?? 3) -
          (skillSourceOrder.get(skillSourceLabel(right)) ?? 3) ||
        left.name.localeCompare(right.name)
    );

  const groups = useMemo(() => {
    const bySource = new Map<string, typeof filtered>();

    for (const skill of filtered) {
      const source = skillSourceLabel(skill);
      const list = bySource.get(source) ?? [];
      list.push(skill);
      bySource.set(source, list);
    }

    return [...bySource.entries()].sort(
      (left, right) =>
        (skillSourceOrder.get(left[0]) ?? 3) -
        (skillSourceOrder.get(right[0]) ?? 3)
    );
  }, [filtered]);

  return (
    <LibraryHubFrame
      toolbar={
        <Input
          aria-label="Search skills"
          className="w-full sm:w-72"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search skills"
          type="search"
          value={search}
        />
      }
    >
      {isLoading && <p role="status">Loading skills…</p>}
      {error && (
        <div className="space-y-2" role="alert">
          <p className="text-destructive text-sm">{formatError(error)}</p>
          <Button onClick={() => void refetch()} variant="outline">
            Retry
          </Button>
        </div>
      )}
      {!(isLoading || error) && filtered.length === 0 && (
        <p className="text-muted-foreground text-sm" role="status">
          {query ? "No matching skills." : "No skills available."}
        </p>
      )}
      {groups.map(([source, items]) => (
        <section className="space-y-3" key={source}>
          <h2 className="font-medium text-muted-foreground text-sm">
            {source} ({items.length})
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((skill) => (
              <li
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
                key={skill.id}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                      <File01Icon
                        aria-hidden
                        className="size-5 text-muted-foreground"
                      />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <Link
                        className="block font-semibold text-foreground text-sm hover:underline"
                        to={`${skillDetailPath(skill.id)}?from=skills`}
                      >
                        {skill.name}
                      </Link>
                      <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                        {skill.description || "No description."}
                      </p>
                    </div>
                  </div>
                  <Button
                    aria-label={`Open ${skill.name}`}
                    className="shrink-0"
                    nativeButton={false}
                    render={
                      <Link to={`${skillDetailPath(skill.id)}?from=skills`} />
                    }
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Add01Icon aria-hidden className="size-4" />
                  </Button>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
                  {skill.enabled ? null : (
                    <span className="text-muted-foreground">Disabled</span>
                  )}
                  {profilesError ? (
                    <button
                      className="text-destructive underline"
                      onClick={() => void refetchProfiles()}
                      type="button"
                    >
                      Retry assignments
                    </button>
                  ) : profilesBySkill.has(skill.id) ? (
                    <div className="flex -space-x-2">
                      {(profilesBySkill.get(skill.id) ?? []).map((profile) => (
                        <Link
                          aria-label={`Open ${profile.name}`}
                          className="relative rounded-full ring-2 ring-card hover:z-10 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-ring"
                          key={profile.id}
                          title={profile.name}
                          to={profilePath(profile.id)}
                        >
                          <ProfileAvatar profile={profile} size="xxs" />
                        </Link>
                      ))}
                    </div>
                  ) : profiles ? (
                    <span className="text-muted-foreground">Not assigned</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </LibraryHubFrame>
  );
}
