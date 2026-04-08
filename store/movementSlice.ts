import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  type SerializedError,
} from "@reduxjs/toolkit";
import { StockMovement, StockMovementType } from "@/types/inventory";
import { updateProduct } from "./productSlice";
import { deleteProduct } from "./productSlice";

/**
 * API Response types
 */
interface MovementsResponse {
  data: StockMovement[];
  success: boolean;
}

interface MovementResponse {
  data: StockMovement;
  success: boolean;
}

/**
 * Record Movement Payload
 */
export interface RecordMovementPayload {
  productId: string;
  type: StockMovementType;
  quantity: number;
  note?: string;
}

/**
 * Movement Slice State
 */
interface MovementSliceState {
  movements: StockMovement[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: SerializedError | null;
}

/**
 * Initial state
 */
const initialState: MovementSliceState = {
  movements: [],
  status: "idle",
  error: null,
};

/**
 * Async Thunk: Fetch movements for a product
 */
export const fetchMovements = createAsyncThunk<
  StockMovement[],
  string,
  {
    rejectValue: { message: string };
  }
>("movements/fetchMovements", async (productId, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/movements?productId=${productId}`);

    if (!response.ok) {
      return rejectWithValue({ message: "Failed to fetch movements" });
    }

    const json: MovementsResponse = await response.json();
    return json.data;
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Async Thunk: Record stock movement
 * This automatically updates product quantity via the API
 */
export const recordMovement = createAsyncThunk<
  StockMovement,
  RecordMovementPayload,
  {
    rejectValue: { message: string };
  }
>(
  "movements/recordMovement",
  async (movementData, { rejectWithValue, dispatch }) => {
  try {
    const response = await fetch("/api/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movementData),
    });

    if (!response.ok) {
      return rejectWithValue({ message: "Failed to record movement" });
    }

    const json: MovementResponse = await response.json();

    // Keep product quantity/updatedAt in sync without full refetch.
    const productRes = await fetch(`/api/products/${movementData.productId}`, {
      cache: "no-store",
    });
    if (productRes.ok) {
      const productJson = await productRes.json();
      if (productJson?.data) {
        dispatch(updateProduct(productJson.data));
      }
    }

    return json.data;
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Movement Slice
 */
const movementSlice = createSlice({
  name: "movements",
  initialState,
  reducers: {
    /**
     * Set all movements (for hydration or manual updates)
     */
    setMovements: (state, action: PayloadAction<StockMovement[]>) => {
      state.movements = action.payload;
      state.status = "succeeded";
      state.error = null;
    },

    /**
     * Add single movement to state
     */
    addMovement: (state, action: PayloadAction<StockMovement>) => {
      state.movements.unshift(action.payload);
    },

    /**
     * Clear all movements for a product
     * Called when product is deleted (cascade delete)
     */
    clearMovementsForProduct: (state, action: PayloadAction<string>) => {
      state.movements = state.movements.filter(
        (m) => m.productId !== action.payload,
      );
    },

    /**
     * Clear all movements
     */
    clearAllMovements: (state) => {
      state.movements = [];
    },
  },

  extraReducers: (builder) => {
    /**
     * Fetch Movements
     */
    builder
      .addCase(fetchMovements.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMovements.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.movements = action.payload;
        state.error = null;
      })
      .addCase(fetchMovements.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || {
          name: "Error",
          message: "Failed to fetch movements",
        };
      });

    /**
     * Record Movement
     * Automatically updates product quantity via API
     */
    builder
      .addCase(recordMovement.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(recordMovement.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.movements.unshift(action.payload);
        state.error = null;
      })
      .addCase(recordMovement.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || {
          name: "Error",
          message: "Failed to record movement",
        };
      });

    /**
     * Cross-slice dependency: When product is deleted, clear its movements
     */
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.movements = state.movements.filter(
        (m) => m.productId !== action.payload,
      );
    });
  },
});

export const {
  setMovements,
  addMovement,
  clearMovementsForProduct,
  clearAllMovements,
} = movementSlice.actions;

export default movementSlice.reducer;
