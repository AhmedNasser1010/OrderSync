"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Share2, Gift } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";

function buildReferralLink(uid: string): string {
  const { origin } = window.location;
  return `${origin}?ref=${encodeURIComponent(uid)}`;
}

export default function ReferralLinkCard() {
  const t = useTranslations();
  const { uid, isAuthenticated } = useAuthSession();
  const [copied, setCopied] = useState(false);

  // Derived during render (not in an effect): `window` is only touched on the
  // client, and `uid` is unavailable on the server/prerender, so hydration is
  // safe. Once auth resolves, the link appears without extra render cascades.
  const link = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (!uid || !isAuthenticated) return null;
    return buildReferralLink(uid);
  }, [uid, isAuthenticated]);

  const copyLink = useCallback(async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = link;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [link]);

  const shareLink = useCallback(async () => {
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("referralShareTitle"),
          text: t("referralShareMessage"),
          url: link,
        });
      } catch {
        // User dismissed the share sheet — nothing to do.
      }
    } else {
      await copyLink();
    }
  }, [link, t, copyLink]);

  if (!isAuthenticated || !uid || !link) return null;

  return (
    <section className="mt-6 rounded-2xl border border-color-7 bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Gift className="size-4" />
        </span>
        <div>
          <h2 className="font-ProximaNovaBold text-sm text-color-1">
            {t("referralTitle")}
          </h2>
          <p className="text-xs font-ProximaNovaThin text-color-8">
            {t("referralSubtitle")}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={copyLink}
        className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-color-7 bg-color-7/30 p-3 text-left transition-colors hover:bg-color-7/50"
        aria-label={t("referralCopyLink")}
      >
        <span className="truncate font-mono text-xs text-color-1 sm:text-sm">
          {link}
        </span>
        {copied ? (
          <Check className="size-4 shrink-0 text-emerald-600" />
        ) : (
          <Copy className="size-4 shrink-0 text-color-8" />
        )}
      </button>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs font-ProximaNovaThin text-color-8">
          {t("referralCodeLabel")}:{" "}
          <span className="font-mono font-ProximaNovaSemiBold text-color-1">
            {uid}
          </span>
        </p>
        <button
          type="button"
          onClick={shareLink}
          className="inline-flex items-center gap-1.5 rounded-full bg-color-2 px-4 py-2 font-ProximaNovaSemiBold text-xs text-white transition-colors hover:bg-color-2/90"
        >
          <Share2 className="size-3.5" />
          {t("referralShare")}
        </button>
      </div>
    </section>
  );
}