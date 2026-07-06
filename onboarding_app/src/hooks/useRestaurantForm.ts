"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  type BusinessDocument,
} from "@/rtk/api/firestoreApi";
import { useAppSelector } from "@/rtk/hooks";
import { selectUser } from "@/rtk/slices/authSlice";
import { Restaurant } from "@/lib/mock-data";

export interface ValidationError {
  [key: string]: string;
}

export function useRestaurantForm(initialData?: Restaurant) {
  const router = useRouter();
  const currentUser = useAppSelector(selectUser);
  const [createBusiness] = useCreateBusinessMutation();
  const [updateBusiness] = useUpdateBusinessMutation();
  const [formData, setFormData] = useState<Restaurant>(
    initialData || createEmptyRestaurant(),
  );
  const [errors, setErrors] = useState<ValidationError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialData) return;

    const timeoutId = window.setTimeout(() => {
      setFormData(initialData);
      setErrors({});
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [initialData]);

  const validate = useCallback((data: Restaurant): ValidationError => {
    const newErrors: ValidationError = {};

    // Owner validation
    if (!data.owner.name.trim())
      newErrors["owner.name"] = "Owner name is required";
    if (!data.owner.email.trim())
      newErrors["owner.email"] = "Email is required";
    else if (!isValidEmail(data.owner.email))
      newErrors["owner.email"] = "Invalid email";
    if (!data.owner.phone.trim())
      newErrors["owner.phone"] = "Phone is required";
    if (!data.owner.userId.trim())
      newErrors["owner.userId"] = "User ID is required";

    // Restaurant info validation
    if (!data.info.name.trim())
      newErrors["info.name"] = "Restaurant name is required";
    if (!data.info.arabicName.trim())
      newErrors["info.arabicName"] = "Arabic name is required";

    // Address validation
    if (!isValidCoordinate(data.info.address.latitude, -90, 90)) {
      newErrors["info.address.latitude"] =
        "Latitude must be between -90 and 90";
    }
    if (!isValidCoordinate(data.info.address.longitude, -180, 180)) {
      newErrors["info.address.longitude"] =
        "Longitude must be between -180 and 180";
    }

    // Cook time validation
    if (data.cookTime.min < 0)
      newErrors["cookTime.min"] = "Minimum time cannot be negative";
    if (data.cookTime.max < 0)
      newErrors["cookTime.max"] = "Maximum time cannot be negative";
    if (data.cookTime.min > data.cookTime.max) {
      newErrors["cookTime.max"] = "Maximum time must be greater than minimum";
    }

    // Contact validation
    if (data.contact.phoneNumbers.length === 0) {
      newErrors["contact.phoneNumbers"] =
        "At least one phone number is required";
    }

    return newErrors;
  }, []);

  const updateFormData = useCallback((updates: Partial<Restaurant>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

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
    const newErrors = validate(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = toBusinessDocument(formData, currentUser?.uid);

      if (!payload.accessToken) {
        throw new Error("Business access token is missing.");
      }

      if (initialData?.id) {
        await updateBusiness({
          accessToken: payload.accessToken,
          updates: payload,
        }).unwrap();
      } else {
        if (!currentUser?.uid || !currentUser.email) {
          throw new Error("You must be signed in to create a business.");
        }

        await createBusiness({
          business: payload,
          user: {
            uid: currentUser.uid,
            email: formData.owner.email,
            name: formData.owner.name,
            phone: formData.owner.phone,
            secondPhone: formData.contact.phoneNumbers[1] ?? "",
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
    errors,
    isSubmitting,
    updateFormData,
    updateNestedField,
    handleSubmit,
    clearErrors,
    hasError,
    getError,
    validate,
  };
}

function createEmptyRestaurant(): Restaurant {
  return {
    id: crypto.randomUUID(),
    owner: {
      name: "",
      email: "",
      phone: "",
      userId: "",
    },
    info: {
      name: "",
      arabicName: "",
      iconUrl: "",
      coverUrl: "",
      industry: "restaurant",
      cuisines: [],
      address: {
        latitude: 0,
        longitude: 0,
      },
    },
    hours: [
      { day: "Sunday", openTime: "10:00", closeTime: "22:00", closed: false },
      { day: "Monday", openTime: "10:00", closeTime: "23:00", closed: false },
      { day: "Tuesday", openTime: "10:00", closeTime: "23:00", closed: false },
      {
        day: "Wednesday",
        openTime: "10:00",
        closeTime: "23:00",
        closed: false,
      },
      { day: "Thursday", openTime: "10:00", closeTime: "23:00", closed: false },
      { day: "Friday", openTime: "11:00", closeTime: "00:00", closed: false },
      { day: "Saturday", openTime: "11:00", closeTime: "00:00", closed: false },
    ],
    cookTime: { min: 15, max: 45 },
    settings: {
      assignOrdersToCook: true,
      assignOrdersToDelivery: true,
      automaticDeliveryAssignment: false,
      printInvoice: true,
    },
    contact: {
      phoneNumbers: [""],
    },
    additional: {
      promotionalSubtitle: "",
      closeMessage: "",
    },
    status: "active",
    lastUpdated: new Date().toISOString(),
  };
}

function toBusinessDocument(
  formData: Restaurant,
  userId?: string,
): BusinessDocument {
  const ownerNameParts = splitOwnerName(formData.owner.name);
  const ownerUid = formData.owner.userId || userId || "";

  return {
    accessToken: formData.id || "",
    partnerUid: userId,
    owner: {
      uid: ownerUid,
      name: formData.owner.name,
      email: formData.owner.email,
      phone: formData.owner.phone,
      basic: {
        fName: ownerNameParts.fName,
        lName: ownerNameParts.lName,
      },
      contact: {
        name: formData.owner.name,
        email: formData.owner.email,
        phone: formData.owner.phone,
      },
    },
    business: {
      name: formData.info.name,
      nameInAr: formData.info.arabicName,
      industry: formData.info.industry,
      address: `${formData.info.address.latitude},${formData.info.address.longitude}`,
      latlng: [formData.info.address.latitude, formData.info.address.longitude],
      cover: formData.info.coverUrl,
      icon: formData.info.iconUrl,
      promotionalSubtitle: formData.additional.promotionalSubtitle,
      cuisines: formData.info.cuisines,
    },
    services: {
      openingHours: Object.fromEntries(
        formData.hours.map((day) => [
          day.day.toLowerCase(),
          { start: day.openTime, end: day.closeTime, closed: day.closed },
        ]),
      ),
      cookTime: [formData.cookTime.min, formData.cookTime.max],
      paymentMethods: {},
    },
    settings: {
      siteControl: {
        closeMsg: formData.additional.closeMessage,
        availability: formData.status === "active",
        autoAvailability: true,
        isBusy: false,
        temporaryPause: false,
      },
      orderManagement: {
        assign: {
          forCooks: formData.settings.assignOrdersToCook,
          forDeliveryWorkers: formData.settings.assignOrdersToDelivery,
        },
        driverAssignment: formData.settings.automaticDeliveryAssignment,
        printInvoice: formData.settings.printInvoice,
      },
    },
    status: formData.status === "active" ? "active" : "inactive",
    createdOn: formData.lastUpdated,
  };
}

function splitOwnerName(name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { fName: "", lName: "" };
  }

  const parts = trimmedName.split(/\s+/);
  if (parts.length === 1) {
    return { fName: trimmedName, lName: "" };
  }

  return {
    fName: parts.slice(0, -1).join(" "),
    lName: parts[parts.length - 1],
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidCoordinate(value: number, min: number, max: number): boolean {
  return !isNaN(value) && value >= min && value <= max;
}
