"use client";

import { createContext, useContext, useMemo } from "react";
import type { ThemeTone } from "@/lib/theme/tokens";
import { useThemeManager } from "@/hooks/useThemeManager";

interface ThemeContextValue {
  theme: ThemeTone;
  resolvedTheme: ThemeTone;
  systemTheme: ThemeTone;
  isReady: boolean;
  setTheme: (tone: ThemeTone) => void;
  toggleTheme: () => void;
  clearPreference: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, resolvedTheme, systemTheme, isReady, setTheme, toggleTheme, clearPreference } = useThemeManager();

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      systemTheme,
      isReady,
      setTheme,
      toggleTheme,
      clearPreference,
    }),
    [theme, resolvedTheme, systemTheme, isReady, setTheme, toggleTheme, clearPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
