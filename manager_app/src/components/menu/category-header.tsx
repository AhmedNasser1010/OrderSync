"use client";

import {
  ChevronDown,
  Eye,
  EyeOff,
  Edit,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Trash } from "lucide-react";
import { useState } from "react";
import { ActionsMenu } from "@/components/ui/actions-menu";
import { ImageEditDialog } from "@/components/ui/image-edit-dialog";
import { MenuCategory } from "@/lib/types/types";

interface CategoryHeaderProps {
  category: MenuCategory;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onUpdateBackgrounds?: (backgrounds: string[]) => void;
}

export function CategoryHeader({
  category,
  isExpanded,
  onToggleExpand,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onUpdateBackgrounds,
}: CategoryHeaderProps) {
  const [showImageEditor, setShowImageEditor] = useState(false);
  return (
    <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-card/80 transition-colors">
      <button
        onClick={onToggleExpand}
        className="shrink-0 p-1.5 hover:bg-muted rounded-md transition-colors"
      >
        <ChevronDown
          size={20}
          className={`transition-transform duration-200 ${
            isExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>

      <div className="flex-1 min-w-0 flex items-center gap-3">
        <button
          onClick={() => setShowImageEditor(true)}
          className="w-12 h-12 rounded-md overflow-hidden bg-background/50 flex items-center justify-center shrink-0"
          title="Edit backgrounds"
        >
          {category.backgrounds && category.backgrounds[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.backgrounds[0]}
              alt={category.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-sm text-muted-foreground">No background</div>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground line-clamp-2">
              {category.title}
            </h3>
            {category.visible === false && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/10 px-2 py-0.5 text-xs text-muted-foreground">
                <EyeOff size={14} />
                Hidden
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {category.description}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {category.items.length} items
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <ActionsMenu
          items={[
            {
              key: "toggleVisibility",
              label: category.visible ? "Hide from menu" : "Show in menu",
              onClick: onToggleVisibility,
              icon: category.visible ? <Eye size={14} /> : <EyeOff size={14} />,
            },
            {
              key: "moveUp",
              label: "Move category up",
              onClick: onMoveUp,
              icon: <ArrowUp size={14} />,
            },
            {
              key: "moveDown",
              label: "Move category down",
              onClick: onMoveDown,
              icon: <ArrowDown size={14} />,
            },
            {
              key: "edit",
              label: "Edit category",
              onClick: onEdit,
              icon: <Edit size={14} />,
            },
            {
              key: "delete",
              label: "Delete category",
              onClick: () => onDelete && onDelete(),
              icon: <Trash size={14} />,
              destructive: true,
            },
          ]}
        />
      </div>

      {showImageEditor && (
        <ImageEditDialog
          initialImages={category.backgrounds}
          onCancel={() => setShowImageEditor(false)}
          onSave={(backgrounds) =>
            onUpdateBackgrounds && onUpdateBackgrounds(backgrounds)
          }
        />
      )}
    </div>
  );
}
