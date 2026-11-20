export type DesignTab = "studio" | "library" | "results";

export type DesignOutputKind = "image" | "video";

export interface DesignPrompt {
  category: string;
  id: string;
  prompt: string;
  sourceUrl: string;
  thumbUrl: string;
  title: string;
}

export interface DesignModelParameter {
  default?: string | number | null;
  description?: string;
  name: string;
  options: string[];
  required?: string;
  type: string;
}

export interface DesignDurationRange {
  max: number;
  min: number;
}

export interface DesignModel {
  aspectRatios: string[];
  description: string;
  durationRange: DesignDurationRange | null;
  durations: number[];
  id: string;
  mediasRoles: string[];
  name: string;
  outputType: DesignOutputKind;
  parameters: DesignModelParameter[];
  provider: string;
  supportsUnlim?: boolean;
  tags?: string[];
}

export interface DesignResult {
  aspectRatio?: string;
  createdAt: string;
  duration?: number;
  id: string;
  imageUrl?: string;
  kind: DesignOutputKind;
  model: string;
  modelName?: string;
  prompt: string;
  videoUrl?: string;
}

export interface DesignSourceFile {
  data: string;
  filename: string;
  mediaType: string;
}

export interface DesignLocalSource {
  file: File;
  id: string;
  mediaType: string;
  name: string;
  previewUrl: string;
}

export interface DesignGenerateRequest {
  aspectRatio?: string;
  count?: number;
  duration?: number;
  kind: DesignOutputKind;
  model: string;
  parameters?: Record<string, string | number>;
  prompt: string;
  sourceFiles?: DesignSourceFile[];
  sourceMediaUrls?: string[];
}

export interface DesignStatusResponse {
  balance?: unknown;
  connected: boolean;
  needsAuth?: boolean;
  serverId?: string | null;
  serverName?: string | null;
  toolCount?: number;
}
