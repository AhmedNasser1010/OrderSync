import {
  useFetchDailyReportsDataQuery,
  useFetchUserDataQuery,
} from "@/lib/rtk/api/firestoreApi";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/lib/rtk/hooks";
import { userUid } from "@/lib/rtk/slices/constantsSlice";
import { timeRange, customDateRange } from "@/lib/rtk/slices/toggleSlice";
import filterDataByDateRange from "@/utilities/filterDataByDateRange";
import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo } from "react";
import { calculateMetrics } from "@/utilities/analytics/calculateMetrics";
import { calculatePercentageChange } from "@/utilities/analytics/calculatePercentageChange";
import { generateDashboardData } from "@/utilities/analytics/generateDashboardData";
import type { DailyReport } from "@ordersync/types";
import type { DashboardData } from "@/lib/types/types";

const useAnalytics = () => {
  const t = useTranslations("Dashboard.kpis");
  const uid = useAppSelector(userUid);

  const { data: user } = useFetchUserDataQuery(uid ?? skipToken);

  const resId = user?.accessToken;

  const { data: dailyReportsData } =
    useFetchDailyReportsDataQuery(resId ?? skipToken);

  const timeRangeValue = useAppSelector(timeRange);
  const customRange = useAppSelector(customDateRange);

  const currentPeriodData = useMemo(() => {
    if (!dailyReportsData) return [];

    if (timeRangeValue === "all") {
      return dailyReportsData;
    }

    if (timeRangeValue === "custom") {
      if (!customRange.start || !customRange.end) return [];
      return filterDataByDateRange(
        customRange.start,
        customRange.end,
        "businessDate",
        dailyReportsData,
      );
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
      "businessDate",
      dailyReportsData,
    );
  }, [dailyReportsData, timeRangeValue, customRange.start, customRange.end]);

  const previousPeriodData = useMemo(() => {
    if (!dailyReportsData || timeRangeValue === "all") {
      return [];
    }

    if (timeRangeValue === "custom") {
      if (!customRange.start || !customRange.end) return [];
      const diff =
        new Date(customRange.end).getTime() -
        new Date(customRange.start).getTime();
      const previousEnd = new Date(new Date(customRange.start).getTime() - 1);
      const previousStart = new Date(previousEnd.getTime() - diff);
      return filterDataByDateRange(
        previousStart.toISOString().split("T")[0],
        previousEnd.toISOString().split("T")[0],
        "businessDate",
        dailyReportsData,
      );
    }

    const days = Number(timeRangeValue);

    const previousEnd = new Date();
    previousEnd.setDate(previousEnd.getDate() - days);

    const previousStart = new Date(previousEnd);

    previousStart.setDate(previousStart.getDate() - days);

    return filterDataByDateRange(
      previousStart.toISOString().split("T")[0],
      previousEnd.toISOString().split("T")[0],
      "businessDate",
      dailyReportsData,
    );
  }, [dailyReportsData, timeRangeValue, customRange.start, customRange.end]);

  const dashboardData = useMemo(() => {
    const currentMetrics = calculateMetrics(currentPeriodData);

    const previousMetrics = calculateMetrics(previousPeriodData);

    const kpis = [
      {
        label: t("revenue"),
        value: currentMetrics.totalRevenue,
        change: calculatePercentageChange(
          currentMetrics.totalRevenue,
          previousMetrics.totalRevenue,
        ),
        icon: "TrendingUp",
      },
      {
        label: t("orders"),
        value: currentMetrics.totalOrders,
        change: calculatePercentageChange(
          currentMetrics.totalOrders,
          previousMetrics.totalOrders,
        ),
        icon: "ShoppingCart",
      },
      {
        label: t("avgOrderValue"),
        value: currentMetrics.avgOrderValue,
        change: calculatePercentageChange(
          currentMetrics.avgOrderValue,
          previousMetrics.avgOrderValue,
        ),
        icon: "DollarSign",
      },
      {
        label: t("cancellationRate"),
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
    loading: !dailyReportsData,
    hasData: currentPeriodData.length > 0,
  };
};

export default useAnalytics;
