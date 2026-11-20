import {
  type AgentMarketplaceEntry,
  AirinApiError,
  getAgentMarketplaceEntry,
  listAgentMarketplaceCatalog,
  MARKETPLACE_LEGACY_NAME_TO_PERSON,
} from "@airin/core";
import type { ProfileResponse } from "@airin/core/contract";
import type { DatabaseAdapter } from "@airin/db";
import type { ProfileService } from "./profile-service";

export interface AgentMarketplaceListItem {
  category: string;
  characterId: string;
  composioApps: string[];
  description: string;
  id: string;
  installed: boolean;
  name: string;
}

export interface AgentMarketplaceListResponse {
  agents: AgentMarketplaceListItem[];
}

export type AgentMarketplaceInstallResponse = ProfileResponse;

function marketplaceNameKey(name: string): string {
  return name.trim().toLowerCase();
}

/** Current catalog name plus older role titles for the same agent. */
function installedNameKeysForEntry(entry: AgentMarketplaceEntry): Set<string> {
  const keys = new Set<string>([marketplaceNameKey(entry.name)]);

  for (const [legacy, person] of Object.entries(
    MARKETPLACE_LEGACY_NAME_TO_PERSON
  )) {
    if (marketplaceNameKey(person) === marketplaceNameKey(entry.name)) {
      keys.add(legacy);
    }
  }

  return keys;
}

export class AgentMarketplaceService {
  constructor(
    private readonly profiles: ProfileService,
    private readonly db?: DatabaseAdapter
  ) {}

  async list(orgId: string): Promise<AgentMarketplaceListResponse> {
    await this.renameLegacyMarketplaceProfiles(orgId);
    const existing = await this.profiles.listProfiles(orgId);

    const installedNames = new Set(
      existing.profiles.map((profile) => marketplaceNameKey(profile.name))
    );

    return {
      agents: listAgentMarketplaceCatalog().map((entry) =>
        toListItem(
          entry,
          [...installedNameKeysForEntry(entry)].some((key) =>
            installedNames.has(key)
          )
        )
      ),
    };
  }

  /** Role titles from earlier catalog seeds → person names matching portraits. */
  async renameLegacyMarketplaceProfiles(orgId: string): Promise<void> {
    const existing = await this.profiles.listProfiles(orgId);

    for (const profile of existing.profiles) {
      const next =
        MARKETPLACE_LEGACY_NAME_TO_PERSON[marketplaceNameKey(profile.name)];

      if (!next || next === profile.name) {
        continue;
      }

      try {
        await this.profiles.updateProfile(orgId, profile.id, { name: next });
      } catch {
        // Skip locked / shared instances; the owner can rename in settings.
      }
    }
  }

  async install(
    orgId: string,
    catalogId: string,
    owner?: { ownerUserId: string; sharedWithTeam: boolean }
  ): Promise<AgentMarketplaceInstallResponse> {
    const entry = getAgentMarketplaceEntry(catalogId);

    if (!entry) {
      throw new AirinApiError("Marketplace agent not found.", 404);
    }

    const existing = await this.profiles.listProfiles(orgId);
    const installedKeys = installedNameKeysForEntry(entry);

    const already = existing.profiles.find((profile) =>
      installedKeys.has(marketplaceNameKey(profile.name))
    );

    // Idempotent: a prior install that failed on avatar (or a double-click)
    // must return the existing profile instead of 409. Still sync catalog
    // skills and Composio apps so Alya can pick up Docs/Sheets later.
    if (already) {
      await this.assignBundledSkills(already.id, entry.bundledSkillNames ?? []);
      await this.assignComposioHints(orgId, already.id, entry.composioApps);

      return this.profiles.getProfile(orgId, already.id);
    }

    if (
      entry.preferredProfileId &&
      existing.profiles.some(
        (profile) => profile.id === entry.preferredProfileId
      )
    ) {
      const preferred = existing.profiles.find(
        (profile) => profile.id === entry.preferredProfileId
      )!;

      await this.assignBundledSkills(
        preferred.id,
        entry.bundledSkillNames ?? []
      );
      await this.assignComposioHints(orgId, preferred.id, entry.composioApps);

      return this.profiles.getProfile(orgId, preferred.id);
    }

    const instructions = entry.roleOneLiner
      ? `${entry.instructions}\n\n## Role one-liner\n\n${entry.roleOneLiner}`
      : entry.instructions;

    let soulFiles = {
      "INSTRUCTIONS.md": instructions,
      "SOUL.md": entry.soul,
      "STYLE.md": entry.style,
    };

    if (entry.memoryMarkdown) {
      soulFiles = {
        ...soulFiles,
        "MEMORY.md": entry.memoryMarkdown,
      };
    }

    const created = entry.preferredProfileId
      ? await this.profiles.createProfile(
          orgId,
          {
            id: entry.preferredProfileId,
            name: entry.name,
            soulFiles,
            systemPrompt: entry.systemPrompt,
          },
          owner
        )
      : await this.profiles.createProfile(
          orgId,
          {
            name: entry.name,
            soulFiles,
            systemPrompt: entry.systemPrompt,
          },
          owner
        );

    await this.assignBundledSkills(
      created.profile.id,
      entry.bundledSkillNames ?? []
    );
    await this.assignComposioHints(
      orgId,
      created.profile.id,
      entry.composioApps
    );

    return created;
  }

  private async assignBundledSkills(
    profileId: string,
    names: readonly string[]
  ): Promise<void> {
    if (!this.db || names.length === 0) {
      return;
    }

    for (const name of names) {
      const skill = await this.db.getSkillByName(name);

      if (skill) {
        await this.db.assignSkillToProfile(profileId, skill.id);
      }
    }
  }

  /** Merge catalog Composio apps onto the profile; keep existing assignments. */
  private async assignComposioHints(
    orgId: string,
    profileId: string,
    slugs: readonly string[]
  ): Promise<void> {
    if (!this.db || slugs.length === 0) {
      return;
    }

    const existing = await this.db.listProfileComposioToolkits(profileId);
    const byToolkitId = new Map(
      existing.map((row) => [row.toolkitId, row] as const)
    );

    for (const slug of slugs) {
      const toolkit = await this.db.getComposioToolkitBySlug(orgId, slug);

      if (!toolkit || byToolkitId.has(toolkit.id)) {
        continue;
      }

      byToolkitId.set(toolkit.id, {
        allowedActions: null,
        profileId,
        toolkitId: toolkit.id,
      });
    }

    await this.db.replaceProfileComposioToolkits(
      profileId,
      [...byToolkitId.values()].map((row) => ({
        allowedActions: row.allowedActions,
        profileId,
        toolkitId: row.toolkitId,
      }))
    );
  }
}

function toListItem(
  entry: AgentMarketplaceEntry,
  installed: boolean
): AgentMarketplaceListItem {
  return {
    category: entry.category,
    characterId: entry.characterId,
    composioApps: [...entry.composioApps],
    description: entry.description,
    id: entry.id,
    installed,
    name: entry.name,
  };
}
