"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  DollarSign,
  Percent,
  Edit,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Trash } from "lucide-react";
import { ActionsMenu } from "@/components/ui/actions-menu";
import { ImageEditDialog } from "@/components/ui/image-edit-dialog";
import { MenuItem } from "@/lib/types/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MenuItemCardProps {
  item: MenuItem;
  onToggleVisibility: () => void;
  onUpdateDiscount: (discount: MenuItem["discount"]) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onUpdateBackgrounds?: (backgrounds: string[]) => void;
}

export function MenuItemCard({
  item,
  onToggleVisibility,
  onUpdateDiscount,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onUpdateBackgrounds,
}: MenuItemCardProps) {
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showDiscountEditor, setShowDiscountEditor] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    item.discount?.type || "percentage",
  );
  const [discountValue, setDiscountValue] = useState(item.discount?.value || 0);
  const [discountActive, setDiscountActive] = useState(
    item.discount?.active || false,
  );

  const handleSaveDiscount = () => {
    if (discountValue > 0) {
      onUpdateDiscount({
        type: discountType,
        value: discountValue,
        active: discountActive,
      });
    }
    setShowDiscountEditor(false);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-card/50 border border-border rounded-lg hover:bg-card/70 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImageEditor(true)}
            className="w-12 h-12 rounded-md overflow-hidden bg-background/50 flex items-center justify-center shrink-0"
            title="Edit backgrounds"
          >
            {item.backgrounds && item.backgrounds[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.backgrounds[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-sm text-muted-foreground">No image</div>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-foreground line-clamp-2">
                {item.title}
              </h4>
              {item.visible === false && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/10 px-2 py-0.5 text-xs text-muted-foreground">
                  <EyeOff size={14} />
                  Hidden
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <ActionsMenu
            items={[
              {
                key: "moveUp",
                label: "Move item up",
                onClick: onMoveUp,
                icon: <ArrowUp size={14} />,
              },
              {
                key: "moveDown",
                label: "Move item down",
                onClick: onMoveDown,
                icon: <ArrowDown size={14} />,
              },
              {
                key: "edit",
                label: "Edit item",
                onClick: onEdit,
                icon: <Edit size={14} />,
              },
              {
                key: "toggleVisibility",
                label: item.visible ? "Hide from menu" : "Show in menu",
                onClick: onToggleVisibility,
                icon: item.visible ? <Eye size={14} /> : <EyeOff size={14} />,
              },
              {
                key: "delete",
                label: "Delete item",
                onClick: () => onDelete && onDelete(),
                icon: <Trash size={14} />,
                destructive: true,
              },
            ]}
          />
        </div>
      </div>

      {showImageEditor && (
        <ImageEditDialog
          initialImages={item.backgrounds}
          onCancel={() => setShowImageEditor(false)}
          onSave={(backgrounds) =>
            onUpdateBackgrounds && onUpdateBackgrounds(backgrounds)
          }
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-lg font-semibold text-foreground">
              ${item.price.toFixed(2)}
            </span>
            {item.discount &&
              (item.discount.active || item.discount.value > 0) && (
                <Badge
                  variant="outline"
                  className={`h-auto rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                    item.discount.active
                      ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-slate-950"
                      : "border-slate-500 bg-slate-800 text-slate-100 dark:border-slate-400 dark:bg-slate-900 dark:text-slate-50"
                  }`}
                >
                  {item.discount.type === "percentage"
                    ? `${item.discount.value}% off`
                    : `$${item.discount.value.toFixed(2)} off`}
                  {!item.discount.active ? " (inactive)" : ""}
                </Badge>
              )}
          </div>
          {item.sizes && item.sizes.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              {item.sizes.map((size) => (
                <div
                  key={size.size}
                  className="rounded-md border border-border bg-background/80 px-2 py-1 text-center"
                >
                  <div className="font-semibold text-foreground">
                    {size.size}
                  </div>
                  <div>${String(size.price)}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDiscountEditor(!showDiscountEditor)}
          className="text-xs"
        >
          {item.discount?.active ? "Edit" : "Add"} Discount
        </Button>
      </div>

      {showDiscountEditor && (
        <div className="mt-2 p-3 bg-muted rounded-md space-y-3">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={discountType === "percentage"}
                onChange={() => setDiscountType("percentage")}
                className="w-4 h-4"
              />
              <span className="text-sm text-foreground flex items-center gap-1">
                <Percent size={14} /> Percentage
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={discountType === "fixed"}
                onChange={() => setDiscountType("fixed")}
                className="w-4 h-4"
              />
              <span className="text-sm text-foreground flex items-center gap-1">
                <DollarSign size={14} /> Fixed
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Value {discountType === "percentage" ? "(%)" : "($)"}
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) =>
                setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))
              }
              min="0"
              max={discountType === "percentage" ? "100" : item.price}
              step="0.01"
              className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={discountActive}
              onChange={(e) => setDiscountActive(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-foreground">Active</span>
          </label>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSaveDiscount}
              className="flex-1 h-8 text-xs bg-accent hover:bg-accent/90"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDiscountEditor(false)}
              className="flex-1 h-8 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
