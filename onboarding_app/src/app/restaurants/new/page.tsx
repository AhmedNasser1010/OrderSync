"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { RestaurantForm } from "@/components/forms/RestaurantForm";

export default function NewRestaurantPage() {
  return (
    <MainLayout>
      <RestaurantForm isNew={true} />
    </MainLayout>
  );
}
