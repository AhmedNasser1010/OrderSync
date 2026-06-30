"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SettingsPanelProps {
  settings: {
    assignOrdersToCook: boolean;
    assignOrdersToDelivery: boolean;
    automaticDeliveryAssignment: boolean;
    printInvoice: boolean;
  };
  onChange: (settings: any) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const handleChange = (field: string, value: boolean) => {
    onChange({ ...settings, [field]: value });
  };

  const settingsList = [
    {
      id: "assignOrdersToCook",
      label: "Assign to Cook",
      description: "Automatically assign orders to kitchen staff",
    },
    {
      id: "assignOrdersToDelivery",
      label: "Assign to Delivery",
      description: "Automatically assign delivery orders",
    },
    {
      id: "automaticDeliveryAssignment",
      label: "Auto Delivery Assignment",
      description: "Automatically match delivery riders",
    },
    {
      id: "printInvoice",
      label: "Print Invoice",
      description: "Print invoices for each order",
    },
  ];

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
              checked={settings[setting.id as keyof typeof settings]}
              onCheckedChange={(value) => handleChange(setting.id, value)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
