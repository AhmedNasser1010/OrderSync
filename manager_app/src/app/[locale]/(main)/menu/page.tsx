"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, Cloud, UtensilsCrossed, Percent, Trash2, Power, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useMenuData } from "@/hooks/useMenuData";
import { CategoryHeader } from "@/components/menu/category-header";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { CategoryForm } from "@/components/menu/category-form";
import { MenuItemForm } from "@/components/menu/menu-item-form";
import { DiscountDialog } from "@/components/menu/DiscountDialog";
import { Button } from "@/components/ui/button";
import { ActionsMenu } from "@/components/ui/actions-menu";
import { AppHeader } from "@/components/dashboard/app-header";
import type { DiscountObject, DiscountLevel } from "@ordersync/types";
import type { RootState } from "@/lib/rtk/store";
import {
  setItemDiscount,
  removeItemDiscount,
  setCategoryDiscount,
  removeCategoryDiscount,
  addOrderDiscount,
  updateOrderDiscount,
  removeOrderDiscount,
  toggleItemDiscountActive,
  toggleCategoryDiscountActive,
  toggleOrderDiscountActive,
} from "@/lib/rtk/slices/menuSlice";

export default function MenuManagementPage() {
  const dispatch = useDispatch();
  const orderDiscounts = useSelector(
    (state: RootState) => state.menu.orderDiscounts ?? [],
  );

  const {
    menuData,
    isSyncing,
    syncMessage,
    hasChanges,
    revertChanges,
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

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Discount dialog state
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [discountDialogLevel, setDiscountDialogLevel] =
    useState<DiscountLevel>("item");
  const [editingDiscount, setEditingDiscount] = useState<
    DiscountObject | undefined
  >(undefined);
  const [discountContext, setDiscountContext] = useState<{
    type: "item" | "category" | "order";
    itemId?: string;
    categoryId?: string;
  } | null>(null);

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

  // Discount handlers
  const openItemDiscountDialog = (itemId: string) => {
    const item = menuData.categories
      .flatMap((c) => c.items)
      .find((i) => i.id === itemId);
    setDiscountDialogLevel("item");
    setDiscountContext({ type: "item", itemId });
    setEditingDiscount(item?.discount);
    setDiscountDialogOpen(true);
  };

  const openCategoryDiscountDialog = (categoryId: string) => {
    const category = menuData.categories.find((c) => c.id === categoryId);
    setDiscountDialogLevel("category");
    setDiscountContext({ type: "category", categoryId });
    setEditingDiscount(category?.discount);
    setDiscountDialogOpen(true);
  };

  const openOrderDiscountDialog = () => {
    setDiscountDialogLevel("order");
    setDiscountContext({ type: "order" });
    setEditingDiscount(undefined);
    setDiscountDialogOpen(true);
  };

  const openEditOrderDiscountDialog = (discount: DiscountObject) => {
    setDiscountDialogLevel("order");
    setDiscountContext({ type: "order" });
    setEditingDiscount(discount);
    setDiscountDialogOpen(true);
  };

  const handleDiscountDelete = () => {
    if (!discountContext || !editingDiscount) return;

    switch (discountContext.type) {
      case "item":
        if (discountContext.itemId) {
          dispatch(removeItemDiscount({ itemId: discountContext.itemId }));
        }
        break;
      case "category":
        if (discountContext.categoryId) {
          dispatch(removeCategoryDiscount({ categoryId: discountContext.categoryId }));
        }
        break;
      case "order":
        dispatch(removeOrderDiscount({ id: editingDiscount.id }));
        break;
    }
  };

  const handleDiscountSubmit = (discount: DiscountObject) => {
    if (!discountContext) return;

    switch (discountContext.type) {
      case "item":
        if (discountContext.itemId) {
          dispatch(
            setItemDiscount({ itemId: discountContext.itemId, discount }),
          );
        }
        break;
      case "category":
        if (discountContext.categoryId) {
          dispatch(
            setCategoryDiscount({
              categoryId: discountContext.categoryId,
              discount,
            }),
          );
        }
        break;
      case "order":
        if (editingDiscount) {
          dispatch(
            updateOrderDiscount({ id: editingDiscount.id, updates: discount }),
          );
        } else {
          dispatch(addOrderDiscount(discount));
        }
        break;
    }

    setDiscountDialogOpen(false);
    setDiscountContext(null);
    setEditingDiscount(undefined);
  };

  const handleRemoveItemDiscount = (itemId: string) => {
    dispatch(removeItemDiscount({ itemId }));
  };

  const handleRemoveCategoryDiscount = (categoryId: string) => {
    dispatch(removeCategoryDiscount({ categoryId }));
  };

  const handleRemoveOrderDiscount = (discountId: string) => {
    dispatch(removeOrderDiscount({ id: discountId }));
  };

  const handleToggleItemDiscountActive = (itemId: string) => {
    dispatch(toggleItemDiscountActive({ itemId }));
  };

  const handleToggleCategoryDiscountActive = (categoryId: string) => {
    dispatch(toggleCategoryDiscountActive({ categoryId }));
  };

  const handleToggleOrderDiscountActive = (discountId: string) => {
    dispatch(toggleOrderDiscountActive({ id: discountId }));
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
        <div className="mb-6">
          {hasChanges && (
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("unsavedChanges")}
                </span>
              </div>
              <button
                onClick={revertChanges}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("revertChanges")}
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => setShowCategoryForm(true)}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Plus size={16} />
              <span>{t("addCategory")}</span>
            </Button>

            <Button
              onClick={syncToCloud}
              disabled={isSyncing || !hasChanges}
              className="flex-1 gap-2"
            >
              {isSyncing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Cloud size={16} />
              )}
              <span>{isSyncing ? t("syncing") : t("sync")}</span>
            </Button>
          </div>
        </div>

        {syncMessage && (
          <div className="mb-6 p-3 bg-accent/20 border border-accent rounded-md text-sm text-foreground">
            {syncMessage}
          </div>
        )}

        {/* Cart Discounts Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {t("orderDiscounts")}
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={openOrderDiscountDialog}
              className="gap-1"
            >
              <Plus size={14} />
              {t("addOrderDiscount")}
            </Button>
          </div>

          {orderDiscounts.length > 0 ? (
            <div className="space-y-2">
              {orderDiscounts.map((discount) => (
                <div
                  key={discount.id}
                  className="flex items-center justify-between p-3 bg-card/50 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 ${
                        discount.active
                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                          : "bg-muted text-muted-foreground border-border opacity-60"
                      }`}
                    >
                      <Percent size={12} />
                      {discount.type === "P"
                        ? `${discount.value}% OFF`
                        : `$${discount.value} OFF`}
                      {!discount.active && ` · ${t("disabled")}`}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {discount.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {discount.code}
                        {discount.minOrderTotal
                          ? ` · Min $${discount.minOrderTotal}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <ActionsMenu
                    items={[
                      {
                        key: "edit",
                        label: t("editDiscount"),
                        onClick: () => openEditOrderDiscountDialog(discount),
                        icon: <Percent size={14} />,
                      },
                      {
                        key: "toggleActive",
                        label: discount.active ? t("disableDiscount") : t("enableDiscount"),
                        onClick: () => handleToggleOrderDiscountActive(discount.id),
                        icon: <Power size={14} />,
                      },
                      {
                        key: "remove",
                        label: t("removeDiscount"),
                        onClick: () => handleRemoveOrderDiscount(discount.id),
                        icon: <Trash2 size={14} />,
                        destructive: true,
                      },
                    ]}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-3 bg-card/30 border border-border rounded-lg">
              {t("noOrderDiscounts")}
            </p>
          )}
        </div>

        {/* Categories */}
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
                  onAddDiscount={() =>
                    openCategoryDiscountDialog(category.id)
                  }
                  onRemoveDiscount={() =>
                    handleRemoveCategoryDiscount(category.id)
                  }
                  onToggleDiscountActive={() =>
                    handleToggleCategoryDiscountActive(category.id)
                  }
                />

                {expandedCategories.has(category.id) && (
                  <div className="ps-2 sm:ps-4 space-y-3">
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
                          onAddDiscount={() =>
                            openItemDiscountDialog(item.id)
                          }
                          onRemoveDiscount={() =>
                            handleRemoveItemDiscount(item.id)
                          }
                          onToggleDiscountActive={() =>
                            handleToggleItemDiscountActive(item.id)
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

      <DiscountDialog
        open={discountDialogOpen}
        onOpenChange={setDiscountDialogOpen}
        onSubmit={handleDiscountSubmit}
        onDelete={editingDiscount ? handleDiscountDelete : undefined}
        level={discountDialogLevel}
        initialData={editingDiscount}
        isEditing={!!editingDiscount}
      />
    </div>
  );
}
