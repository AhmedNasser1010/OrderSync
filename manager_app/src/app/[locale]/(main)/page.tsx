"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { BarChart3, Calendar, Inbox, ChevronDown } from "lucide-react";
import type { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { AppHeader } from "@/components/dashboard/app-header";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { SalesTrends } from "@/components/dashboard/sales-trends";
import { TopItems } from "@/components/dashboard/top-items";
import { CategoryPerf } from "@/components/dashboard/category-perf";
import { CustomerAnalytics } from "@/components/dashboard/customer-analytics";
import { OperationsPerf } from "@/components/dashboard/operations-perf";
import { DeliveryAreas } from "@/components/dashboard/delivery-areas";
import { PaymentMethods } from "@/components/dashboard/payment-methods";
import { BusinessScore } from "@/components/dashboard/business-score";
import { useAppDispatch, useAppSelector } from "@/lib/rtk/hooks";
import {
  setTimeRange,
  setCustomDateRange,
  timeRange,
  customDateRange,
} from "@/lib/rtk/slices/toggleSlice";
import useAnalytics from "@/hooks/useAnalytics";

export default function Component() {
  const { dashboardData, hasData } = useAnalytics();
  const t = useTranslations("Dashboard.header");
  const tNoData = useTranslations("Dashboard.noData");
  const dispatch = useAppDispatch();
  const timeRangeValue = useAppSelector(timeRange);
  const savedCustomRange = useAppSelector(customDateRange);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: savedCustomRange.start ? new Date(savedCustomRange.start) : undefined,
    to: savedCustomRange.end ? new Date(savedCustomRange.end) : undefined,
  }));
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (savedCustomRange.start && savedCustomRange.end) {
      setDateRange({
        from: new Date(savedCustomRange.start),
        to: new Date(savedCustomRange.end),
      });
    }
  }, [savedCustomRange]);

  const timeRangeOptions = useMemo(
    () => [
      { value: "1", label: t("last24Hours") },
      { value: "7", label: t("last7Days") },
      { value: "30", label: t("last30Days") },
      { value: "90", label: t("last3Months") },
      { value: "180", label: t("last6Months") },
      { value: "custom", label: t("custom") },
    ],
    [t],
  );

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (!range) return;
    setDateRange(range);
    if (range.from && range.to) {
      const start = format(range.from, "yyyy-MM-dd");
      const end = format(range.to, "yyyy-MM-dd");
      dispatch(setCustomDateRange({ start, end }));
      setCalendarOpen(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col w-full">
      <AppHeader
        title={t("title")}
        subtitle={t("welcome")}
        icon={<BarChart3 className="w-5 h-5" />}
      />

      <div className="flex-1 px-4 pt-6 pb-24 max-w-5xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-2">
          <Select
            value={timeRangeValue}
            onValueChange={(value) => dispatch(setTimeRange(value))}
          >
            <SelectTrigger className="w-[140px] h-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder={t("selectRange")} />
              </div>
            </SelectTrigger>
            <SelectContent position="popper" align="end" className="min-w-[140px]">
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {timeRangeValue === "custom" && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 w-[220px] justify-start text-left text-xs font-normal"
                >
                  <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d, yyyy")} —{" "}
                        {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    <span className="text-muted-foreground">
                      {t("selectRange")}
                    </span>
                  )}
                  <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={handleRangeSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {tNoData("title")}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {tNoData("description")}
            </p>
          </div>
        ) : (
          <>
            <KPICards kpis={dashboardData.kpis} />
            <InsightsCard insights={dashboardData.aiInsights} />
            <SalesTrends data={dashboardData.salesTrends} />
            <TopItems items={dashboardData.topItems} />
            <CategoryPerf categories={dashboardData.categories} />
            <CustomerAnalytics data={dashboardData.customerAnalytics} />
            <OperationsPerf metrics={dashboardData.operations} />
            <DeliveryAreas areas={dashboardData.deliveryAreas} />
            <PaymentMethods methods={dashboardData.paymentMethods} />
            <BusinessScore data={dashboardData.businessHealth} />
          </>
        )}
      </div>
    </main>
  );
}
