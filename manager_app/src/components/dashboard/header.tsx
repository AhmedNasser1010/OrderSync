"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/lib/rtk/hooks";
import {
  initTimeRange,
  setTimeRange,
  timeRange,
} from "@/lib/rtk/slices/toggleSlice";
import { UserAvatar } from "@/components/user-avatar";

export function DashboardHeader() {
  const t = useTranslations("Dashboard.header");
  const dispatch = useAppDispatch();
  const timeRangeValue = useAppSelector(timeRange);

  const timeRangeOptions = useMemo(
    () => [
      { value: "all", label: t("allTime") },
      { value: "1", label: t("last24Hours") },
      { value: "3", label: t("last3Hours") },
      { value: "7", label: t("last7Days") },
      { value: "30", label: t("last30Days") },
    ],
    [t],
  );

  return (
    <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">
            {t("title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{t("welcome")}</p>
        </div>
        <UserAvatar />
      </div>

      <div className="relative w-full max-w-xs">
        <Select
          value={timeRangeValue}
          onValueChange={(value) => dispatch(setTimeRange(value))}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <SelectValue placeholder={t("selectRange")} />
            </div>
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            className="w-full min-w-full"
          >
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
