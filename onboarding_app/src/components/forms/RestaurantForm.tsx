"use client";

import type { BusinessDocument } from "@ordersync/types";
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
import { useCallback } from "react";

interface RestaurantFormProps {
  initialData?: BusinessDocument;
  isNew?: boolean;
}

export function RestaurantForm({
  initialData,
  isNew = true,
}: RestaurantFormProps) {
  const router = useRouter();
  const {
    formData,
    phoneNumbers,
    isSubmitting,
    updateFormData,
    setPhoneNumbers,
    handleSubmit,
  } = useRestaurantForm(initialData);

  const handleSave = async () => {
    const success = await handleSubmit();
    if (success) {
      router.push("/restaurants");
    }
  };

  const handleAdditionalChange = useCallback(
    (data: { promotionalSubtitle: string; closeMsg: string }) => {
      updateFormData({
        business: { ...formData.business, promotionalSubtitle: data.promotionalSubtitle },
      });
      updateFormData({
        settings: {
          ...formData.settings,
          siteControl: { ...formData.settings.siteControl, closeMsg: data.closeMsg },
        },
      });
    },
    [formData.business, formData.settings, updateFormData],
  );

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
              data={{
                name: formData.business.name,
                nameInAr: formData.business.nameInAr,
                icon: formData.business.icon,
                cover: formData.business.cover,
                industry: formData.business.industry,
                cuisines: formData.business.cuisines,
              }}
              onChange={(info) =>
                updateFormData({
                  business: {
                    ...formData.business,
                    ...info,
                  },
                })
              }
            />
            <CuisinesSection
              cuisines={formData.business.cuisines}
              onChange={(cuisines) =>
                updateFormData({
                  business: { ...formData.business, cuisines },
                })
              }
            />
            <AddressSection
              data={{
                address: formData.business.address,
                latitude: formData.business.latlng[0],
                longitude: formData.business.latlng[1],
              }}
              onChange={({ address, latitude, longitude }) =>
                updateFormData({
                  business: {
                    ...formData.business,
                    address,
                    latlng: [latitude, longitude],
                  },
                })
              }
            />
            <OpeningHoursSection
              hours={formData.services.openingHours}
              onChange={(openingHours) =>
                updateFormData({
                  services: { ...formData.services, openingHours },
                })
              }
            />
            <CookTimeSection
              data={formData.services.cookTime}
              onChange={(cookTime) =>
                updateFormData({
                  services: { ...formData.services, cookTime },
                })
              }
            />
            <ContactNumbersSection
              phoneNumbers={phoneNumbers}
              onChange={setPhoneNumbers}
            />
            <AdditionalInfoSection
              data={{
                promotionalSubtitle: formData.business.promotionalSubtitle,
                closeMsg: formData.settings.siteControl.closeMsg,
              }}
              onChange={handleAdditionalChange}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <PreviewCard
              name={formData.business.name}
              nameInAr={formData.business.nameInAr}
              cover={formData.business.cover}
              industry={formData.business.industry}
            />
            <SettingsPanel
              settings={formData.settings.orderManagement}
              topChains={formData.topChains}
              onChange={(orderManagement) =>
                updateFormData({
                  settings: {
                    ...formData.settings,
                    orderManagement,
                  },
                })
              }
              onTopChainsChange={(value) =>
                updateFormData({ topChains: value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
