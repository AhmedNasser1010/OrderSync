"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImagePickerField } from "@/components/gallery/ImagePickerField";
import {
  useCreateBannerMutation,
  useUpdateBannerMutation,
} from "@/rtk/api/firestoreApi";
import { BannerPreview } from "./BannerPreview";
import { AlertCircle, Loader2 } from "lucide-react";
import type { HeroBanner } from "@ordersync/types";

interface BannerDraft {
  imageUrl: string;
  href: string;
  active: boolean;
  sortOrder: number;
}

function emptyDraft(sortOrder: number): BannerDraft {
  return {
    imageUrl: "",
    href: "",
    active: true,
    sortOrder,
  };
}

function fromBanner(banner: HeroBanner): BannerDraft {
  return {
    imageUrl: banner.imageUrl,
    href: banner.href,
    active: banner.active,
    sortOrder: banner.sortOrder,
  };
}

interface BannerFormContentProps {
  banner: HeroBanner | null;
  defaultSortOrder: number;
  partnerUid: string;
  onClose: () => void;
}

function BannerFormContent({
  banner,
  defaultSortOrder,
  partnerUid,
  onClose,
}: BannerFormContentProps) {
  const [draft, setDraft] = useState<BannerDraft>(() =>
    banner ? fromBanner(banner) : emptyDraft(defaultSortOrder)
  );
  const [previewLang, setPreviewLang] = useState<"en" | "ar">("en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!draft.imageUrl.trim()) {
      setError("Banner image URL is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      partnerUid,
      imageUrl: draft.imageUrl.trim(),
      href: draft.href.trim(),
      active: draft.active,
      sortOrder: draft.sortOrder,
    };

    try {
      if (banner) {
        await updateBanner({ id: banner.id, updates: payload }).unwrap();
      } else {
        await createBanner({ banner: payload }).unwrap();
      }
      onClose();
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to save the banner.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>
          {banner ? "Edit Banner" : "Add Banner"}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        <div className="space-y-6">
          <div className="space-y-3 rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground">Banner Image</h3>
            <ImagePickerField
              id="banner-image-url"
              label="Image"
              value={draft.imageUrl}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, imageUrl: value }))
              }
              placeholder="https://example.com/banner.png"
              folder="banners"
              hint="The whole card acts as the button."
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground">CTA action</h3>
            <div>
              <Label htmlFor="banner-href">Link</Label>
              <Input
                id="banner-href"
                value={draft.href}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, href: e.target.value }))
                }
                placeholder="#restaurants"
                className="mt-1.5"
              />
              <p className="text-sm text-muted-foreground mt-1.5">
                Tapping anywhere on the banner opens this link. Section:{" "}
                <code>#restaurants</code>. Restaurant item:{" "}
                <code>Burger-Station#beef-burger</code>. External:{" "}
                <code>https://...</code>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border p-4">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <Switch
                checked={draft.active}
                onCheckedChange={(checked) =>
                  setDraft((prev) => ({ ...prev, active: checked }))
                }
              />
              Active on homepage
            </label>
            <div className="flex items-center gap-2">
              <Label htmlFor="banner-sort-order" className="shrink-0">
                Order
              </Label>
              <Input
                id="banner-sort-order"
                type="number"
                value={draft.sortOrder}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    sortOrder: Number(e.target.value) || 0,
                  }))
                }
                className="w-24"
              />
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground">Live preview</h3>
          <div className="inline-flex rounded-lg bg-secondary p-0.5">
            {(["en", "ar"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setPreviewLang(lang)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  previewLang === lang
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "en" ? "English" : "عربي"}
              </button>
            ))}
          </div>
          <div className="flex min-h-56 items-center justify-center overflow-x-auto rounded-lg bg-secondary/40 p-4">
            <BannerPreview
              data={draft}
              lang={previewLang}
              className="w-full"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This is exactly how the banner will render in the customer app.
          </p>
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : banner ? (
            "Save Changes"
          ) : (
            "Add Banner"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

interface BannerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: HeroBanner | null;
  defaultSortOrder: number;
  partnerUid: string;
}

export function BannerFormDialog({
  open,
  onOpenChange,
  banner,
  defaultSortOrder,
  partnerUid,
}: BannerFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <BannerFormContent
          key={banner?.id ?? "new"}
          banner={banner ?? null}
          defaultSortOrder={defaultSortOrder}
          partnerUid={partnerUid}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  );
}
