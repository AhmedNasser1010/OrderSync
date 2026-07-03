"use client";

import { Restaurant } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OwnerSection } from "./OwnerSection";
import { RestaurantInfoSection } from "./RestaurantInfoSection";
import { OpeningHoursSection } from "./OpeningHoursSection";
import { CuisinesSection } from "./CuisinesSection";
import { AddressSection } from "./AddressSection";
import { CookTimeSection } from "./CookTimeSection";
import { ContactNumbersSection } from "./ContactNumbersSection";
import { AdditionalInfoSection } from "./AdditionalInfoSection";
import { SettingsPanel } from "./SettingsPanel";
import { PreviewCard } from "./PreviewCard";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRestaurantForm } from "@/hooks/useRestaurantForm";

interface RestaurantFormProps {
  initialData?: Restaurant;
  isNew?: boolean;
}

export function RestaurantForm({
  initialData,
  isNew = true,
}: RestaurantFormProps) {
  const router = useRouter();
  const {
    formData,
    isSubmitting,
    updateFormData,
    updateNestedField,
    handleSubmit,
  } = useRestaurantForm(initialData);

  const handleSave = async () => {
    const success = await handleSubmit();
    if (success) {
      router.push("/restaurants");
    }
  };

  return (
    <div className="bg-background pt-4">
      {/* Page Header - Below main header */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/restaurants">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? "Create New Restaurant" : "Edit Restaurant"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Restaurant"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <OwnerSection
              data={formData.owner}
              onChange={(owner) => updateFormData({ owner })}
            />
            <RestaurantInfoSection
              data={formData.info}
              onChange={(info) => updateFormData({ info })}
            />
            <CuisinesSection
              cuisines={formData.info.cuisines}
              onChange={(cuisines) =>
                updateFormData({ info: { ...formData.info, cuisines } })
              }
            />
            <AddressSection
              data={formData.info.address}
              onChange={(address) =>
                updateFormData({ info: { ...formData.info, address } })
              }
            />
            <OpeningHoursSection
              hours={formData.hours}
              onChange={(hours) => updateFormData({ hours })}
            />
            <CookTimeSection
              data={formData.cookTime}
              onChange={(cookTime) => updateFormData({ cookTime })}
            />
            <ContactNumbersSection
              phoneNumbers={formData.contact.phoneNumbers}
              onChange={(phoneNumbers) =>
                updateFormData({ contact: { phoneNumbers } })
              }
            />
            <AdditionalInfoSection
              data={formData.additional}
              onChange={(additional) => updateFormData({ additional })}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <PreviewCard
              name={formData.info.name}
              arabicName={formData.info.arabicName}
              coverUrl={formData.info.coverUrl}
              industry={formData.info.industry}
            />
            <SettingsPanel
              settings={formData.settings}
              onChange={(settings) => updateFormData({ settings })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
