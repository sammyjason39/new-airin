import seedPrompts from "./prompt-library.seed.json";
import type { DesignPrompt } from "./types";

// SAFETY: prompt-library.seed.json is a committed seed list that matches DesignPrompt[].
const library = seedPrompts as DesignPrompt[];

export function listDesignPrompts(): DesignPrompt[] {
  return library;
}

export function filterDesignPrompts(query: string): DesignPrompt[] {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return library;
  }

  return library.filter(
    (item) =>
      item.title.toLowerCase().includes(needle) ||
      item.prompt.toLowerCase().includes(needle)
  );
}

export function getDesignPrompt(id: string): DesignPrompt | undefined {
  return library.find((item) => item.id === id);
}
