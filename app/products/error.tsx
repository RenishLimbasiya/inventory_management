"use client";

import { useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Products Error Boundary
 * Handles errors during products page fetch/render
 * Provides retry button and navigation options
 */
export default function ProductsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service if available
    console.error("Products page error:", error);
  }, [error]);

  return (
    <div className="space-y-6">
      {/* Error Container */}
      <div
        className={cn(
          "glass rounded-lg p-8",
          "border border-red-500/30 bg-red-500/10",
          "flex flex-col items-center justify-center gap-6",
          "text-center",
        )}
      >
        {/* Icon */}
        <div className="text-5xl">⚠️</div>

        {/* Error Message */}
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">
            Failed to Load Products
          </h2>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {error.message ||
              "An error occurred while fetching the products. Please try again."}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {/* Retry Button */}
          <button
            onClick={() => reset()}
            className={cn(
              "px-6 py-3 rounded-lg font-medium",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "transition-colors",
              "w-full",
            )}
          >
            Try Again
          </button>

          {/* Back to Dashboard */}
          <Link
            href="/"
            className={cn(
              "px-6 py-3 rounded-lg font-medium",
              "bg-white/10 text-foreground",
              "hover:bg-white/20",
              "border border-white/20",
              "transition-colors",
              "w-full",
              "text-center",
            )}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Additional Help Section */}
      <div
        className={cn(
          "glass rounded-lg p-6",
          "border border-white/10",
          "space-y-4",
        )}
      >
        <h3 className="font-semibold text-foreground">What you can try:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Check your internet connection</li>
          <li>✓ Refresh the page and try again</li>
          <li>✓ Clear your browser cache and reload</li>
          <li>✓ Try again after a few moments</li>
        </ul>
      </div>
    </div>
  );
}
