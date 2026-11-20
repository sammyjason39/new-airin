import type { JsonValue } from "@airin/core";
import { client } from "@/lib/client";
import type {
  DesignGenerateRequest,
  DesignResult,
  DesignStatusResponse,
} from "./types";

export type DesignCostEstimate = JsonValue;

type DesignGenerateResponse = {
  estimate?: JsonValue;
  result?: {
    createdAt?: string;
    id?: string;
    kind?: "image" | "video";
    model?: string;
    prompt?: string;
    resultUrl?: string | null;
  };
};

function toBody(request: DesignGenerateRequest, estimateOnly?: boolean) {
  return {
    aspectRatio: request.aspectRatio,
    count: request.count ?? 1,
    duration: request.duration,
    estimateOnly: estimateOnly === true,
    kind: request.kind,
    model: request.model,
    params: request.parameters,
    prompt: request.prompt,
    sourceMediaUrls: request.sourceMediaUrls,
  };
}

function toDesignResult(
  payload: DesignGenerateResponse,
  request: DesignGenerateRequest
): DesignResult {
  const nested = payload.result;

  if (!nested) {
    throw new Error(
      "Generation finished but no result was returned. Check Higgsfield Assets."
    );
  }

  const id = nested.id ?? crypto.randomUUID();
  const createdAt = nested.createdAt ?? new Date().toISOString();
  const url = nested.resultUrl ?? undefined;

  return {
    aspectRatio: request.aspectRatio,
    createdAt,
    duration: request.duration,
    id,
    imageUrl: request.kind === "image" ? url : undefined,
    kind: request.kind,
    model: request.model,
    prompt: request.prompt,
    videoUrl: request.kind === "video" ? url : undefined,
  };
}

export async function getDesignStatus(): Promise<DesignStatusResponse> {
  return client.getDesignStatus();
}

export async function listRemoteDesignResults(): Promise<DesignResult[]> {
  const data = await client.listDesignResults();

  return (data.results ?? []).map((item) => ({
    createdAt: item.createdAt,
    id: item.id,
    imageUrl: item.kind === "image" ? (item.resultUrl ?? undefined) : undefined,
    kind: item.kind,
    model: item.model,
    prompt: item.prompt,
    videoUrl: item.kind === "video" ? (item.resultUrl ?? undefined) : undefined,
  }));
}

export async function generateDesign(
  request: DesignGenerateRequest
): Promise<DesignResult> {
  const payload = await client.generateDesign(toBody(request));

  return toDesignResult(payload, request);
}

export async function estimateDesignCost(
  request: DesignGenerateRequest
): Promise<DesignCostEstimate> {
  const payload = await client.generateDesign(toBody(request, true));

  if (payload.estimate === undefined || payload.estimate === null) {
    throw new Error(
      "Cost estimate was empty. Try again or check Design status."
    );
  }

  return payload.estimate;
}
