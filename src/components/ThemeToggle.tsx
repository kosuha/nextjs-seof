"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const { resolvedTheme, toggleTheme, isReady } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="relative h-8 w-8 p-0"
      onClick={toggleTheme}
      title={resolvedTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      aria-label={resolvedTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      aria-pressed={resolvedTheme === "dark"}
      disabled={!isReady}
    >
      <Sun
        className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        aria-hidden
      />
      <Moon
        className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        aria-hidden
      />
      <span className="sr-only">테마 토글</span>
    </Button>
  );
};
