import { useDesignPageController } from "@/pages/design/design-page-controller";
import {
  DesignLibraryPanel,
  DesignResultsPanel,
} from "@/pages/design/design-page-panels";
import { DesignStudioPanel } from "@/pages/design/design-page-studio";
import "./design-page.css";

export function DesignPage() {
  const page = useDesignPageController();

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
                aria-current={page.tab === item.id ? "page" : undefined}
                className="design-page__tab"
                key={item.id}
                onClick={() => page.setTab(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {page.tab === "studio" ? (
            <DesignStudioPanel
              aspectRatio={page.aspectRatio}
              aspectRatios={page.aspectRatios}
              busy={page.busy}
              duration={page.duration}
              durationOptions={page.durationOptions}
              error={page.error}
              estimateNote={page.estimateNote}
              extraParameters={page.extraParameters}
              fileInputRef={page.fileInputRef}
              kind={page.kind}
              localFileInputRef={page.localFileInputRef}
              localSources={page.localSources}
              modelId={page.modelId}
              models={page.models}
              onEstimate={() => void page.onEstimate()}
              onGenerate={() => void page.onGenerate()}
              onKindChange={page.setKind}
              onLocalFilesSelected={page.onLocalFilesSelected}
              onModelChange={page.setModelId}
              onPickPrompt={page.pickPrompt}
              onPromptChange={page.setPrompt}
              onRemoveLocalSource={page.onRemoveLocalSource}
              onToggleAdvanced={() => page.setShowAdvanced((open) => !open)}
              paramValues={page.paramValues}
              prompt={page.prompt}
              recommended={page.recommended}
              selectedModelLabel={page.selectedModelLabel}
              setAspectRatio={page.setAspectRatio}
              setDuration={page.setDuration}
              setParamValues={page.setParamValues}
              setShowAdvanced={page.setShowAdvanced}
              setSourceUrls={page.setSourceUrls}
              showAdvanced={page.showAdvanced}
              sourceConnected={page.sourceConnected}
              sourceInputId={page.sourceInputId}
              sourceUrls={page.sourceUrls}
              statusNote={page.statusNote}
            />
          ) : null}

          {page.tab === "library" ? (
            <DesignLibraryPanel onPick={page.pickPrompt} />
          ) : null}

          {page.tab === "results" ? (
            <DesignResultsPanel
              onClear={page.clearResults}
              results={page.results}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
