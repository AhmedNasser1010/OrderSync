"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SettingsPanelProps {
  settings: {
    printInvoice: boolean;
    allowMarkComplete?: boolean;
    enableLiveTrackingMap?: boolean;
  };
  topChains: boolean;
  commissionPercent: number | "";
  commissionError?: string;
  onCommissionPercentChange: (value: number | "") => void;
  onChange: (settings: {
    printInvoice: boolean;
    allowMarkComplete?: boolean;
    enableLiveTrackingMap?: boolean;
  }) => void;
  onTopChainsChange: (value: boolean) => void;
}

export function SettingsPanel({
  settings,
  topChains,
  commissionPercent,
  commissionError,
  onCommissionPercentChange,
  onChange,
  onTopChainsChange,
}: SettingsPanelProps) {
  const handleChange = (field: string, value: boolean) => {
    onChange({ ...settings, [field]: value });
  };

  const settingsList = [
    {
      id: "printInvoice",
      label: "Print Invoice",
      description: "Print invoices for each order",
    },
    {
      id: "allowMarkComplete",
      label: "Mark Order As Complete",
      description: "Complete orders without delivery drivers (starter plan)",
    },
    {
      id: "enableLiveTrackingMap",
      label: "Live Tracking Map",
      description: "Show live driver tracking map to customers during delivery",
    },
    {
      id: "topChains",
      label: "Top Chains",
      description: "Feature this restaurant in top chains",
    },
  ];

  const getValue = (id: string): boolean => {
    switch (id) {
      case "printInvoice":
        return settings.printInvoice;
      case "allowMarkComplete":
        return settings.allowMarkComplete ?? false;
      case "enableLiveTrackingMap":
        return settings.enableLiveTrackingMap ?? true;
      case "topChains":
        return topChains;
      default:
        return false;
    }
  };

  const handleCommissionChange = (raw: string) => {
    if (raw === "") {
      onCommissionPercentChange("");
      return;
    }
    const num = parseFloat(raw);
    onCommissionPercentChange(isNaN(num) ? "" : num);
  };

  return (
    <Card className="p-6 bg-card border-border sticky top-32">
      <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="commission-percent" className="text-foreground font-medium text-sm">
            Commission (%)
          </Label>
          <Input
            id="commission-percent"
            type="number"
            min={0}
            max={100}
            step="0.5"
            value={commissionPercent}
            onChange={(e) => handleCommissionChange(e.target.value)}
            placeholder="10"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-0.5">
            Platform commission taken from this restaurant&apos;s orders (0–100).
            Required before it can receive orders.
          </p>
          {commissionError && (
            <p className="flex items-center gap-1 text-sm text-destructive mt-1">
              {commissionError}
            </p>
          )}
        </div>
        {settingsList.map((setting) => (
          <div key={setting.id} className="flex items-start justify-between">
            <div>
              <Label className="text-foreground font-medium text-sm">
                {setting.label}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {setting.description}
              </p>
            </div>
            <Switch
              checked={getValue(setting.id)}
              onCheckedChange={(value) => {
                if (setting.id === "topChains") {
                  onTopChainsChange(value);
                } else {
                  handleChange(setting.id, value);
                }
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
