"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/Auth/GoogleSignInButton";
import { useAuthSession } from "@/hooks/useAuthSession";
import { LOGO_URL } from "@/utils/constants";

export function SignInView() {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, isAuthLoading, error } =
    useAuthSession();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) return;

    router.replace("/");
  }, [isAuthenticated, isAuthLoading, router]);

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <Image
            src={LOGO_URL}
            alt="logo"
            width={72}
            height={72}
            className="h-18 w-18 object-contain"
          />
          <h1 className="font-Beiruti text-4xl text-color-1 mt-4">
            {t("Zajil")}
          </h1>
          <p className="text-sm font-ProximaNovaThin text-color-5 mt-2">
            {t("Login")} · {t("Enjoy your time")}
          </p>
        </div>

        <div className="rounded-3xl border border-color-7 bg-card p-6 shadow-sm">
          <GoogleSignInButton />

          <p className="mt-4 text-center text-xs font-ProximaNovaThin text-color-5">
            {t("Continue with Google to start ordering")}
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-sm font-ProximaNovaMed text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-400"
            >
              <span className="block text-center text-red-600 dark:text-red-400">
                {t("Google sign in failed")}
              </span>
              <span className="mt-2 block rounded-lg bg-white/80 px-3 py-2 font-mono text-xs text-red-800 dark:bg-black/30 dark:text-red-300">
                {error.code}
              </span>
              <span className="mt-2 block text-xs leading-5 text-red-700/90 dark:text-red-400/90">
                {error.message}
              </span>
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] font-ProximaNovaThin text-color-5">
          {t("SignInDisclaimers")}
        </p>
      </div>
    </section>
  );
}
