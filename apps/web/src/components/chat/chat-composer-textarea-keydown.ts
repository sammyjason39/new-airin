import type { Dispatch, KeyboardEvent, RefObject, SetStateAction } from "react";
import type { AttachmentsContext } from "@/components/ai-elements/prompt-input";
import { openAttachmentPicker } from "@/components/chat/chat-composer-textarea-context";
import type {
  ComposerSuggestion,
  SkillSlashRange,
} from "@/lib/chat-composer-skills";
import { ALL_ATTACHMENT_ACCEPT } from "@/lib/chat-images";

export function chatComposerTextareaKeyDown(
  event: KeyboardEvent<HTMLTextAreaElement>,
  state: {
    attachments: AttachmentsContext;
    disabled: boolean;
    historyPointer: number | null;
    pickerOpen: boolean;
    prefix: string | null;
    promptHistoryRef: RefObject<string[]>;
    safeActiveIndex: number;
    selectSuggestion: (suggestion: ComposerSuggestion) => void;
    setActiveIndex: Dispatch<SetStateAction<number>>;
    setHistoryPointer: (pointer: number | null) => void;
    setInput: (value: string) => void;
    setPrefix: (prefix: string | null) => void;
    setSlashRange: Dispatch<SetStateAction<SkillSlashRange | null>>;
    suggestions: ComposerSuggestion[];
  }
) {
  const {
    attachments,
    disabled,
    historyPointer,
    pickerOpen,
    prefix,
    promptHistoryRef,
    safeActiveIndex,
    selectSuggestion,
    setActiveIndex,
    setHistoryPointer,
    setInput,
    setPrefix,
    setSlashRange,
    suggestions,
  } = state;

  if (
    !disabled &&
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === "u"
  ) {
    event.preventDefault();
    openAttachmentPicker(attachments, ALL_ATTACHMENT_ACCEPT);

    return;
  }

  if (!pickerOpen) {
    if (event.key === "Escape" && prefix) {
      event.preventDefault();
      setPrefix(null);
    }

    if (
      event.currentTarget.selectionStart === 0 &&
      event.currentTarget.selectionEnd === 0
    ) {
      if (event.key === "ArrowUp") {
        if (promptHistoryRef.current.length === 0) {
          return;
        }

        const nextPointer =
          historyPointer === null
            ? promptHistoryRef.current.length - 1
            : Math.max(historyPointer - 1, 0);

        event.preventDefault();
        setHistoryPointer(nextPointer);
        setInput(promptHistoryRef.current[nextPointer]);
      }

      if (event.key === "ArrowDown" && historyPointer !== null) {
        event.preventDefault();

        if (historyPointer >= promptHistoryRef.current.length - 1) {
          setHistoryPointer(null);
          setInput("");
        } else {
          const nextPointer = historyPointer + 1;
          setHistoryPointer(nextPointer);
          setInput(promptHistoryRef.current[nextPointer]);
        }
      }
    }

    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    setActiveIndex((current) =>
      suggestions.length === 0 ? 0 : (current + 1) % suggestions.length
    );

    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    setActiveIndex((current) =>
      suggestions.length === 0
        ? 0
        : (current - 1 + suggestions.length) % suggestions.length
    );

    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    setSlashRange(null);
    setActiveIndex(0);

    return;
  }

  if ((event.key === "Enter" || event.key === "Tab") && !event.shiftKey) {
    event.preventDefault();
    const suggestion = suggestions[safeActiveIndex];

    if (suggestion) {
      selectSuggestion(suggestion);
    }
  }
}
