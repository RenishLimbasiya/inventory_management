"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch } from "@/hooks/useRedux";
import { updateProduct, deleteProduct } from "@/store/productSlice";
import { Product, ProductCategory, StockMovement } from "@/types/inventory";
import { useWarehouse } from "@/context/WarehouseContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  History,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

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
 * Product Detail/Edit Page
 * Displays and allows editing of a single product
 * Shows product information, stock movements, and edit form
 */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formatPrice } = useWarehouse();

  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const productId = params.id as string;

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    sku: "",
    name: "",
    description: "",
    category: "other",
    price: "",
    quantity: "",
    minStockLevel: "",
    maxStockLevel: "",
    unit: "pieces",
    supplier: "",
  });

  useEffect(() => {
    async function fetchProductData() {
      setLoading(true);
      setError(null);

      try {
        const [productRes, movementsRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/movements?productId=${productId}&limit=20`),
        ]);

        if (!productRes.ok) {
          throw new Error("Product not found");
        }

        const productData = await productRes.json();
        const product = productData.data;

        setProduct(product);

        // Initialize form data
        setFormData({
          sku: product.sku,
          name: product.name,
          description: product.description || "",
          category: product.category,
          price: product.price.toString(),
          quantity: product.quantity.toString(),
          minStockLevel: product.minStockLevel.toString(),
          maxStockLevel: product.maxStockLevel?.toString() || "",
          unit: product.unit,
          supplier: product.supplier || "",
        });

        if (movementsRes.ok) {
          const movementsData = await movementsRes.json();
          setMovements(movementsData.data || []);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch product",
        );
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (
      !formData.price ||
      isNaN(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      newErrors.price = "Valid price is required";
    }
    if (
      !formData.quantity ||
      isNaN(Number(formData.quantity)) ||
      Number(formData.quantity) < 0
    ) {
      newErrors.quantity = "Valid quantity is required";
    }
    if (
      !formData.minStockLevel ||
      isNaN(Number(formData.minStockLevel)) ||
      Number(formData.minStockLevel) < 0
    ) {
      newErrors.minStockLevel = "Valid minimum stock level is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !product) return;

    setIsSubmitting(true);

    try {
      const updateData = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        minStockLevel: Number(formData.minStockLevel),
        maxStockLevel: formData.maxStockLevel
          ? Number(formData.maxStockLevel)
          : undefined,
        unit: formData.unit,
        supplier: formData.supplier.trim(),
      };

      const result = await dispatch(
        updateProduct({ id: product.id, ...updateData }),
      ).unwrap();

      setProduct(result);
      setIsEditing(false);
      setErrors({});
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      await dispatch(deleteProduct(product.id)).unwrap();
      router.push("/products");
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete product");
    }
  };

  const getStockStatus = (quantity: number, minStockLevel: number) => {
    if (quantity === 0) return { status: "Out of Stock", color: "destructive" };
    if (quantity <= minStockLevel)
      return { status: "Low Stock", color: "warning" };
    return { status: "In Stock", color: "default" };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-white/10 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-lg p-6 animate-pulse">
              <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded"></div>
                <div className="h-4 bg-white/10 rounded"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
        <div className="glass rounded-lg p-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <Button asChild>
            <Link href="/products">Return to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.quantity, product.minStockLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {product.name}
            </h1>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel Edit" : "Edit Product"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{product.name}"? This action
                  cannot be undone and will also delete all associated stock
                  movements.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Product
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className={cn(
            "glass rounded-lg p-4 border border-red-500/30 bg-red-500/10",
          )}
        >
          <p className="text-red-700 dark:text-red-300 font-medium">
            ⚠️ {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
              <CardDescription>
                Basic product details and specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU *</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData({ ...formData, sku: e.target.value })
                        }
                        className={errors.sku ? "border-destructive" : ""}
                      />
                      {errors.sku && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.sku}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: ProductCategory) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) =>
                          setFormData({ ...formData, unit: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className={errors.price ? "border-destructive" : ""}
                      />
                      {errors.price && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.price}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="quantity">Current Stock *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                        className={errors.quantity ? "border-destructive" : ""}
                      />
                      {errors.quantity && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.quantity}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="minStockLevel">Min Stock Level *</Label>
                      <Input
                        id="minStockLevel"
                        type="number"
                        min="0"
                        value={formData.minStockLevel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minStockLevel: e.target.value,
                          })
                        }
                        className={
                          errors.minStockLevel ? "border-destructive" : ""
                        }
                      />
                      {errors.minStockLevel && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.minStockLevel}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxStockLevel">Max Stock Level</Label>
                      <Input
                        id="maxStockLevel"
                        type="number"
                        min="0"
                        value={formData.maxStockLevel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxStockLevel: e.target.value,
                          })
                        }
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) =>
                          setFormData({ ...formData, supplier: e.target.value })
                        }
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        SKU
                      </Label>
                      <p className="text-foreground font-mono">{product.sku}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Category
                      </Label>
                      <Badge variant="secondary">{product.category}</Badge>
                    </div>
                  </div>

                  {product.description && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Description
                      </Label>
                      <p className="text-foreground">{product.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Price
                      </Label>
                      <p className="text-foreground font-semibold">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Current Stock
                      </Label>
                      <p className="text-foreground font-semibold">
                        {product.quantity} {product.unit}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Min Stock Level
                      </Label>
                      <p className="text-foreground">
                        {product.minStockLevel} {product.unit}
                      </p>
                    </div>
                    {product.maxStockLevel && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Max Stock Level
                        </Label>
                        <p className="text-foreground">
                          {product.maxStockLevel} {product.unit}
                        </p>
                      </div>
                    )}
                  </div>

                  {product.supplier && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Supplier
                      </Label>
                      <p className="text-foreground">{product.supplier}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Movements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Stock Movements
              </CardTitle>
              <CardDescription>
                Latest stock changes for this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              {movements.length > 0 ? (
                <div className="space-y-3">
                  {movements.slice(0, 10).map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between p-3 glass rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            movement.type === "inbound"
                              ? "bg-green-500"
                              : movement.type === "outbound"
                                ? "bg-red-500"
                                : movement.type === "adjustment"
                                  ? "bg-yellow-500"
                                  : "bg-blue-500",
                          )}
                        />
                        <div>
                          <p className="font-medium capitalize">
                            {movement.type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(movement.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-semibold",
                            movement.type === "inbound"
                              ? "text-green-600"
                              : movement.type === "outbound"
                                ? "text-red-600"
                                : "text-foreground",
                          )}
                        >
                          {movement.type === "inbound"
                            ? "+"
                            : movement.type === "outbound"
                              ? "-"
                              : ""}
                          {movement.quantity} {product.unit}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {movement.reason || "No reason provided"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {movements.length > 10 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/movements?productId=${product.id}`}>
                          View All Movements
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No stock movements recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stock Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Current Stock
                    </span>
                    <Badge variant={stockStatus.color as any}>
                      {stockStatus.status}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {product.quantity}{" "}
                    <span className="text-sm text-muted-foreground">
                      {product.unit}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min Level</span>
                    <span>
                      {product.minStockLevel} {product.unit}
                    </span>
                  </div>
                  {product.maxStockLevel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max Level</span>
                      <span>
                        {product.maxStockLevel} {product.unit}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Stock Level</span>
                    <span>
                      {Math.round(
                        (product.quantity /
                          (product.maxStockLevel ||
                            product.minStockLevel * 2)) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        product.quantity === 0
                          ? "bg-red-500"
                          : product.quantity <= product.minStockLevel
                            ? "bg-yellow-500"
                            : "bg-green-500",
                      )}
                      style={{
                        width: `${Math.min(100, (product.quantity / (product.maxStockLevel || product.minStockLevel * 2)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Value Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Value Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span className="font-semibold">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Value</span>
                  <span className="font-semibold">
                    {formatPrice(product.price * product.quantity)}
                  </span>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(product.updatedAt).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
