"use client";

import React from "react";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddMemberSheetProps {
  onAddMember: (member: {
    name: string;
    role: string;
    email: string;
    phone: string;
    duesAmount: number;
  }) => void;
}

const ROLES = [
  "Manager",
  "Developer",
  "Designer",
  "Sales",
  "Support",
  "Marketing",
];

export function AddMemberSheet({ onAddMember }: AddMemberSheetProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    duesAmount: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMember({
      ...formData,
      duesAmount: parseFloat(formData.duesAmount) || 0,
    });
    setFormData({ name: "", role: "", email: "", phone: "", duesAmount: "" });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Add New Member
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Add New Staff Member</SheetTitle>
          <SheetDescription>
            Fill in the details below to add a new team member.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dues">Initial Dues Amount</Label>
            <Input
              id="dues"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.duesAmount}
              onChange={(e) =>
                setFormData({ ...formData, duesAmount: e.target.value })
              }
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">
              Add Member
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
