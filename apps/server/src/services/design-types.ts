import type { JsonValue } from "@airin/core";
import type { McpToolArguments } from "./mcp-client-manager";

export const RESULTS_FILE = "results.json";

export const MAX_RESULTS = 100;

export const MAX_PROMPT_CHARS = 16_000;

export const MAX_SOURCE_URLS = 8;

export const MAX_SOURCE_FILES = 4;

export const MAX_SOURCE_FILE_BYTES = Math.floor(1.5 * 1024 * 1024);

export const GENERATE_DEADLINE_MS = 180_000;

export const UPLOAD_DEADLINE_MS = 60_000;

export const JOB_POLL_FALLBACK_MS = 2000;

export const MAX_PENDING_REFRESH = 3;

export const TERMINAL_SUCCESS = new Set([
  "completed",
  "done",
  "ready",
  "success",
  "succeeded",
]);

export const TERMINAL_FAILURE = new Set([
  "cancelled",
  "canceled",
  "failed",
  "ip_detected",
  "nsfw",
]);

export type DesignOutputKind = "image" | "video";

export type DesignEstimate = JsonValue;

export type DesignResultRecord = {
  id: string;
  kind: DesignOutputKind;
  model: string;
  prompt: string;
  createdAt: string;
  cost?: number | string | null;
  jobId?: string | null;
  resultUrl?: string | null;
  status?: string | null;
  raw?: JsonValue;
};

export type DesignSourceFileInput = {
  data: string;
  filename: string;
  mediaType: string;
};

export type DesignGenerateInput = {
  aspectRatio?: string;
  count?: number;
  duration?: number;
  estimateOnly?: boolean;
  kind: DesignOutputKind;
  model: string;
  params?: McpToolArguments;
  profileId?: string;
  prompt: string;
  sourceFiles?: DesignSourceFileInput[];
  sourceMediaUrls?: string[];
};

export type DesignStatus = {
  connected: boolean;
  needsAuth: boolean;
  serverId: string | null;
  serverName: string | null;
  toolCount: number;
};
