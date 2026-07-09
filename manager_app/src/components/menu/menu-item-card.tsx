"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Eye,
  EyeOff,
  Edit,
  ArrowUp,
  ArrowDown,
  Trash,
} from "lucide-react";
import { ActionsMenu } from "@/components/ui/actions-menu";
import { ImageEditDialog } from "@/components/ui/image-edit-dialog";
import type { ItemType } from "@ordersync/types";

interface MenuItemCardProps {
  item: ItemType;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onUpdateBackgrounds?: (backgrounds: string[]) => void;
}

export function MenuItemCard({
  item,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onUpdateBackgrounds,
}: MenuItemCardProps) {
  const t = useTranslations("Menu.itemCard");
  const common = useTranslations("Common");
  const [showImageEditor, setShowImageEditor] = useState(false);

  return (
    <div className="flex flex-col gap-3 p-4 bg-card/50 border border-border rounded-lg hover:bg-card/70 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImageEditor(true)}
            className="w-12 h-12 rounded-md overflow-hidden bg-background/50 flex items-center justify-center shrink-0"
            title={common("editBackgrounds")}
          >
            {item.backgrounds && item.backgrounds[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.backgrounds[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-sm text-muted-foreground">{common("noImage")}</div>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-foreground line-clamp-2">
                {item.title}
              </h4>
              {item.visibility === false && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/10 px-2 py-0.5 text-xs text-muted-foreground">
                  <EyeOff size={14} />
                  {common("hidden")}
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
                label: t("moveUp"),
                onClick: onMoveUp,
                icon: <ArrowUp size={14} />,
              },
              {
                key: "moveDown",
                label: t("moveDown"),
                onClick: onMoveDown,
                icon: <ArrowDown size={14} />,
              },
              {
                key: "edit",
                label: t("edit"),
                onClick: onEdit,
                icon: <Edit size={14} />,
              },
              {
                key: "toggleVisibility",
                label: item.visibility ? t("hideFromMenu") : t("showInMenu"),
                onClick: onToggleVisibility,
                icon: item.visibility ? <Eye size={14} /> : <EyeOff size={14} />,
              },
              {
                key: "delete",
                label: t("delete"),
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
          </div>
          {item.sizes && item.sizes.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              {item.sizes.filter((s) => s.price !== "").map((size) => (
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
      </div>
    </div>
  );
}
