"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { RestaurantForm } from "@/components/forms/RestaurantForm";
import { mockRestaurants } from "@/lib/mock-data";
import { useParams } from "next/navigation";

export default function EditRestaurantPage() {
  const params = useParams();
  const id = params.id as string;
  const restaurant = mockRestaurants.find((r) => r.id === id);

  return (
    <MainLayout>
      <RestaurantForm initialData={restaurant} isNew={false} />
    </MainLayout>
  );
}
