"use client";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/lib/rtk/hooks";
import { initTimeRange, setTimeRange, timeRange } from "@/lib/rtk/slices/toggleSlice";

export default function Range() {
  const dispatch = useAppDispatch();
  const timeRangeValue = useAppSelector(timeRange);

  useEffect(() => {
    dispatch(initTimeRange())
  }, [])

  return (
    <Select value={timeRangeValue} onValueChange={(value) => dispatch(setTimeRange(value))}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Last 24 hours</SelectItem>
        <SelectItem value="3">Last 3 hours</SelectItem>
        <SelectItem value="7">Last 7 days</SelectItem>
        <SelectItem value="30">Last 30 days</SelectItem>
      </SelectContent>
    </Select>
  );
}
