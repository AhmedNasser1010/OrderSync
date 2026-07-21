"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserCheck, AlertCircle, Plus } from "lucide-react";
import { getUserUid } from "@/app/actions/getUserUid";
import { getUserProvider } from "@/app/actions/getUserProvider";
import { useCreateDriverDocumentMutation } from "@/rtk/api/firestoreApi";
import { useAuth } from "@/contexts/AuthContext";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AddDriverDialog() {
  const partnerUid = useAuth().user?.uid;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [secondPhone, setSecondPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licensePlateLetters, setLicensePlateLetters] = useState("");
  const [licensePlateNumbers, setLicensePlateNumbers] = useState("");

  const [uid, setUid] = useState("");
  const [isFetchingUid, setIsFetchingUid] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [createDriverDocument] = useCreateDriverDocumentMutation();

  const handleGetUserUid = useCallback(async () => {
    if (!isValidEmail(email)) return;

    setIsFetchingUid(true);
    setFetchError(null);

    try {
      const result = await getUserUid(email);
      if (result.uid) {
        setUid(result.uid);
      } else {
        setFetchError(result.error || "No user found with this email address");
      }
    } catch {
      setFetchError("Failed to fetch user UID. Please try again.");
    } finally {
      setIsFetchingUid(false);
    }
  }, [email]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setFetchError(null);
  };

  const handleSubmit = async () => {
    if (!uid || !partnerUid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const providerResult = await getUserProvider(uid);
      const provider = providerResult.provider || "unknown";

      const licensePlate =
        licensePlateLetters && licensePlateNumbers
          ? { letters: licensePlateLetters, numbers: parseInt(licensePlateNumbers) }
          : undefined;

      await createDriverDocument({
        uid,
        partnerUid,
        email,
        name,
        phone,
        secondPhone: secondPhone || undefined,
        provider,
        licensePlate,
      }).unwrap();

      setOpen(false);
      resetForm();
    } catch (error: any) {
      setSubmitError(error?.data || error?.message || "Failed to create driver");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setSecondPhone("");
    setEmail("");
    setLicensePlateLetters("");
    setLicensePlateNumbers("");
    setUid("");
    setFetchError(null);
    setSubmitError(null);
  };

  const showGetUidButton = isValidEmail(email) && email.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Driver
      </Button>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="driver-name">Full Name</Label>
            <Input
              id="driver-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mohammed Ali"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="driver-phone">Phone Number</Label>
            <Input
              id="driver-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +966501234567"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="driver-second-phone">
              Second Phone Number (optional)
            </Label>
            <Input
              id="driver-second-phone"
              value={secondPhone}
              onChange={(e) => setSecondPhone(e.target.value)}
              placeholder="e.g. +966501234568"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="driver-email">Email Address</Label>
            <div className="relative mt-1.5">
              <Input
                id="driver-email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="e.g. mohammed@example.com"
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
            <Label htmlFor="driver-uid">User ID</Label>
            <Input
              id="driver-uid"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="e.g. user_1"
              className="mt-1.5"
            />
            <p className="text-sm text-muted-foreground mt-1.5">
              The User ID is the driver's Firebase Authentication uid
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plate-letters">Plate Letters (optional)</Label>
              <Input
                id="plate-letters"
                value={licensePlateLetters}
                onChange={(e) => setLicensePlateLetters(e.target.value.toUpperCase())}
                placeholder="e.g. ABC"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="plate-numbers">Plate Numbers (optional)</Label>
              <Input
                id="plate-numbers"
                type="number"
                value={licensePlateNumbers}
                onChange={(e) => setLicensePlateNumbers(e.target.value)}
                placeholder="e.g. 1234"
                className="mt-1.5"
              />
            </div>
          </div>
          {submitError && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-3 w-3" />
              {submitError}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!uid || !name || !phone || !partnerUid || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Driver"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
