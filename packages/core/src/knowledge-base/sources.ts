import type { KnowledgeBaseSource } from "../contract";

function env(name: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[name];
}

/** Our product GitHub repo — agents and docs links use this, not upstream forks. */
export const AIRIN_GITHUB_REPO =
  env("AIRIN_GITHUB_REPO")?.replace(/\/$/, "") ||
  "https://github.com/Conextlab-MIT/new-airin";

/**
 * Optional published docs site (serves llms.txt). Set AIRIN_DOCS_SITE_URL when
 * you host docs. When empty, agents use the in-app Panduan + airin-guide skill.
 */
export const AIRIN_DOCS_SITE_URL =
  env("AIRIN_DOCS_SITE_URL")?.replace(/\/$/, "") || "";

export const AIRIN_DOCS_LLMS_URL = AIRIN_DOCS_SITE_URL
  ? `${AIRIN_DOCS_SITE_URL}/llms.txt`
  : "";

export const DEFAULT_KNOWLEDGE_SOURCES: KnowledgeBaseSource[] =
  AIRIN_DOCS_LLMS_URL
    ? [
        {
          description:
            "Official Airin docs index (llms.txt). Fetch this first with web_fetch, then fetch specific .md pages listed in the index.",
          enabled: true,
          id: "airin-docs",
          inherited: true,
          kind: "url",
          title: "Airin Documentation",
          url: AIRIN_DOCS_LLMS_URL,
        },
      ]
    : [];

/** Prompt lines that tell agents where product docs live. */
export function airinDocsAgentGuidance(): string {
  if (AIRIN_DOCS_LLMS_URL) {
    return `For Airin product questions, web_fetch ${AIRIN_DOCS_LLMS_URL}, then web_fetch the matching .md page from that index. Do not use knowledge_base_search for inherited docs. Do not fetch ahmadrosid.github.io or other upstream docs hosts.`;
  }

  return `For Airin product or UI questions, load_skill airin-guide and use in-app paths such as /guide and /settings/…. Do not fetch ahmadrosid.github.io or other upstream docs hosts. Engineering source of truth: ${AIRIN_GITHUB_REPO}.`;
}
