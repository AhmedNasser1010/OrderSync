"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listImages,
  uploadImage,
  deleteImage,
  type R2Image,
} from "@/lib/r2";
import { AlertCircle, Check, Copy, ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";

const KNOWN_FOLDERS = ["restaurants", "banners", "menu"];

interface ImageGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional folder filter (prefix query). Gallery still lists all when omitted. */
  folder?: string;
  /** Called when the user selects an image to use. */
  onSelect: (url: string) => void;
  /** Called after an upload completes so the caller can react (e.g. save the URL immediately). */
  onUploaded?: (image: R2Image) => void;
}

export function ImageGallery({
  open,
  onOpenChange,
  folder,
  onSelect,
  onUploaded,
}: ImageGalleryProps) {
  const [images, setImages] = useState<R2Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<R2Image | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(
    folder ?? null
  );
  const [uploadFolder, setUploadFolder] = useState<string>(folder ?? "menu");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const all = await listImages();
      setImages(all);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load images.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [open, load]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const img = await uploadImage(file, uploadFolder);
        await load();
        onUploaded?.(img);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const copyLink = async (image: R2Image) => {
    try {
      await navigator.clipboard.writeText(image.url);
      setCopiedId(image.id);
      window.setTimeout(
        () => setCopiedId((cur) => (cur === image.id ? null : cur)),
        1500
      );
    } catch {
      setError("Failed to copy link.");
    }
  };

  const handleDelete = async (image: R2Image) => {
    setError(null);
    try {
      await deleteImage(image);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setConfirmDelete(null);
    }
  };

  const categoryOptions = useMemo(() => {
    const folders = new Set(images.map((i) => i.folder));
    KNOWN_FOLDERS.forEach((f) => folders.add(f));
    const entries = Array.from(folders)
      .filter((f) => f !== "")
      .sort((a, b) => {
        const ia = KNOWN_FOLDERS.indexOf(a);
        const ib = KNOWN_FOLDERS.indexOf(b);
        return (
          (ia === -1 ? KNOWN_FOLDERS.length : ia) -
          (ib === -1 ? KNOWN_FOLDERS.length : ib)
        );
      })
      .map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }));
    if (folders.has("")) {
      entries.push({ value: "", label: "Uncategorized" });
    }
    return entries;
  }, [images]);

  const visibleImages = useMemo(() => {
    if (activeFolder === null) return images;
    return images.filter((i) => i.folder === activeFolder);
  }, [images, activeFolder]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="z-[70]"
        className="max-h-[92vh] overflow-y-auto z-[70] sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>Image Gallery</DialogTitle>
          <DialogDescription>
            Upload a new image or pick an existing one. Uploaded images are
            stored in Cloudflare R2.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Select value={uploadFolder} onValueChange={setUploadFolder}>
            <SelectTrigger
              size="sm"
              className="w-44"
              aria-label="Upload to category"
            >
              <SelectValue placeholder="Upload to category" />
            </SelectTrigger>
            <SelectContent className="z-[80]">
              <SelectGroup>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            {uploading ? "Uploading..." : "Upload images"}
          </Button>
          {visibleImages.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {visibleImages.length} image
              {visibleImages.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={activeFolder === null ? "default" : "outline"}
            onClick={() => setActiveFolder(null)}
          >
            All
          </Button>
          {categoryOptions.map((opt) => (
            <Button
              type="button"
              size="sm"
              key={opt.value}
              variant={activeFolder === opt.value ? "default" : "outline"}
              onClick={() => setActiveFolder(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {loading ? (
            <div className="col-span-full flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading images...
            </div>
          ) : visibleImages.length === 0 ? (
            <div className="col-span-full flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm">
                {activeFolder === null
                  ? "No images yet. Upload some to get started."
                  : "No images in this category."}
              </p>
            </div>
          ) : (
            visibleImages.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary"
              >
                <button
                  type="button"
                  onClick={() => onSelect(image.url)}
                  className="absolute inset-0 z-0"
                  aria-label={`Select ${image.fileName}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.fileName}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 block truncate bg-gradient-to-t from-black/70 to-transparent px-2 py-3 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {image.fileName}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void copyLink(image);
                  }}
                  className="absolute left-1.5 top-1.5 z-10 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                  title="Copy image link"
                >
                  {copiedId === image.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(image)}
                  className="absolute right-1.5 top-1.5 z-10 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                  title="Delete image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {confirmDelete && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/5 p-3">
            <p className="text-sm text-foreground">
              Delete{" "}
              <span className="font-medium">{confirmDelete.fileName}</span> from
              R2? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(confirmDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
