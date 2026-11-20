import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { formatError } from "@/lib/client";
import {
  estimateDesignCost,
  generateDesign,
  getDesignStatus,
  listRemoteDesignResults,
} from "@/lib/design/api";
import {
  aspectRatiosForModel,
  defaultModelId,
  durationOptionsForModel,
  getDesignModel,
  listDesignModels,
  selectableParameters,
} from "@/lib/design/models";
import { filterDesignPrompts } from "@/lib/design/prompt-library";
import {
  addDesignResult,
  clearDesignResults,
  listDesignResults,
} from "@/lib/design/results-store";
import type {
  DesignGenerateRequest,
  DesignLocalSource,
  DesignOutputKind,
  DesignPendingGeneration,
  DesignPrompt,
  DesignTab,
} from "@/lib/design/types";
import {
  appendDesignLocalSources,
  clearDesignLocalSources,
  defaultParameterValues,
  encodeDesignLocalSources,
  parseSourceUrls,
  revokeDesignLocalSource,
} from "@/pages/design/design-page-helpers";

export function useDesignPageController() {
  const sourceInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localFileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<DesignTab>("studio");
  const [kind, setKind] = useState<DesignOutputKind>("image");
  const [modelId, setModelId] = useState(() => defaultModelId("image"));
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [duration, setDuration] = useState("");

  const [paramValues, setParamValues] = useState<Record<string, string>>(() =>
    defaultParameterValues(defaultModelId("image"))
  );

  const [sourceUrls, setSourceUrls] = useState("");
  const [localSources, setLocalSources] = useState<DesignLocalSource[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [estimateNote, setEstimateNote] = useState<string | null>(null);
  const [busy, setBusy] = useState<"estimate" | "generate" | null>(null);

  const [pendingGeneration, setPendingGeneration] =
    useState<DesignPendingGeneration | null>(null);

  const [results, setResults] = useState(() => listDesignResults());
  const localSourcesRef = useRef(localSources);

  useEffect(() => {
    localSourcesRef.current = localSources;
  }, [localSources]);

  useEffect(
    () => () => {
      clearDesignLocalSources(localSourcesRef.current);
    },
    []
  );

  const models = listDesignModels(kind);
  const model = getDesignModel(modelId);
  const aspectRatios = aspectRatiosForModel(model);
  const durationOptions = durationOptionsForModel(model);
  const extraParameters = selectableParameters(model);
  const recommended = filterDesignPrompts("").slice(0, 8);

  const selectedModelLabel =
    modelId === defaultModelId(kind) ? "Auto" : (model?.name ?? "Auto");

  const statusQuery = useQuery({
    queryFn: () => getDesignStatus(),
    queryKey: ["design-status"],
    retry: false,
  });

  useEffect(() => {
    let cancelled = false;

    void listRemoteDesignResults()
      .then((remote) => {
        if (cancelled || remote.length === 0) {
          return;
        }

        setResults((current) => {
          const seen = new Set(current.map((item) => item.id));
          const merged = [...current];

          for (const item of remote) {
            if (!seen.has(item.id)) {
              merged.push(item);
              seen.add(item.id);
            }
          }

          return merged;
        });
      })
      .catch(() => {
        // Local results still work when the org store is empty or offline.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const nextDefault = defaultModelId(kind);
    setModelId(nextDefault);
    setParamValues(defaultParameterValues(nextDefault));
  }, [kind]);

  // oxlint-disable react-doctor/no-effect-chain -- Model change resets aspect, duration, and extra params together.
  useEffect(() => {
    if (!aspectRatios.includes(aspectRatio)) {
      setAspectRatio(aspectRatios[0] ?? "1:1");
    }
  }, [aspectRatio, aspectRatios, modelId]);

  useEffect(() => {
    setParamValues(defaultParameterValues(modelId));

    const options = durationOptionsForModel(getDesignModel(modelId));

    if (options.length > 0) {
      setDuration(options[0] ?? "");
    } else {
      setDuration("");
    }
  }, [modelId]);
  // oxlint-enable react-doctor/no-effect-chain

  const buildRequest = async (): Promise<DesignGenerateRequest> => {
    const numericDuration = duration ? Number(duration) : undefined;

    const sourceFiles =
      localSources.length > 0
        ? await encodeDesignLocalSources(localSources)
        : undefined;

    return {
      aspectRatio,
      count: 1,
      duration:
        numericDuration != null && !Number.isNaN(numericDuration)
          ? numericDuration
          : undefined,
      kind,
      model: modelId,
      parameters: Object.keys(paramValues).length ? paramValues : undefined,
      prompt: prompt.trim(),
      sourceFiles,
      sourceMediaUrls: parseSourceUrls(sourceUrls),
    };
  };

  const onLocalFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const result = appendDesignLocalSources(localSources, files);

    if (result.error) {
      setError(result.error);
    }

    setLocalSources(result.sources);
  };

  const onRemoveLocalSource = (id: string) => {
    const target = localSources.find((source) => source.id === id);

    if (target) {
      revokeDesignLocalSource(target);
    }

    setLocalSources(localSources.filter((source) => source.id !== id));
  };

  const onEstimate = async () => {
    setError(null);
    setEstimateNote(null);

    if (!prompt.trim()) {
      setError("Enter a prompt before estimating cost.");

      return;
    }

    setBusy("estimate");

    try {
      const request = await buildRequest();
      const estimate = await estimateDesignCost(request);
      setEstimateNote(
        Object.prototype.toString.call(estimate) === "[object String]"
          ? String(estimate)
          : JSON.stringify(estimate, null, 2)
      );
    } catch (failure) {
      setError(formatError(failure));
    } finally {
      setBusy(null);
    }
  };

  const onGenerate = async () => {
    setError(null);
    setStatusNote(null);
    setEstimateNote(null);

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError("Enter a prompt before generating.");

      return;
    }

    const pending: DesignPendingGeneration = {
      id: crypto.randomUUID(),
      kind,
      model: modelId,
      prompt: trimmedPrompt,
    };

    setBusy("generate");
    setPendingGeneration(pending);
    setTab("results");

    try {
      const request = await buildRequest();
      const result = await generateDesign(request);
      setResults(addDesignResult(result));
      setStatusNote("Saved to Results.");
    } catch (failure) {
      setError(formatError(failure));
      setTab("studio");
    } finally {
      setPendingGeneration(null);
      setBusy(null);
    }
  };

  const pickPrompt = (item: DesignPrompt) => {
    setPrompt(item.prompt);
    setKind(item.category === "video" ? "video" : "image");
    setTab("studio");
  };

  const clearResults = () => {
    if (pendingGeneration) {
      return;
    }

    clearDesignResults();
    setResults([]);
  };

  return {
    aspectRatio,
    aspectRatios,
    busy,
    clearResults,
    duration,
    durationOptions,
    error,
    estimateNote,
    extraParameters,
    fileInputRef,
    kind,
    localFileInputRef,
    localSources,
    modelId,
    models,
    onEstimate,
    onGenerate,
    onLocalFilesSelected,
    onRemoveLocalSource,
    paramValues,
    pendingGeneration,
    pickPrompt,
    prompt,
    recommended,
    results,
    selectedModelLabel,
    setAspectRatio,
    setDuration,
    setKind,
    setModelId,
    setParamValues,
    setPrompt,
    setShowAdvanced,
    setSourceUrls,
    setTab,
    showAdvanced,
    sourceConnected: statusQuery.data?.connected !== false,
    sourceInputId,
    sourceUrls,
    statusNote,
    tab,
  };
}
