"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressSectionProps {
  data: {
    latitude: number;
    longitude: number;
  };
  onChange: (data: any) => void;
}

export function AddressSection({ data, onChange }: AddressSectionProps) {
  const handleChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({ ...data, [field]: numValue });
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Address & Location
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude" className="text-foreground">
              Latitude
            </Label>
            <Input
              id="latitude"
              type="number"
              step="0.0001"
              value={data.latitude}
              onChange={(e) => handleChange("latitude", e.target.value)}
              placeholder="24.7136"
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Range: -90 to 90
            </p>
          </div>
          <div>
            <Label htmlFor="longitude" className="text-foreground">
              Longitude
            </Label>
            <Input
              id="longitude"
              type="number"
              step="0.0001"
              value={data.longitude}
              onChange={(e) => handleChange("longitude", e.target.value)}
              placeholder="46.6753"
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Range: -180 to 180
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-lg">
          Current coordinates: {data.latitude.toFixed(4)},{" "}
          {data.longitude.toFixed(4)}
        </div>
      </div>
    </Card>
  );
}
