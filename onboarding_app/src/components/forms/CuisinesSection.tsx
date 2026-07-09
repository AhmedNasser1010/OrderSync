"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { useState } from "react";

interface CuisinesSectionProps {
  cuisines: string[];
  onChange: (cuisines: string[]) => void;
}

export function CuisinesSection({ cuisines, onChange }: CuisinesSectionProps) {
  const [value, setValue] = useState("");

  const trimmed = value.trim();

  const handleAdd = () => {
    const cuisine = trimmed;
    if (!cuisine || cuisines.includes(cuisine)) return;
    onChange([...cuisines, cuisine]);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemoveCuisine = (cuisine: string) => {
    onChange(cuisines.filter((c) => c !== cuisine));
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">Cuisines</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="cuisines-input" className="text-foreground">
            Add Cuisines
          </Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              id="cuisines-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a cuisine and press Enter..."
              className="flex-1"
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              disabled={!trimmed || cuisines.includes(trimmed)}
              onClick={handleAdd}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {cuisines.length > 0 && (
          <div>
            <Label className="text-foreground">Selected Cuisines</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {cuisines.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant="secondary"
                  className="gap-1.5 py-1 px-2 cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleRemoveCuisine(cuisine)}
                >
                  {cuisine}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
