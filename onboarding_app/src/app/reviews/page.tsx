"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ReviewsTable } from "@/components/dashboard/ReviewsTable";
import { ReviewsFilters } from "@/components/dashboard/ReviewsFilters";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFetchUserDataQuery,
  useFetchBusinessesQuery,
  useFetchReviewsQuery,
  useFetchCustomersQuery,
} from "@/rtk/api/firestoreApi";
import type { ExportColumn } from "@/lib/export-utils";

const COOLDOWN_DURATION = 5;
const PAGE_SIZE = 15;
const FETCH_LIMIT = 100;

const reviewColumns: ExportColumn[] = [
  { header: "Order ID", accessor: "orderId" },
  { header: "Customer ID", accessor: "customerId" },
  { header: "Customer Name", accessor: "customerName" },
  { header: "Restaurant ID", accessor: "restaurantId" },
  { header: "Restaurant Name", accessor: "restaurantName" },
  { header: "Rating", accessor: "rating" },
  { header: "Comment", accessor: "comment" },
  { header: "Created At", accessor: "createdAt" },
  { header: "Updated At", accessor: "updatedAt" },
];

export default function ReviewsPage() {
  const authUser = useAuth().user;
  const [ratingFilter, setRatingFilter] = useState("all");
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: userData } = useFetchUserDataQuery(authUser?.uid ?? "", {
    skip: !authUser?.uid,
  });

  const { data: businesses = [] } = useFetchBusinessesQuery(
    userData?.data?.businesses,
    { skip: !userData?.data?.businesses },
  );

  const { data: customers = [] } = useFetchCustomersQuery(
    authUser?.uid ?? "",
    { skip: !authUser?.uid },
  );

  const customerNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of customers) {
      map[c.uid] = c.userInfo?.name || c.userInfo?.email?.split("@")[0] || "";
    }
    return map;
  }, [customers]);

  const restaurantNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const biz of businesses) {
      map[biz.accessToken] = biz.profile.name;
    }
    return map;
  }, [businesses]);

  const {
    data: allReviews = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useFetchReviewsQuery(
    { partnerUid: authUser?.uid ?? "", fetchLimit: FETCH_LIMIT },
    { skip: !authUser?.uid },
  );

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

  const handleRatingChange = useCallback((value: string) => {
    setRatingFilter(value);
    setPage(1);
  }, []);

  const handleRestaurantChange = useCallback((value: string) => {
    setRestaurantFilter(value);
    setPage(1);
  }, []);

  const handleDateRangeChange = useCallback((value: string) => {
    setDateRange(value);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const filteredReviews = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- Date.now() is safe here for time-based filtering
    const now = Date.now();
    const msPerDay = 86400000;

    return allReviews.filter((review) => {
      const matchesRating =
        ratingFilter === "all" || review.rating === Number(ratingFilter);

      const matchesRestaurant =
        restaurantFilter === "all" ||
        review.restaurantId === restaurantFilter;

      const matchesDate =
        dateRange === "all" ||
        now - review.createdAt <= Number(dateRange) * msPerDay;

      const matchesSearch =
        !searchQuery ||
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRating && matchesRestaurant && matchesDate && matchesSearch;
    });
  }, [allReviews, ratingFilter, restaurantFilter, dateRange, searchQuery]);

  const totalPages = Math.ceil(filteredReviews.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const paginatedReviews = filteredReviews.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const exportData = useMemo(() => {
    return filteredReviews.map((review) => ({
      ...review,
      customerName: customerNameMap[review.customerId] || "",
      restaurantName: restaurantNameMap[review.restaurantId] || "",
    }));
  }, [filteredReviews, customerNameMap, restaurantNameMap]);

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Customer Reviews
            </h1>
            <p className="text-muted-foreground mt-1">
              View all customer feedback across your restaurants
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton
              data={exportData as unknown as Record<string, unknown>[]}
              columns={reviewColumns}
              filename="reviews"
              sheetName="Reviews"
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
          </div>
        </div>

        {/* Filters */}
        <ReviewsFilters
          restaurants={businesses}
          ratingFilter={ratingFilter}
          restaurantFilter={restaurantFilter}
          dateRange={dateRange}
          searchQuery={searchQuery}
          onRatingChange={handleRatingChange}
          onRestaurantChange={handleRestaurantChange}
          onDateRangeChange={handleDateRangeChange}
          onSearchChange={handleSearchChange}
        />

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredReviews.length} of {allReviews.length} reviews
        </div>

        {/* Reviews Table */}
        <ReviewsTable
          reviews={paginatedReviews}
          customerNameMap={customerNameMap}
          restaurantNameMap={restaurantNameMap}
          isLoading={isLoading}
          isError={isError}
        />

        {/* Pagination */}
        {filteredReviews.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filteredReviews.length)} of{" "}
              {filteredReviews.length} reviews
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
    </MainLayout>
  );
}
