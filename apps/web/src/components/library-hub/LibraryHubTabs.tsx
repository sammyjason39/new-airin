import { cn } from "@airin/ui/utils";
import type { ReactNode } from "react";
import { Link, useMatch } from "react-router-dom";
import { useAuth } from "@/context/use-auth";
import {
  canAccessIntegrationsPage,
  canAccessSystemPage,
  PAGE_PATHS,
} from "@/lib/navigation";

const ADMIN_HUB_TABS = [
  { label: "Plugins", path: PAGE_PATHS["plugin-management"] },
  { label: "Skills", path: PAGE_PATHS.skills },
  { label: "Connectors", path: PAGE_PATHS.composio },
] as const;

const MEMBER_HUB_TABS = [
  { label: "Connectors", path: PAGE_PATHS.composio },
] as const;

function activeHubPath(pathnameMatch: {
  plugins: boolean;
  skills: boolean;
  connectors: boolean;
}): string {
  if (pathnameMatch.plugins) {
    return PAGE_PATHS["plugin-management"];
  }

  if (pathnameMatch.skills) {
    return PAGE_PATHS.skills;
  }

  return PAGE_PATHS.composio;
}

/**
 * Accio-style hub: Plugins (installable systems) · Skills · Connectors
 * (Composio + Airin Library + custom connectors). No MCP wording.
 */
export function LibraryHubTabs({ children }: { children?: ReactNode }) {
  const { activeOrg, user } = useAuth();
  const isPlatformAdmin = user?.isPlatformAdmin === true;
  const canManageHub = canAccessSystemPage(isPlatformAdmin, activeOrg?.role);
  const canUseConnectors = canAccessIntegrationsPage(activeOrg?.role);
  const plugins = useMatch(`${PAGE_PATHS["plugin-management"]}/*`) !== null;
  const pluginsExact = useMatch(PAGE_PATHS["plugin-management"]) !== null;
  const skills = useMatch(PAGE_PATHS.skills) !== null;
  const connectors = useMatch(PAGE_PATHS.composio) !== null;

  const active = activeHubPath({
    connectors,
    plugins: plugins || pluginsExact,
    skills,
  });

  const tabs = canManageHub ? ADMIN_HUB_TABS : MEMBER_HUB_TABS;

  if (!(canManageHub || canUseConnectors)) {
    return children ? (
      <div className="flex items-center gap-3">{children}</div>
    ) : null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <nav
        aria-label="Library"
        className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-muted/40 p-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.path === active;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-medium text-sm transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              key={tab.path}
              to={tab.path}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children ? (
        <div className="ml-auto flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:flex-none">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function LibraryHubFrame({
  children,
  toolbar,
}: {
  children: ReactNode;
  toolbar?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6">
      <LibraryHubTabs>{toolbar}</LibraryHubTabs>
      {children}
    </div>
  );
}
