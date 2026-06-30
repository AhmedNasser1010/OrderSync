"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface RestaurantFiltersProps {
  onIndustryChange: (industry: string) => void;
  onStatusChange: (status: string) => void;
}

export function RestaurantFilters({
  onIndustryChange,
  onStatusChange,
}: RestaurantFiltersProps) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}