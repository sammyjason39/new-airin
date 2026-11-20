import type { ReactNode } from "react";
import { LibraryHubTabs } from "@/components/library-hub/LibraryHubTabs";

/**
 * @deprecated Prefer LibraryHubTabs. Kept so Connectors/Plugins call sites keep working.
 */
export function IntegrationsTabs({ children }: { children: ReactNode }) {
  return <LibraryHubTabs>{children}</LibraryHubTabs>;
}
