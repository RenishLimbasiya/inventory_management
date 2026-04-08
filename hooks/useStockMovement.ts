"use client";

import { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { recordMovement } from "@/store/movementSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { StockMovementType } from "@/types/inventory";

/**
 * Stock Movement Form Data
 */
export function useStockMovement(productId: string) {
  const dispatch = useAppDispatch();
  const products = useSelector((state: RootState) => state.products.products);
  const movementStatus = useSelector((state: RootState) => state.movements.status);

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );

  const [movementType, setMovementType] = useState<StockMovementType>("restock");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate preview quantity based on form data
   * Live preview without actually updating
   */
  const previewQuantity = useMemo((): number => {
    if (!product) return 0;

    if (movementType === "sale" || movementType === "adjustment") {
      return product.quantity - quantity;
    }
    return product.quantity + quantity;
  }, [product, movementType, quantity]);

  const canSubmit = useMemo(() => {
    if (!product || quantity <= 0) return false;
    if ((movementType === "sale" || movementType === "adjustment") && previewQuantity < 0) {
      return false;
    }
    return true;
  }, [product, quantity, movementType, previewQuantity]);

  const submit = useCallback(async (): Promise<boolean> => {
    if (!product || !canSubmit) return false;

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await dispatch(
        recordMovement({
          productId,
          type: movementType,
          quantity,
          note: note || undefined,
        }),
      );

      if (recordMovement.rejected.match(result)) {
        setError(result.payload?.message ?? "Failed to record movement");
        return false;
      }

      setQuantity(1);
      setNote("");
      return true;
    } catch {
      setError("Failed to record movement");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, product, canSubmit, productId, movementType, quantity, note]);

  const isLoading = useMemo(() => movementStatus === "loading", [movementStatus]);

  return {
    movementType,
    setMovementType,
    quantity,
    setQuantity,
    note,
    setNote,
    canSubmit,
    submit,
    isSubmitting: isSubmitting || isLoading,
    product,
    currentQuantity: product?.quantity || 0,
    previewQuantity,
    error,
  };
}
