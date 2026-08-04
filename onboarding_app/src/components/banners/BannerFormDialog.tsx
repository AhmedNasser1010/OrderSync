"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  useCreateBannerMutation,
  useUpdateBannerMutation,
} from "@/rtk/api/firestoreApi";
import { BannerPreview } from "./BannerPreview";
import { AlertCircle, Loader2 } from "lucide-react";
import type { HeroBanner } from "@ordersync/types";

const FONT_WEIGHTS = [
  { label: "Normal", value: "normal" },
  { label: "Medium", value: "500" },
  { label: "Semibold", value: "600" },
  { label: "Bold", value: "bold" },
];

interface BannerDraft {
  imageUrl: string;
  cta: {
    labelEn: string;
    labelAr: string;
    href: string;
    openInNewTab: boolean;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
  };
  ctaPositionX: number;
  ctaPositionY: number;
  ctaPositionCorner: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  active: boolean;
  sortOrder: number;
}

function emptyDraft(sortOrder: number): BannerDraft {
  return {
    imageUrl: "",
    cta: {
      labelEn: "",
      labelAr: "",
      href: "",
      openInNewTab: false,
      backgroundColor: "#fc8019",
      textColor: "#ffffff",
      borderColor: "",
      borderWidth: 0,
      borderRadius: 9999,
      fontFamily: "",
      fontSize: 14,
      fontWeight: "600",
    },
    ctaPositionX: 16,
    ctaPositionY: 16,
    ctaPositionCorner: "top-left" as const,
    active: true,
    sortOrder,
  };
}

function fromBanner(banner: HeroBanner): BannerDraft {
  return {
    imageUrl: banner.imageUrl,
    cta: {
      labelEn: banner.cta.labelEn,
      labelAr: banner.cta.labelAr,
      href: banner.cta.href,
      openInNewTab: banner.cta.openInNewTab ?? false,
      backgroundColor: banner.cta.backgroundColor ?? "#fc8019",
      textColor: banner.cta.textColor ?? "#ffffff",
      borderColor: banner.cta.borderColor ?? "",
      borderWidth: banner.cta.borderWidth ?? 0,
      borderRadius: banner.cta.borderRadius ?? 9999,
      fontFamily: banner.cta.fontFamily ?? "",
      fontSize: banner.cta.fontSize ?? 14,
      fontWeight: banner.cta.fontWeight ?? "600",
    },
    ctaPositionX: banner.ctaPosition?.x ?? 16,
    ctaPositionY: banner.ctaPosition?.y ?? 16,
    ctaPositionCorner: banner.ctaPosition?.corner ?? "top-left",
    active: banner.active,
    sortOrder: banner.sortOrder,
  };
}

interface BannerFormContentProps {
  banner: HeroBanner | null;
  defaultSortOrder: number;
  onClose: () => void;
}

function BannerFormContent({
  banner,
  defaultSortOrder,
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

  const setCtaField = <K extends keyof BannerDraft["cta"]>(
    key: K,
    value: BannerDraft["cta"][K]
  ) => {
    setDraft((prev) => ({
      ...prev,
      cta: { ...prev.cta, [key]: value },
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!draft.imageUrl.trim()) {
      setError("Banner image URL is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const ctaPayload: {
      labelEn: string;
      labelAr: string;
      href: string;
      openInNewTab: boolean;
      borderRadius: number;
      fontSize: number;
      fontWeight: string;
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
      borderWidth?: number;
      fontFamily?: string;
    } = {
      labelEn: draft.cta.labelEn.trim(),
      labelAr: draft.cta.labelAr.trim(),
      href: draft.cta.href.trim(),
      openInNewTab: draft.cta.openInNewTab,
      borderRadius: draft.cta.borderRadius,
      fontSize: draft.cta.fontSize,
      fontWeight: draft.cta.fontWeight,
    };
    if (draft.cta.backgroundColor) ctaPayload.backgroundColor = draft.cta.backgroundColor;
    if (draft.cta.textColor) ctaPayload.textColor = draft.cta.textColor;
    if (draft.cta.borderColor) ctaPayload.borderColor = draft.cta.borderColor;
    if (draft.cta.borderWidth) ctaPayload.borderWidth = draft.cta.borderWidth;
    if (draft.cta.fontFamily) ctaPayload.fontFamily = draft.cta.fontFamily;

    const payload = {
      imageUrl: draft.imageUrl.trim(),
      cta: ctaPayload,
      ctaPosition: { x: draft.ctaPositionX, y: draft.ctaPositionY, corner: draft.ctaPositionCorner },
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
            <div>
              <Label htmlFor="banner-image-url">Image URL</Label>
              <Input
                id="banner-image-url"
                value={draft.imageUrl}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
                placeholder="https://example.com/banner.png"
                className="mt-1.5"
              />
              <p className="text-sm text-muted-foreground mt-1.5">
                Paste the URL of your banner image (designed in Canva or other
                tool).
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground">CTA Button - Text</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="banner-cta-label-en">Label (English)</Label>
                <Input
                  id="banner-cta-label-en"
                  value={draft.cta.labelEn}
                  onChange={(e) => setCtaField("labelEn", e.target.value)}
                  placeholder="e.g. Order now"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="banner-cta-label-ar">Label (Arabic)</Label>
                <Input
                  id="banner-cta-label-ar"
                  value={draft.cta.labelAr}
                  onChange={(e) => setCtaField("labelAr", e.target.value)}
                  placeholder="e.g. اطلب دلوقتي"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="banner-cta-href">Link</Label>
              <Input
                id="banner-cta-href"
                value={draft.cta.href}
                onChange={(e) => setCtaField("href", e.target.value)}
                placeholder="#restaurants"
                className="mt-1.5"
              />
              <p className="text-sm text-muted-foreground mt-1.5">
                Section: <code>#restaurants</code>. Restaurant item:{" "}
                <code>Burger-Station#beef-burger</code>. External:{" "}
                <code>https://...</code>
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <Checkbox
                checked={draft.cta.openInNewTab}
                onCheckedChange={(checked) =>
                  setCtaField("openInNewTab", Boolean(checked))
                }
              />
              Open external links in a new tab
            </label>
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground">
              CTA Button - Colors
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="bg-color">Background Color (HEX)</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="color"
                    value={draft.cta.backgroundColor || "#fc8019"}
                    onChange={(e) =>
                      setCtaField("backgroundColor", e.target.value)
                    }
                    className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border"
                  />
                  <Input
                    id="bg-color"
                    value={draft.cta.backgroundColor}
                    onChange={(e) =>
                      setCtaField("backgroundColor", e.target.value)
                    }
                    placeholder="#fc8019"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="text-color">Text Color (HEX)</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="color"
                    value={draft.cta.textColor || "#ffffff"}
                    onChange={(e) =>
                      setCtaField("textColor", e.target.value)
                    }
                    className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border"
                  />
                  <Input
                    id="text-color"
                    value={draft.cta.textColor}
                    onChange={(e) =>
                      setCtaField("textColor", e.target.value)
                    }
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground">
              CTA Button - Border
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="border-color">Color (HEX)</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      type="color"
                      value={draft.cta.borderColor || "#000000"}
                      onChange={(e) =>
                        setCtaField("borderColor", e.target.value)
                      }
                      className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border"
                    />
                    <Input
                      id="border-color"
                      value={draft.cta.borderColor}
                      onChange={(e) =>
                        setCtaField("borderColor", e.target.value)
                      }
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="border-width">Width (px)</Label>
                  <Input
                    id="border-width"
                    type="number"
                    min={0}
                    max={10}
                    value={draft.cta.borderWidth}
                    onChange={(e) =>
                      setCtaField("borderWidth", Number(e.target.value) || 0)
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="border-radius">Radius (px)</Label>
                  <Input
                    id="border-radius"
                    type="number"
                    min={0}
                    max={50}
                    value={draft.cta.borderRadius}
                    onChange={(e) =>
                      setCtaField("borderRadius", Number(e.target.value) || 0)
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground">
              CTA Button - Typography
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Input
                  id="font-family"
                  value={draft.cta.fontFamily}
                  onChange={(e) => setCtaField("fontFamily", e.target.value)}
                  placeholder="e.g. Inter, Arial, or leave empty for default"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="font-size">Size (px)</Label>
                <Input
                  id="font-size"
                  type="number"
                  min={12}
                  max={24}
                  value={draft.cta.fontSize}
                  onChange={(e) =>
                    setCtaField("fontSize", Number(e.target.value) || 14)
                  }
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Weight</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {FONT_WEIGHTS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setCtaField("fontWeight", w.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors cursor-pointer ${
                      draft.cta.fontWeight === w.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground">
              CTA Button - Position
            </h3>
            <div>
              <Label>Corner</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((corner) => (
                  <button
                    key={corner}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, ctaPositionCorner: corner }))
                    }
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer capitalize ${
                      draft.ctaPositionCorner === corner
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {corner.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cta-pos-x">X offset (px)</Label>
                <Input
                  id="cta-pos-x"
                  type="number"
                  min={0}
                  max={500}
                  value={draft.ctaPositionX}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      ctaPositionX: Number(e.target.value) || 0,
                    }))
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="cta-pos-y">Y offset (px)</Label>
                <Input
                  id="cta-pos-y"
                  type="number"
                  min={0}
                  max={500}
                  value={draft.ctaPositionY}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      ctaPositionY: Number(e.target.value) || 0,
                    }))
                  }
                  className="mt-1.5"
                />
              </div>
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
}

export function BannerFormDialog({
  open,
  onOpenChange,
  banner,
  defaultSortOrder,
}: BannerFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <BannerFormContent
          key={banner?.id ?? "new"}
          banner={banner ?? null}
          defaultSortOrder={defaultSortOrder}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  );
}
