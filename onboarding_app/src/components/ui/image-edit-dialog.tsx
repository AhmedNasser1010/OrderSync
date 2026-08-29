"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import { uploadImage } from "@/lib/r2";

interface ImageEditDialogProps {
  initialImages?: string[];
  onCancel: () => void;
  onSave: (images: string[]) => void;
  folder?: string;
}

export function ImageEditDialog({
  initialImages = [],
  onCancel,
  onSave,
  folder = "menu",
}: ImageEditDialogProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const removeAt = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        const img = await uploadImage(file, folder);
        added.push(img.url);
      }
      setImages((prev) => [...prev, ...added]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-[60]">
      <div className="w-full md:w-[32rem] bg-card border border-border rounded-t-lg md:rounded-lg p-6 shadow-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Images</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              size="sm"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              Upload
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setGalleryOpen(true)}
            >
              Choose from gallery
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No images yet.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="group relative aspect-square overflow-hidden rounded-md border border-border bg-secondary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                    title="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-3">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                onSave([...images]);
                onCancel();
              }}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <ImageGallery
        key={String(galleryOpen)}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        folder={folder}
        onSelect={(url) => {
          setImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
          setGalleryOpen(false);
        }}
      />
    </div>
  );
}
