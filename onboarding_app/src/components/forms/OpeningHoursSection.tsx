"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const DAY_LABELS: Record<string, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

const DAY_KEYS = Object.keys(DAY_LABELS);

interface OpeningHoursSectionProps {
  hours: Record<
    string,
    { start: string; end: string; closed: boolean }
  >;
  onChange: (
    hours: Record<string, { start: string; end: string; closed: boolean }>,
  ) => void;
}

export function OpeningHoursSection({
  hours,
  onChange,
}: OpeningHoursSectionProps) {
  const [applyAllOpen, setApplyAllOpen] = useState("");
  const [applyAllClose, setApplyAllClose] = useState("");

  const handleHourChange = (
    day: string,
    field: "start" | "end" | "closed",
    value: string | boolean,
  ) => {
    onChange({
      ...hours,
      [day]: { ...hours[day], [field]: value },
    });
  };

  const handleApplyToAll = () => {
    if (!applyAllOpen || !applyAllClose) return;
    const newHours: Record<string, { start: string; end: string; closed: boolean }> = {};
    for (const day of DAY_KEYS) {
      newHours[day] = { start: applyAllOpen, end: applyAllClose, closed: false };
    }
    onChange(newHours);
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Opening Hours
      </h2>
      <div className="space-y-3">
        {/* Apply to All Row */}
        <div className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="w-24 font-medium text-foreground text-sm">
            Apply to All
          </div>
          <Input
            type="time"
            value={applyAllOpen}
            onChange={(e) => setApplyAllOpen(e.target.value)}
            className="h-8 w-32 text-xs"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="time"
            value={applyAllClose}
            onChange={(e) => setApplyAllClose(e.target.value)}
            className="h-8 w-32 text-xs"
          />
          <Button
            variant="default"
            size="sm"
            onClick={handleApplyToAll}
            disabled={!applyAllOpen || !applyAllClose}
            className="ml-auto"
          >
            Apply
          </Button>
        </div>

        {DAY_KEYS.map((dayKey) => {
          const dayData = hours[dayKey] ?? { start: "", end: "", closed: false };
          return (
            <div
              key={dayKey}
              className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg"
            >
              <div className="w-24 font-medium text-foreground text-sm">
                {DAY_LABELS[dayKey]}
              </div>

              {!dayData.closed ? (
                <>
                  <Input
                    type="time"
                    value={dayData.start}
                    onChange={(e) =>
                      handleHourChange(dayKey, "start", e.target.value)
                    }
                    className="h-8 w-32 text-xs"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={dayData.end}
                    onChange={(e) =>
                      handleHourChange(dayKey, "end", e.target.value)
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
                  id={`closed-${dayKey}`}
                  checked={dayData.closed}
                  onCheckedChange={(checked) =>
                    handleHourChange(dayKey, "closed", checked)
                  }
                />
                <Label
                  htmlFor={`closed-${dayKey}`}
                  className="text-xs font-normal cursor-pointer text-foreground"
                >
                  Closed
                </Label>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
