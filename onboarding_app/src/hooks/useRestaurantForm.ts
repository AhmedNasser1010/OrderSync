"use client";

import { useState, useCallback } from "react";
import { Restaurant } from "@/lib/mock-data";

export interface ValidationError {
  [key: string]: string;
}

export function useRestaurantForm(initialData?: Restaurant) {
  const [formData, setFormData] = useState<Restaurant>(
    initialData || createEmptyRestaurant(),
  );
  const [errors, setErrors] = useState<ValidationError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const updateNestedField = useCallback((path: string, value: any) => {
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form submitted successfully:", formData);
      setErrors({});
      return true;
    } catch (error) {
      console.error("Form submission error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate]);

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
    id: "",
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
    status: "open",
    lastUpdated: new Date().toISOString(),
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidCoordinate(value: number, min: number, max: number): boolean {
  return !isNaN(value) && value >= min && value <= max;
}
