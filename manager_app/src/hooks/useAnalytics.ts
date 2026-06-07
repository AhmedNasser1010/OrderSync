import {
  useFetchOrdersDailySummarizationDataQuery,
  useFetchUserDataQuery,
} from "@/lib/rtk/api/firestoreApi";
import { useAppSelector } from "@/lib/rtk/hooks";
import { userUid } from "@/lib/rtk/slices/constantsSlice";
import { timeRange } from "@/lib/rtk/slices/toggleSlice";
import filterDataByDateRange from "@/utilities/filterDataByDateRange";
import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo } from "react";
import { calculateMetrics } from "@/utilities/analytics/calculateMetrics";
import { calculatePercentageChange } from "@/utilities/analytics/calculatePercentageChange";
import { generateDashboardData } from "@/utilities/analytics/generateDashboardData";
import { AnalyticsEntry } from "@/lib/types/AnalyticsEntry";
import { DashboardData } from "@/lib/types/types";

const useAnalytics = () => {
  const uid = useAppSelector(userUid);

  const { data: user } = useFetchUserDataQuery(uid ?? skipToken);

  const resId = user?.accessToken;

  const { data: dailySummarizationData } =
    useFetchOrdersDailySummarizationDataQuery(resId ?? skipToken);

  const timeRangeValue = useAppSelector(timeRange);

  const currentPeriodData = useMemo(() => {
    if (!dailySummarizationData) return [];

    if (timeRangeValue === "all") {
      return dailySummarizationData;
    }

    const startDate = new Date(
      new Date().setDate(new Date().getDate() - Number(timeRangeValue)),
    )
      .toISOString()
      .split("T")[0];

    const endDate = new Date().toISOString().split("T")[0];

    return filterDataByDateRange(
      startDate,
      endDate,
      "date",
      dailySummarizationData,
    );
  }, [dailySummarizationData, timeRangeValue]);

  const previousPeriodData = useMemo(() => {
    if (!dailySummarizationData || timeRangeValue === "all") {
      return [];
    }

    const days = Number(timeRangeValue);

    const previousEnd = new Date();
    previousEnd.setDate(previousEnd.getDate() - days);

    const previousStart = new Date(previousEnd);

    previousStart.setDate(previousStart.getDate() - days);

    return filterDataByDateRange(
      previousStart.toISOString().split("T")[0],
      previousEnd.toISOString().split("T")[0],
      "date",
      dailySummarizationData,
    );
  }, [dailySummarizationData, timeRangeValue]);

  const dashboardData = useMemo(() => {
    const currentMetrics = calculateMetrics(currentPeriodData);

    const previousMetrics = calculateMetrics(previousPeriodData);

    const kpis = [
      {
        label: "Revenue",
        value: currentMetrics.totalRevenue,
        change: calculatePercentageChange(
          currentMetrics.totalRevenue,
          previousMetrics.totalRevenue,
        ),
        icon: "TrendingUp",
      },
      {
        label: "Orders",
        value: currentMetrics.totalOrders,
        change: calculatePercentageChange(
          currentMetrics.totalOrders,
          previousMetrics.totalOrders,
        ),
        icon: "ShoppingCart",
      },
      {
        label: "Avg Order Value",
        value: currentMetrics.avgOrderValue,
        change: calculatePercentageChange(
          currentMetrics.avgOrderValue,
          previousMetrics.avgOrderValue,
        ),
        icon: "DollarSign",
      },
      {
        label: "Cancellation Rate",
        value: currentMetrics.cancellationRate,
        change: calculatePercentageChange(
          currentMetrics.cancellationRate,
          previousMetrics.cancellationRate,
        ),
        icon: "AlertCircle",
      },
    ];

    return generateDashboardData({
      currentPeriodData,
      previousPeriodData,
      kpis,
    });
  }, [currentPeriodData, previousPeriodData]);

  return {
    data: currentPeriodData,
    previousData: previousPeriodData,
    dashboardData,
    loading: !dailySummarizationData,
  };
};

export default useAnalytics;
