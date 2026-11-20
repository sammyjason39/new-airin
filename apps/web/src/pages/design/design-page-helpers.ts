import { getDesignModel, selectableParameters } from "@/lib/design/models";
import type { DesignLocalSource, DesignSourceFile } from "@/lib/design/types";
import { readFileAsDataUrl } from "@/lib/read-file-as-data-url";

export const DESIGN_PROMPT_PLACEHOLDER =
  "Create a six-image Alibaba.com product image set for headphones.";

export const MAX_DESIGN_LOCAL_FILES = 4;

export const MAX_DESIGN_LOCAL_FILE_BYTES = Math.floor(1.5 * 1024 * 1024);

const ALLOWED_SOURCE_PREFIXES = ["image/", "video/"] as const;

export function parseSourceUrls(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function isDesignSourceMediaType(mediaType: string): boolean {
  return ALLOWED_SOURCE_PREFIXES.some((prefix) => mediaType.startsWith(prefix));
}

export type DesignLocalSourcesResult = {
  error: string | null;
  sources: DesignLocalSource[];
};

export function appendDesignLocalSources(
  current: DesignLocalSource[],
  files: FileList | File[]
) {
  const next = [...current];
  const incoming = Array.from(files);

  for (const file of incoming) {
    if (next.length >= MAX_DESIGN_LOCAL_FILES) {
      const result = {
        error: `You can attach up to ${MAX_DESIGN_LOCAL_FILES} files.`,
        sources: next,
      } satisfies DesignLocalSourcesResult;

      return result;
    }

    if (!isDesignSourceMediaType(file.type)) {
      const result = {
        error: "Attach an image or video file.",
        sources: next,
      } satisfies DesignLocalSourcesResult;

      return result;
    }

    if (file.size > MAX_DESIGN_LOCAL_FILE_BYTES) {
      const result = {
        error: "Each file must be 1.5 MB or smaller.",
        sources: next,
      } satisfies DesignLocalSourcesResult;

      return result;
    }

    next.push({
      file,
      id: crypto.randomUUID(),
      mediaType: file.type,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
    });
  }

  const result = {
    error: null,
    sources: next,
  } satisfies DesignLocalSourcesResult;

  return result;
}

export function revokeDesignLocalSource(source: DesignLocalSource): void {
  URL.revokeObjectURL(source.previewUrl);
}

export function clearDesignLocalSources(sources: DesignLocalSource[]): void {
  for (const source of sources) {
    revokeDesignLocalSource(source);
  }
}

export async function encodeDesignLocalSources(
  sources: DesignLocalSource[]
): Promise<DesignSourceFile[]> {
  return Promise.all(
    sources.map(async (source) => {
      const dataUrl = await readFileAsDataUrl(source.file);
      const marker = ";base64,";
      const index = dataUrl.indexOf(marker);

      if (index < 0) {
        throw new Error(`Could not read ${source.name}.`);
      }

      return {
        data: dataUrl.slice(index + marker.length),
        filename: source.name,
        mediaType: source.mediaType,
      };
    })
  );
}

export function defaultParameterValues(modelId: string) {
  const model = getDesignModel(modelId);

  if (!model) {
    return {};
  }

  const values: Record<string, string> = {};

  for (const parameter of selectableParameters(model)) {
    const fallback = parameter.default;

    if (fallback != null && String(fallback).length > 0) {
      values[parameter.name] = String(fallback);
    } else if (parameter.options[0]) {
      values[parameter.name] = parameter.options[0];
    }
  }

  // oxlint-disable-next-line anti-slop/no-known-value-widening -- Callers need a string map for form state.
  return values;
}
