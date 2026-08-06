"use client";

import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { setSearchTerm } from "@/rtk/slices/uiSlice";

interface RestaurantFiltersProps {
  onIndustryChange: (industry: string) => void;
  onStatusChange: (status: string) => void;
}

export function RestaurantFilters({
  onIndustryChange,
  onStatusChange,
}: RestaurantFiltersProps) {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector((state) => state.ui.searchTerm);

  return (
    <Card className="p-4 bg-card border-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            className="pl-10 h-9 bg-secondary border-border"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          />
        </div>

        {/* Industry Filter */}
        <Select onValueChange={onIndustryChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Industries</SelectItem>
            <SelectItem value="restaurant">Restaurant</SelectItem>
            <SelectItem value="coffee-shop">Coffee Shop</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select onValueChange={onStatusChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pause">Pause</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}