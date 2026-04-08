"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Product } from "@/types/inventory";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

/**
 * Products Page (Client Component)
 * Displays product inventory in a responsive grid
 * Supports filtering by search, category, price, stock level
 * Supports sorting by various fields
 */
export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        // Build query string from search params
        const queryParams = new URLSearchParams();

        const search = searchParams.get("search");
        const category = searchParams.get("category");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const lowStockOnly = searchParams.get("lowStockOnly");
        const sortBy = searchParams.get("sortBy");
        const sortOrder = searchParams.get("sortOrder");

        if (search) {
          queryParams.append("searchTerm", search);
        }
        if (category) {
          queryParams.append("category", category);
        }
        if (minPrice) {
          queryParams.append("minPrice", minPrice);
        }
        if (maxPrice) {
          queryParams.append("maxPrice", maxPrice);
        }
        if (lowStockOnly === "true") {
          queryParams.append("lowStockOnly", "true");
        }
        if (sortBy) {
          queryParams.append("sortBy", sortBy);
        }
        if (sortOrder) {
          queryParams.append("sortOrder", sortOrder);
        }

        const res = await fetch(`/api/products?${queryParams}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setProducts(data.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch products",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchParams]);

  const handleProductClick = (product: Product) => {
    // Navigate to product detail page
    router.push(`/products/${product.id}`);
  };

  const handleEditProduct = (product: Product) => {
    // Navigate to product detail page in edit mode
    router.push(`/products/${product.id}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    ) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Refresh the products list
          setProducts(products.filter((p) => p.id !== productId));
        } else {
          alert("Failed to delete product");
        }
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleViewMovements = (productId: string) => {
    // Navigate to movements page filtered by this product
    router.push(`/movements?productId=${productId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory items and stock levels
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-6 bg-white/10 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-white/10 rounded"></div>
                <div className="h-3 bg-white/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground">
          Manage your inventory items and stock levels
        </p>
      </div>

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

      {/* Filter Info */}
      {products.length > 0 && (
        <div className="glass rounded-lg p-4 border border-white/10 bg-white/5">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {products.length}
            </span>{" "}
            product{products.length !== 1 ? "s" : ""}
            {searchParams.get("category") &&
              ` in category: ${searchParams.get("category")}`}
            {searchParams.get("lowStockOnly") === "true" && " (low stock only)"}
          </p>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onViewMovements={handleViewMovements}
            />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "glass rounded-lg p-12",
            "border border-white/10",
            "flex flex-col items-center justify-center gap-4",
            "text-center",
          )}
        >
          <div className="text-4xl">📦</div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              No Products Found
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {searchParams.get("search")
                ? "Try adjusting your search terms"
                : "Add your first product to get started"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
