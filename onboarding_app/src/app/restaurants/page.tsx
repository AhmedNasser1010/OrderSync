"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { RestaurantsTable } from "@/components/dashboard/RestaurantsTable";
import { RestaurantFilters } from "@/components/dashboard/RestaurantFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { mockRestaurants, type Restaurant } from "@/lib/mock-data";
import { useAppSelector } from "@/rtk/hooks";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const searchTerm = useAppSelector((state) => state.ui.searchTerm);
  const [industryFilter, setIndustryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        !searchTerm ||
        restaurant.info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.info.arabicName.includes(searchTerm) ||
        restaurant.owner.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIndustry =
        !industryFilter || restaurant.info.industry === industryFilter;
      const matchesStatus =
        !statusFilter || restaurant.status === statusFilter;

      return matchesSearch && matchesIndustry && matchesStatus;
    });
  }, [restaurants, searchTerm, industryFilter, statusFilter]);

  const handleDelete = (id: string) => {
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Restaurants</h1>
            <p className="text-muted-foreground mt-1">
              Manage all your restaurants in one place
            </p>
          </div>
          <Link href="/restaurants/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Restaurant
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <RestaurantFilters
          onIndustryChange={setIndustryFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Restaurants Table */}
        <RestaurantsTable
          restaurants={filteredRestaurants}
          onDelete={handleDelete}
        />
      </div>
    </MainLayout>
  );
}