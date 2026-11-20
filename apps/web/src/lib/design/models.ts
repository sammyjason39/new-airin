import rawCatalog from "./higgsfield-models.json";
import type { DesignModel, DesignOutputKind } from "./types";

interface DesignModelCatalog {
  image: DesignModel[];
  video: DesignModel[];
}

// SAFETY: higgsfield-models.json is a committed catalog that matches DesignModelCatalog.
const catalog = rawCatalog as DesignModelCatalog;

const modelsById = new Map<string, DesignModel>();

for (const model of [...catalog.image, ...catalog.video]) {
  modelsById.set(model.id, model);
}

export function listDesignModels(kind: DesignOutputKind): DesignModel[] {
  return catalog[kind];
}

export function getDesignModel(id: string): DesignModel | undefined {
  return modelsById.get(id);
}

export function defaultModelId(kind: DesignOutputKind): string {
  const models = listDesignModels(kind);

  if (kind === "image") {
    const preferred = models.find((model) => model.id === "nano_banana");

    return preferred?.id ?? models[0]?.id ?? "";
  }

  const seedanceMini = models.find((model) => model.id === "seedance_2_0_mini");

  if (seedanceMini) {
    return seedanceMini.id;
  }

  const cheapest = models.find((model) => model.id.includes("mini"));

  return cheapest?.id ?? models[0]?.id ?? "";
}

export const DEFAULT_ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export function aspectRatiosForModel(model: DesignModel | undefined): string[] {
  if (model?.aspectRatios.length) {
    return model.aspectRatios;
  }

  return DEFAULT_ASPECT_RATIOS;
}

export function durationOptionsForModel(
  model: DesignModel | undefined
): string[] {
  if (!model) {
    return [];
  }

  if (model.durations.length > 0) {
    return model.durations.map(String);
  }

  if (model.durationRange) {
    const values: string[] = [];

    for (
      let seconds = model.durationRange.min;
      seconds <= model.durationRange.max;
      seconds += 1
    ) {
      values.push(String(seconds));
    }

    return values;
  }

  const durationParam = model.parameters.find(
    (parameter) => parameter.name === "duration"
  );

  if (!durationParam) {
    return [];
  }

  if (durationParam.options.length > 0) {
    return durationParam.options.map(String);
  }

  if (durationParam.type !== "number") {
    return [];
  }

  const min = 4;
  const max = 15;
  const values: string[] = [];

  for (let seconds = min; seconds <= max; seconds += 1) {
    values.push(String(seconds));
  }

  return values;
}

export function selectableParameters(model: DesignModel | undefined) {
  if (!model) {
    return [];
  }

  return model.parameters.filter(
    (parameter) => parameter.name !== "duration" && parameter.options.length > 0
  );
}
