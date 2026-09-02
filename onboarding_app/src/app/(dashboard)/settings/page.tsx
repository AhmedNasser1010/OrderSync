"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useFetchServicesQuery,
  useUpdateServicesMutation,
} from "@/rtk/api/firestoreApi";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertCircle,
  BadgePercent,
  Loader2,
  MapPinned,
  Save,
  Truck,
  Wrench,
} from "lucide-react";
import type { CashbackConfig } from "@ordersync/types";

const DEFAULT_DELIVERY_FEES_PER_KM = 3.5;
const DEFAULT_MIN_DELIVERY_FEES = 5;
const DEFAULT_MAX_WORK_DISTANCE_KM = 15;

export default function SettingsPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useFetchServicesQuery();
  const [updateServices] = useUpdateServicesMutation();

  const [deliveryFeesPerKm, setDeliveryFeesPerKm] = useState<number | null>(
    null
  );
  const [minDeliveryFees, setMinDeliveryFees] = useState<number | null>(null);
  const [maxWorkDistanceKm, setMaxWorkDistanceKm] = useState<number | null>(
    null
  );
  const [cashbackEnabled, setCashbackEnabled] = useState<boolean | null>(null);
  const [cashbackPercent, setCashbackPercent] = useState<number | null>(null);
  const [cashbackWipeDays, setCashbackWipeDays] = useState<number | null>(null);
  const [cashbackThreshold, setCashbackThreshold] = useState<number | null>(
    null
  );
  const [cashbackMaxPerTx, setCashbackMaxPerTx] = useState<number | null>(null);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState<boolean | null>(
    null
  );
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(
    null
  );
  const [maintenanceEta, setMaintenanceEta] = useState<string | null>(null);
  const [confirmMaintenanceDialog, setConfirmMaintenanceDialog] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const feesPerKm =
    deliveryFeesPerKm ??
    data?.deliveryFeesPerKm ??
    DEFAULT_DELIVERY_FEES_PER_KM;
  const minFees =
    minDeliveryFees ?? data?.minDeliveryFees ?? DEFAULT_MIN_DELIVERY_FEES;
  const maxDistanceKm =
    maxWorkDistanceKm ??
    data?.maxWorkDistanceKm ??
    DEFAULT_MAX_WORK_DISTANCE_KM;
  const cbEnabled = cashbackEnabled ?? data?.cashback?.enabled ?? false;
  const cbPercent = cashbackPercent ?? data?.cashback?.cashbackPercent ?? 0;
  const cbWipeDays = cashbackWipeDays ?? data?.cashback?.wipeDays ?? 90;
  const cbThreshold =
    cashbackThreshold ?? data?.cashback?.redemptionThreshold ?? 0;
  const cbMaxPerTx =
    cashbackMaxPerTx ?? data?.cashback?.maxCashbackPerTx ?? 0;
  const maintenanceOn = maintenanceEnabled ?? data?.maintenance?.enabled ?? false;
  const maintenanceMessageValue =
    maintenanceMessage ?? data?.maintenance?.message ?? "";
  const maintenanceEtaValue = maintenanceEta ?? data?.maintenance?.eta ?? "";

  const handleSave = async () => {
    if (isSaving) return;

    const perKm = Number(feesPerKm);
    const min = Number(minFees);
    const maxKm = Number(maxDistanceKm);
    if (Number.isNaN(perKm) || perKm < 0) {
      setSaveError("Delivery fee per km must be a positive number.");
      return;
    }
    if (Number.isNaN(min) || min < 0) {
      setSaveError("Minimum delivery fee must be a positive number.");
      return;
    }
    if (Number.isNaN(maxKm) || maxKm <= 0) {
      setSaveError("Max work distance must be greater than zero.");
      return;
    }
    const cb: CashbackConfig = {
      enabled: cbEnabled,
      cashbackPercent: Number(cbPercent),
      wipeDays: Number(cbWipeDays),
      redemptionThreshold: Number(cbThreshold),
      maxCashbackPerTx: Number(cbMaxPerTx),
    };
    if (cb.cashbackPercent < 0 || cb.cashbackPercent > 100) {
      setSaveError("Cash back percentage must be between 0 and 100.");
      return;
    }
    if (Number.isNaN(cb.wipeDays) || cb.wipeDays <= 0) {
      setSaveError("Wipe (expiry) days must be greater than zero.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaved(false);

    const maintenance: {
      enabled: boolean;
      message?: string | null;
      eta?: string | null;
    } = { enabled: maintenanceOn };
    const trimmedMessage = maintenanceMessageValue.trim();
    const trimmedEta = maintenanceEtaValue.trim();
    maintenance.message = trimmedMessage || null;
    maintenance.eta = trimmedEta || null;

    try {
      await updateServices({
        updates: {
          deliveryFeesPerKm: perKm,
          minDeliveryFees: min,
          maxWorkDistanceKm: maxKm,
          cashback: cb,
          maintenance,
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

  const handleToggleMaintenance = (value: boolean) => {
    if (value && !maintenanceOn) {
      setConfirmMaintenanceDialog(true);
      return;
    }
    setMaintenanceEnabled(value);
  };

  const confirmEnableMaintenance = () => {
    setMaintenanceEnabled(true);
    setConfirmMaintenanceDialog(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Platform Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure global delivery pricing and the maximum delivery range
          used by the customer app and validated on every order. Restaurant
          commission is set per restaurant on each restaurant&apos;s edit
          page.
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

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPinned className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Max Work Distance
                </h2>
                <p className="text-sm text-muted-foreground">
                  Orders delivered farther than this straight-line distance
                  from the restaurant are rejected at checkout.
                </p>
              </div>
            </div>

            <div className="max-w-xs">
              <Label htmlFor="max-work-distance-km">
                Max work distance (km)
              </Label>
              <Input
                id="max-work-distance-km"
                type="number"
                step="1"
                min="1"
                value={maxDistanceKm}
                onChange={(e) =>
                  setMaxWorkDistanceKm(
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

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  maintenanceOn
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Maintenance Mode
                </h2>
                <p className="text-sm text-muted-foreground">
                  Put the entire customer app into maintenance. It becomes
                  non-interactive and shows an apology message, useful during
                  planned maintenance or upgrades.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label
                  htmlFor="maintenance-enabled"
                  className="text-sm font-medium"
                >
                  Enable maintenance mode
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {maintenanceOn
                    ? "Customers will see the maintenance page and cannot place orders."
                    : "Customers can browse and order normally."}
                </p>
              </div>
              <Switch
                id="maintenance-enabled"
                checked={maintenanceOn}
                onCheckedChange={handleToggleMaintenance}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="maintenance-message">
                  Message to customers (optional)
                </Label>
                <Textarea
                  id="maintenance-message"
                  value={maintenanceMessageValue}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="e.g. We are upgrading our systems and will be back very soon."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="maintenance-eta">
                  Expected back (date, optional)
                </Label>
                <Input
                  id="maintenance-eta"
                  type="date"
                  value={maintenanceEtaValue}
                  onChange={(e) => setMaintenanceEta(e.target.value)}
                  className="mt-1.5 max-w-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BadgePercent className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Cash Back Engine
                </h2>
                <p className="text-sm text-muted-foreground">
                  Reward customers with global cash back on qualifying
                  purchases, configure credit expiration, and set redemption
                  limits.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="cashback-enabled"
                type="checkbox"
                checked={cbEnabled}
                onChange={(e) => setCashbackEnabled(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="cashback-enabled" className="!mt-0">
                Enable cash back
              </Label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cashback-percent">
                  Cash back percentage (%)
                </Label>
                <Input
                  id="cashback-percent"
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={cbPercent}
                  onChange={(e) =>
                    setCashbackPercent(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  className="mt-1.5"
                  disabled={!cbEnabled}
                />
              </div>
              <div>
                <Label htmlFor="cashback-wipe-days">
                  Credit expiry (days)
                </Label>
                <Input
                  id="cashback-wipe-days"
                  type="number"
                  step="1"
                  min="1"
                  value={cbWipeDays}
                  onChange={(e) =>
                    setCashbackWipeDays(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  className="mt-1.5"
                  disabled={!cbEnabled}
                />
              </div>
              <div>
                <Label htmlFor="cashback-threshold">
                  Min cart to redeem (EGP)
                </Label>
                <Input
                  id="cashback-threshold"
                  type="number"
                  step="1"
                  min="0"
                  value={cbThreshold}
                  onChange={(e) =>
                    setCashbackThreshold(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  className="mt-1.5"
                  disabled={!cbEnabled}
                />
              </div>
              <div>
                <Label htmlFor="cashback-max-per-tx">
                  Max cash back per transaction (EGP)
                </Label>
                <Input
                  id="cashback-max-per-tx"
                  type="number"
                  step="1"
                  min="0"
                  value={cbMaxPerTx}
                  onChange={(e) =>
                    setCashbackMaxPerTx(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  className="mt-1.5"
                  disabled={!cbEnabled}
                />
              </div>
            </div>
          </div>

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

      <Dialog
        open={confirmMaintenanceDialog}
        onOpenChange={setConfirmMaintenanceDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Enable Maintenance Mode?</DialogTitle>
                <DialogDescription className="mt-1">
                  This will immediately disable the entire customer app. All
                  visitors will see a maintenance page and will not be able to
                  browse the menu or place orders.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setConfirmMaintenanceDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmEnableMaintenance}>
              Enable Maintenance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
