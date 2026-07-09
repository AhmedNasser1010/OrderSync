"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SettingsPanelProps {
  settings: {
    printInvoice: boolean;
  };
  topChains: boolean;
  onChange: (settings: {
    printInvoice: boolean;
  }) => void;
  onTopChainsChange: (value: boolean) => void;
}

export function SettingsPanel({
  settings,
  topChains,
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
      id: "topChains",
      label: "Top Chains",
      description: "Feature this restaurant in top chains",
    },
  ];

  const getValue = (id: string): boolean => {
    switch (id) {
      case "printInvoice":
        return settings.printInvoice;
      case "topChains":
        return topChains;
      default:
        return false;
    }
  };

  return (
    <Card className="p-6 bg-card border-border sticky top-32">
      <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>
      <div className="space-y-4">
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
