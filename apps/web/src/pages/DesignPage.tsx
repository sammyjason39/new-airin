import { Button } from "@airin/ui/button";
import { Input } from "@airin/ui/input";
import { Textarea } from "@airin/ui/textarea";
import { cn } from "@airin/ui/utils";
import { useQuery } from "@tanstack/react-query";
import { Search01Icon } from "hugeicons-react";
import { useEffect, useState } from "react";
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
  DesignTab,
} from "@/lib/design/types";

const selectClassName =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

const tabClass = (active: boolean) =>
  cn(
    "rounded-full px-3.5 py-1.5 font-medium text-sm transition-colors",
    active
      ? "bg-background text-foreground shadow-sm"
      : "text-muted-foreground hover:text-foreground"
  );

function parseSourceUrls(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function defaultParameterValues(modelId: string): Record<string, string> {
  const model = getDesignModel(modelId);

  if (!model) {
    return {} satisfies Record<string, string>;
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

  // oxlint-disable-next-line anti-slop/no-known-value-widening -- Parameter names come from the model catalog schema.
  return values satisfies Record<string, string>;
}

// oxlint-disable-next-line react-doctor/no-high-complexity-react-function, react-doctor/no-giant-component -- Studio controls, library, and results share one Design page.
export function DesignPage() {
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
  const [librarySearch, setLibrarySearch] = useState("");
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
  const libraryPrompts = filterDesignPrompts(librarySearch);

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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <nav
        aria-label="Design sections"
        className="inline-flex flex-wrap gap-1 self-start rounded-full border border-border bg-muted/40 p-1"
      >
        {(
          [
            { id: "studio", label: "Studio" },
            { id: "library", label: "Library" },
            { id: "results", label: "Results" },
          ] as const
        ).map((item) => (
          <button
            aria-current={tab === item.id ? "page" : undefined}
            className={tabClass(tab === item.id)}
            key={item.id}
            onClick={() => setTab(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {tab === "studio" ? (
        <div className="flex flex-col gap-5">
          <h1 className="font-semibold text-2xl tracking-tight">Design</h1>

          {statusQuery.data ? (
            <p className="text-muted-foreground text-sm">
              {statusQuery.data.connected
                ? `Connected${statusQuery.data.serverName ? ` · ${statusQuery.data.serverName}` : ""}`
                : "Design provider is not connected."}
            </p>
          ) : statusQuery.isError ? (
            <p className="text-muted-foreground text-sm">
              Design status is unavailable until server routes are live.
            </p>
          ) : null}

          <Textarea
            aria-label="Prompt"
            className="min-h-40 text-base"
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe the image or video you want"
            value={prompt}
          />

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "image", label: "Photo" },
                { id: "video", label: "Video" },
              ] as const
            ).map((item) => (
              <button
                aria-pressed={kind === item.id}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  kind === item.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
                key={item.id}
                onClick={() => setKind(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            Model
            <select
              className={selectClassName}
              onChange={(event) => setModelId(event.target.value)}
              value={modelId}
            >
              {models.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name} — {entry.provider}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            Aspect ratio
            <select
              className={selectClassName}
              onChange={(event) => setAspectRatio(event.target.value)}
              value={aspectRatio}
            >
              {aspectRatios.map((ratio) => (
                <option key={ratio} value={ratio}>
                  {ratio}
                </option>
              ))}
            </select>
          </label>

          {kind === "video" && durationOptions.length > 0 ? (
            <label className="flex flex-col gap-1.5 text-sm">
              Duration (seconds)
              <select
                className={selectClassName}
                onChange={(event) => setDuration(event.target.value)}
                value={duration}
              >
                {durationOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}s
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {extraParameters.map((parameter) => (
            <label
              className="flex flex-col gap-1.5 text-sm"
              key={parameter.name}
            >
              {parameter.name.replaceAll("_", " ")}
              <select
                className={selectClassName}
                onChange={(event) =>
                  setParamValues((current) => ({
                    ...current,
                    [parameter.name]: event.target.value,
                  }))
                }
                value={
                  paramValues[parameter.name] ?? parameter.options[0] ?? ""
                }
              >
                {parameter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <label className="flex flex-col gap-1.5 text-sm">
            Source image URLs
            <Input
              onChange={(event) => setSourceUrls(event.target.value)}
              placeholder="https://… (comma-separated)"
              value={sourceUrls}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <Button
              disabled={busy != null}
              onClick={() => void onEstimate()}
              type="button"
              variant="outline"
            >
              {busy === "estimate" ? "Estimating…" : "Estimate cost"}
            </Button>
            <Button
              disabled={busy != null}
              onClick={() => void onGenerate()}
              type="button"
            >
              {busy === "generate" ? "Generating…" : "Generate"}
            </Button>
          </div>

          {estimateNote ? (
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-3 text-xs">
              {estimateNote}
            </pre>
          ) : null}

          {statusNote ? (
            <p className="text-muted-foreground text-sm">{statusNote}</p>
          ) : null}
        </div>
      ) : null}

      {tab === "library" ? (
        <div className="flex flex-col gap-4">
          <h1 className="font-semibold text-2xl tracking-tight">Library</h1>
          <div className="relative w-full sm:max-w-md">
            <Search01Icon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Search prompts"
              className="pl-9"
              onChange={(event) => setLibrarySearch(event.target.value)}
              placeholder="Search prompt library"
              value={librarySearch}
            />
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {libraryPrompts.map((item) => (
              <li key={item.id}>
                <button
                  className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-foreground/30"
                  onClick={() => {
                    setPrompt(item.prompt);
                    setKind(item.category === "video" ? "video" : "image");
                    setTab("studio");
                  }}
                  type="button"
                >
                  <img
                    alt=""
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                    src={item.thumbUrl}
                  />
                  <span className="line-clamp-3 p-3 text-sm">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === "results" ? (
        <div className="flex flex-col gap-4">
          <h1 className="font-semibold text-2xl tracking-tight">Results</h1>
          {results.length > 0 ? (
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  clearDesignResults();
                  setResults([]);
                }}
                type="button"
                variant="outline"
              >
                Clear saved results
              </Button>
            </div>
          ) : null}

          {results.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No saved results yet.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((item) => {
                const mediaUrl = item.videoUrl ?? item.imageUrl;

                const modelName =
                  item.modelName ??
                  getDesignModel(item.model)?.name ??
                  item.model;

                return (
                  <li
                    className="overflow-hidden rounded-xl border border-border bg-card"
                    key={item.id}
                  >
                    {mediaUrl ? (
                      item.kind === "video" ? (
                        <video
                          className="aspect-video w-full bg-muted object-cover"
                          controls
                          preload="metadata"
                          src={mediaUrl}
                        />
                      ) : (
                        <img
                          alt=""
                          className="aspect-video w-full object-cover"
                          src={mediaUrl}
                        />
                      )
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground text-sm">
                        No preview
                      </div>
                    )}
                    <div className="space-y-1 p-3 text-sm">
                      <p className="line-clamp-2 text-muted-foreground">
                        {item.prompt}
                      </p>
                      <p>
                        {modelName} ·{" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
