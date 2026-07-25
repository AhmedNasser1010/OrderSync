import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DiscountAnalyticsData } from "@/lib/types/analytics";

interface DiscountAnalyticsState {
  data: DiscountAnalyticsData[];
  loading: boolean;
  error: string | null;
  selectedDiscountId: string | null;
}

const initialState: DiscountAnalyticsState = {
  data: [],
  loading: false,
  error: null,
  selectedDiscountId: null,
};

export const fetchDiscountAnalytics = createAsyncThunk(
  "discountAnalytics/fetch",
  async (
    { restaurantId, period }: { restaurantId: string; period?: string },
    { rejectWithValue }
  ) => {
    try {
      const currentPeriod =
        period ||
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

      const q = query(
        collection(db, "discountAnalytics"),
        where("restaurantId", "==", restaurantId),
        where("period", "==", currentPeriod),
        orderBy("redemptions", "desc"),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const data: DiscountAnalyticsData[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          discountId: d.discountId,
          restaurantId: d.restaurantId,
          period: d.period,
          impressions: d.impressions ?? 0,
          redemptions: d.redemptions ?? 0,
          conversionRate:
            d.impressions > 0 ? d.redemptions / d.impressions : 0,
          revenueImpact: d.revenueImpact ?? 0,
          avgDiscountValue:
            d.redemptions > 0 ? d.revenueImpact / d.redemptions : 0,
          uniqueUsers: d.uniqueUsers?.length ?? 0,
        };
      });

      return data;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch analytics"
      );
    }
  }
);

export const discountAnalyticsSlice = createSlice({
  name: "discountAnalytics",
  initialState,
  reducers: {
    setSelectedDiscount: (state, { payload }: PayloadAction<string | null>) => {
      state.selectedDiscountId = payload;
    },
    clearAnalytics: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscountAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscountAnalytics.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload;
      })
      .addCase(fetchDiscountAnalytics.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });
  },
});

export const { setSelectedDiscount, clearAnalytics } =
  discountAnalyticsSlice.actions;

export default discountAnalyticsSlice.reducer;
