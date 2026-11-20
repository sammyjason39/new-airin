import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@airin/ui/dropdown-menu";
import {
  Add01Icon,
  ArrowUp02Icon,
  Cancel01Icon,
  Image01Icon,
  Mic01Icon,
  PuzzleIcon,
} from "hugeicons-react";
import type { ChangeEvent, RefObject } from "react";
import type {
  DesignLocalSource,
  DesignModel,
  DesignOutputKind,
} from "@/lib/design/types";
import { DESIGN_PROMPT_PLACEHOLDER } from "@/pages/design/design-page-helpers";

export function DesignStudioComposer({
  busy,
  kind,
  localFileInputRef,
  localSources,
  modelId,
  models,
  onEstimate,
  onGenerate,
  onKindChange,
  onLocalFilesSelected,
  onModelChange,
  onPromptChange,
  onRemoveLocalSource,
  onToggleAdvanced,
  prompt,
  selectedModelLabel,
  setShowAdvanced,
}: {
  busy: "estimate" | "generate" | null;
  kind: DesignOutputKind;
  localFileInputRef: RefObject<HTMLInputElement | null>;
  localSources: DesignLocalSource[];
  modelId: string;
  models: DesignModel[];
  onEstimate: () => void;
  onGenerate: () => void;
  onKindChange: (kind: DesignOutputKind) => void;
  onLocalFilesSelected: (files: FileList | null) => void;
  onModelChange: (modelId: string) => void;
  onPromptChange: (value: string) => void;
  onRemoveLocalSource: (id: string) => void;
  onToggleAdvanced: () => void;
  prompt: string;
  selectedModelLabel: string;
  setShowAdvanced: (value: boolean) => void;
}) {
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onLocalFilesSelected(event.target.files);
    event.target.value = "";
  };

  return (
    <div className="design-page__composer">
      <input
        accept="image/*,video/*"
        aria-label="Upload image or video from folder"
        className="sr-only"
        multiple
        onChange={onFileChange}
        ref={localFileInputRef}
        type="file"
      />

      {localSources.length > 0 ? (
        <ul aria-label="Attached files" className="design-page__attachments">
          {localSources.map((source) => (
            <li className="design-page__attachment" key={source.id}>
              {source.mediaType.startsWith("video/") ? (
                <video
                  aria-hidden
                  className="design-page__attachment-thumb"
                  muted
                  preload="metadata"
                  src={source.previewUrl}
                />
              ) : (
                <img
                  alt=""
                  className="design-page__attachment-thumb"
                  src={source.previewUrl}
                />
              )}
              <span className="design-page__attachment-name">
                {source.name}
              </span>
              <button
                aria-label={`Remove ${source.name}`}
                className="design-page__attachment-remove"
                onClick={() => onRemoveLocalSource(source.id)}
                type="button"
              >
                <Cancel01Icon aria-hidden className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <textarea
        aria-label="Prompt"
        className="design-page__textarea"
        onChange={(event) => onPromptChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onGenerate();
          }
        }}
        placeholder={DESIGN_PROMPT_PLACEHOLDER}
        value={prompt}
      />

      <div className="design-page__toolbar">
        <button
          aria-label="Upload image or video"
          className="design-page__tool"
          onClick={() => localFileInputRef.current?.click()}
          type="button"
        >
          <Image01Icon aria-hidden className="size-4" />
        </button>
        <button
          aria-label="Open advanced settings"
          className="design-page__tool"
          onClick={onToggleAdvanced}
          type="button"
        >
          <Add01Icon aria-hidden className="size-4" />
        </button>
        <button
          className="design-page__tool design-page__tool--chip"
          onClick={() => setShowAdvanced(true)}
          type="button"
        >
          <PuzzleIcon aria-hidden className="size-3.5" />
          Use plugins
        </button>
        <span className="design-page__tool design-page__tool--design">
          # Design
        </span>

        <span className="design-page__toolbar-spacer" />

        <div
          aria-label="Output type"
          className="design-page__kind"
          role="group"
        >
          <button
            aria-pressed={kind === "image"}
            className="design-page__tool"
            onClick={() => onKindChange("image")}
            type="button"
          >
            Photo
          </button>
          <button
            aria-pressed={kind === "video"}
            className="design-page__tool"
            onClick={() => onKindChange("video")}
            type="button"
          >
            Video
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="design-page__tool design-page__tool--chip"
            render={
              <button
                className="design-page__tool design-page__tool--chip"
                type="button"
              />
            }
          >
            {selectedModelLabel}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-0">
            <div className="design-page__model-menu">
              {models.map((entry) => (
                <button
                  aria-pressed={entry.id === modelId}
                  className="design-page__model-item"
                  key={entry.id}
                  onClick={() => onModelChange(entry.id)}
                  type="button"
                >
                  {entry.name}
                  <span>{entry.provider}</span>
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          aria-label="Estimate cost"
          className="design-page__tool"
          disabled={busy != null}
          onClick={onEstimate}
          type="button"
        >
          <Mic01Icon aria-hidden className="size-4" />
        </button>
        <button
          aria-label="Generate"
          className="design-page__send"
          disabled={busy != null}
          onClick={onGenerate}
          type="button"
        >
          <ArrowUp02Icon aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
