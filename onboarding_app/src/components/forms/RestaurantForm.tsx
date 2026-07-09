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
        branding: { ...formData.branding, ...data },
      });
    },
    [formData.branding, updateFormData],
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
                name: formData.profile.name,
                nameInAr: formData.profile.nameInAr,
                icon: formData.branding.icon,
                cover: formData.branding.cover,
                industry: formData.profile.industry,
                cuisines: formData.profile.cuisines,
              }}
              onChange={(info) => {
                updateFormData({
                  profile: {
                    name: info.name,
                    nameInAr: info.nameInAr,
                    industry: info.industry,
                    address: formData.profile.address,
                    latlng: formData.profile.latlng,
                    cuisines: info.cuisines,
                  },
                });
                updateFormData({
                  branding: {
                    ...formData.branding,
                    icon: info.icon,
                    cover: info.cover,
                  },
                });
              }}
            />
            <CuisinesSection
              cuisines={formData.profile.cuisines}
              onChange={(cuisines) =>
                updateFormData({
                  profile: { ...formData.profile, cuisines },
                })
              }
            />
            <AddressSection
              data={{
                address: formData.profile.address,
                latitude: formData.profile.latlng[0],
                longitude: formData.profile.latlng[1],
              }}
              onChange={({ address, latitude, longitude }) =>
                updateFormData({
                  profile: {
                    ...formData.profile,
                    address,
                    latlng: [latitude, longitude],
                  },
                })
              }
            />
            <OpeningHoursSection
              hours={formData.operations.openingHours}
              onChange={(openingHours) =>
                updateFormData({
                  operations: { ...formData.operations, openingHours },
                })
              }
            />
            <CookTimeSection
              data={formData.operations.cookTime}
              onChange={(cookTime) =>
                updateFormData({
                  operations: { ...formData.operations, cookTime },
                })
              }
            />
            <ContactNumbersSection
              phoneNumbers={phoneNumbers}
              onChange={setPhoneNumbers}
            />
            <AdditionalInfoSection
              data={{
                promotionalSubtitle: formData.branding.promotionalSubtitle,
                closeMsg: formData.branding.closeMsg,
              }}
              onChange={handleAdditionalChange}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <PreviewCard
              name={formData.profile.name}
              nameInAr={formData.profile.nameInAr}
              cover={formData.branding.cover}
              industry={formData.profile.industry}
            />
            <SettingsPanel
              settings={{
                printInvoice: formData.settings.printInvoice,
              }}
              topChains={formData.topChains}
              onChange={(settings) =>
                updateFormData({
                  settings,
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
