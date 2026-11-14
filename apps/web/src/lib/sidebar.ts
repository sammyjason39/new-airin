export const SIDEBAR_COLLAPSED_KEY = "airin-sidebar-collapsed";

export const SIDEBAR_RECENTS_COLLAPSED_KEY = "airin-sidebar-recents-collapsed";

export const SIDEBAR_PINNED_COLLAPSED_KEY = "airin-sidebar-pinned-collapsed";

/** Owner team sidebar hidden on this browser until the user shows it again. */
export const OWNER_SIDEBAR_HIDDEN_KEY = "airin-owner-sidebar-hidden";

export function getInitialSidebarCollapsed(): boolean {
  return readLocalStorageFlag(SIDEBAR_COLLAPSED_KEY);
}

export function getInitialOwnerSidebarHidden(): boolean {
  return readLocalStorageFlag(OWNER_SIDEBAR_HIDDEN_KEY);
}

/** Boolean flags shared across hook instances on this page. */
const localStorageFlagListeners = new Map<string, Set<() => void>>();

export function readLocalStorageFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

export function writeLocalStorageFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage failures (private browsing, etc.)
  }

  const listeners = localStorageFlagListeners.get(key);

  if (!listeners) {
    return;
  }

  for (const listener of listeners) {
    listener();
  }
}

export function toggleLocalStorageFlag(key: string): boolean {
  const next = !readLocalStorageFlag(key);
  writeLocalStorageFlag(key, next);

  return next;
}

export function subscribeLocalStorageFlag(
  key: string,
  listener: () => void
): () => void {
  let listeners = localStorageFlagListeners.get(key);

  if (!listeners) {
    listeners = new Set();
    localStorageFlagListeners.set(key, listeners);
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      localStorageFlagListeners.delete(key);
    }
  };
}

export function getInitialRecentsCollapsed(): boolean {
  return readLocalStorageFlag(SIDEBAR_RECENTS_COLLAPSED_KEY);
}

export function getInitialPinnedCollapsed(): boolean {
  return readLocalStorageFlag(SIDEBAR_PINNED_COLLAPSED_KEY);
}

const PINNED_PLUGINS_KEY = "airin-sidebar-pinned-plugins";

const pinnedPluginListeners = new Set<() => void>();

/** Pins belong to one person in one organization, on this browser. */
export function pinnedPluginsStorageKey(userId: string, orgId: string): string {
  return `${PINNED_PLUGINS_KEY}:${userId}:${orgId}`;
}

export function readPinnedPluginIds(key: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(
      (key && localStorage.getItem(key)) || "[]"
    );

    return Array.isArray(parsed)
      ? // oxlint-disable-next-line anti-slop/no-runtime-typeof -- This guard validates decoded external data before the caller uses the domain value.
        parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function togglePinnedPlugin(key: string, pluginId: string): void {
  const pinned = readPinnedPluginIds(key);

  const next = pinned.includes(pluginId)
    ? pinned.filter((id) => id !== pluginId)
    : [...pinned, pluginId];

  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Ignore storage failures (private browsing, etc.)
  }

  for (const listener of pinnedPluginListeners) {
    listener();
  }
}

export function subscribePinnedPlugins(listener: () => void): () => void {
  pinnedPluginListeners.add(listener);

  return () => pinnedPluginListeners.delete(listener);
}
