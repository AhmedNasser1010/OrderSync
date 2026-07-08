"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
} from "@/rtk/api/firestoreApi";
import type { BusinessDocument } from "@ordersync/types";
import { useAppSelector } from "@/rtk/hooks";
import { selectUser } from "@/rtk/slices/authSlice";

export interface ValidationError {
  [key: string]: string;
}

export function useRestaurantForm(initialData?: BusinessDocument) {
  const router = useRouter();
  const currentUser = useAppSelector(selectUser);
  const [createBusiness] = useCreateBusinessMutation();
  const [updateBusiness] = useUpdateBusinessMutation();
  const [formData, setFormData] = useState<BusinessDocument>(
    initialData || createEmptyBusinessDocument(),
  );
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(
    initialData?.owner?.phone ? [initialData.owner.phone] : [""],
  );
  const [errors, setErrors] = useState<ValidationError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialData) return;

    const timeoutId = window.setTimeout(() => {
      setFormData(initialData);
      setPhoneNumbers(initialData?.owner?.phone ? [initialData.owner.phone] : [""]);
      setErrors({});
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [initialData]);

  const validate = useCallback(
    (data: BusinessDocument, phones: string[]): ValidationError => {
      const newErrors: ValidationError = {};

      if (!data.owner.name?.trim())
        newErrors["owner.name"] = "Owner name is required";
      if (!data.owner.email.trim())
        newErrors["owner.email"] = "Email is required";
      else if (!isValidEmail(data.owner.email))
        newErrors["owner.email"] = "Invalid email";
      if (!data.owner.phone.trim())
        newErrors["owner.phone"] = "Phone is required";
      if (!data.owner.uid.trim())
        newErrors["owner.uid"] = "User ID is required";

      if (!data.business.name.trim())
        newErrors["business.name"] = "Restaurant name is required";
      if (!data.business.nameInAr.trim())
        newErrors["business.nameInAr"] = "Arabic name is required";

      if (
        !isValidCoordinate(data.business.latlng[0], -90, 90)
      ) {
        newErrors["business.latlng.0"] =
          "Latitude must be between -90 and 90";
      }
      if (
        !isValidCoordinate(data.business.latlng[1], -180, 180)
      ) {
        newErrors["business.latlng.1"] =
          "Longitude must be between -180 and 180";
      }

      if (data.services.cookTime[0] < 0)
        newErrors["services.cookTime.0"] = "Minimum time cannot be negative";
      if (data.services.cookTime[1] < 0)
        newErrors["services.cookTime.1"] = "Maximum time cannot be negative";
      if (data.services.cookTime[0] > data.services.cookTime[1]) {
        newErrors["services.cookTime.1"] =
          "Maximum time must be greater than minimum";
      }

      if (phones.length === 0 || !phones[0].trim()) {
        newErrors["phoneNumbers"] =
          "At least one phone number is required";
      }

      return newErrors;
    },
    [],
  );

  const updateFormData = useCallback(
    (updates: Partial<BusinessDocument>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const updateNestedField = useCallback((path: string, value: unknown) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    const newErrors = validate(formData, phoneNumbers);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setIsSubmitting(true);
    try {
      if (!formData.accessToken) {
        throw new Error("Business access token is missing.");
      }

      const now = Date.now();
      const ownerName = formData.owner.name ?? "";

      if (initialData?.accessToken) {
        await updateBusiness({
          accessToken: formData.accessToken,
          updates: { ...formData, updatedAt: now },
        }).unwrap();
      } else {
        if (!currentUser?.uid || !currentUser.email) {
          throw new Error("You must be signed in to create a business.");
        }

        await createBusiness({
          business: formData,
          user: {
            uid: currentUser.uid,
            email: formData.owner.email,
            name: ownerName,
            phone: formData.owner.phone,
            secondPhone: formData.owner.secondPhone ?? "",
            displayName: currentUser.displayName,
            phoneNumber: currentUser.phoneNumber,
          },
        }).unwrap();
      }

      console.log("Form submitted successfully:", formData);
      setErrors({});
      router.push("/restaurants");
      return true;
    } catch (error) {
      console.error("Form submission error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData,
    phoneNumbers,
    validate,
    createBusiness,
    updateBusiness,
    currentUser,
    initialData,
    router,
  ]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasError = useCallback(
    (field: string): boolean => {
      return !!errors[field];
    },
    [errors],
  );

  const getError = useCallback(
    (field: string): string | undefined => {
      return errors[field];
    },
    [errors],
  );

  return {
    formData,
    phoneNumbers,
    errors,
    isSubmitting,
    updateFormData,
    setPhoneNumbers,
    updateNestedField,
    handleSubmit,
    clearErrors,
    hasError,
    getError,
    validate,
  };
}

function createEmptyBusinessDocument(): BusinessDocument {
  return {
    accessToken: crypto.randomUUID(),
    partnerUid: "",
    owner: {
      uid: "",
      email: "",
      phone: "",
      name: "",
      secondPhone: "",
    },
    business: {
      name: "",
      nameInAr: "",
      industry: "restaurant",
      address: "",
      latlng: [0, 0],
      cover: "",
      icon: "",
      promotionalSubtitle: "",
      cuisines: [],
    },
    services: {
      openingHours: {
        sunday: { start: "10:00", end: "22:00", closed: false },
        monday: { start: "10:00", end: "23:00", closed: false },
        tuesday: { start: "10:00", end: "23:00", closed: false },
        wednesday: { start: "10:00", end: "23:00", closed: false },
        thursday: { start: "10:00", end: "23:00", closed: false },
        friday: { start: "11:00", end: "00:00", closed: false },
        saturday: { start: "11:00", end: "00:00", closed: false },
      },
      cookTime: [15, 45],
      paymentMethods: { cash: true },
    },
    settings: {
      siteControl: {
        closeMsg: "",
        availability: true,
        autoAvailability: true,
        isBusy: false,
        temporaryPause: false,
        status: "active",
      },
      orderManagement: {
        assign: {
          forCooks: true,
          forDeliveryWorkers: true,
        },
        driverAssignment: false,
        printInvoice: true,
      },
    },
    status: "active",
    updatedAt: Date.now(),
    createdAt: Date.now(),
    topChains: false,
    reviewSummary: {
      averageRating: 0,
      totalRatingPoints: 0,
      totalReviews: 0,
      stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidCoordinate(value: number, min: number, max: number): boolean {
  return !isNaN(value) && value >= min && value <= max;
}
