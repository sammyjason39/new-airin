import type { ProfileSummary } from "@airin/core";

export type OwnerAgentRoleMessageKey =
  | "owner.role.assistant"
  | "owner.role.chiefOfStaff"
  | "owner.role.customerSuccess"
  | "owner.role.hr"
  | "owner.role.laundryAnalyst"
  | "owner.role.laundryFinance"
  | "owner.role.laundryOps"
  | "owner.role.laundrySocial"
  | "owner.role.laundrySupport"
  | "owner.role.laundryVisibility"
  | "owner.role.legal"
  | "owner.role.payroll"
  | "owner.role.recruiting"
  | "owner.role.sales";

const LAUNDRY_PROFILE_ID_TO_ROLE = {
  laundry_analyst: "owner.role.laundryAnalyst",
  laundry_finance: "owner.role.laundryFinance",
  laundry_ops: "owner.role.laundryOps",
  laundry_social: "owner.role.laundrySocial",
  laundry_support: "owner.role.laundrySupport",
  laundry_visibility: "owner.role.laundryVisibility",
} as const satisfies Record<string, OwnerAgentRoleMessageKey>;

/** Summit roster display names and legacy pack labels → role subtitle. */
const LAUNDRY_PROFILE_NAME_TO_ROLE = {
  Analyst: "owner.role.laundryAnalyst",
  Ardi: "owner.role.laundryAnalyst",
  Dimas: "owner.role.laundryFinance",
  Gilang: "owner.role.laundryVisibility",
  Operations: "owner.role.laundryOps",
  Rina: "owner.role.laundrySupport",
  Sari: "owner.role.laundrySocial",
  Social: "owner.role.laundrySocial",
  Support: "owner.role.laundrySupport",
  Toni: "owner.role.laundryOps",
  Visibility: "owner.role.laundryVisibility",
} as const satisfies Record<string, OwnerAgentRoleMessageKey>;

const MARKETPLACE_PROFILE_ID_TO_ROLE = {
  "chief-of-staff": "owner.role.chiefOfStaff",
  "customer-success": "owner.role.customerSuccess",
  "finance-ops": "owner.role.laundryFinance",
  hr_indonesia: "owner.role.hr",
  "hr-indonesia": "owner.role.hr",
  "hr-payroll": "owner.role.payroll",
  "hr-recruiting": "owner.role.recruiting",
  "legal-lite": "owner.role.legal",
  ops: "owner.role.laundryOps",
  sales: "owner.role.sales",
  "social-media": "owner.role.laundrySocial",
} as const satisfies Record<string, OwnerAgentRoleMessageKey>;

const MARKETPLACE_PROFILE_NAME_TO_ROLE = {
  Alya: "owner.role.hr",
  Asisten: "owner.role.assistant",
  Bima: "owner.role.laundryOps",
  "Chief of Staff": "owner.role.chiefOfStaff",
  "Customer Success": "owner.role.customerSuccess",
  "Default Bot": "owner.role.assistant",
  Fajar: "owner.role.sales",
  "Finance Ops": "owner.role.laundryFinance",
  Hana: "owner.role.customerSuccess",
  "HR Indonesia": "owner.role.hr",
  "HR Payroll": "owner.role.payroll",
  "HR Recruiting": "owner.role.recruiting",
  Jovan: "owner.role.chiefOfStaff",
  Kezia: "owner.role.laundrySocial",
  "Legal Lite": "owner.role.legal",
  Maya: "owner.role.recruiting",
  Nisa: "owner.role.legal",
  Ops: "owner.role.laundryOps",
  Rani: "owner.role.payroll",
  Sales: "owner.role.sales",
  "Social Media": "owner.role.laundrySocial",
} as const satisfies Record<string, OwnerAgentRoleMessageKey>;

export function laundryAgentRoleMessageKey(
  profile: Pick<ProfileSummary, "id" | "name" | "isSuper">
): OwnerAgentRoleMessageKey | null {
  // SAFETY: Each lookup checks the key against the dictionary before indexing.
  const id = profile.id as keyof typeof LAUNDRY_PROFILE_ID_TO_ROLE;

  // SAFETY: The name lookup checks the key against the dictionary before indexing.
  const name = profile.name.trim() as keyof typeof LAUNDRY_PROFILE_NAME_TO_ROLE;

  if (Object.hasOwn(LAUNDRY_PROFILE_ID_TO_ROLE, id)) {
    return LAUNDRY_PROFILE_ID_TO_ROLE[id];
  }

  return Object.hasOwn(LAUNDRY_PROFILE_NAME_TO_ROLE, name)
    ? LAUNDRY_PROFILE_NAME_TO_ROLE[name]
    : null;
}

export function marketplaceAgentRoleMessageKey(
  profile: Pick<ProfileSummary, "id" | "name" | "isSuper">
): OwnerAgentRoleMessageKey | null {
  // SAFETY: Each lookup checks the key against the dictionary before indexing.
  const id = profile.id as keyof typeof MARKETPLACE_PROFILE_ID_TO_ROLE;

  // SAFETY: The name lookup checks the key against the dictionary before indexing.
  const name =
    profile.name.trim() as keyof typeof MARKETPLACE_PROFILE_NAME_TO_ROLE;

  if (Object.hasOwn(MARKETPLACE_PROFILE_ID_TO_ROLE, id)) {
    return MARKETPLACE_PROFILE_ID_TO_ROLE[id];
  }

  return Object.hasOwn(MARKETPLACE_PROFILE_NAME_TO_ROLE, name)
    ? MARKETPLACE_PROFILE_NAME_TO_ROLE[name]
    : null;
}

export function ownerAgentSubtitleMessageKey(
  profile: Pick<ProfileSummary, "id" | "name" | "isSuper">
): OwnerAgentRoleMessageKey | "owner.orchestrator" | "owner.agent" {
  if (profile.isSuper) {
    return "owner.orchestrator";
  }

  const laundryRole = laundryAgentRoleMessageKey(profile);

  if (laundryRole) {
    return laundryRole;
  }

  const marketplaceRole = marketplaceAgentRoleMessageKey(profile);

  if (marketplaceRole) {
    return marketplaceRole;
  }

  return "owner.agent";
}

/** Advanced rail hover: "Alya · HR". Generic "Agent" roles stay name-only. */
export function agentRailHoverLabel(
  profile: Pick<ProfileSummary, "id" | "name" | "isSuper">,
  roleLabel: string
): string {
  const name = profile.name.trim() || "Agent";
  const role = roleLabel.trim();

  if (!role || role === name) {
    return name;
  }

  return `${name} · ${role}`;
}
