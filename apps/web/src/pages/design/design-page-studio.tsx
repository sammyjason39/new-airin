import type { RefObject } from "react";
import type {
  DesignModel,
  DesignOutputKind,
  DesignPrompt,
} from "@/lib/design/types";
import { DesignStudioAdvanced } from "@/pages/design/design-page-advanced";
import { DesignFlower, DesignMascot } from "@/pages/design/design-page-art";
import { RecommendedCard } from "@/pages/design/design-page-cards";
import { DesignStudioComposer } from "@/pages/design/design-page-composer";

export function DesignStudioPanel({
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
  modelId,
  models,
  onEstimate,
  onGenerate,
  onKindChange,
  onModelChange,
  onPickPrompt,
  onPromptChange,
  onToggleAdvanced,
  paramValues,
  prompt,
  recommended,
  selectedModelLabel,
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
  modelId: string;
  models: DesignModel[];
  onEstimate: () => void;
  onGenerate: () => void;
  onKindChange: (kind: DesignOutputKind) => void;
  onModelChange: (modelId: string) => void;
  onPickPrompt: (item: DesignPrompt) => void;
  onPromptChange: (value: string) => void;
  onToggleAdvanced: () => void;
  paramValues: Record<string, string>;
  prompt: string;
  recommended: DesignPrompt[];
  selectedModelLabel: string;
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
      <section className="design-page__hero">
        <div className="design-page__hero-copy">
          <div className="design-page__hero-title-row">
            <DesignFlower className="design-page__flower" />
            <h1 className="design-page__hero-title">
              Make E-commerce design easier
            </h1>
          </div>
          <p className="design-page__hero-sub">
            High-converting image &amp; video creation that understands
            business.
          </p>
        </div>
        <DesignMascot className="design-page__mascot" />
      </section>

      <DesignStudioComposer
        busy={busy}
        fileInputRef={fileInputRef}
        kind={kind}
        modelId={modelId}
        models={models}
        onEstimate={onEstimate}
        onGenerate={onGenerate}
        onKindChange={onKindChange}
        onModelChange={onModelChange}
        onPromptChange={onPromptChange}
        onToggleAdvanced={onToggleAdvanced}
        prompt={prompt}
        selectedModelLabel={selectedModelLabel}
        setShowAdvanced={setShowAdvanced}
      />

      <DesignStudioAdvanced
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
        onEstimate={onEstimate}
        paramValues={paramValues}
        setAspectRatio={setAspectRatio}
        setDuration={setDuration}
        setParamValues={setParamValues}
        setShowAdvanced={setShowAdvanced}
        setSourceUrls={setSourceUrls}
        showAdvanced={showAdvanced}
        sourceConnected={sourceConnected}
        sourceInputId={sourceInputId}
        sourceUrls={sourceUrls}
        statusNote={statusNote}
      />

      <section className="design-page__section">
        <h2 className="design-page__section-title">Recommended</h2>
        <ul className="design-page__grid">
          {recommended.map((item, index) => (
            <li key={item.id}>
              <RecommendedCard
                item={item}
                onPick={() => onPickPrompt(item)}
                showPlay={index < 4}
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
