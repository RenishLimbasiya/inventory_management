"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

/**
 * Currency options for formatting
 */
export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR";

/**
 * Currency configuration with locale and symbol
 */
const CURRENCY_CONFIG: Record<
  CurrencyCode,
  { locale: string; symbol: string }
> = {
  USD: { locale: "en-US", symbol: "$" },
  EUR: { locale: "de-DE", symbol: "€" },
  GBP: { locale: "en-GB", symbol: "£" },
  INR: { locale: "en-IN", symbol: "₹" },
};

/**
 * WarehouseContext State
 */
interface WarehouseContextType {
  warehouseName: string;
  currency: CurrencyCode;
  lowStockThresholdOverride: number | null;
  setWarehouseName: (name: string) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setLowStockThresholdOverride: (threshold: number | null) => void;
  formatPrice: (cents: number) => string;
  isLoading: boolean;
}

/**
 * Create WarehouseContext with default values
 */
const WarehouseContext = createContext<WarehouseContextType | undefined>(
  undefined,
);

/**
 * Default warehouse configuration
 */
const DEFAULT_WAREHOUSE_NAME = "Main Warehouse";
const DEFAULT_CURRENCY: CurrencyCode = "USD";
const DEFAULT_LOW_STOCK_THRESHOLD: number | null = null;

/**
 * WarehouseProvider Component
 * Provides warehouse configuration with localStorage persistence
 */
export function WarehouseProvider({ children }: { children: ReactNode }) {
  const [warehouseName, setWarehouseNameState] = useState<string>(
    DEFAULT_WAREHOUSE_NAME,
  );
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [lowStockThresholdOverride, setLowStockThresholdOverrideState] =
    useState<number | null>(DEFAULT_LOW_STOCK_THRESHOLD);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Initialize from localStorage on mount
   */
  useEffect(() => {
    try {
      const storedWarehouse = localStorage.getItem("warehouse_name");
      const storedCurrency = localStorage.getItem(
        "warehouse_currency",
      ) as CurrencyCode | null;
      const storedThreshold = localStorage.getItem("low_stock_threshold");

      if (storedWarehouse) {
        setWarehouseNameState(storedWarehouse);
      }

      if (
        storedCurrency &&
        Object.keys(CURRENCY_CONFIG).includes(storedCurrency)
      ) {
        setCurrencyState(storedCurrency);
      }

      if (storedThreshold === "null") {
        setLowStockThresholdOverrideState(null);
      } else if (storedThreshold) {
        const threshold = parseInt(storedThreshold, 10);
        if (!isNaN(threshold) && threshold >= 0) {
          setLowStockThresholdOverrideState(threshold);
        }
      }
    } catch (error) {
      console.warn(
        "Failed to load warehouse configuration from localStorage:",
        error,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update warehouse name and persist to localStorage
   */
  const handleSetWarehouseName = (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName.length > 0) {
      setWarehouseNameState(trimmedName);
      localStorage.setItem("warehouse_name", trimmedName);
    }
  };

  /**
   * Update currency and persist to localStorage
   */
  const handleSetCurrency = (newCurrency: CurrencyCode) => {
    if (Object.keys(CURRENCY_CONFIG).includes(newCurrency)) {
      setCurrencyState(newCurrency);
      localStorage.setItem("warehouse_currency", newCurrency);
    }
  };

  /**
   * Update low stock threshold and persist to localStorage
   */
  const handleSetLowStockThresholdOverride = (threshold: number | null) => {
    if (threshold === null) {
      setLowStockThresholdOverrideState(null);
      localStorage.setItem("low_stock_threshold", "null");
      return;
    }

    const validThreshold = Math.max(0, Math.floor(threshold));
    setLowStockThresholdOverrideState(validThreshold);
    localStorage.setItem("low_stock_threshold", validThreshold.toString());
  };

  /**
   * Format price according to current currency
   * Uses Intl.NumberFormat for proper localization
   */
  const formatPrice = (cents: number): string => {
    try {
      const config = CURRENCY_CONFIG[currency];
      const formatter = new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return formatter.format(cents / 100);
    } catch (error) {
      console.warn("Failed to format price:", error);
      return `${CURRENCY_CONFIG[currency].symbol}${(cents / 100).toFixed(2)}`;
    }
  };

  const value: WarehouseContextType = {
    warehouseName,
    currency,
    lowStockThresholdOverride,
    setWarehouseName: handleSetWarehouseName,
    setCurrency: handleSetCurrency,
    setLowStockThresholdOverride: handleSetLowStockThresholdOverride,
    formatPrice,
    isLoading,
  };

  return (
    <WarehouseContext.Provider value={value}>
      {children}
    </WarehouseContext.Provider>
  );
}

/**
 * Custom hook to use WarehouseContext
 * Throws error if used outside WarehouseProvider
 */
export function useWarehouse(): WarehouseContextType {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error("useWarehouse must be used within a WarehouseProvider");
  }
  return context;
}
