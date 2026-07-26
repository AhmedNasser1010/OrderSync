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
import type { CustomerType } from "@ordersync/types";

interface CustomerFiltersProps {
  customers: CustomerType[];
  onSearchChange: (search: string) => void;
  onCityChange: (city: string) => void;
  onDateRangeChange: (dateRange: string) => void;
}

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Last Year" },
];

export function CustomerFilters({
  customers,
  onSearchChange,
  onCityChange,
  onDateRangeChange,
}: CustomerFiltersProps) {
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    customers.forEach((customer) => {
      if (customer.locations?.city) {
        citySet.add(customer.locations.city);
      }
    });
    return Array.from(citySet).sort();
  }, [customers]);

  return (
    <Card className="p-4 bg-card border-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-8"
          />
        </div>

        {/* City Filter */}
        <Select onValueChange={onCityChange}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select onValueChange={onDateRangeChange}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
