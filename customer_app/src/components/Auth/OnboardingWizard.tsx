"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { UserIcon, PhoneIcon, MapPinIcon, CheckIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import useUserForm from "@/hooks/useUserForm";
import { setOnboardingComplete } from "@/rtk/slices/authSlice";
import TextInput from "@/components/Sidebar/TextInput";
import { cn } from "@/lib/utils";

const FindUserLocationMap = dynamic(
  () => import("@/components/Sidebar/FindUserLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[280px] rounded-xl bg-color-7/30 animate-pulse" />
    ),
  }
);

const DEFAULT_LOCATION: [number, number] = [
  29.620106778124843, 31.255811811669496,
];

const phoneNumberRegex = /^\d{11}$/;

type Step = "name" | "phone" | "address";

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "name", label: "StepName", icon: UserIcon },
  { key: "phone", label: "StepPhone", icon: PhoneIcon },
  { key: "address", label: "StepAddress", icon: MapPinIcon },
];

export function OnboardingWizard() {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const { saveName, savePhone, saveSecondPhone, saveLocation, saveAddress } =
    useUserForm();

  const [currentStep, setCurrentStep] = useState<Step>("name");
  const [name, setName] = useState(user?.userInfo?.name || "");
  const [phone, setPhone] = useState(user?.userInfo?.phone || "");
  const [secondPhone, setSecondPhone] = useState(
    user?.userInfo?.secondPhone || ""
  );
  const [address, setAddress] = useState(
    user?.locations?.home?.address || ""
  );
  const [location, setLocation] = useState<[number, number] | null>(
    user?.locations?.home?.latlng?.[0]
      ? (user.locations.home.latlng as [number, number])
      : null
  );
  const [errors, setErrors] = useState<{ field?: string; message?: string }>({});
  const [saving, setSaving] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const goToStep = (step: Step) => {
    setErrors({});
    setCurrentStep(step);
  };

  const handleNextFromName = () => {
    if (!name.trim()) {
      setErrors({ field: "name", message: t("NameRequired") });
      return;
    }
    saveName({ target: { value: name } } as React.FocusEvent<HTMLInputElement>);
    goToStep("phone");
  };

  const handleNextFromPhone = () => {
    if (!phone.trim()) {
      setErrors({ field: "phone", message: t("PhoneRequired") });
      return;
    }
    if (!phoneNumberRegex.test(phone.trim())) {
      setErrors({ field: "phone", message: t("PhoneInvalid") });
      return;
    }
    savePhone({
      target: { value: phone },
    } as React.FocusEvent<HTMLInputElement>);
    if (secondPhone.trim()) {
      saveSecondPhone({
        target: { value: secondPhone },
      } as React.FocusEvent<HTMLInputElement>);
    }
    goToStep("address");
  };

  const handleFinish = async () => {
    if (!address.trim()) {
      setErrors({ field: "address", message: t("AddressRequired") });
      return;
    }
    if (!location) {
      setErrors({ field: "location", message: t("LocationRequired") });
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      saveAddress({
        target: { value: address },
      } as React.FocusEvent<HTMLInputElement>);
      await saveLocation(location);
      dispatch(setOnboardingComplete(true));
      router.replace("/");
    } finally {
      setSaving(false);
    }
  };

  const isFinalStep = currentStep === "address";

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Step indicator */}
      <ol className="flex items-center justify-center gap-2 mb-8" aria-label={t("OnboardingProgress")}>
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const active = index === stepIndex;
          const done = index < stepIndex;
          return (
            <li key={step.key} className="flex items-center gap-2">
              {index > 0 && (
                <span
                  className={cn(
                    "h-px w-6 sm:w-10",
                    index <= stepIndex ? "bg-color-2" : "bg-color-7"
                  )}
                />
              )}
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full text-sm font-ProximaNovaSemiBold transition-colors",
                  done && "bg-color-11 text-white",
                  active && "bg-color-2 text-white",
                  !done && !active && "bg-color-7 text-color-5"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? (
                  <CheckIcon className="size-4" />
                ) : (
                  <Icon className="size-4" />
                )}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="rounded-3xl border border-color-7 bg-card p-6 shadow-sm">
        <h2 className="text-start mb-1 text-2xl font-ProximaNovaBold text-color-1">
          {t(STEPS[stepIndex].label)}
        </h2>
        <p className="text-start mb-6 text-sm font-ProximaNovaThin text-color-5">
          {t("OnboardingStepHint")}
        </p>

        <div className="space-y-5">
          {currentStep === "name" && (
            <TextInput
              label={t("Name")}
              placeholder={t("User Name")}
              icon={<UserIcon />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant={errors.field === "name" ? "error" : "standard"}
              helperMessage={errors.field === "name" ? errors.message : undefined}
            />
          )}

          {currentStep === "phone" && (
            <div className="space-y-4">
              <TextInput
                label={t("Primary Phone Number")}
                placeholder={t("Phone Number")}
                icon={<PhoneIcon />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                variant={errors.field === "phone" ? "error" : "standard"}
                helperMessage={
                  errors.field === "phone" ? errors.message : undefined
                }
                dir="ltr"
              />
              <TextInput
                label={t("Second Phone Number")}
                placeholder={t("Phone Number")}
                icon={<PhoneIcon />}
                value={secondPhone}
                onChange={(e) => setSecondPhone(e.target.value)}
                required={false}
                dir="ltr"
              />
            </div>
          )}

          {currentStep === "address" && (
            <div className="space-y-4">
              <TextInput
                label={t("Address")}
                placeholder={t("Street, village, or well known place")}
                icon={<MapPinIcon />}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                variant={errors.field === "address" ? "error" : "standard"}
                helperMessage={
                  errors.field === "address" ? errors.message : undefined
                }
              />
              <div>
                <p className="block text-xs font-ProximaNovaSemiBold text-color-6 uppercase tracking-wide mb-1.5">
                  {t("Location")}
                </p>
                <div
                  className={cn(
                    "overflow-hidden rounded-xl ring-1 transition-all",
                    errors.field === "location"
                      ? "ring-2 ring-red-500"
                      : "ring-color-7"
                  )}
                >
                  <FindUserLocationMap
                    userLocation={location}
                    defaultLocation={DEFAULT_LOCATION}
                    onChange={(value) => {
                      setLocation(value);
                      saveLocation(value);
                    }}
                  />
                </div>
                {errors.field === "location" && (
                  <span className="block text-xs text-red-500 font-ProximaNovaThin mt-1.5">
                    {errors.message}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        {currentStep !== "name" && (
          <button
            type="button"
            onClick={() => goToStep(STEPS[stepIndex - 1].key)}
            className="flex-1 rounded-2xl border border-color-7 bg-card py-3.5 font-ProximaNovaSemiBold text-color-6 transition-colors hover:bg-color-7/40 cursor-pointer"
          >
            {t("Back")}
          </button>
        )}
        <button
          type="button"
          onClick={isFinalStep ? handleFinish : currentStep === "name" ? handleNextFromName : handleNextFromPhone}
          disabled={saving}
          className={cn(
            "flex-1 rounded-2xl py-3.5 font-ProximaNovaSemiBold text-white transition-all cursor-pointer disabled:opacity-60",
            isFinalStep ? "bg-color-11 hover:bg-color-11/90" : "bg-color-2 hover:bg-color-2/90"
          )}
        >
          {isFinalStep
            ? saving
              ? t("Saving")
              : t("Finish")
            : t("Continue")}
        </button>
      </div>
    </div>
  );
}
