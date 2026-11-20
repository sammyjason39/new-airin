import type {
  CreateVaultNoteRequest,
  UpdateVaultNoteRequest,
  VaultNoteResponse,
} from "@airin/core/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/use-auth";
import { client } from "@/lib/client";
import { queryKeys } from "@/lib/query-keys";

export function useVaultNotes(query?: string) {
  const { activeOrg } = useAuth();
  const orgId = activeOrg?.id;

  return useQuery({
    enabled: Boolean(orgId),
    queryFn: async () => {
      if (!orgId) {
        return { notes: [] as VaultNoteResponse[] };
      }

      return client.listVaultNotes(orgId, query);
    },
    queryKey: queryKeys.orgVaultNotes(orgId ?? "", query ?? ""),
  });
}

export function useVaultNote(noteId: string | null) {
  const { activeOrg } = useAuth();
  const orgId = activeOrg?.id;

  return useQuery({
    enabled: Boolean(orgId && noteId),
    queryFn: async () => {
      if (!(orgId && noteId)) {
        return null;
      }

      const { note } = await client.getVaultNote(orgId, noteId);

      return note;
    },
    queryKey: queryKeys.orgVaultNote(orgId ?? "", noteId ?? ""),
  });
}

export function useVaultGraph() {
  const { activeOrg } = useAuth();
  const orgId = activeOrg?.id;

  return useQuery({
    enabled: Boolean(orgId),
    queryFn: async () => {
      if (!orgId) {
        return { edges: [], nodes: [] };
      }

      return client.getVaultGraph(orgId);
    },
    queryKey: queryKeys.orgVaultGraph(orgId ?? ""),
  });
}

export function useCreateVaultNote() {
  const { activeOrg } = useAuth();
  const queryClient = useQueryClient();
  const orgId = activeOrg?.id;

  return useMutation({
    mutationFn: async (request: CreateVaultNoteRequest) => {
      if (!orgId) {
        throw new Error("No active organization");
      }

      return client.createVaultNote(orgId, request);
    },
    onSuccess: async () => {
      if (!orgId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.orgVaultRoot(orgId),
      });
    },
  });
}

export function useUpdateVaultNote() {
  const { activeOrg } = useAuth();
  const queryClient = useQueryClient();
  const orgId = activeOrg?.id;

  return useMutation({
    mutationFn: async ({
      noteId,
      request,
    }: {
      noteId: string;
      request: UpdateVaultNoteRequest;
    }) => {
      if (!orgId) {
        throw new Error("No active organization");
      }

      return client.updateVaultNote(orgId, noteId, request);
    },
    onSuccess: async (_data, variables) => {
      if (!orgId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.orgVaultRoot(orgId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.orgVaultNote(orgId, variables.noteId),
      });
    },
  });
}

export function useDeleteVaultNote() {
  const { activeOrg } = useAuth();
  const queryClient = useQueryClient();
  const orgId = activeOrg?.id;

  return useMutation({
    mutationFn: async (noteId: string) => {
      if (!orgId) {
        throw new Error("No active organization");
      }

      return client.deleteVaultNote(orgId, noteId);
    },
    onSuccess: async () => {
      if (!orgId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.orgVaultRoot(orgId),
      });
    },
  });
}
