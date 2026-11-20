import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@airin/ui/dropdown-menu";
import { cn } from "@airin/ui/utils";
import {
  Add01Icon,
  ArrowUp02Icon,
  Image01Icon,
  Mic01Icon,
  PuzzleIcon,
} from "hugeicons-react";
import type { RefObject } from "react";
import type { DesignModel, DesignOutputKind } from "@/lib/design/types";
import { DESIGN_PROMPT_PLACEHOLDER } from "@/pages/design/design-page-helpers";

export function DesignStudioComposer({
  busy,
  fileInputRef,
  kind,
  modelId,
  models,
  onEstimate,
  onGenerate,
  onKindChange,
  onModelChange,
  onPromptChange,
  onToggleAdvanced,
  prompt,
  selectedModelLabel,
  setShowAdvanced,
}: {
  busy: "estimate" | "generate" | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  kind: DesignOutputKind;
  modelId: string;
  models: DesignModel[];
  onEstimate: () => void;
  onGenerate: () => void;
  onKindChange: (kind: DesignOutputKind) => void;
  onModelChange: (modelId: string) => void;
  onPromptChange: (value: string) => void;
  onToggleAdvanced: () => void;
  prompt: string;
  selectedModelLabel: string;
  setShowAdvanced: (value: boolean) => void;
}) {
  return (
    <div className="design-page__composer">
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
          aria-label="Add source image URL"
          className="design-page__tool"
          onClick={() => fileInputRef.current?.focus()}
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

        <div className="inline-flex items-center gap-1">
          <button
            aria-pressed={kind === "image"}
            className={cn(
              "design-page__tool design-page__tool--chip",
              kind === "image" && "text-foreground"
            )}
            onClick={() => onKindChange("image")}
            type="button"
          >
            Photo
          </button>
          <button
            aria-pressed={kind === "video"}
            className={cn(
              "design-page__tool design-page__tool--chip",
              kind === "video" && "text-foreground"
            )}
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
