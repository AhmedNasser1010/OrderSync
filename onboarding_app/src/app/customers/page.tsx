"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CustomersTable } from "@/components/dashboard/CustomersTable";
import { CustomerFilters } from "@/components/dashboard/CustomerFilters";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useFetchCustomersQuery } from "@/rtk/api/firestoreApi";
import { subDays, subYears } from "date-fns";
import type { ExportColumn } from "@/lib/export-utils";

const COOLDOWN_DURATION = 5;

const customerColumns: ExportColumn[] = [
  { header: "UID", accessor: "uid" },
  { header: "Name", accessor: "userInfo.name" },
  { header: "Email", accessor: "userInfo.email" },
  { header: "Phone", accessor: "userInfo.phone" },
  { header: "Second Phone", accessor: "userInfo.secondPhone" },
  { header: "Avatar", accessor: "userInfo.avatar" },
  { header: "City", accessor: "locations.city" },
  { header: "Home Address", accessor: "locations.home.address" },
  { header: "Home Latitude", accessor: "locations.home.latlang[0]" },
  { header: "Home Longitude", accessor: "locations.home.latlang[1]" },
  { header: "Is Active", accessor: "isActive" },
  { header: "Is First Order", accessor: "referral.isFirstOrder" },
  { header: "Referred By", accessor: "referral.referredBy" },
  { header: "Total Restaurants", accessor: "restaurants.length" },
  { header: "Created At", accessor: "createdAt" },
  { header: "Updated At", accessor: "updatedAt" },
];

function getDateRangeMs(dateRange: string): number | null {
  const now = Date.now();
  switch (dateRange) {
    case "7d":
      return now - subDays(now, 7).getTime();
    case "30d":
      return now - subDays(now, 30).getTime();
    case "90d":
      return now - subDays(now, 90).getTime();
    case "1y":
      return now - subYears(now, 1).getTime();
    default:
      return null;
  }
}

export default function CustomersPage() {
  const authUser = useAuth().user;
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [dateRange, setDateRange] = useState("all");

  const {
    data: allCustomers = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useFetchCustomersQuery(authUser?.uid ?? "", {
    skip: !authUser?.uid,
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

  // Client-side filtering
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter((customer) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        customer.userInfo?.name?.toLowerCase().includes(searchLower) ||
        customer.userInfo?.email?.toLowerCase().includes(searchLower) ||
        customer.userInfo?.phone?.includes(search);

      const matchesCity =
        !city || city === "all" || customer.locations?.city === city;

      const dateRangeMs = getDateRangeMs(dateRange);
      const matchesDate =
        !dateRangeMs ||
        (customer.createdAt && customer.createdAt >= dateRangeMs);

      return matchesSearch && matchesCity && matchesDate;
    });
  }, [allCustomers, search, city, dateRange]);

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your customers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton
              data={filteredCustomers as unknown as Record<string, unknown>[]}
              columns={customerColumns}
              filename="customers"
              sheetName="Customers"
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
        <CustomerFilters
          customers={allCustomers}
          onSearchChange={setSearch}
          onCityChange={setCity}
          onDateRangeChange={setDateRange}
        />

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredCustomers.length} of {allCustomers.length} customers
        </div>

        {/* Customers Table */}
        <CustomersTable
          customers={filteredCustomers}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </MainLayout>
  );
}
