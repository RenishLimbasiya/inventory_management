"use client";

import { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { recordMovement } from "@/store/movementSlice";
import { updateProduct } from "@/store/productSlice";
import { useAppDispatch } from "@/hooks/useRedux";

/**
 * Stock Movement Form Data
 */
export interface StockMovementFormData {
  productId: string;
  type: "inbound" | "outbound" | "adjustment" | "return";
  quantity: number;
  reference: string;
  notes: string;
  userId: string;
}

/**
 * Form Errors
 */
export interface MovementErrors {
  [key: string]: string | undefined;
}

/**
 * Hook: useStockMovement
 * Manages stock movement recording with validation
 * Provides live stock preview before confirming
 */
export function useStockMovement(productId: string) {
  const dispatch = useAppDispatch();
  const products = useSelector((state: RootState) => state.products.products);
  const movementStatus = useSelector(
    (state: RootState) => state.movements.status,
  );

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );

  const [formData, setFormData] = useState<StockMovementFormData>({
    productId,
    type: "inbound",
    quantity: 1,
    reference: "",
    notes: "",
    userId: "system",
  });

  const [errors, setErrors] = useState<MovementErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Calculate preview quantity based on form data
   * Live preview without actually updating
   */
  const previewQuantity = useMemo((): number => {
    if (!product) return 0;

    let quantityChange = 0;
    switch (formData.type) {
      case "inbound":
      case "return":
        quantityChange = formData.quantity;
        break;
      case "outbound":
        quantityChange = -formData.quantity;
        break;
      case "adjustment":
        quantityChange = formData.quantity;
        break;
    }

    return Math.max(0, product.quantity + quantityChange);
  }, [product, formData.type, formData.quantity]);

  /**
   * Check if movement would result in negative stock
   */
  const wouldCauseNegativeStock = useMemo((): boolean => {
    return previewQuantity < 0 && product
      ? product.quantity +
          (formData.type === "outbound"
            ? -formData.quantity
            : formData.quantity) <
          0
      : false;
  }, [previewQuantity, formData, product]);

  /**
   * Validate form data
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: MovementErrors = {};

    if (!product) {
      newErrors.productId = "Product not found";
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (formData.type === "outbound" && previewQuantity < 0) {
      newErrors.quantity = "Insufficient stock for outbound movement";
    }

    if (!formData.reference.trim()) {
      newErrors.reference = "Reference is required";
    }

    if (!formData.userId.trim()) {
      newErrors.userId = "User ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, product, previewQuantity]);

  /**
   * Update form field
   */
  const updateField = useCallback(
    (field: keyof StockMovementFormData, value: unknown) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear error for this field
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    },
    [],
  );

  /**
   * Submit movement
   * Records the movement and updates product quantity
   */
  const submitMovement = useCallback(async (): Promise<boolean> => {
    if (!validateForm() || !product) {
      return false;
    }

    setIsSubmitting(true);
    try {
      // Record the movement
      await dispatch(recordMovement(formData));

      // Update product quantity locally in Redux
      const updatedProduct = {
        ...product,
        quantity: previewQuantity,
        updatedAt: new Date(),
      };
      dispatch(updateProduct(updatedProduct));

      // Reset form
      setFormData({
        productId,
        type: "inbound",
        quantity: 1,
        reference: "",
        notes: "",
        userId: "system",
      });
      setErrors({});
      return true;
    } catch (error) {
      console.error("Stock movement error:", error);
      setErrors({
        submit: "Failed to record movement. " + String(error),
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, validateForm, product, formData, previewQuantity, productId]);

  /**
   * Reset form to defaults
   */
  const resetForm = useCallback(() => {
    setFormData({
      productId,
      type: "inbound",
      quantity: 1,
      reference: "",
      notes: "",
      userId: "system",
    });
    setErrors({});
  }, [productId]);

  const isLoading = useMemo(
    () => movementStatus === "loading",
    [movementStatus],
  );

  return {
    formData,
    errors,
    isSubmitting: isSubmitting || isLoading,
    product,
    currentQuantity: product?.quantity || 0,
    previewQuantity,
    wouldCauseNegativeStock,
    updateField,
    submitMovement,
    resetForm,
    validateForm,
  };
}
