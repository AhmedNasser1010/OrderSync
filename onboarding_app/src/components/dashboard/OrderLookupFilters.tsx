"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import type { OrderLookupField } from "@/rtk/api/firestoreApi";

export type LookupFieldKey = OrderLookupField | "driverName" | "customerName";

export const LOOKUP_FIELD_OPTIONS: {
  value: LookupFieldKey;
  label: string;
  placeholder: string;
}[] = [
  {
    value: "orderId",
    label: "Order ID",
    placeholder: "Firestore document ID...",
  },
  { value: "orderNumber", label: "Order Number", placeholder: "e.g. 1042" },
  { value: "customerUid", label: "Customer ID", placeholder: "Customer UID..." },
  {
    value: "customerName",
    label: "Customer Name",
    placeholder: "Customer name (partial match)...",
  },
  {
    value: "customerPhone",
    label: "Customer Phone",
    placeholder: "Exact phone number, e.g. +9647xxxxxxxxx",
  },
  {
    value: "driverName",
    label: "Driver Name",
    placeholder: "Driver name (partial match)...",
  },
  { value: "driverUid", label: "Driver ID", placeholder: "Driver UID..." },
  {
    value: "businessId",
    label: "Restaurant ID",
    placeholder: "Business / Restaurant ID...",
  },
];

interface OrderLookupFiltersProps {
  field: LookupFieldKey;
  onFieldChange: (field: LookupFieldKey) => void;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  isSearching: boolean;
  restaurantOptions?: { value: string; label: string }[];
}

export function OrderLookupFilters({
  field,
  onFieldChange,
  value,
  onValueChange,
  onSubmit,
  isSearching,
  restaurantOptions,
}: OrderLookupFiltersProps) {
  const placeholder =
    LOOKUP_FIELD_OPTIONS.find((opt) => opt.value === field)?.placeholder ??
    "Enter value...";

  return (
    <Card className="p-4 bg-card border-border">
      <form
        className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <Select
          value={field}
          onValueChange={(v) => onFieldChange(v as LookupFieldKey)}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Search by" />
          </SelectTrigger>
          <SelectContent>
            {LOOKUP_FIELD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {field === "businessId" && restaurantOptions?.length ? (
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Select a restaurant..." />
            </SelectTrigger>
            <SelectContent>
              {restaurantOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder}
            className="h-9"
          />
        )}

        <Button
          type="submit"
          className="gap-2"
          disabled={isSearching || !value.trim()}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>
    </Card>
  );
}
