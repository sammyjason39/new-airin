import { createContext, type RefObject } from "react";
import type { AttachmentsContext } from "@/components/ai-elements/prompt-input";
import type { ComposerOpenPlugin } from "@/lib/chat-composer-skills";

const NO_OPEN_PLUGINS: ComposerOpenPlugin[] = [];

/** Plugin pages `/open` lists for the active agent, and how to show one. */
export const OpenPluginContext = createContext<{
  /** Opens the add-plugin dialog. Null when the user cannot assign tools. */
  onAdd: (() => void) | null;
  open: (plugin: ComposerOpenPlugin) => void;
  plugins: ComposerOpenPlugin[];
}>({ onAdd: null, open: () => undefined, plugins: NO_OPEN_PLUGINS });

/** True when `/btw` is offered: only the composer that can open a side chat. */
export const BtwCommandContext = createContext(false);

/** `/new` handler when the page supports starting a blank chat. */
export const NewChatCommandContext = createContext<(() => void) | null>(null);

export const PromptHistoryContext = createContext<{
  promptHistoryRef: RefObject<string[]>;
  historyPointer: number | null;
  setHistoryPointer: (pointer: number | null) => void;
}>({
  historyPointer: null,
  promptHistoryRef: { current: [] },
  setHistoryPointer: () => undefined,
});

export const CommandPrefixContext = createContext<{
  prefix: string | null;
  setPrefix: (prefix: string | null) => void;
}>({ prefix: null, setPrefix: () => undefined });

/** Shared by the + menu item and the Ctrl+U/Cmd+U composer shortcut. */
export function openAttachmentPicker(
  attachments: AttachmentsContext,
  accept: string
) {
  const input = attachments.fileInputRef.current;

  if (!input) {
    attachments.openFileDialog();

    return;
  }

  input.accept = accept;
  input.click();
}
