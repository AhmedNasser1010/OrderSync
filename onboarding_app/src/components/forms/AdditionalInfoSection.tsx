"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AdditionalInfoSectionProps {
  data: {
    promotionalSubtitle: string;
    closeMessage: string;
  };
  onChange: (data: any) => void;
}

export function AdditionalInfoSection({
  data,
  onChange,
}: AdditionalInfoSectionProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Additional Information
      </h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="promo-subtitle" className="text-foreground">
            Promotional Subtitle
          </Label>
          <Input
            id="promo-subtitle"
            value={data.promotionalSubtitle}
            onChange={(e) =>
              handleChange("promotionalSubtitle", e.target.value)
            }
            placeholder="e.g. Authentic spices from the East"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Shown in promotional materials and listings
          </p>
        </div>
        <div>
          <Label htmlFor="close-message" className="text-foreground">
            Closed Message
          </Label>
          <Textarea
            id="close-message"
            value={data.closeMessage}
            onChange={(e) => handleChange("closeMessage", e.target.value)}
            placeholder="Thank you for visiting. We are closed now."
            className="mt-1.5 min-h-24"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Message shown to customers when the restaurant is closed
          </p>
        </div>
      </div>
    </Card>
  );
}
