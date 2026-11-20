import type {
  CreateVaultNoteRequest,
  ListVaultNotesResponse,
  UpdateVaultNoteRequest,
  VaultGraphResponse,
  VaultNoteDetailResponse,
  VaultNoteResponse,
  VaultSearchRequest,
  VaultSearchResponse,
} from "@airin/core/contract";
import { OrgMemoryClient } from "./client-org-memory";

/** Company vault (second brain) notes + graph. */
export class OrgVaultClient extends OrgMemoryClient {
  async listVaultNotes(
    orgId: string,
    query?: string
  ): Promise<ListVaultNotesResponse> {
    const qs = query?.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";

    return this.request<ListVaultNotesResponse>(
      `/v1/orgs/${encodeURIComponent(orgId)}/vault/notes${qs}`,
      {
        headers: { "X-Org-Id": orgId },
      }
    );
  }

  async getVaultNote(
    orgId: string,
    noteId: string
  ): Promise<{ note: VaultNoteDetailResponse }> {
    return this.request<{ note: VaultNoteDetailResponse }>(
      `/v1/orgs/${encodeURIComponent(orgId)}/vault/notes/${encodeURIComponent(noteId)}`,
      {
        headers: { "X-Org-Id": orgId },
      }
    );
  }

  async createVaultNote(
    orgId: string,
    request: CreateVaultNoteRequest
  ): Promise<{ note: VaultNoteResponse }> {
    return this.request<{ note: VaultNoteResponse }>(
      `/v1/orgs/${encodeURIComponent(orgId)}/vault/notes`,
      {
        body: JSON.stringify(request),
        headers: { "X-Org-Id": orgId },
        method: "POST",
      }
    );
  }

  async updateVaultNote(
    orgId: string,
    noteId: string,
    request: UpdateVaultNoteRequest
  ): Promise<{ note: VaultNoteResponse }> {
    return this.request<{ note: VaultNoteResponse }>(
      `/v1/orgs/${encodeURIComponent(orgId)}/vault/notes/${encodeURIComponent(noteId)}`,
      {
        body: JSON.stringify(request),
        headers: { "X-Org-Id": orgId },
        method: "PUT",
      }
    );
  }

  async deleteVaultNote(
    orgId: string,
    noteId: string
  ): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>(
      `/v1/orgs/${encodeURIComponent(orgId)}/vault/notes/${encodeURIComponent(noteId)}`,
      {
        headers: { "X-Org-Id": orgId },
        method: "DELETE",
      }
    );
  }

  async getVaultGraph(orgId: string): Promise<VaultGraphResponse> {
    return this.request<VaultGraphResponse>(
      `/v1/orgs/${encodeURIComponent(orgId)}/vault/graph`,
      {
        headers: { "X-Org-Id": orgId },
      }
    );
  }

  async searchVault(
    orgId: string,
    request: VaultSearchRequest
  ): Promise<VaultSearchResponse> {
    return this.request<VaultSearchResponse>(
      `/v1/orgs/${encodeURIComponent(orgId)}/vault/search`,
      {
        body: JSON.stringify(request),
        headers: { "X-Org-Id": orgId },
        method: "POST",
      }
    );
  }
}
