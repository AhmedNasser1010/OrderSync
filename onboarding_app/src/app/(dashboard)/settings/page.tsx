"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useFetchServicesQuery,
  useUpdateServicesMutation,
} from "@/rtk/api/firestoreApi";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertCircle,
  Loader2,
  Save,
  Truck,
} from "lucide-react";

const DEFAULT_DELIVERY_FEES_PER_KM = 3.5;
const DEFAULT_MIN_DELIVERY_FEES = 5;

export default function SettingsPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useFetchServicesQuery();
  const [updateServices] = useUpdateServicesMutation();

  const [deliveryFeesPerKm, setDeliveryFeesPerKm] = useState<number | null>(
    null
  );
  const [minDeliveryFees, setMinDeliveryFees] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const feesPerKm =
    deliveryFeesPerKm ??
    data?.deliveryFeesPerKm ??
    DEFAULT_DELIVERY_FEES_PER_KM;
  const minFees =
    minDeliveryFees ?? data?.minDeliveryFees ?? DEFAULT_MIN_DELIVERY_FEES;

  const handleSave = async () => {
    if (isSaving) return;

    const perKm = Number(deliveryFeesPerKm);
    const min = Number(minDeliveryFees);
    if (Number.isNaN(perKm) || perKm < 0) {
      setSaveError("Delivery fee per km must be a positive number.");
      return;
    }
    if (Number.isNaN(min) || min < 0) {
      setSaveError("Minimum delivery fee must be a positive number.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      await updateServices({
        updates: {
          deliveryFeesPerKm: perKm,
          minDeliveryFees: min,
          updatedBy: user?.uid,
        },
      }).unwrap();
      setSaved(true);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to save settings.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Platform Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure global delivery pricing used by the customer app and
          validated on every order. Restaurant commission is set per
          restaurant on each restaurant&apos;s edit page.
        </p>
      </div>

      {isLoading ? (
        <Card className="p-12 bg-card border-border text-center text-muted-foreground">
          Loading settings...
        </Card>
      ) : isError ? (
        <Card className="p-12 bg-card border-border text-center text-destructive">
          Failed to load settings.
        </Card>
      ) : (
        <Card className="p-6 bg-card border-border space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Delivery Fees
              </h2>
              <p className="text-sm text-muted-foreground">
                Delivery fee = rate per km × distance, with a minimum fee.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="delivery-fees-per-km">
                Delivery fee per km (EGP)
              </Label>
              <Input
                id="delivery-fees-per-km"
                type="number"
                step="0.1"
                min="0"
                value={feesPerKm}
                onChange={(e) =>
                  setDeliveryFeesPerKm(
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="min-delivery-fees">
                Minimum delivery fee (EGP)
              </Label>
              <Input
                id="min-delivery-fees"
                type="number"
                step="0.5"
                min="0"
                value={minFees}
                onChange={(e) =>
                  setMinDeliveryFees(
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                className="mt-1.5"
              />
            </div>
          </div>

          {saveError && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {saveError}
            </p>
          )}

          {saved && (
            <p className="text-sm text-emerald-600">
              Settings saved successfully.
            </p>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
