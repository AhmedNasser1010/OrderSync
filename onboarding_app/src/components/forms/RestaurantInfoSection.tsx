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
import { ImagePickerField } from "@/components/gallery/ImagePickerField";

interface RestaurantInfoSectionProps {
  data: {
    name: string;
    nameInAr: string;
    icon: string;
    cover: string;
    industry: string;
    cuisines: string[];
  };
  onChange: (data: {
    name: string;
    nameInAr: string;
    icon: string;
    cover: string;
    industry: string;
    cuisines: string[];
  }) => void;
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
            value={data.nameInAr}
            onChange={(e) => handleChange("nameInAr", e.target.value)}
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
            onValueChange={(value) => handleChange("industry", value)}
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
          <ImagePickerField
            id="rest-icon"
            label="Restaurant Icon"
            value={data.icon}
            onChange={(value) => handleChange("icon", value)}
            placeholder="https://.../icon.png"
            folder="restaurants"
            hint="Square logo shown on cards and the restaurant header."
          />
        </div>
        <div>
          <ImagePickerField
            id="rest-cover"
            label="Restaurant Cover Image"
            value={data.cover}
            onChange={(value) => handleChange("cover", value)}
            placeholder="https://.../cover.png"
            folder="restaurants"
            hint="Wide banner shown behind the restaurant header."
          />
        </div>
      </div>
    </Card>
  );
}
