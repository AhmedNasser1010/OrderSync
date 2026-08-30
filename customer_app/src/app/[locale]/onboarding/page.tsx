"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { OnboardingWizard } from "@/components/Auth/OnboardingWizard";
import { useAuthSession } from "@/hooks/useAuthSession";
import { LOGO_URL } from "@/utils/constants";

export default function OnboardingPage() {
  const t = useTranslations();
  const { logout, isAuthLoading } = useAuthSession();

  if (isAuthLoading) {
    return (
      <section className="min-h-[85vh] flex items-center justify-center px-4 py-10">
        <div className="size-10 animate-spin rounded-full border-4 border-color-7 border-t-color-2" />
      </section>
    );
  }

  return (
    <section className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <Image
            src={LOGO_URL}
            alt="logo"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />
          <h1 className="font-Beiruti text-3xl text-color-1 mt-4">
            {t("CompleteYourProfile")}
          </h1>
          <p className="text-sm font-ProximaNovaThin text-color-5 mt-2 max-w-sm">
            {t("OnboardingIntro")}
          </p>
        </div>

        <OnboardingWizard />

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => void logout()}
            className="text-sm font-ProximaNovaMed text-color-5 underline-offset-2 hover:underline cursor-pointer"
          >
            {t("Logout")}
          </button>
        </div>
      </div>
    </section>
  );
}

