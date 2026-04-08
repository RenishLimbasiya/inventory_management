"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useRedux";
import { createProduct } from "@/store/productSlice";
import { ProductCategory, Product } from "@/types/inventory";
import { cn } from "@/lib/utils";

const CATEGORIES: ProductCategory[] = [
  "electronics",
  "furniture",
  "clothing",
  "food",
  "other",
];

const UNITS = ["pieces", "boxes", "kg", "liters", "meters", "hours"];

interface FormData {
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: string;
  costPrice: string;
  quantity: string;
  minStockLevel: string;
  maxStockLevel: string;
  unit: string;
  supplier: string;
}

interface FormErrors {
  [key: string]: string;
}

/**
 * Add Product Page
 * Form to create a new product in inventory
 * Validates input and dispatches to Redux store
 */
export default function AddProductPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState<FormData>({
    sku: "",
    name: "",
    description: "",
    category: "other",
    price: "",
    costPrice: "",
    quantity: "",
    minStockLevel: "",
    maxStockLevel: "",
    unit: "pieces",
    supplier: "",
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (!formData.price || parseInt(formData.price, 10) <= 0) {
      newErrors.price = "Price must be a positive integer (cents)";
    }
    if (!formData.costPrice || parseInt(formData.costPrice, 10) <= 0) {
      newErrors.costPrice = "Cost price must be a positive integer (cents)";
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = "Quantity must be 0 or greater";
    }
    if (!formData.minStockLevel || parseInt(formData.minStockLevel) < 0) {
      newErrors.minStockLevel = "Min stock level must be 0 or greater";
    }
    if (!formData.maxStockLevel || parseInt(formData.maxStockLevel) < 0) {
      newErrors.maxStockLevel = "Max stock level must be 0 or greater";
    }
    if (parseInt(formData.maxStockLevel) < parseInt(formData.minStockLevel)) {
      newErrors.maxStockLevel =
        "Max stock level must be greater than or equal to min stock level";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const productData: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseInt(formData.price, 10),
        costPrice: parseInt(formData.costPrice, 10),
        quantity: parseInt(formData.quantity),
        minStockLevel: parseInt(formData.minStockLevel),
        maxStockLevel: parseInt(formData.maxStockLevel),
        unit: formData.unit,
        supplier: formData.supplier,
        isActive: true,
      };

      const result = await dispatch(createProduct(productData)).unwrap();

      setSuccessMessage(`Product "${result.name}" created successfully!`);

      // Redirect after success
      setTimeout(() => {
        router.push("/products");
      }, 1500);
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to create product",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Add Product</h1>
        <p className="text-muted-foreground">
          Create a new product in your inventory
        </p>
      </div>

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

      {/* Error Message */}
      {errors.submit && (
        <div
          className={cn(
            "glass rounded-lg p-4",
            "border border-red-500/30 bg-red-500/10",
            "text-red-700 dark:text-red-300",
            "text-sm",
          )}
        >
          <p className="font-medium">⚠️ {errors.submit}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="glass rounded-lg p-6 border border-white/10 space-y-6">
          {/* SKU and Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium mb-2">
                SKU *
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g., SKU-001"
                className={cn(
                  "w-full px-4 py-2 rounded-lg",
                  "bg-white/5 border border-white/10",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  errors.sku && "border-red-500/50 focus:ring-red-500",
                )}
              />
              {errors.sku && (
                <p className="text-xs text-red-500 mt-1">{errors.sku}</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Product Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Laptop Pro"
                className={cn(
                  "w-full px-4 py-2 rounded-lg",
                  "bg-white/5 border border-white/10",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  errors.name && "border-red-500/50 focus:ring-red-500",
                )}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description..."
              rows={3}
              className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-white/5 border border-white/10",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary",
              )}
            />
          </div>

          {/* Category and Unit Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium mb-2"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-2 rounded-lg",
                  "bg-white/5 border border-white/10",
                  "text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                )}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium mb-2">
                Unit *
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-2 rounded-lg",
                  "bg-white/5 border border-white/10",
                  "text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                )}
              >
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing and Quantity Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-2">
                Price (cents) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="129999"
                className={cn(
                  "w-full px-4 py-2 rounded-lg",
                  "bg-white/5 border border-white/10",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  errors.price && "border-red-500/50 focus:ring-red-500",
                )}
              />
              {errors.price && (
                <p className="text-xs text-red-500 mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="costPrice"
                className="block text-sm font-medium mb-2"
              >
                Cost Price (cents) *
              </label>
              <input
                id="costPrice"
                name="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={handleChange}
                placeholder="99999"
                className={cn(
                  "w-full px-4 py-2 rounded-lg",
                  "bg-white/5 border border-white/10",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  errors.costPrice && "border-red-500/50 focus:ring-red-500",
                )}
              />
              {errors.costPrice && (
                <p className="text-xs text-red-500 mt-1">{errors.costPrice}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium mb-2"
              >
                Initial Quantity *
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                className={cn(
                  "w-full px-4 py-2 rounded-lg",
                  "bg-white/5 border border-white/10",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  errors.quantity && "border-red-500/50 focus:ring-red-500",
                )}
              />
              {errors.quantity && (
                <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Stock Levels Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="minStockLevel"
                className="block text-sm font-medium mb-2"
              >
                Min Stock Level *
              </label>
              <input
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                value={formData.minStockLevel}
                onChange={handleChange}
                placeholder="0"
                className={cn(
                  "w-full px-4 py-2 rounded-lg",
                  "bg-white/5 border border-white/10",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  errors.minStockLevel &&
                    "border-red-500/50 focus:ring-red-500",
                )}
              />
              {errors.minStockLevel && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.minStockLevel}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="maxStockLevel"
                className="block text-sm font-medium mb-2"
              >
                Max Stock Level *
              </label>
              <input
                id="maxStockLevel"
                name="maxStockLevel"
                type="number"
                value={formData.maxStockLevel}
                onChange={handleChange}
                placeholder="0"
                className={cn(
                  "w-full px-4 py-2 rounded-lg",
                  "bg-white/5 border border-white/10",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  errors.maxStockLevel &&
                    "border-red-500/50 focus:ring-red-500",
                )}
              />
              {errors.maxStockLevel && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.maxStockLevel}
                </p>
              )}
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label
              htmlFor="supplier"
              className="block text-sm font-medium mb-2"
            >
              Supplier
            </label>
            <input
              id="supplier"
              name="supplier"
              type="text"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="Supplier name"
              className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-white/5 border border-white/10",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary",
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all",
              )}
            >
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>
            <Link
              href="/products"
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium",
                "bg-white/10 text-foreground",
                "hover:bg-white/20",
                "border border-white/20",
                "transition-colors",
                "text-center",
              )}
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
