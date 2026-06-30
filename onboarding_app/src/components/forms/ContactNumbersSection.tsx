"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface ContactNumbersSectionProps {
  phoneNumbers: string[];
  onChange: (phoneNumbers: string[]) => void;
}

export function ContactNumbersSection({
  phoneNumbers,
  onChange,
}: ContactNumbersSectionProps) {
  const handleAddPhone = () => {
    onChange([...phoneNumbers, ""]);
  };

  const handleRemovePhone = (index: number) => {
    onChange(phoneNumbers.filter((_, i) => i !== index));
  };

  const handleChangePhone = (index: number, value: string) => {
    const newPhones = [...phoneNumbers];
    newPhones[index] = value;
    onChange(newPhones);
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Contact Numbers
        </h2>
        <Button
          onClick={handleAddPhone}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Number
        </Button>
      </div>

      <div className="space-y-3">
        {phoneNumbers.map((phone, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1">
              <Label
                htmlFor={`phone-${index}`}
                className="text-xs text-muted-foreground"
              >
                Phone {index + 1}
              </Label>
              <Input
                id={`phone-${index}`}
                value={phone}
                onChange={(e) => handleChangePhone(index, e.target.value)}
                placeholder="e.g. +966501234567"
                className="mt-1"
              />
            </div>
            {phoneNumbers.length > 1 && (
              <Button
                onClick={() => handleRemovePhone(index)}
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive hover:text-destructive mt-6"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
