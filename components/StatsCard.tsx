"use client";

import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: string;
  subtext?: string;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-white/5 border-white/10",
  success: "bg-green-500/10 border-green-500/20",
  warning: "bg-amber-500/10 border-amber-500/20",
  danger: "bg-red-500/10 border-red-500/20",
};

const textVariantStyles: Record<string, string> = {
  default: "text-primary",
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
};

/**
 * StatsCard Component
 * Displays a single stat with icon, label, and optional subtext
 * Supports multiple visual variants
 */
export function StatsCard({
  label,
  value,
  icon,
  subtext,
  variant = "default",
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-lg p-6",
        "border border-white/10",
        variantStyles[variant],
        "transition-all hover:bg-white/10 dark:hover:bg-black/30",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div
            className={cn(
              "flex items-center justify-center h-12 w-12 rounded-lg",
              "bg-white/10",
            )}
          >
            <span className="text-2xl">{icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p
            className={cn(
              "text-3xl font-bold mt-2",
              textVariantStyles[variant],
            )}
          >
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-2">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
}
