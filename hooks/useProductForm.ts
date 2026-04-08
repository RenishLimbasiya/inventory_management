"use client";

import { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useAppDispatch } from "@/hooks/useRedux";
import { createProduct, editProduct } from "@/store/productSlice";
import { Product, ProductCategory } from "@/types/inventory";

/**
 * Product Form State
 */
export interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  supplier: string;
  isActive: boolean;
}

/**
 * Form Errors
 */
export interface FormErrors {
  [key: string]: string | undefined;
}

/**
 * Hook: useProductForm
 * Manages product form state with validation
 * Handles both create and edit operations
 */
export function useProductForm(initialProduct?: Product) {
  const dispatch = useAppDispatch();
  const status = useSelector((state: RootState) => state.products.status);

  const [formData, setFormData] = useState<ProductFormData>({
    sku: initialProduct?.sku || "",
    name: initialProduct?.name || "",
    description: initialProduct?.description || "",
    category: initialProduct?.category || "other",
    price: initialProduct?.price || 0,
    costPrice: initialProduct?.costPrice || 0,
    quantity: initialProduct?.quantity || 0,
    minStockLevel: initialProduct?.minStockLevel || 0,
    maxStockLevel: initialProduct?.maxStockLevel || 0,
    unit: initialProduct?.unit || "piece",
    supplier: initialProduct?.supplier || "",
    isActive: initialProduct?.isActive ?? true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate form data
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (formData.costPrice <= 0) {
      newErrors.costPrice = "Cost price must be greater than 0";
    }

    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    if (formData.minStockLevel < 0) {
      newErrors.minStockLevel = "Minimum stock level cannot be negative";
    }

    if (formData.maxStockLevel < formData.minStockLevel) {
      newErrors.maxStockLevel =
        "Maximum stock level must be >= minimum stock level";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Update form field
   */
  const updateField = useCallback(
    (field: keyof ProductFormData, value: unknown) => {
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
   * Submit form (create or update)
   */
  const submitForm = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      if (initialProduct) {
        // Update existing product
        await dispatch(
          editProduct({
            id: initialProduct.id,
            data: formData,
          }),
        );
        return true;
      } else {
        // Create new product
        await dispatch(createProduct(formData));
        return true;
      }
    } catch (error) {
      console.error("Form submission error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, validateForm, initialProduct, formData]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData({
      sku: initialProduct?.sku || "",
      name: initialProduct?.name || "",
      description: initialProduct?.description || "",
      category: initialProduct?.category || "other",
      price: initialProduct?.price || 0,
      costPrice: initialProduct?.costPrice || 0,
      quantity: initialProduct?.quantity || 0,
      minStockLevel: initialProduct?.minStockLevel || 0,
      maxStockLevel: initialProduct?.maxStockLevel || 0,
      unit: initialProduct?.unit || "piece",
      supplier: initialProduct?.supplier || "",
      isActive: initialProduct?.isActive ?? true,
    });
    setErrors({});
  }, [initialProduct]);

  const isLoading = useMemo(() => status === "loading", [status]);

  return {
    formData,
    errors,
    isSubmitting: isSubmitting || isLoading,
    updateField,
    submitForm,
    resetForm,
    validateForm,
  };
}
