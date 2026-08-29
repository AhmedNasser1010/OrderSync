"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import { Images } from "lucide-react";

interface ImagePickerFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  folder?: string;
  hint?: string;
}

/**
 * Reusable single-image field: shows the current value (as editable URL) plus
 * a "Browse gallery" button that opens the R2 image gallery to pick an image.
 */
export function ImagePickerField({
  id,
  label,
  value,
  onChange,
  placeholder,
  folder,
  hint,
}: ImagePickerFieldProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <div>
      <Label htmlFor={id} className="text-foreground">
        {label}
      </Label>
      <div className="mt-1.5 flex items-center gap-2">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="size-11 shrink-0 rounded-md border border-border object-cover"
          />
        ) : (
          <div className="grid size-11 shrink-0 place-items-center rounded-md border border-dashed border-border text-muted-foreground">
            <Images className="size-4" />
          </div>
        )}
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Paste an image URL or use the gallery"}
          className="flex-1"
        />
      </div>
      <div className="mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setGalleryOpen(true)}
          className="gap-2"
        >
          <Images className="h-4 w-4" />
          Browse gallery
        </Button>
      </div>
      {hint && <p className="text-sm text-muted-foreground mt-1.5">{hint}</p>}

      <ImageGallery
        key={String(galleryOpen)}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        folder={folder}
        onSelect={(url) => {
          onChange(url);
          setGalleryOpen(false);
        }}
        onUploaded={(image) => {
          onChange(image.url);
          setGalleryOpen(false);
        }}
      />
    </div>
  );
}
