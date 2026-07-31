import {
  useFetchMenuDataQuery,
  useFetchOrdersDataQuery,
  useFetchUserDataQuery,
} from "@/lib/rtk/api/firestoreApi";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/lib/rtk/hooks";
import { userUid } from "@/lib/rtk/slices/constantsSlice";
import { timeRange, customDateRange } from "@/lib/rtk/slices/toggleSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo, useState, useEffect, useRef } from "react";
import { calculateMetrics } from "@/utilities/analytics/calculateMetrics";
import { calculatePercentageChange } from "@/utilities/analytics/calculatePercentageChange";
import { generateDashboardData } from "@/utilities/analytics/generateDashboardData";
import getAnalyticsRanges from "@/utilities/analytics/getAnalyticsRanges";
import buildAnalyticsFromOrders from "@/utilities/analytics/buildAnalyticsFromOrders";
import type { AnalyticsEntry } from "@/lib/types/AnalyticsEntry";

const useAnalytics = () => {
  const t = useTranslations("Dashboard.kpis");
  const uid = useAppSelector(userUid);

  const { data: user } = useFetchUserDataQuery(uid ?? skipToken);
  const resId = user?.accessToken;

  const { data: menuData } = useFetchMenuDataQuery(resId ?? skipToken);

  const timeRangeValue = useAppSelector(timeRange);
  const customRange = useAppSelector(customDateRange);

  const [filterLoading, setFilterLoading] = useState(false);
  const prevTimeRangeRef = useRef(timeRangeValue);
  const prevCustomRangeRef = useRef(customRange);

  useEffect(() => {
    if (
      prevTimeRangeRef.current !== timeRangeValue ||
      prevCustomRangeRef.current.start !== customRange.start ||
      prevCustomRangeRef.current.end !== customRange.end
    ) {
      setFilterLoading(true);
      prevTimeRangeRef.current = timeRangeValue;
      prevCustomRangeRef.current = customRange;
      const id = requestAnimationFrame(() => setFilterLoading(false));
      return () => cancelAnimationFrame(id);
    }
  }, [timeRangeValue, customRange]);

  const ranges = useMemo(
    () => getAnalyticsRanges(timeRangeValue, customRange),
    [timeRangeValue, customRange],
  );

  const isCustomIncomplete =
    timeRangeValue === "custom" && (!customRange.start || !customRange.end);

  const currentArgs =
    resId && !isCustomIncomplete
      ? { resId, start: ranges.start, end: ranges.end }
      : skipToken;

  const previousArgs =
    resId &&
    !isCustomIncomplete &&
    timeRangeValue !== "all" &&
    ranges.previousStart != null &&
    ranges.previousEnd != null
      ? { resId, start: ranges.previousStart, end: ranges.previousEnd }
      : skipToken;

  const { data: currentOrders } = useFetchOrdersDataQuery(currentArgs);
  const { data: previousOrders } = useFetchOrdersDataQuery(previousArgs);

  const currentPeriodData = useMemo<AnalyticsEntry[]>(
    () => buildAnalyticsFromOrders(currentOrders ?? [], menuData),
    [currentOrders, menuData],
  );

  const previousPeriodData = useMemo<AnalyticsEntry[]>(
    () => buildAnalyticsFromOrders(previousOrders ?? [], menuData),
    [previousOrders, menuData],
  );

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

  const loading =
    !resId ||
    (currentArgs !== skipToken && (!currentOrders || !menuData)) ||
    filterLoading;

  return {
    data: currentPeriodData,
    previousData: previousPeriodData,
    dashboardData,
    loading,
    hasData: currentPeriodData.length > 0,
  };
};

export default useAnalytics;
