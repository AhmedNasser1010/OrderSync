"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { RestaurantsTable } from "@/components/dashboard/RestaurantsTable";
import { RestaurantFilters } from "@/components/dashboard/RestaurantFilters";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/rtk/hooks";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFetchUserDataQuery,
  useFetchBusinessesQuery,
  useDeleteBusinessMutation,
} from "@/rtk/api/firestoreApi";
import type { ExportColumn } from "@/lib/export-utils";

const COOLDOWN_DURATION = 5;
const PAGE_SIZE = 15;

const restaurantColumns: ExportColumn[] = [
  { header: "Access Token", accessor: "accessToken" },
  { header: "Name", accessor: "profile.name" },
  { header: "Name (Arabic)", accessor: "profile.nameInAr" },
  { header: "Industry", accessor: "profile.industry" },
  { header: "Address", accessor: "profile.address" },
  { header: "Status", accessor: "status" },
  { header: "Owner Name", accessor: "owner.name" },
  { header: "Owner Email", accessor: "owner.email" },
  { header: "Owner Phone", accessor: "owner.phone" },
  { header: "Cuisines", accessor: "profile.cuisines" },
  { header: "Print Invoice", accessor: "settings.printInvoice" },
  { header: "Average Rating", accessor: "reviewSummary.averageRating" },
  { header: "Total Reviews", accessor: "reviewSummary.totalReviews" },
  { header: "Created At", accessor: "createdAt" },
  { header: "Updated At", accessor: "updatedAt" },
];

export default function RestaurantsPage() {
  const searchTerm = useAppSelector((state) => state.ui.searchTerm);
  const authUser = useAuth().user;
  const [industryFilter, setIndustryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: userData } = useFetchUserDataQuery(authUser?.uid ?? "", {
    skip: !authUser?.uid,
  });
  const {
    data: businesses = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useFetchBusinessesQuery(userData?.data?.businesses, {
    skip: !userData?.data?.businesses,
  });

  const handleRefetch = useCallback(() => {
    if (cooldown > 0 || isFetching) return;
    refetch();
    setCooldown(COOLDOWN_DURATION);
  }, [cooldown, isFetching, refetch]);

  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
      return;
    }
    if (!cooldownRef.current) {
      cooldownRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (cooldownRef.current) {
              clearInterval(cooldownRef.current);
              cooldownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
  }, [cooldown]);
  const [deleteBusiness] = useDeleteBusinessMutation();

  const handleIndustryChange = useCallback((value: string) => {
    setIndustryFilter(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);
  if (prevSearchTerm !== searchTerm) {
    setPrevSearchTerm(searchTerm);
    setPage(1);
  }

  const filteredRestaurants = useMemo(() => {
    return businesses.filter((restaurant) => {
      const matchesSearch =
        !searchTerm ||
        restaurant.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.profile.nameInAr.includes(searchTerm) ||
        (restaurant.owner.name ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIndustry =
        !industryFilter || restaurant.profile.industry === industryFilter;
      const matchesStatus = !statusFilter || restaurant.status === statusFilter;

      return matchesSearch && matchesIndustry && matchesStatus;
    });
  }, [businesses, searchTerm, industryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredRestaurants.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const paginatedRestaurants = filteredRestaurants.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleDelete = async (accessToken: string) => {
    if (!authUser) return;
    const idToken = await authUser.getIdToken();
    await deleteBusiness({ accessToken, userUid: authUser.uid, idToken }).unwrap();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Restaurants</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your restaurants in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={filteredRestaurants as unknown as Record<string, unknown>[]}
            columns={restaurantColumns}
            filename="restaurants"
            sheetName="Restaurants"
          />
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleRefetch}
            disabled={cooldown > 0 || isFetching}
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            {isFetching
              ? "Refetching..."
              : cooldown > 0
                ? `Refetch (${cooldown}s)`
                : "Refetch"}
          </Button>
          <Link href="/restaurants/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Restaurant
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <RestaurantFilters
        onIndustryChange={handleIndustryChange}
        onStatusChange={handleStatusChange}
      />

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredRestaurants.length} of {businesses.length} restaurants
      </div>

      {/* Restaurants Table */}
      <RestaurantsTable
        restaurants={paginatedRestaurants}
        onDelete={handleDelete}
        isLoading={isLoading}
        isError={isError}
      />

      {/* Pagination */}
      {filteredRestaurants.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filteredRestaurants.length)} of{" "}
            {filteredRestaurants.length} restaurants
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
