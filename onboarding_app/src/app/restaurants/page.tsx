"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { RestaurantsTable } from "@/components/dashboard/RestaurantsTable";
import { RestaurantFilters } from "@/components/dashboard/RestaurantFilters";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/rtk/hooks";
import { selectUser } from "@/rtk/slices/authSlice";
import {
  useFetchUserDataQuery,
  useFetchBusinessesQuery,
  useDeleteBusinessMutation,
} from "@/rtk/api/firestoreApi";
import type { BusinessDocument } from "@/rtk/api/firestoreApi";
import type { Restaurant } from "@/lib/mock-data";

const COOLDOWN_DURATION = 5; // seconds

export default function RestaurantsPage() {
  const searchTerm = useAppSelector((state) => state.ui.searchTerm);
  const authUser = useAppSelector(selectUser);
  const [industryFilter, setIndustryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
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
    skip: !userData?.data?.businesses?.length,
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

  const restaurants = useMemo(
    () => businesses.map(mapBusinessToRestaurant),
    [businesses],
  );

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        !searchTerm ||
        restaurant.info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.info.arabicName.includes(searchTerm) ||
        restaurant.owner.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIndustry =
        !industryFilter || restaurant.info.industry === industryFilter;
      const matchesStatus = !statusFilter || restaurant.status === statusFilter;

      return matchesSearch && matchesIndustry && matchesStatus;
    });
  }, [restaurants, searchTerm, industryFilter, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!authUser) return;
    await deleteBusiness({ accessToken: id, userUid: authUser.uid }).unwrap();
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
          <div className="flex items-center gap-2">
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
          onIndustryChange={setIndustryFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Restaurants Table */}
        <RestaurantsTable
          restaurants={filteredRestaurants}
          onDelete={handleDelete}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </MainLayout>
  );
}

function mapBusinessToRestaurant(business: BusinessDocument): Restaurant {
  const owner = business.owner ?? {};
  const ownerName =
    [owner?.basic?.fName, owner?.basic?.lName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    owner?.name ||
    owner?.contact?.name ||
    "";
  const ownerEmail = owner?.email || owner?.contact?.email || "";
  const ownerPhone = owner?.phone || owner?.contact?.phone || "";
  const industry: Restaurant["info"]["industry"] =
    business.business?.industry === "coffee-shop"
      ? "coffee-shop"
      : "restaurant";

  return {
    id: business.accessToken,
    owner: {
      name: ownerName || ownerEmail || "Unknown",
      email: ownerEmail,
      phone: ownerPhone,
      userId: owner?.uid ?? "",
    },
    info: {
      name: business.business?.name ?? "",
      arabicName: business.business?.nameInAr ?? "",
      iconUrl: business.business?.icon ?? "",
      coverUrl: business.business?.cover ?? "",
      industry,
      cuisines: business.business?.cuisines ?? [],
      address: {
        latitude: business.business?.latlng?.[0] ?? 0,
        longitude: business.business?.latlng?.[1] ?? 0,
      },
    },
    hours: Object.entries(business.services?.openingHours ?? {}).map(
      ([day, value]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        openTime: value?.start ?? "",
        closeTime: value?.end ?? "",
        closed: !(value?.start && value?.end),
      }),
    ) as Restaurant["hours"],
    cookTime: {
      min: business.services?.cookTime?.[0] ?? 0,
      max: business.services?.cookTime?.[1] ?? 0,
    },
    settings: {
      assignOrdersToCook:
        !!business.settings?.orderManagement?.assign?.forCooks,
      assignOrdersToDelivery:
        !!business.settings?.orderManagement?.assign?.forDeliveryWorkers,
      automaticDeliveryAssignment:
        !!business.settings?.orderManagement?.driverAssignment,
      printInvoice: !!business.settings?.orderManagement?.printInvoice,
    },
    contact: {
      phoneNumbers: ownerPhone ? [ownerPhone] : [],
    },
    additional: {
      promotionalSubtitle: business.business?.promotionalSubtitle ?? "",
      closeMessage: business.settings?.siteControl?.closeMsg ?? "",
    },
    status: business.settings?.siteControl?.status || "inactive",
    lastUpdated:
      business.lastUpdate?.date && business.lastUpdate?.time
        ? new Date(
            `${business.lastUpdate.date}T${business.lastUpdate.time}`,
          ).toISOString()
        : new Date().toISOString(),
  };
}
