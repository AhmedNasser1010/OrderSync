"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { RestaurantForm } from "@/components/forms/RestaurantForm";
import { useParams } from "next/navigation";
import { useFetchRestaurantDataQuery } from "@/rtk/api/firestoreApi";
import { Card } from "@/components/ui/card";

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

  return (
    <MainLayout>
      {isLoading || isFetching ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card className="p-8 text-muted-foreground">
            Loading business data...
          </Card>
        </div>
      ) : (
        <RestaurantForm initialData={restaurant} isNew={false} />
      )}
    </MainLayout>
  );
}
