"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

import useStaff from "@/hooks/useStaff";
import { toast } from "sonner";

const addMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(6, "Phone is required"),
  uid: z.string().min(1, "User ID is required"),
});

type AddMemberForm = z.infer<typeof addMemberSchema>;

export function AddMemberSheet() {
  const [open, setOpen] = useState(false);
  const { addNewDriver } = useStaff();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberForm>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      uid: "",
    },
  });

  const onSubmit = async (data: AddMemberForm) => {
    try {
      await addNewDriver.trigger(data);
      setOpen(false);
      toast.success("New member added successfully");
    } catch (err) {
      toast.error("Failed to add new member. Please try again.");
    }
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              {...register("email")}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="01123456789"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="uid">User ID</Label>
            <Input
              id="uid"
              {...register("uid")}
              placeholder="Enter user ID of this member"
            />
            {errors.uid && (
              <p className="text-red-500 text-sm">{errors.uid.message}</p>
            )}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Add Member
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
