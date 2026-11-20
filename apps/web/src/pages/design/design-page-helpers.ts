import { getDesignModel, selectableParameters } from "@/lib/design/models";

export const DESIGN_PROMPT_PLACEHOLDER =
  "Create a six-image Alibaba.com product image set for headphones.";

export function parseSourceUrls(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
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
