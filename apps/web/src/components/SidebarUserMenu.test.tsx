import { expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { SidebarUserMenu } from "@/components/SidebarUserMenu";
import { AppContext, type AppContextValue } from "@/context/app-context-shared";
import {
  AuthContext,
  type AuthContextValue,
} from "@/context/auth-context-shared";
import { LocaleContext } from "@/context/locale-context-shared";
import { ThemeContext } from "@/context/theme-context-shared";
import { UiModeContext } from "@/context/ui-mode-context-shared";
import { translate } from "@/lib/i18n";

test("account menu does not show What's new", async () => {
  // SAFETY: The menu reads only user, activeOrg, logout and refreshSession.
  const auth: AuthContextValue = {
    activeOrg: null,
    logout: async () => {},
    refreshSession: async () => {},
    user: { email: "member@example.com", id: "member" },
  } as never;

  // SAFETY: The menu reads only health.version and health.updateCheckEnabled.
  const app: AppContextValue = {
    health: { updateCheckEnabled: false, version: "0.4.74" },
  } as never;

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter>
            <AuthContext.Provider value={auth}>
              <AppContext.Provider value={app}>
                <ThemeContext.Provider
                  value={{
                    resolvedTheme: "light",
                    setTheme: () => {},
                    theme: "light",
                    toggleTheme: () => {},
                  }}
                >
                  <LocaleContext.Provider
                    value={{
                      locale: "en",
                      setLocale: () => {},
                      t: (key, vars) => translate("en", key, vars),
                    }}
                  >
                    <UiModeContext.Provider
                      value={{
                        setUiMode: () => {},
                        uiMode: "owner",
                      }}
                    >
                      <SidebarUserMenu />
                    </UiModeContext.Provider>
                  </LocaleContext.Provider>
                </ThemeContext.Provider>
              </AppContext.Provider>
            </AuthContext.Provider>
          </MemoryRouter>
        </QueryClientProvider>
      );
    });

    const trigger = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Account menu"]'
    );

    await act(async () => {
      trigger?.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const links = [...document.querySelectorAll("a")];

    expect(
      links.some((anchor) => anchor.textContent?.includes("What's new"))
    ).toBe(false);
    expect(
      links.some((anchor) => anchor.getAttribute("href") === "/guide")
    ).toBe(true);
    expect(
      links.some(
        (anchor) => anchor.getAttribute("href") === "/settings/preferences"
      )
    ).toBe(true);
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});
