"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageEditDialogProps {
  initialImages?: string[];
  onCancel: () => void;
  onSave: (images: string[]) => void;
}

export function ImageEditDialog({
  initialImages = [],
  onCancel,
  onSave,
}: ImageEditDialogProps) {
  const t = useTranslations("ImageEditor");
  const common = useTranslations("Common");
  const fields = 5;
  const [values, setValues] = useState<string[]>(
    Array.from({ length: fields }, (_, i) => initialImages[i] ?? ""),
  );

  const setAt = (index: number, val: string) => {
    const copy = [...values];
    copy[index] = val;
    setValues(copy);
  };

  const handleSave = () => {
    const cleaned = values.map((v) => v.trim()).filter(Boolean);
    onSave(cleaned);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="w-full md:w-96 bg-card border border-border rounded-t-lg md:rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {values.map((v, i) => (
            <div key={i}>
              <label className="block text-xs font-medium text-foreground mb-1">
                {t("imageLabel", { number: i + 1 })}
              </label>
              <input
                type="text"
                value={v}
                onChange={(e) => setAt(i, e.target.value)}
                placeholder={t("urlPlaceholder")}
                className="w-full px-2 py-1 bg-input border border-border rounded text-sm text-foreground focus:outline-none"
              />
            </div>
          ))}

          <div className="flex gap-2 pt-3">
            <Button size="sm" className="flex-1 bg-accent" onClick={handleSave}>
              {common("save")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              {common("cancel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
