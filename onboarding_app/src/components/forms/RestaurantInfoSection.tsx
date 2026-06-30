"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RestaurantInfoSectionProps {
  data: {
    name: string;
    arabicName: string;
    iconUrl: string;
    coverUrl: string;
    industry: "restaurant" | "coffee-shop";
    cuisines: string[];
    address: any;
  };
  onChange: (data: any) => void;
}

export function RestaurantInfoSection({
  data,
  onChange,
}: RestaurantInfoSectionProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Restaurant Information
      </h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="rest-name" className="text-foreground">
            Restaurant Name (English)
          </Label>
          <Input
            id="rest-name"
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. Spice House"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="rest-arabic-name" className="text-foreground">
            Restaurant Name (Arabic)
          </Label>
          <Input
            id="rest-arabic-name"
            value={data.arabicName}
            onChange={(e) => handleChange("arabicName", e.target.value)}
            placeholder="e.g. بيت التوابل"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="rest-industry" className="text-foreground">
            Industry
          </Label>
          <Select
            value={data.industry}
            onValueChange={(value: any) => handleChange("industry", value)}
          >
            <SelectTrigger id="rest-industry" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="coffee-shop">Coffee Shop</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rest-icon" className="text-foreground">
            Icon URL
          </Label>
          <Input
            id="rest-icon"
            value={data.iconUrl}
            onChange={(e) => handleChange("iconUrl", e.target.value)}
            placeholder="https://example.com/icon.png"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="rest-cover" className="text-foreground">
            Cover Image URL
          </Label>
          <Input
            id="rest-cover"
            value={data.coverUrl}
            onChange={(e) => handleChange("coverUrl", e.target.value)}
            placeholder="https://example.com/cover.png"
            className="mt-1.5"
          />
        </div>
      </div>
    </Card>
  );
}
