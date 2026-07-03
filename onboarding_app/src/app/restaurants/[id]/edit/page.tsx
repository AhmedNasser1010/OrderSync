"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { RestaurantForm } from "@/components/forms/RestaurantForm";
import { useParams } from "next/navigation";
import { useFetchRestaurantDataQuery } from "@/rtk/api/firestoreApi";

export default function EditRestaurantPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: restaurant } = useFetchRestaurantDataQuery(id, {
    skip: !id,
  });

  return (
    <MainLayout>
      <RestaurantForm initialData={mapBusinessToRestaurant(restaurant)} isNew={false} />
    </MainLayout>
  );
}

function mapBusinessToRestaurant(business: any | undefined) {
  if (!business) return undefined;
  return {
    id: business.accessToken,
    owner: {
      name:
        `${business.owner?.basic?.fName ?? ""} ${business.owner?.basic?.lName ?? ""}`.trim() ||
        business.owner?.contact?.email ||
        "Unknown",
      email: business.owner?.contact?.email ?? "",
      phone: business.owner?.contact?.phone ?? "",
      userId: business.owner?.uid ?? "",
    },
    info: {
      name: business.business?.name ?? "",
      arabicName: business.business?.nameInAr ?? "",
      iconUrl: business.business?.icon ?? "",
      coverUrl: business.business?.cover ?? "",
      industry: business.business?.industry === "coffee-shop" ? "coffee-shop" : "restaurant",
      cuisines: business.business?.cuisines ?? [],
      address: {
        latitude: business.business?.latlng?.[0] ?? 0,
        longitude: business.business?.latlng?.[1] ?? 0,
      },
    },
    hours: Object.entries(business.services?.openingHours ?? {}).map(([day, value]) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      openTime: value?.start ?? "",
      closeTime: value?.end ?? "",
      closed: !(value?.start && value?.end),
    })),
    cookTime: {
      min: business.services?.cookTime?.[0] ?? 0,
      max: business.services?.cookTime?.[1] ?? 0,
    },
    settings: {
      assignOrdersToCook: !!business.settings?.orderManagement?.assign?.forCooks,
      assignOrdersToDelivery: !!business.settings?.orderManagement?.assign?.forDeliveryWorkers,
      automaticDeliveryAssignment: !!business.settings?.orderManagement?.driverAssignment,
      printInvoice: !!business.settings?.orderManagement?.printInvoice,
    },
    contact: {
      phoneNumbers: business.owner?.contact?.phone ? [business.owner.contact.phone] : [],
    },
    additional: {
      promotionalSubtitle: business.business?.promotionalSubtitle ?? "",
      closeMessage: business.settings?.siteControl?.closeMsg ?? "",
    },
    status: business.status === "inactive" ? "closed" : "open",
    lastUpdated:
      business.lastUpdate?.date && business.lastUpdate?.time
        ? new Date(`${business.lastUpdate.date}T${business.lastUpdate.time}`).toISOString()
        : new Date().toISOString(),
  };
}
