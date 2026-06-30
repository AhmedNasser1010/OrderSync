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

const availableCuisines = [
  "Indian",
  "Italian",
  "Chinese",
  "Japanese",
  "Thai",
  "Mexican",
  "Middle Eastern",
  "American",
  "French",
  "Korean",
  "Fast Food",
  "Specialty Coffee",
  "Pastries",
  "Mediterranean",
  "Vietnamese",
  "Turkish",
];

export function CuisinesSection({ cuisines, onChange }: CuisinesSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCuisines = availableCuisines.filter(
    (c) =>
      c.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !cuisines.includes(c),
  );

  const handleAddCuisine = (cuisine: string) => {
    onChange([...cuisines, cuisine]);
    setSearchTerm("");
  };

  const handleRemoveCuisine = (cuisine: string) => {
    onChange(cuisines.filter((c) => c !== cuisine));
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">Cuisines</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="cuisines-search" className="text-foreground">
            Add Cuisines
          </Label>
          <div className="relative mt-1.5">
            <Input
              id="cuisines-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cuisines..."
              className="pr-10"
            />
            {searchTerm && filteredCuisines.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50">
                <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                  {filteredCuisines.map((cuisine) => (
                    <button
                      key={cuisine}
                      onClick={() => handleAddCuisine(cuisine)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-secondary text-sm text-foreground"
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
