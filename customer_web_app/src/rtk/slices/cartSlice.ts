import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  quantity: number;
  selectedSize?: string | null;
  discountCode?: string | null;
}

export interface CartState {
  items: CartItem[];
  restaurant: string;
  appliedOrderDiscount: Record<string, unknown> | null;
  hydrated: boolean;
}

const emptyCartState = (): CartState => ({
  items: [],
  restaurant: "",
  appliedOrderDiscount: null,
  hydrated: false,
});

const loadStateFromLocalStorage = (): Omit<CartState, "hydrated"> => {
  if (typeof window === "undefined") {
    return { items: [], restaurant: "", appliedOrderDiscount: null };
  }
  try {
    const savedCart = window.localStorage.getItem("cartState");
    return savedCart
      ? { ...JSON.parse(savedCart), appliedOrderDiscount: null }
      : { items: [], restaurant: "", appliedOrderDiscount: null };
  } catch {
    return { items: [], restaurant: "", appliedOrderDiscount: null };
  }
};

const saveStateToLocalStorage = (state: CartState) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("cartState", JSON.stringify(state));
  }
};

const initialState: CartState = emptyCartState();

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initCart: (state, { payload }: PayloadAction<CartState>) => {
      saveStateToLocalStorage(payload);
      return payload;
    },
    hydrateCart: (state) => {
      if (state.hydrated) return state;
      const saved = loadStateFromLocalStorage();
      state.items = saved.items;
      state.restaurant = saved.restaurant;
      state.appliedOrderDiscount = saved.appliedOrderDiscount;
      state.hydrated = true;
      return state;
    },
    clearCart: () => {
      const newState = { ...emptyCartState(), hydrated: true };
      saveStateToLocalStorage(newState);
      return newState;
    },
    addToCart: (state, { payload }: PayloadAction<CartItem>) => {
      state.items.push({ ...payload });
      saveStateToLocalStorage(state);
    },
    quantityHandle: (
      state,
      { payload }: PayloadAction<{ id: string; selectedSize?: string | null; quantity: "+" | "-" }>
    ) => {
      state.items = state.items.reduce<CartItem[]>((acc, item) => {
        if (
          item.id === payload.id &&
          (item.selectedSize ?? null) === (payload.selectedSize ?? null)
        ) {
          if (payload.quantity === "+") {
            acc.push({ ...item, quantity: item.quantity + 1 });
          } else if (payload.quantity === "-" && item.quantity > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);

      if (state.items.length === 0) {
        state.restaurant = "";
      }
      saveStateToLocalStorage(state);
    },
    setRestaurant: (state, { payload }: PayloadAction<string>) => {
      state.restaurant = payload;
      saveStateToLocalStorage(state);
    },
    handleAddDiscount: (
      state,
      { payload }: PayloadAction<{ id: string; discountCode: string }>
    ) => {
      state.items = state.items.map((item) =>
        item.id === payload.id ? { ...item, discountCode: payload.discountCode } : item
      );
      saveStateToLocalStorage(state);
    },
    applyOrderDiscount: (
      state,
      { payload }: PayloadAction<Record<string, unknown>>
    ) => {
      state.appliedOrderDiscount = payload;
      saveStateToLocalStorage(state);
    },
    removeOrderDiscount: (state) => {
      state.appliedOrderDiscount = null;
      saveStateToLocalStorage(state);
    },
  },
});

export const {
  initCart,
  hydrateCart,
  clearCart,
  addToCart,
  quantityHandle,
  setRestaurant,
  handleAddDiscount,
  applyOrderDiscount,
  removeOrderDiscount,
} = cartSlice.actions;

export default cartSlice.reducer;
