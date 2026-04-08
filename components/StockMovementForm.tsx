"use client";

import { useStockMovement } from "@/hooks/useStockMovement";
import { cn } from "@/lib/utils";

interface StockMovementFormProps {
  productId: string;
  onSuccess?: () => void;
  className?: string;
}

/**
 * StockMovementForm Component
 * Records stock movements with live preview
 * Provides validation and prevents negative stock
 * Displays risk warnings before submission
 */
export function StockMovementForm({
  productId,
  onSuccess,
  className,
}: StockMovementFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    product,
    currentQuantity,
    previewQuantity,
    wouldCauseNegativeStock,
    updateField,
    submitMovement,
  } = useStockMovement(productId);

  if (!product) {
    return (
      <div className={cn("glass rounded-lg p-6", className)}>
        <p className="text-sm text-destructive">Product not found</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitMovement();
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("glass rounded-lg p-6 space-y-4", className)}
    >
      {/* Product Info */}
      <div className="mb-4 pb-4 border-b border-white/10">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Product
        </p>
        <p className="font-semibold text-foreground">{product.name}</p>
        <p className="text-sm text-muted-foreground">{product.sku}</p>
      </div>

      {/* Movement Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Movement Type <span className="text-destructive">*</span>
        </label>
        <select
          value={formData.type}
          onChange={(e) =>
            updateField(
              "type",
              e.target.value as
                | "inbound"
                | "outbound"
                | "adjustment"
                | "return",
            )
          }
          className="glass-input w-full px-3 py-2 rounded"
          disabled={isSubmitting}
        >
          <option value="inbound">Inbound (Receive Stock)</option>
          <option value="outbound">Outbound (Send Stock)</option>
          <option value="return">Return (From Customer)</option>
          <option value="adjustment">Adjustment (Manual)</option>
        </select>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Quantity <span className="text-destructive">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) =>
            updateField("quantity", parseInt(e.target.value, 10))
          }
          className={cn(
            "glass-input w-full px-3 py-2 rounded",
            errors.quantity && "border-destructive/50",
          )}
          disabled={isSubmitting}
        />
        {errors.quantity && (
          <p className="text-xs text-destructive mt-1">{errors.quantity}</p>
        )}
      </div>

      {/* Reference */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Reference <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          placeholder="PO#, RMA#, etc."
          value={formData.reference}
          onChange={(e) => updateField("reference", e.target.value)}
          className={cn(
            "glass-input w-full px-3 py-2 rounded",
            errors.reference && "border-destructive/50",
          )}
          disabled={isSubmitting}
        />
        {errors.reference && (
          <p className="text-xs text-destructive mt-1">{errors.reference}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Notes
        </label>
        <textarea
          placeholder="Additional details..."
          value={formData.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          className="glass-input w-full px-3 py-2 rounded resize-none"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {/* Stock Preview */}
      <div className="bg-white/5 dark:bg-black/20 rounded p-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Stock Preview
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="font-semibold text-foreground">{currentQuantity}</p>
          </div>
          <div className="flex items-center justify-center">
            <p className="text-lg text-muted-foreground">→</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">After Movement</p>
            <p
              className={cn(
                "font-semibold",
                previewQuantity < 0 ? "text-red-500" : "text-green-500",
              )}
            >
              {previewQuantity}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Warnings */}
      {wouldCauseNegativeStock && (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            ⚠️ This movement would exceed available stock
          </p>
        </div>
      )}

      {previewQuantity <= product.minStockLevel && previewQuantity > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
          <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
            ⚠️ Stock will be below minimum level
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || wouldCauseNegativeStock || !!errors.submit}
        className={cn(
          "w-full btn-glass btn-glassPrimary py-2 rounded font-medium transition-all",
          isSubmitting && "opacity-60 cursor-not-allowed",
        )}
      >
        {isSubmitting ? "Recording..." : "Record Movement"}
      </button>

      {errors.submit && (
        <p className="text-xs text-destructive text-center">{errors.submit}</p>
      )}
    </form>
  );
}
