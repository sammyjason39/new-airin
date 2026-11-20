import { Button } from "@airin/ui/button";
import { Settings01Icon } from "hugeicons-react";
import type { RefObject } from "react";
import type { DesignModel, DesignOutputKind } from "@/lib/design/types";

export function DesignStudioAdvanced({
  aspectRatio,
  aspectRatios,
  busy,
  duration,
  durationOptions,
  error,
  estimateNote,
  extraParameters,
  fileInputRef,
  kind,
  onEstimate,
  paramValues,
  setAspectRatio,
  setDuration,
  setParamValues,
  setShowAdvanced,
  setSourceUrls,
  showAdvanced,
  sourceConnected,
  sourceInputId,
  sourceUrls,
  statusNote,
}: {
  aspectRatio: string;
  aspectRatios: string[];
  busy: "estimate" | "generate" | null;
  duration: string;
  durationOptions: string[];
  error: string | null;
  estimateNote: string | null;
  extraParameters: DesignModel["parameters"];
  fileInputRef: RefObject<HTMLInputElement | null>;
  kind: DesignOutputKind;
  onEstimate: () => void;
  paramValues: Record<string, string>;
  setAspectRatio: (value: string) => void;
  setDuration: (value: string) => void;
  setParamValues: (
    update: (current: Record<string, string>) => Record<string, string>
  ) => void;
  setShowAdvanced: (value: boolean) => void;
  setSourceUrls: (value: string) => void;
  showAdvanced: boolean;
  sourceConnected: boolean;
  sourceInputId: string;
  sourceUrls: string;
  statusNote: string | null;
}) {
  return (
    <>
      {showAdvanced ? (
        <div className="design-page__advanced">
          <label>
            Aspect ratio
            <select
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
            <label>
              Duration (seconds)
              <select
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
            <label key={parameter.name}>
              {parameter.name.replaceAll("_", " ")}
              <select
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

          <label htmlFor={sourceInputId}>
            Source image URLs
            <input
              id={sourceInputId}
              onChange={(event) => setSourceUrls(event.target.value)}
              placeholder="https://… (optional, with local uploads)"
              ref={fileInputRef}
              value={sourceUrls}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowAdvanced(false)}
              size="sm"
              type="button"
              variant="outline"
            >
              Hide settings
            </Button>
            <Button
              disabled={busy != null}
              onClick={onEstimate}
              size="sm"
              type="button"
              variant="outline"
            >
              {busy === "estimate" ? "Estimating…" : "Estimate cost"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="design-page__composer-foot">
          <button
            className="design-page__tool design-page__tool--chip"
            onClick={() => setShowAdvanced(true)}
            type="button"
          >
            <Settings01Icon aria-hidden className="size-3.5" />
            Settings
          </button>
        </div>
      )}

      {error ? (
        <p className="design-page__alert" role="alert">
          {error}
        </p>
      ) : null}
      {estimateNote ? (
        <pre className="design-page__note">{estimateNote}</pre>
      ) : null}
      {statusNote ? <p className="design-page__note">{statusNote}</p> : null}
      {sourceConnected ? null : (
        <p className="design-page__note">
          Connect Higgsfield in Settings → MCP to generate.
        </p>
      )}
    </>
  );
}
