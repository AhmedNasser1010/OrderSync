"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, AlertCircle } from "lucide-react";
import { getUserUid } from "@/app/actions/getUserUid";

interface OwnerSectionProps {
  data: {
    uid: string;
    email: string;
    phone: string;
    name?: string;
    secondPhone?: string;
  };
  onChange: (data: { uid: string; email: string; phone: string; name?: string; secondPhone?: string }) => void;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function OwnerSection({ data, onChange }: OwnerSectionProps) {
  const [isFetchingUid, setIsFetchingUid] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
    // Clear fetch error when user types
    if (field === "email") {
      setFetchError(null);
    }
  };

  const handleGetUserUid = useCallback(async () => {
    if (!isValidEmail(data.email)) return;

    setIsFetchingUid(true);
    setFetchError(null);

    try {
      const result = await getUserUid(data.email);

      if (result.uid) {
        onChange({ ...data, uid: result.uid });
      } else {
        setFetchError(
          result.error || "No user found with this email address"
        );
      }
    } catch {
      setFetchError("Failed to fetch user UID. Please try again.");
    } finally {
      setIsFetchingUid(false);
    }
  }, [data, onChange]);

  const showGetUidButton = isValidEmail(data.email) && data.email.length > 0;

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
          <div className="relative mt-1.5">
            <Input
              id="owner-email"
              type="email"
              value={data.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="e.g. ahmed@example.com"
              className="pr-36"
            />
            {showGetUidButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetUserUid}
                disabled={isFetchingUid}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 gap-1 text-xs"
              >
                {isFetchingUid ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <UserCheck className="h-3 w-3" />
                )}
                {isFetchingUid ? "Searching..." : "Get User UID"}
              </Button>
            )}
          </div>
          {fetchError && (
            <p className="flex items-center gap-1 text-sm text-destructive mt-1.5">
              <AlertCircle className="h-3 w-3" />
              {fetchError}
            </p>
          )}
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
          <Label htmlFor="owner-second-phone" className="text-foreground">
            Second Phone Number
          </Label>
          <Input
            id="owner-second-phone"
            value={data.secondPhone ?? ""}
            onChange={(e) => handleChange("secondPhone", e.target.value)}
            placeholder="e.g. +966501234568"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="owner-userid" className="text-foreground">
            User ID
          </Label>
          <Input
          id="owner-uid"
          value={data.uid}
          onChange={(e) => handleChange("uid", e.target.value)}
          placeholder="e.g. user_1"
            className="mt-1.5"
          />
          <p className="text-sm text-muted-foreground mt-1.5">
            The User ID is the manager's Firebase Authentication uid
          </p>
        </div>
      </div>
    </Card>
  );
}
