import { Navigate } from "react-router-dom";
import { VaultApp } from "@/components/vault/VaultApp";
import { useAuth } from "@/context/use-auth";
import { canAccessOrganizationPage, PAGE_PATHS } from "@/lib/navigation";

export function VaultPage() {
  const { user, activeOrg } = useAuth();

  const allowed = canAccessOrganizationPage(
    user?.isPlatformAdmin === true,
    activeOrg?.role
  );

  if (!allowed) {
    return <Navigate replace to={PAGE_PATHS.chat} />;
  }

  return <VaultApp />;
}
