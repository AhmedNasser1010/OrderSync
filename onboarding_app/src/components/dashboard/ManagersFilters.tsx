"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface ManagersFiltersProps {
  onSearchChange: (search: string) => void;
  onRoleChange: (role: string) => void;
}

export function ManagersFilters({
  onSearchChange,
  onRoleChange,
}: ManagersFiltersProps) {
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  return (
    <Card className="p-4 bg-card border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-8"
          />
        </div>

        <Select onValueChange={onRoleChange}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="BUSINESS_MANAGER">Business Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
