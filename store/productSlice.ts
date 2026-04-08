import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  type SerializedError,
} from "@reduxjs/toolkit";
import { Product, InventoryFilters } from "@/types/inventory";

/**
 * API Response types
 */
interface ProductsResponse {
  data: Product[];
  success: boolean;
}

interface ProductResponse {
  data: Product;
  success: boolean;
}

/**
 * Product Slice State
 */
interface ProductSliceState {
  products: Product[];
  filters: InventoryFilters;
  selectedProduct: Product | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: SerializedError | null;
}

/**
 * Initial filters state
 */
const initialFilters: InventoryFilters = {
  search: "",
  category: "all",
  minPrice: null,
  maxPrice: null,
  lowStockOnly: false,
};

/**
 * Initial state
 */
const initialState: ProductSliceState = {
  products: [],
  filters: initialFilters,
  selectedProduct: null,
  status: "idle",
  error: null,
};

/**
 * Async Thunk: Fetch all products
 */
export const fetchProducts = createAsyncThunk<
  Product[],
  InventoryFilters | undefined,
  {
    rejectValue: { message: string };
  }
>("products/fetchProducts", async (filters, { rejectWithValue }) => {
  try {
    const activeFilters = filters ?? initialFilters;
    const queryParams = new URLSearchParams();
    if (activeFilters.search) queryParams.append("search", activeFilters.search);
    if (activeFilters.category !== "all") queryParams.append("category", activeFilters.category);
    if (activeFilters.minPrice !== null) queryParams.append("minPrice", String(activeFilters.minPrice));
    if (activeFilters.maxPrice !== null) queryParams.append("maxPrice", String(activeFilters.maxPrice));
    queryParams.append("lowStockOnly", String(activeFilters.lowStockOnly));

    const response = await fetch(`/api/products?${queryParams}`);

    if (!response.ok) {
      return rejectWithValue({ message: "Failed to fetch products" });
    }

    const json: ProductsResponse = await response.json();
    return json.data;
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Async Thunk: Create new product
 */
export const createProduct = createAsyncThunk<
  Product,
  Omit<Product, "id" | "createdAt" | "updatedAt">,
  {
    rejectValue: { message: string };
  }
>("products/createProduct", async (productData, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      return rejectWithValue({ message: "Failed to create product" });
    }

    const json: ProductResponse = await response.json();
    return json.data;
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Async Thunk: Update existing product
 */
export const editProduct = createAsyncThunk<
  Product,
  {
    id: string;
    data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>;
  },
  {
    rejectValue: { message: string };
  }
>("products/editProduct", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return rejectWithValue({ message: "Failed to update product" });
    }

    const json: ProductResponse = await response.json();
    return json.data;
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Async Thunk: Delete product
 * Cascades to clear movements in movement slice
 */
export const deleteProduct = createAsyncThunk<
  string,
  string,
  {
    rejectValue: { message: string };
  }
>("products/deleteProduct", async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return rejectWithValue({ message: "Failed to delete product" });
    }

    return id;
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Product Slice
 */
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    /**
     * Set all products (for hydration or manual updates)
     */
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.status = "succeeded";
      state.error = null;
    },

    /**
     * Add single product to state
     */
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },

    /**
     * Update product in state
     * Updates both the product in the array and selectedProduct if it's the same
     */
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      if (state.selectedProduct?.id === action.payload.id) {
        state.selectedProduct = action.payload;
      }
    },

    /**
     * Remove product from state
     */
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
      if (state.selectedProduct?.id === action.payload) {
        state.selectedProduct = null;
      }
    },

    /**
     * Set filters and trigger re-fetch if needed
     */
    setFilters: (state, action: PayloadAction<Partial<InventoryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    /**
     * Reset filters to initial state
     */
    clearFilters: (state) => {
      state.filters = initialFilters;
    },

    /**
     * Set selected product for detail view
     */
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
  },

  extraReducers: (builder) => {
    /**
     * Fetch Products
     */
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || {
          name: "Error",
          message: "Failed to fetch products",
        };
      });

    /**
     * Create Product
     */
    builder
      .addCase(createProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products.push(action.payload);
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || {
          name: "Error",
          message: "Failed to create product",
        };
      });

    /**
     * Edit Product
     */
    builder
      .addCase(editProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id,
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
        state.error = null;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || {
          name: "Error",
          message: "Failed to update product",
        };
      });

    /**
     * Delete Product
     */
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = state.products.filter((p) => p.id !== action.payload);
        if (state.selectedProduct?.id === action.payload) {
          state.selectedProduct = null;
        }
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || {
          name: "Error",
          message: "Failed to delete product",
        };
      });
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setFilters,
  clearFilters,
  setSelectedProduct,
} = productSlice.actions;

export default productSlice.reducer;
