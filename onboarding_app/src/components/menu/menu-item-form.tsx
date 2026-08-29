"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface MenuItemFormProps {
  categoryName: string;
  onSubmit: (
    title: string,
    description: string,
    price: number,
    sizes?: { size: string; price: string }[],
    topMenu?: boolean,
  ) => void;
  onCancel: () => void;
  initialTitle?: string;
  initialDescription?: string;
  initialPrice?: number;
  initialSizes?: { size: string; price: string }[];
  initialTopMenu?: boolean;
  isEditing?: boolean;
  submitLabel?: string;
}

function getSizePrice(
  sizes: { size: string; price: string }[] | undefined,
  aliases: string[],
): string {
  if (!Array.isArray(sizes)) {
    return "";
  }

  const match = sizes.find((entry) =>
    aliases.includes(
      String(entry.size ?? "")
        .trim()
        .toUpperCase(),
    ),
  );
  return match?.price ?? "";
}

export function MenuItemForm({
  categoryName,
  onSubmit,
  onCancel,
  initialTitle = "",
  initialDescription = "",
  initialPrice,
  initialSizes,
  initialTopMenu = false,
  isEditing = false,
  submitLabel,
}: MenuItemFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [price, setPrice] = useState(
    initialPrice !== undefined ? String(initialPrice) : "",
  );
  const [smallPrice, setSmallPrice] = useState(() =>
    getSizePrice(initialSizes, ["S", "SMALL", "SM"]),
  );
  const [mediumPrice, setMediumPrice] = useState(() =>
    getSizePrice(initialSizes, ["M", "MEDIUM", "MD"]),
  );
  const [largePrice, setLargePrice] = useState(() =>
    getSizePrice(initialSizes, ["L", "LARGE", "LG"]),
  );
  const [sizesEnabled, setSizesEnabled] = useState<boolean>(
    () =>
      getSizePrice(initialSizes, ["S", "SMALL", "SM"]) !== "" ||
      getSizePrice(initialSizes, ["M", "MEDIUM", "MD"]) !== "" ||
      getSizePrice(initialSizes, ["L", "LARGE", "LG"]) !== "",
  );
  const [topMenu, setTopMenu] = useState<boolean>(initialTopMenu);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && price) {
      const sizes = sizesEnabled
        ? [
            { size: "S", price: smallPrice },
            { size: "M", price: mediumPrice },
            { size: "L", price: largePrice },
          ]
        : undefined;
      onSubmit(title.trim(), description.trim(), parseFloat(price), sizes, topMenu);
      setTitle("");
      setDescription("");
      setPrice("");
      setSmallPrice("");
      setMediumPrice("");
      setLargePrice("");
      setSizesEnabled(false);
      setTopMenu(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-[60]">
      <div className="w-full md:w-96 bg-card border border-border rounded-t-lg md:rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing
              ? `Edit Item in ${categoryName}`
              : `Add Item to ${categoryName}`}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grilled Salmon"
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the item"
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Price *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Sizes (tiered pricing)
            </label>
            {sizesEnabled ? (
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={smallPrice}
                  onChange={(e) => setSmallPrice(e.target.value)}
                  placeholder="Small Price"
                  step="0.01"
                  min="0"
                  className="w-full px-2 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="number"
                  value={mediumPrice}
                  onChange={(e) => setMediumPrice(e.target.value)}
                  placeholder="Medium Price"
                  step="0.01"
                  min="0"
                  className="w-full px-2 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="number"
                  value={largePrice}
                  onChange={(e) => setLargePrice(e.target.value)}
                  placeholder="Large Price"
                  step="0.01"
                  min="0"
                  className="w-full px-2 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSizesEnabled(true)}
              className="mt-2"
            >
              Enable Sizes
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Mark as popular
            </label>
            <Switch checked={topMenu} onCheckedChange={setTopMenu} />
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
              >
                {submitLabel ?? (isEditing ? "Save Item" : "Add Item")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
