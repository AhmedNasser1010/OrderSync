"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { BusinessDocument } from "@ordersync/types";

interface ReviewsFiltersProps {
  restaurants: BusinessDocument[];
  ratingFilter: string;
  restaurantFilter: string;
  dateRange: string;
  searchQuery: string;
  visibilityFilter: string;
  onRatingChange: (value: string) => void;
  onRestaurantChange: (value: string) => void;
  onDateRangeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onVisibilityChange: (value: string) => void;
}

export function ReviewsFilters({
  restaurants,
  ratingFilter,
  restaurantFilter,
  dateRange,
  searchQuery,
  visibilityFilter,
  onRatingChange,
  onRestaurantChange,
  onDateRangeChange,
  onSearchChange,
  onVisibilityChange,
}: ReviewsFiltersProps) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex flex-wrap items-center gap-3">
        {/* Rating Filter */}
        <Select value={ratingFilter} onValueChange={onRatingChange}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="All Ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>

        {/* Restaurant Filter */}
        <Select value={restaurantFilter} onValueChange={onRestaurantChange}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="All Restaurants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Restaurants</SelectItem>
            {restaurants.map((biz) => (
              <SelectItem key={biz.accessToken} value={biz.accessToken}>
                {biz.profile.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>

        {/* Visibility Filter */}
        <Select value={visibilityFilter} onValueChange={onVisibilityChange}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="All Reviews" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="visible">Visible</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>
    </Card>
  );
}
