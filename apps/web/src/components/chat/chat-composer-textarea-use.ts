import type { SkillSummary } from "@airin/core/contract";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePromptInputController } from "@/components/ai-elements/prompt-input";
import {
  BtwCommandContext,
  CommandPrefixContext,
  NewChatCommandContext,
  OpenPluginContext,
  PromptHistoryContext,
} from "@/components/chat/chat-composer-textarea-context";
import {
  type ComposerAddCommandAction,
  type ComposerSuggestion,
  filterComposerMentionSuggestions,
  filterComposerSlashSuggestions,
  findActiveSkillSlashRange,
  getLeadingCommand,
  replaceSlashRangeWithReservedCommand,
  replaceSlashRangeWithSkillInvocation,
  type SkillSlashRange,
} from "@/lib/chat-composer-skills";

export function useChatComposerTextarea({
  availableSkills,
  disabled,
  onAddCommand,
}: {
  availableSkills: SkillSummary[];
  disabled: boolean;
  onAddCommand?: (action: ComposerAddCommandAction) => void;
}) {
  const controller = usePromptInputController();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [slashRange, setSlashRange] = useState<SkillSlashRange | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const openPlugin = useContext(OpenPluginContext);
  const enableBtw = useContext(BtwCommandContext);
  const onNewChat = useContext(NewChatCommandContext);
  const enableNewChat = Boolean(onNewChat);

  const mentionOpen =
    slashRange !== null && controller.textInput.value[slashRange.start] === "@";

  const suggestions = useMemo(() => {
    if (!slashRange) {
      return [];
    }

    return mentionOpen
      ? filterComposerMentionSuggestions(slashRange.query)
      : filterComposerSlashSuggestions(availableSkills, slashRange.query, {
          enableAddCommands: onAddCommand != null,
          enableBtw,
          enableNewChat,
          openPlugins: openPlugin.plugins,
        });
  }, [
    availableSkills,
    enableBtw,
    enableNewChat,
    mentionOpen,
    onAddCommand,
    openPlugin.plugins,
    slashRange,
  ]);

  const pickerOpen = Boolean(slashRange && !disabled && suggestions.length > 0);

  const safeActiveIndex =
    suggestions.length === 0
      ? 0
      : Math.min(activeIndex, suggestions.length - 1);

  const updateSlashRange = useCallback((value: string, cursorIndex: number) => {
    setSlashRange(
      findActiveSkillSlashRange(value, cursorIndex) ??
        findActiveSkillSlashRange(value, cursorIndex, "@")
    );
    setActiveIndex(0);
  }, []);

  const selectSuggestion = useCallback(
    (suggestion: ComposerSuggestion) => {
      const textarea = textareaRef.current;
      const value = controller.textInput.value;
      const cursorIndex = textarea?.selectionStart ?? value.length;

      const activeRange =
        slashRange ??
        findActiveSkillSlashRange(
          value,
          cursorIndex,
          suggestion.kind === "mention" ? "@" : "/"
        );

      if (!activeRange) {
        return;
      }

      if (suggestion.kind === "plugin") {
        controller.textInput.setInput(
          `${value.slice(0, activeRange.start)}${value.slice(activeRange.end)}`
        );
        setSlashRange(null);
        setActiveIndex(0);
        openPlugin.open(suggestion.plugin);

        return;
      }

      if (
        suggestion.kind === "command" &&
        suggestion.command.name === "new" &&
        onNewChat
      ) {
        controller.textInput.setInput(
          `${value.slice(0, activeRange.start)}${value.slice(activeRange.end)}`
        );
        setSlashRange(null);
        setActiveIndex(0);
        onNewChat();

        return;
      }

      const addAction =
        suggestion.kind === "command" ? suggestion.command.action : undefined;

      if (
        onAddCommand &&
        (addAction === "add-tool" ||
          addAction === "add-mcp" ||
          addAction === "add-plugin" ||
          addAction === "add-skill")
      ) {
        controller.textInput.setInput(
          `${value.slice(0, activeRange.start)}${value.slice(activeRange.end)}`
        );
        setSlashRange(null);
        setActiveIndex(0);
        onAddCommand(addAction);

        return;
      }

      const next =
        suggestion.kind === "skill"
          ? replaceSlashRangeWithSkillInvocation(
              value,
              activeRange,
              suggestion.skill
            )
          : suggestion.kind === "mention"
            ? replaceSlashRangeWithReservedCommand(
                value,
                activeRange,
                suggestion.mention,
                "@"
              )
            : replaceSlashRangeWithReservedCommand(
                value,
                activeRange,
                suggestion.command
              );

      controller.textInput.setInput(next.value);
      setSlashRange(null);
      setActiveIndex(0);

      requestAnimationFrame(() => {
        textareaRef.current?.setSelectionRange(
          next.cursorIndex,
          next.cursorIndex
        );
        textareaRef.current?.focus();
      });
    },
    [controller.textInput, onAddCommand, onNewChat, openPlugin, slashRange]
  );

  const { prefix, setPrefix } = useContext(CommandPrefixContext);

  const { promptHistoryRef, historyPointer, setHistoryPointer } =
    useContext(PromptHistoryContext);

  const value = controller.textInput.value;
  const setInput = controller.textInput.setInput;

  // Move a finished leading command (`/learn `, `/skill name `) out of the text.
  useEffect(() => {
    const command = getLeadingCommand(value, availableSkills);
    const next = command ? value[command.range.end] : undefined;

    if (!(command && next && /\s/.test(next))) {
      return;
    }

    setPrefix(value.slice(command.range.start, command.range.end));
    setInput(value.slice(command.range.end).replace(/^[ \t]/, ""));
  }, [availableSkills, setInput, setPrefix, value]);

  return {
    activeIndex,
    controller,
    historyPointer,
    pickerOpen,
    prefix,
    promptHistoryRef,
    safeActiveIndex,
    scrollTop,
    selectSuggestion,
    setActiveIndex,
    setHistoryPointer,
    setInput,
    setPrefix,
    setScrollTop,
    setSlashRange,
    suggestions,
    textareaRef,
    updateSlashRange,
  };
}
