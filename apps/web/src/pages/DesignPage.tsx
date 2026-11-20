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
  DesignOutputKind,
  DesignPrompt,
  DesignTab,
} from "@/lib/design/types";
import {
  defaultParameterValues,
  parseSourceUrls,
} from "@/pages/design/design-page-helpers";
import {
  DesignLibraryPanel,
  DesignResultsPanel,
} from "@/pages/design/design-page-panels";
import { DesignStudioPanel } from "@/pages/design/design-page-studio";
import "./design-page.css";

export function DesignPage() {
  const sourceInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [estimateNote, setEstimateNote] = useState<string | null>(null);
  const [busy, setBusy] = useState<"estimate" | "generate" | null>(null);
  const [results, setResults] = useState(() => listDesignResults());

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

  const buildRequest = (): DesignGenerateRequest => {
    const numericDuration = duration ? Number(duration) : undefined;

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
      sourceMediaUrls: parseSourceUrls(sourceUrls),
    };
  };

  const onEstimate = async () => {
    setError(null);
    setEstimateNote(null);

    const request = buildRequest();

    if (!request.prompt) {
      setError("Enter a prompt before estimating cost.");
      return;
    }

    setBusy("estimate");

    try {
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

    const request = buildRequest();

    if (!request.prompt) {
      setError("Enter a prompt before generating.");
      return;
    }

    setBusy("generate");

    try {
      const result = await generateDesign(request);
      setResults(addDesignResult(result));
      setStatusNote("Saved to Results.");
      setTab("results");
    } catch (failure) {
      setError(formatError(failure));
    } finally {
      setBusy(null);
    }
  };

  const pickPrompt = (item: DesignPrompt) => {
    setPrompt(item.prompt);
    setKind(item.category === "video" ? "video" : "image");
    setTab("studio");
  };

  return (
    <div className="design-page">
      <div className="design-page__scroll">
        <div className="design-page__inner">
          <nav aria-label="Design sections" className="design-page__tabs">
            {(
              [
                { id: "studio", label: "Design" },
                { id: "library", label: "Library" },
                { id: "results", label: "Results" },
              ] as const
            ).map((item) => (
              <button
                aria-current={tab === item.id ? "page" : undefined}
                className="design-page__tab"
                key={item.id}
                onClick={() => setTab(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {tab === "studio" ? (
            <DesignStudioPanel
              aspectRatio={aspectRatio}
              aspectRatios={aspectRatios}
              busy={busy}
              duration={duration}
              durationOptions={durationOptions}
              error={error}
              estimateNote={estimateNote}
              extraParameters={extraParameters}
              fileInputRef={fileInputRef}
              kind={kind}
              modelId={modelId}
              models={models}
              onEstimate={() => void onEstimate()}
              onGenerate={() => void onGenerate()}
              onKindChange={setKind}
              onModelChange={setModelId}
              onPickPrompt={pickPrompt}
              onPromptChange={setPrompt}
              onToggleAdvanced={() => setShowAdvanced((open) => !open)}
              paramValues={paramValues}
              prompt={prompt}
              recommended={recommended}
              selectedModelLabel={selectedModelLabel}
              setAspectRatio={setAspectRatio}
              setDuration={setDuration}
              setParamValues={setParamValues}
              setShowAdvanced={setShowAdvanced}
              setSourceUrls={setSourceUrls}
              showAdvanced={showAdvanced}
              sourceConnected={statusQuery.data?.connected !== false}
              sourceInputId={sourceInputId}
              sourceUrls={sourceUrls}
              statusNote={statusNote}
            />
          ) : null}

          {tab === "library" ? (
            <DesignLibraryPanel onPick={pickPrompt} />
          ) : null}

          {tab === "results" ? (
            <DesignResultsPanel
              onClear={() => {
                clearDesignResults();
                setResults([]);
              }}
              results={results}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
