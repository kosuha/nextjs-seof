"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ThemeTone } from "@/lib/theme/tokens";

const THEME_STORAGE_KEY = "seof-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

type StoredTheme = ThemeTone | null;

const isClient = () => typeof window !== "undefined";

const readStoredTheme = (): StoredTheme => {
  if (!isClient()) return null;
  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
};

const readSystemTheme = (): ThemeTone => {
  if (!isClient()) return "light";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
};

const applyThemeClass = (tone: ThemeTone) => {
  if (!isClient()) return;
  const root = window.document.documentElement;
  root.classList.toggle("dark", tone === "dark");
  root.dataset.theme = tone;
  root.style.colorScheme = tone;
};

interface ThemeManager {
  theme: ThemeTone;
  resolvedTheme: ThemeTone;
  systemTheme: ThemeTone;
  isReady: boolean;
  setTheme: (tone: ThemeTone) => void;
  toggleTheme: () => void;
  clearPreference: () => void;
}

export const useThemeManager = (): ThemeManager => {
  const [theme, setTheme] = useState<ThemeTone>("light");
  const [systemTheme, setSystemTheme] = useState<ThemeTone>(() => readSystemTheme());
  const [isReady, setIsReady] = useState<boolean>(false);
  const userPreference = useRef<StoredTheme>(null);

  const resolvedTheme = userPreference.current ?? theme;

  const persistTheme = useCallback((tone: ThemeTone) => {
    if (!isClient()) return;
    window.localStorage.setItem(THEME_STORAGE_KEY, tone);
    userPreference.current = tone;
  }, []);

  const removeStoredTheme = useCallback(() => {
    if (!isClient()) return;
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    userPreference.current = null;
  }, []);

  const syncTheme = useCallback(
    (tone: ThemeTone, { persist }: { persist: boolean }) => {
      applyThemeClass(tone);
      setTheme(tone);
      if (persist) {
        persistTheme(tone);
      }
    },
    [persistTheme],
  );

  useEffect(() => {
    const stored = readStoredTheme();
    const system = readSystemTheme();

    userPreference.current = stored;
    setSystemTheme(system);
    syncTheme(stored ?? system, { persist: false });
    setIsReady(true);

    if (!isClient()) return;

    const media = window.matchMedia(DARK_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      const nextSystemTheme: ThemeTone = event.matches ? "dark" : "light";
      setSystemTheme(nextSystemTheme);
      if (!userPreference.current) {
        syncTheme(nextSystemTheme, { persist: false });
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [syncTheme]);

  const setExplicitTheme = useCallback(
    (tone: ThemeTone) => {
      syncTheme(tone, { persist: true });
    },
    [syncTheme],
  );

  const toggleTheme = useCallback(() => {
    setExplicitTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setExplicitTheme]);

  const clearPreference = useCallback(() => {
    removeStoredTheme();
    const system = readSystemTheme();
    syncTheme(system, { persist: false });
  }, [removeStoredTheme, syncTheme]);

  return useMemo(
    () => ({
      theme,
      resolvedTheme,
      systemTheme,
      isReady,
      setTheme: setExplicitTheme,
      toggleTheme,
      clearPreference,
    }),
    [theme, resolvedTheme, systemTheme, isReady, setExplicitTheme, toggleTheme, clearPreference],
  );
};
