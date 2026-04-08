"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/inventory";
import { StockMovementForm } from "@/components/StockMovementForm";
import { cn } from "@/lib/utils";

interface StockMovementRecordFormProps {
  products: Product[];
  error?: string | null;
}

/**
 * StockMovementRecordForm Component
 * Wrapper component for recording stock movements
 * Allows selection of product then opens movement recording form
 */
export function StockMovementRecordForm({
  products,
  error,
}: StockMovementRecordFormProps) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleMovementSuccess = () => {
    setSuccessMessage("Movement recorded successfully!");
    setSelectedProductId("");
    setTimeout(() => {
      setSuccessMessage("");
      router.push("/movements");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div
          className={cn(
            "glass rounded-lg p-4",
            "border border-red-500/30 bg-red-500/10",
            "text-red-700 dark:text-red-300",
            "text-sm",
          )}
        >
          <p className="font-medium">⚠️ {error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          className={cn(
            "glass rounded-lg p-4",
            "border border-green-500/30 bg-green-500/10",
            "text-green-700 dark:text-green-300",
            "text-sm",
          )}
        >
          <p className="font-medium">✓ {successMessage}</p>
        </div>
      )}

      {/* Product Selection */}
      {!selectedProductId ? (
        <div className="glass rounded-lg p-6 border border-white/10 space-y-4">
          <h2 className="font-semibold text-foreground">Select a Product</h2>

          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No products available. Create a product first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  className={cn(
                    "text-left p-4 rounded-lg border transition-all",
                    "hover:bg-white/10 hover:border-primary/50",
                    "bg-white/5 border-white/10",
                  )}
                >
                  <p className="font-semibold text-foreground">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    SKU: {product.sku}
                  </p>
                  <p className="text-sm mt-2">
                    <span className="text-muted-foreground">Stock:</span>{" "}
                    <span className="font-bold text-foreground">
                      {product.quantity}
                    </span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selected Product Info */}
          <div className="glass rounded-lg p-4 border border-primary/30 bg-primary/5">
            <p className="text-sm text-muted-foreground">
              Recording movement for:
            </p>
            <p className="text-lg font-bold text-foreground">
              {selectedProduct?.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Current stock: {selectedProduct?.quantity} units
            </p>
            <button
              onClick={() => setSelectedProductId("")}
              className={cn(
                "mt-3 text-sm px-3 py-1 rounded",
                "bg-white/10 hover:bg-white/20",
                "border border-white/20",
                "transition-colors",
              )}
            >
              Change Product
            </button>
          </div>

          {/* Movement Form */}
          <StockMovementForm
            productId={selectedProductId}
            onSuccess={handleMovementSuccess}
          />
        </div>
      )}
    </div>
  );
}
