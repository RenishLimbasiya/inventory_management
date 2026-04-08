"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * ThemeToggle Component
 * Tests and demonstrates theme switching
 * Validates CSS variables load correctly for each theme
 */
export function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();

  // Check CSS variables synchronously
  const checkCssVars = () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    const requiredVars = [
      "--background",
      "--foreground",
      "--primary",
      "--secondary",
      "--accent",
      "--destructive",
      "--muted-background",
      "--muted-foreground",
    ];

    return requiredVars.every(
      (varName) => computedStyle.getPropertyValue(varName).trim().length > 0,
    );
  };

  const cssVarsLoaded = typeof window !== "undefined" ? checkCssVars() : false;

  if (!theme || !themes) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Theme Status */}
      <div
        className={cn(
          "glass rounded-lg p-4 border border-white/10",
          cssVarsLoaded ? "bg-green-500/10" : "bg-red-500/10",
        )}
      >
        <p className="text-sm text-foreground font-medium">
          Current Theme: <span className="capitalize font-bold">{theme}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          CSS Variables: {cssVarsLoaded ? "✓ Loaded" : "✗ Missing"}
        </p>
      </div>

      {/* Theme Selector */}
      <div className="grid grid-cols-4 gap-2">
        {themes.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-all",
              theme === t
                ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                : "bg-white/10 text-foreground hover:bg-white/20",
              "border border-white/20",
            )}
          >
            {t === "system" ? "🖥️" : t === "light" ? "☀️" : "🌙"}
            <span className="capitalize block text-xs">{t}</span>
          </button>
        ))}
      </div>

      {/* Color Palette Preview */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Color Palette
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 rounded-lg bg-primary" />
          <div className="h-12 rounded-lg bg-secondary" />
          <div className="h-12 rounded-lg bg-accent" />
          <div className="h-12 rounded-lg bg-destructive" />
          <div className="h-12 rounded-lg bg-muted bg-opacity-100" />
          <div className="h-12 rounded-lg border-2 border-foreground" />
        </div>
      </div>
    </div>
  );
}
