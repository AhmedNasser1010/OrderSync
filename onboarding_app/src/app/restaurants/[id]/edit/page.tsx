"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { RestaurantForm } from "@/components/forms/RestaurantForm";
import { useParams } from "next/navigation";
import {
  useFetchRestaurantDataQuery,
  type BusinessDocument,
} from "@/rtk/api/firestoreApi";
import { Card } from "@/components/ui/card";
import type { Restaurant } from "@/lib/mock-data";

export default function EditRestaurantPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    data: restaurant,
    isLoading,
    isFetching,
  } = useFetchRestaurantDataQuery(id, {
    skip: !id,
  });

  const initialData = mapBusinessToRestaurant(restaurant);

  return (
    <MainLayout>
      {isLoading || isFetching ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card className="p-8 text-muted-foreground">
            Loading business data...
          </Card>
        </div>
      ) : (
        <RestaurantForm initialData={initialData} isNew={false} />
      )}
    </MainLayout>
  );
}

function mapBusinessToRestaurant(
  business: BusinessDocument | undefined,
): Restaurant | undefined {
  if (!business) return undefined;

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
  const status: Restaurant["status"] =
    business.status === "inactive"
      ? "inactive"
      : business.status === "busy"
        ? "busy"
        : business.status === "pause"
          ? "pause"
          : "active";

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
      ([day, value]) => {
        const schedule = value as { start?: string; end?: string } | undefined;
        return {
          day: (day.charAt(0).toUpperCase() +
            day.slice(1)) as Restaurant["hours"][number]["day"],
          openTime: schedule?.start ?? "",
          closeTime: schedule?.end ?? "",
          closed: !(schedule?.start && schedule?.end),
        };
      },
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
    status,
    lastUpdated:
      business.lastUpdate?.date && business.lastUpdate?.time
        ? new Date(
            `${business.lastUpdate.date}T${business.lastUpdate.time}`,
          ).toISOString()
        : new Date().toISOString(),
  };
}
