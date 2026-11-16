import type { SkillSummary } from "@airin/core/contract";
import {
  PromptInputTextarea,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { chatComposerTextareaKeyDown } from "@/components/chat/chat-composer-textarea-keydown";
import { useChatComposerTextarea } from "@/components/chat/chat-composer-textarea-use";
import { ChatSkillPicker } from "@/components/chat/chat-skill-picker";
import { ChatSkillTokenOverlay } from "@/components/chat/chat-skill-token-overlay";
import type { ComposerAddCommandAction } from "@/lib/chat-composer-skills";

export {
  BtwCommandContext,
  CommandPrefixContext,
  NewChatCommandContext,
  OpenPluginContext,
  openAttachmentPicker,
  PromptHistoryContext,
} from "@/components/chat/chat-composer-textarea-context";

export function ChatComposerTextarea({
  availableSkills,
  disabled,
  className,
  onAddCommand,
  placeholder,
  longPasteWordThreshold,
}: {
  availableSkills: SkillSummary[];
  disabled: boolean;
  className: string;
  onAddCommand?: (action: ComposerAddCommandAction) => void;
  placeholder: string;
  longPasteWordThreshold?: number;
}) {
  const attachments = usePromptInputAttachments();

  const textarea = useChatComposerTextarea({
    availableSkills,
    disabled,
    onAddCommand,
  });

  return (
    <div className="relative min-w-0 flex-1">
      <ChatSkillTokenOverlay
        className={className}
        scrollTop={textarea.scrollTop}
        value={textarea.controller.textInput.value}
      />
      {textarea.pickerOpen ? (
        <ChatSkillPicker
          activeIndex={textarea.safeActiveIndex}
          onSelect={textarea.selectSuggestion}
          suggestions={textarea.suggestions}
        />
      ) : null}
      <PromptInputTextarea
        className={className}
        disabled={disabled}
        longPasteWordThreshold={longPasteWordThreshold}
        onChange={(event) => {
          if (textarea.historyPointer !== null) {
            textarea.setHistoryPointer(null);
          }

          textarea.updateSlashRange(
            event.currentTarget.value,
            event.currentTarget.selectionStart
          );
        }}
        onKeyDown={(event) =>
          chatComposerTextareaKeyDown(event, {
            attachments,
            disabled,
            historyPointer: textarea.historyPointer,
            pickerOpen: textarea.pickerOpen,
            prefix: textarea.prefix,
            promptHistoryRef: textarea.promptHistoryRef,
            safeActiveIndex: textarea.safeActiveIndex,
            selectSuggestion: textarea.selectSuggestion,
            setActiveIndex: textarea.setActiveIndex,
            setHistoryPointer: textarea.setHistoryPointer,
            setInput: textarea.setInput,
            setPrefix: textarea.setPrefix,
            setSlashRange: textarea.setSlashRange,
            suggestions: textarea.suggestions,
          })
        }
        onScroll={(event) =>
          textarea.setScrollTop(event.currentTarget.scrollTop)
        }
        placeholder={placeholder}
        ref={textarea.textareaRef}
      />
    </div>
  );
}
