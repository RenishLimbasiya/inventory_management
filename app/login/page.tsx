"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Login Page
 * Initializes inventory_token cookie for authentication
 * In production, integrate with real authentication provider
 */
export default function LoginPage() {
  const router = useRouter();
  const [warehouseName, setWarehouseName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouseName: warehouseName || "Default Warehouse",
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      // Store warehouse name in localStorage
      if (data.warehouseName) {
        localStorage.setItem("warehouseName", data.warehouseName);
      }

      // Redirect to dashboard
      const redirect = new URL(window.location.href).searchParams.get(
        "redirect",
      );
      router.push(redirect || "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/10 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-primary">📦</div>
          <h1 className="text-3xl font-bold text-foreground">
            Inventory System
          </h1>
          <p className="text-muted-foreground">
            Manage your warehouse inventory
          </p>
        </div>

        {/* Form Card */}
        <div
          className={cn(
            "glass rounded-lg p-8",
            "border border-white/10",
            "space-y-6",
          )}
        >
          {/* Error Message */}
          {error && (
            <div
              className={cn(
                "rounded-lg p-4",
                "border border-red-500/30 bg-red-500/10",
                "text-red-700 dark:text-red-300 text-sm",
              )}
            >
              <p className="font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="warehouse"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Warehouse Name (Optional)
              </label>
              <input
                id="warehouse"
                type="text"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                placeholder="My Warehouse"
                className={cn(
                  "w-full px-4 py-3 rounded-lg",
                  "bg-white/5 border border-white/10",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  "transition-all",
                )}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to use default warehouse
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full px-4 py-3 rounded-lg font-semibold",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all",
              )}
            >
              {isLoading ? "Authenticating..." : "Enter Dashboard"}
            </button>
          </form>

          {/* Info Box */}
          <div
            className={cn(
              "rounded-lg p-4",
              "bg-primary/10 border border-primary/20",
              "text-primary text-sm",
            )}
          >
            <p className="font-semibold mb-2">Demo Mode</p>
            <p className="text-xs opacity-90">
              Click &quot;Enter Dashboard&quot; to initialize your
              authentication token and access the inventory management system.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-muted-foreground space-y-2">
          <p>This is a demonstration of the Inventory Management System</p>
          <p>For production use, integrate with your authentication provider</p>
        </div>
      </div>
    </div>
  );
}
