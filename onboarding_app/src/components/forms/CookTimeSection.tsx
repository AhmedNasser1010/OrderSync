"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CookTimeSectionProps {
  data: {
    min: number;
    max: number;
  };
  onChange: (data: any) => void;
}

export function CookTimeSection({ data, onChange }: CookTimeSectionProps) {
  const handleChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    onChange({ ...data, [field]: numValue });
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Cooking Time
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cook-min" className="text-foreground">
              Minimum (minutes)
            </Label>
            <Input
              id="cook-min"
              type="number"
              value={data.min}
              onChange={(e) => handleChange("min", e.target.value)}
              placeholder="15"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="cook-max" className="text-foreground">
              Maximum (minutes)
            </Label>
            <Input
              id="cook-max"
              type="number"
              value={data.max}
              onChange={(e) => handleChange("max", e.target.value)}
              placeholder="45"
              className="mt-1.5"
            />
          </div>
        </div>
        <div className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-lg">
          Estimated cooking time: {data.min} - {data.max} minutes
        </div>
      </div>
    </Card>
  );
}
