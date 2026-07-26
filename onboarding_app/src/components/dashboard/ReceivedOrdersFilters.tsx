"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { BusinessDocument } from "@ordersync/types";

interface ReceivedOrdersFiltersProps {
  restaurants: BusinessDocument[];
  onSearchChange: (search: string) => void;
  onRestaurantChange: (restaurant: string) => void;
}

export function ReceivedOrdersFilters({
  restaurants,
  onSearchChange,
  onRestaurantChange,
}: ReceivedOrdersFiltersProps) {
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  const restaurantOptions = useMemo(() => {
    return restaurants.map((biz) => ({
      value: biz.accessToken,
      label: biz.profile.name,
    }));
  }, [restaurants]);

  return (
    <Card className="p-4 bg-card border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name or order #..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-8"
          />
        </div>

        <Select onValueChange={onRestaurantChange}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="All Restaurants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Restaurants</SelectItem>
            {restaurantOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
