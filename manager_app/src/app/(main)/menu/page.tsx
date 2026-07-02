"use client";

import { useState, useMemo } from "react";
import { Plus, Cloud } from "lucide-react";
import { useMenuData } from "@/hooks/useMenuData";
import { CategoryHeader } from "@/components/menu/category-header";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { CategoryForm } from "@/components/menu/category-form";
import { MenuItemForm } from "@/components/menu/menu-item-form";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";

export default function MenuManagementPage() {
  const {
    menuData,
    isSyncing,
    syncMessage,
    updateCategory,
    updateMenuItem,
    toggleItemVisibility,
    toggleCategoryVisibility,
    updateItemDiscount,
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
    sizes?: { size: string; price: string | number }[],
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
    sizes?: { size: string; price: string | number }[],
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
    return [...menuData.categories].sort((a, b) => a.position - b.position);
  }, [menuData.categories]);

  const selectedCategory = menuData.categories.find(
    (c) => c.id === selectedCategoryForItem,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Restaurant Menu
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage categories, items, and promotions
                </p>
              </div>
              <UserAvatar />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowCategoryForm(true)}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              >
                <Plus size={18} />
                <span>Category</span>
              </Button>

              <Button
                onClick={syncToCloud}
                disabled={isSyncing}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Cloud size={18} />
                <span>{isSyncing ? "Syncing..." : "Sync"}</span>
              </Button>
            </div>
          </div>

          {syncMessage && (
            <div className="mt-4 p-3 bg-accent/20 border border-accent rounded-md text-sm text-accent">
              {syncMessage}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {sortedCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No categories yet</p>
              <Button
                onClick={() => setShowCategoryForm(true)}
                className="bg-accent hover:bg-accent/90"
              >
                Create First Category
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
                          No items in this category
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAddItemForm(category.id)}
                        >
                          Add First Item
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
                          onUpdateDiscount={(discount) =>
                            updateItemDiscount(item.id, discount)
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
                      + Add Item
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
          Last synced: {new Date(menuData.lastSynced).toLocaleString()}
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
