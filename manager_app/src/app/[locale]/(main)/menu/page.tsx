"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, Cloud, UtensilsCrossed } from "lucide-react";
import { useMenuData } from "@/hooks/useMenuData";
import { CategoryHeader } from "@/components/menu/category-header";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { CategoryForm } from "@/components/menu/category-form";
import { MenuItemForm } from "@/components/menu/menu-item-form";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/dashboard/app-header";

export default function MenuManagementPage() {
  const {
    menuData,
    isSyncing,
    syncMessage,
    updateCategory,
    updateMenuItem,
    toggleItemVisibility,
    toggleCategoryVisibility,
    syncToCloud,
    addCategory,
    addMenuItem,
    deleteCategory,
    deleteItem,
    moveCategory,
    moveItem,
  } = useMenuData();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(menuData.categories.map((c) => c.id)),
  );
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedCategoryForItem, setSelectedCategoryForItem] = useState<
    string | null
  >(null);
  const t = useTranslations("Menu.page");
  const common = useTranslations("Common");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const toggleCategoryExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = (title: string, description: string) => {
    addCategory(title, description);
    setShowCategoryForm(false);
  };

  const handleEditCategory = (title: string, description: string) => {
    if (editingCategoryId) {
      updateCategory(editingCategoryId, { title, description });
      setEditingCategoryId(null);
    }
  };

  const openEditCategoryDialog = (categoryId: string) => {
    setEditingCategoryId(categoryId);
  };

  const handleAddItem = (
    title: string,
    description: string,
    price: number,
    sizes?: { size: string; price: string }[],
  ) => {
    if (selectedCategoryForItem) {
      addMenuItem(selectedCategoryForItem, title, description, price, sizes);
      setShowItemForm(false);
      setSelectedCategoryForItem(null);
    }
  };

  const handleEditItem = (
    title: string,
    description: string,
    price: number,
    sizes?: { size: string; price: string }[],
  ) => {
    if (editingItemId) {
      updateMenuItem(editingItemId, { title, description, price, sizes });
      setEditingItemId(null);
    }
  };

  const openEditItemDialog = (itemId: string) => {
    setEditingItemId(itemId);
  };

  const openAddItemForm = (categoryId: string) => {
    setSelectedCategoryForItem(categoryId);
    setShowItemForm(true);
  };

  const sortedCategories = useMemo(() => {
    return [...menuData.categories];
  }, [menuData.categories]);

  const selectedCategory = menuData.categories.find(
    (c) => c.id === selectedCategoryForItem,
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={<UtensilsCrossed className="w-5 h-5" />}
      />

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        <div className="flex flex-col gap-2 mb-6">
          <Button
            onClick={() => setShowCategoryForm(true)}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus size={18} />
            <span>{t("addCategory")}</span>
          </Button>

          <Button
            onClick={syncToCloud}
            disabled={isSyncing}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Cloud size={18} />
            <span>{isSyncing ? t("syncing") : t("sync")}</span>
          </Button>
        </div>

        {syncMessage && (
          <div className="mb-6 p-3 bg-accent/20 border border-accent rounded-md text-sm text-accent">
            {syncMessage}
          </div>
        )}
        <div className="space-y-4">
          {sortedCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{t("noCategories")}</p>
              <Button
                onClick={() => setShowCategoryForm(true)}
                className="bg-accent hover:bg-accent/90"
              >
                {t("createFirstCategory")}
              </Button>
            </div>
          ) : (
            sortedCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <CategoryHeader
                  category={category}
                  isExpanded={expandedCategories.has(category.id)}
                  onToggleExpand={() => toggleCategoryExpand(category.id)}
                  onToggleVisibility={() =>
                    toggleCategoryVisibility(category.id)
                  }
                  onMoveUp={() => moveCategory(category.id, "up")}
                  onMoveDown={() => moveCategory(category.id, "down")}
                  onEdit={() => openEditCategoryDialog(category.id)}
                  onDelete={() => {
                    deleteCategory(category.id);
                  }}
                  onUpdateBackgrounds={(backgrounds) =>
                    updateCategory(category.id, { backgrounds })
                  }
                />

                {expandedCategories.has(category.id) && (
                  <div className="pl-2 sm:pl-4 space-y-3">
                    {category.items.length === 0 ? (
                      <div className="p-4 bg-card/30 border border-border rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-3">
                          {t("noItems")}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAddItemForm(category.id)}
                        >
                          {t("addFirstItem")}
                        </Button>
                      </div>
                    ) : (
                      category.items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          onToggleVisibility={() =>
                            toggleItemVisibility(item.id)
                          }
                          onMoveUp={() => moveItem(item.id, "up")}
                          onMoveDown={() => moveItem(item.id, "down")}
                          onEdit={() => openEditItemDialog(item.id)}
                          onDelete={() => deleteItem(item.id)}
                          onUpdateBackgrounds={(backgrounds) =>
                            updateMenuItem(item.id, { backgrounds })
                          }
                        />
                      ))
                    )}

                    <button
                      onClick={() => openAddItemForm(category.id)}
                      className="w-full p-3 border-2 border-dashed border-border rounded-lg text-foreground hover:bg-card/50 transition-colors text-sm font-medium"
                    >
                      {t("addItem")}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Last Sync Info */}
        <div
          suppressHydrationWarning
          className="mt-8 p-4 bg-card/50 border border-border rounded-lg text-xs text-muted-foreground text-center"
        >
          {t("lastSynced")} {new Date(menuData.lastSynced).toLocaleString()}
        </div>
      </main>

      {/* Modals */}
      {showCategoryForm && (
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setShowCategoryForm(false)}
        />
      )}

      {editingCategoryId && (
        <CategoryForm
          isEditing
          initialTitle={
            menuData.categories.find((c) => c.id === editingCategoryId)
              ?.title || ""
          }
          initialDescription={
            menuData.categories.find((c) => c.id === editingCategoryId)
              ?.description || ""
          }
          onSubmit={handleEditCategory}
          onCancel={() => setEditingCategoryId(null)}
        />
      )}

      {showItemForm && selectedCategory && (
        <MenuItemForm
          categoryName={selectedCategory.title}
          onSubmit={handleAddItem}
          onCancel={() => {
            setShowItemForm(false);
            setSelectedCategoryForItem(null);
          }}
        />
      )}

      {editingItemId && (
        <MenuItemForm
          categoryName={
            menuData.categories.find((category) =>
              category.items.some((item) => item.id === editingItemId),
            )?.title ?? ""
          }
          onSubmit={handleEditItem}
          onCancel={() => setEditingItemId(null)}
          initialTitle={
            menuData.categories
              .flatMap((category) => category.items)
              .find((item) => item.id === editingItemId)?.title ?? ""
          }
          initialDescription={
            menuData.categories
              .flatMap((category) => category.items)
              .find((item) => item.id === editingItemId)?.description ?? ""
          }
          initialPrice={
            menuData.categories
              .flatMap((category) => category.items)
              .find((item) => item.id === editingItemId)?.price
          }
          initialSizes={
            menuData.categories
              .flatMap((category) => category.items)
              .find((item) => item.id === editingItemId)?.sizes
          }
          isEditing
          submitLabel="Save Item"
        />
      )}
    </div>
  );
}
