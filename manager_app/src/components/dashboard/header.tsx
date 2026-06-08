"use client";

import { useEffect } from "react";
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

const timeRangeOptions = [
  { value: "all", label: "All time" },
  { value: "1", label: "Last 24 hours" },
  { value: "3", label: "Last 3 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
];

export function DashboardHeader() {
  const dispatch = useAppDispatch();
  const timeRangeValue = useAppSelector(timeRange);

  useEffect(() => {
    dispatch(initTimeRange());
  }, [dispatch]);

  return (
    <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Welcome back to OrderSync
          </p>
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
              <SelectValue placeholder="Select range" />
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
