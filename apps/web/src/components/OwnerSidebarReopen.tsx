import { Button } from "@airin/ui/button";
import { cn } from "@airin/ui/utils";
import { PanelLeftOpenIcon } from "hugeicons-react";
import type { ReactNode } from "react";
import { useLocale } from "@/context/use-locale";
import { useUiMode } from "@/context/use-ui-mode";
import { useOwnerSidebarHidden } from "@/hooks/use-sidebar-collapsed";

/**
 * Shows the Owner team sidebar again after Hide. Phones use the nav drawer
 * instead (`MobileNavDrawer`).
 */
export function OwnerSidebarReopen({ className }: { className?: string }) {
  const { collapsed: hidden, toggle } = useOwnerSidebarHidden();
  const { t } = useLocale();

  if (!hidden) {
    return null;
  }

  return (
    <Button
      aria-label={t("owner.showSidebar")}
      className={cn(
        "hidden shrink-0 items-center justify-center text-muted-foreground sm:inline-flex",
        className
      )}
      onClick={toggle}
      size="icon-sm"
      title={t("owner.showSidebar")}
      type="button"
      variant="ghost"
    >
      <PanelLeftOpenIcon aria-hidden="true" className="size-4" />
    </Button>
  );
}

/**
 * When the Owner sidebar is hidden, a click on the agent avatar shows it
 * again. Otherwise the avatar is unchanged.
 */
export function OwnerSidebarAvatarTrigger({
  children,
}: {
  children: ReactNode;
}) {
  const { uiMode } = useUiMode();
  const { collapsed: hidden, toggle } = useOwnerSidebarHidden();
  const { t } = useLocale();

  if (uiMode !== "owner" || !hidden) {
    return children;
  }

  return (
    <button
      aria-label={t("owner.showSidebar")}
      className="shrink-0 rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
      onClick={toggle}
      title={t("owner.showSidebar")}
      type="button"
    >
      {children}
    </button>
  );
}
