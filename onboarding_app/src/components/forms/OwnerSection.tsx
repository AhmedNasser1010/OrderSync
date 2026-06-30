"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OwnerSectionProps {
  data: {
    name: string;
    email: string;
    phone: string;
    userId: string;
  };
  onChange: (data: any) => void;
}

export function OwnerSection({ data, onChange }: OwnerSectionProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Owner Information
      </h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="owner-name" className="text-foreground">
            Full Name
          </Label>
          <Input
            id="owner-name"
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. Ahmed Hassan"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="owner-email" className="text-foreground">
            Email Address
          </Label>
          <Input
            id="owner-email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="e.g. ahmed@example.com"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="owner-phone" className="text-foreground">
            Phone Number
          </Label>
          <Input
            id="owner-phone"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="e.g. +966501234567"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="owner-userid" className="text-foreground">
            User ID
          </Label>
          <Input
            id="owner-userid"
            value={data.userId}
            onChange={(e) => handleChange("userId", e.target.value)}
            placeholder="e.g. user_1"
            className="mt-1.5"
          />
        </div>
      </div>
    </Card>
  );
}
