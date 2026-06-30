"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DayHours } from "@/lib/mock-data";

interface OpeningHoursSectionProps {
  hours: DayHours[];
  onChange: (hours: DayHours[]) => void;
}

export function OpeningHoursSection({
  hours,
  onChange,
}: OpeningHoursSectionProps) {
  const handleHourChange = (
    index: number,
    field: keyof DayHours,
    value: any,
  ) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    onChange(newHours);
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Opening Hours
      </h2>
      <div className="space-y-3">
        {hours.map((day, index) => (
          <div
            key={day.day}
            className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg"
          >
            <div className="w-24 font-medium text-foreground text-sm">
              {day.day}
            </div>

            {!day.closed ? (
              <>
                <Input
                  type="time"
                  value={day.openTime}
                  onChange={(e) =>
                    handleHourChange(index, "openTime", e.target.value)
                  }
                  className="h-8 w-32 text-xs"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={day.closeTime}
                  onChange={(e) =>
                    handleHourChange(index, "closeTime", e.target.value)
                  }
                  className="h-8 w-32 text-xs"
                />
              </>
            ) : (
              <div className="text-sm text-muted-foreground font-medium">
                Closed
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Checkbox
                id={`closed-${day.day}`}
                checked={day.closed}
                onCheckedChange={(checked) =>
                  handleHourChange(index, "closed", checked)
                }
              />
              <Label
                htmlFor={`closed-${day.day}`}
                className="text-xs font-normal cursor-pointer text-foreground"
              >
                Closed
              </Label>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
