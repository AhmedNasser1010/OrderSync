"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { MenuData, MenuCategory } from "@/lib/menu-types";
import type { ItemType, MainMenuType, DiscountObject } from "@ordersync/types";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import {
  useFetchMenuDataQuery,
  useSyncMenuDataMutation,
} from "@/rtk/api/firestoreApi";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  addCategory as addCategoryAction,
  addItem as addItemAction,
  addMenu,
  moveCategory as moveCategoryAction,
  moveItem as moveItemAction,
  removeCategory as removeCategoryAction,
  removeItem as removeItemAction,
  setLastSynced,
  setSyncedSnapshot,
  updateCategory as updateCategoryAction,
  updateItem as updateItemAction,
} from "@/rtk/slices/menuSlice";

const STORAGE_KEY_PREFIX = "restaurant_menu_data";

interface RawMenuCategory {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  visibility?: boolean;
  visible?: boolean;
  topMenu?: boolean;
  discount?: DiscountObject;
  createdAt?: number | string;
  updatedAt?: number | string;
  timestamp?: number | string;
  images?: string | string[];
  backgrounds?: string | string[];
  image?: string;
}

interface RawMenuItem {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  price?: string | number;
  category?: string;
  categoryId?: string;
  visibility?: boolean;
  visible?: boolean;
  topMenu?: boolean;
  discount?: DiscountObject;
  createdAt?: number | string;
  updatedAt?: number | string;
  timestamp?: number | string;
  sizes?: { size?: string; price?: string | number }[];
  images?: string | string[];
  backgrounds?: string | string[];
  image?: string;
}

interface RawMenuData {
  categories?: RawMenuCategory[];
  items?: RawMenuItem[];
  orderDiscounts?: DiscountObject[];
  lastSynced?: string;
}

const emptyMenuData: MenuData = {
  categories: [],
  lastSynced: new Date().toISOString(),
};

function extractBackgrounds(
  obj: RawMenuCategory | RawMenuItem | null | undefined,
): string[] {
  if (!obj) return [];
  const backgrounds = obj.backgrounds ?? obj.images ?? obj.image;
  if (Array.isArray(backgrounds))
    return backgrounds.filter((img) => typeof img === "string" && img.trim());
  if (typeof backgrounds === "string" && backgrounds.trim())
    return [backgrounds];
  return [];
}

function normalizeSizes(
  sizes?: { size?: string; price?: string | number }[],
): ItemType["sizes"] {
  if (!Array.isArray(sizes)) {
    return undefined;
  }

  const normalizedSizes = sizes
    .map((size) => {
      const label = String(size?.size ?? "")
        .trim()
        .toUpperCase();
      if (!label) {
        return null;
      }

      return {
        size: label,
        price:
          typeof size?.price === "number"
            ? String(size.price)
            : typeof size?.price === "string"
              ? size.price
              : "",
      };
    })
    .filter(Boolean) as NonNullable<ItemType["sizes"]>;

  return normalizedSizes.length > 0 ? normalizedSizes : undefined;
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((entry) => stripUndefined(entry))
      .filter((entry) => entry !== undefined) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, stripUndefined(entry)]),
    ) as T;
  }

  return value;
}

function resolveTimestamp(
  value: number | string | undefined,
  fallback: number,
): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseInt(value, 10) || fallback;
  return fallback;
}

function normalizeMenuData(rawData?: RawMenuData): MenuData {
  if (!rawData?.categories || !Array.isArray(rawData.categories)) {
    return emptyMenuData;
  }

  const now = Date.now();

  const categories: MenuCategory[] = rawData.categories.map(
    (category, index) => {
      const ts =
        resolveTimestamp(category.createdAt, now) ||
        resolveTimestamp(category.updatedAt, now) ||
        resolveTimestamp(category.timestamp, now) ||
        now;
      return {
        id: category.id ?? `cat-${index}`,
        title: category.title ?? category.name ?? "Category",
        description: category.description ?? "",
        visibility: category.visibility ?? category.visible ?? true,
        topMenu: !!category.topMenu,
        discount: category.discount,
        backgrounds: extractBackgrounds(category),
        createdAt: ts,
        updatedAt: ts,
        items: [],
      };
    },
  );

  const categoryMap = new Map(
    categories.map((category) => [category.id, category]),
  );
  const defaultCategory = categories[0];

  if (Array.isArray(rawData.items)) {
    rawData.items.forEach((item, index) => {
      const categoryId =
        item.category ??
        item.categoryId ??
        defaultCategory?.id ??
        `cat-${index}`;
      const ts =
        resolveTimestamp(item.createdAt, now) ||
        resolveTimestamp(item.updatedAt, now) ||
        resolveTimestamp(item.timestamp, now) ||
        now;
      const mappedItem: ItemType = {
        id: item.id ?? `item-${index}`,
        title: item.title ?? item.name ?? "Item",
        description: item.description ?? "",
        price:
          typeof item.price === "number"
            ? item.price
            : typeof item.price === "string"
              ? parseFloat(item.price) || 0
              : 0,
        category: categoryId,
        visibility: item.visibility ?? item.visible ?? true,
        topMenu: !!item.topMenu,
        discount: item.discount,
        backgrounds: extractBackgrounds(item),
        sizes: normalizeSizes(item.sizes),
        createdAt: ts,
        updatedAt: ts,
      };

      const category = categoryMap.get(categoryId) ?? defaultCategory;
      if (category) {
        category.items.push(mappedItem);
      }
    });
  }

  return {
    categories,
    orderDiscounts: rawData.orderDiscounts,
    lastSynced: rawData.lastSynced ?? emptyMenuData.lastSynced,
  };
}

function createFirestoreMenuData(
  menuData: MenuData,
  accessToken: string,
  partnerUid: string,
): MainMenuType {
  const now = Date.now();
  const items = menuData.categories.flatMap((category) => category.items);
  const firestoreMenuData: MainMenuType = {
    accessToken,
    partnerUid,
    createdAt: now,
    updatedAt: now,
    categories: menuData.categories.map(({ items: _items, ...category }) => {
      void _items;
      return category;
    }),
    items,
    orderDiscounts: menuData.orderDiscounts,
  };

  return stripUndefined(firestoreMenuData);
}

export function useMenuData(resId?: string, partnerUid?: string) {
  const dispatch = useAppDispatch();
  const menuData = useAppSelector((state) => state.menu);

  const { data: menuDataDB } = useFetchMenuDataQuery(resId ?? skipToken);
  const [syncMenuData] = useSyncMenuDataMutation();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const storageKey = useMemo(
    () => (resId ? `${STORAGE_KEY_PREFIX}_${resId}` : null),
    [resId],
  );

  const saveToLocalStorage = useCallback(
    (data: MenuData) => {
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (e) {
        console.error("[menu] Failed to save menu data:", e);
      }
    },
    [storageKey],
  );

  useEffect(() => {
    if (!storageKey) return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MenuData;
        dispatch(addMenu(parsed));
        dispatch(setSyncedSnapshot(parsed));
      } catch (e) {
        console.error("[menu] Failed to parse menu data:", e);
      }
    }
  }, [dispatch, storageKey]);

  useEffect(() => {
    if (!menuDataDB) {
      return;
    }

    const normalized = normalizeMenuData(menuDataDB as RawMenuData);
    dispatch(addMenu(normalized));
    dispatch(setSyncedSnapshot(normalized));
  }, [menuDataDB, dispatch]);

  useEffect(() => {
    const { syncedSnapshot: _snapshot, ...persistable } = menuData;
    void _snapshot;
    saveToLocalStorage(persistable);
  }, [menuData, saveToLocalStorage]);

  const updateCategory = useCallback(
    (categoryId: string, updates: Partial<MenuCategory>) => {
      dispatch(updateCategoryAction({ id: categoryId, updates }));
    },
    [dispatch],
  );

  const updateMenuItem = useCallback(
    (itemId: string, updates: Partial<ItemType>) => {
      dispatch(updateItemAction({ id: itemId, updates }));
    },
    [dispatch],
  );

  const toggleItemVisibility = useCallback(
    (itemId: string) => {
      const item = menuData.categories
        .flatMap((c) => c.items)
        .find((i) => i.id === itemId);
      if (item) {
        dispatch(
          updateItemAction({ id: itemId, updates: { visibility: !item.visibility } }),
        );
      }
    },
    [dispatch, menuData.categories],
  );

  const toggleCategoryVisibility = useCallback(
    (categoryId: string) => {
      const category = menuData.categories.find((c) => c.id === categoryId);
      if (category) {
        dispatch(
          updateCategoryAction({
            id: categoryId,
            updates: { visibility: !category.visibility },
          }),
        );
      }
    },
    [dispatch, menuData.categories],
  );

  const syncToCloud = useCallback(async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      if (!resId) {
        throw new Error("Restaurant ID is unavailable.");
      }

      const syncedMenuData: MenuData = {
        ...menuData,
        lastSynced: new Date().toISOString(),
      };
      const firestoreMenuData = createFirestoreMenuData(
        syncedMenuData,
        resId,
        partnerUid ?? "",
      );

      await syncMenuData({ resId, menu: firestoreMenuData }).unwrap();
      dispatch(setSyncedSnapshot(syncedMenuData));
      dispatch(setLastSynced(syncedMenuData.lastSynced));

      setSyncMessage("Menu synced successfully!");
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (error: unknown) {
      setSyncMessage("Failed to sync menu");
      const message = error instanceof Error ? error.message : String(error);
      console.error("[menu] Sync error:", message);
    } finally {
      setIsSyncing(false);
    }
  }, [dispatch, menuData, resId, partnerUid, syncMenuData]);

  const addCategory = useCallback(
    (title: string, description: string) => {
      const now = Date.now();
      const newCategory: MenuCategory = {
        id: `cat-${now}`,
        title,
        description,
        visibility: true,
        topMenu: false,
        backgrounds: [],
        createdAt: now,
        updatedAt: now,
        items: [],
      };
      dispatch(addCategoryAction(newCategory));
      return newCategory;
    },
    [dispatch],
  );

  const addMenuItem = useCallback(
    (
      categoryId: string,
      title: string,
      description: string,
      price: number,
      sizes?: ItemType["sizes"],
      topMenu = false,
    ) => {
      const now = Date.now();
      const newItem: ItemType = {
        id: `item-${now}`,
        title,
        description,
        price,
        category: categoryId,
        visibility: true,
        topMenu,
        sizes,
        backgrounds: [],
        createdAt: now,
        updatedAt: now,
      };
      dispatch(addItemAction(newItem));
      return newItem;
    },
    [dispatch],
  );

  const deleteCategory = useCallback(
    (categoryId: string) => {
      dispatch(removeCategoryAction({ id: categoryId }));
    },
    [dispatch],
  );

  const deleteItem = useCallback(
    (itemId: string) => {
      dispatch(removeItemAction({ id: itemId }));
    },
    [dispatch],
  );

  const moveCategory = useCallback(
    (categoryId: string, direction: "up" | "down") => {
      dispatch(moveCategoryAction({ categoryId, direction }));
    },
    [dispatch],
  );

  const moveItem = useCallback(
    (itemId: string, direction: "up" | "down") => {
      dispatch(moveItemAction({ itemId, direction }));
    },
    [dispatch],
  );

  const hasChanges = useMemo(() => {
    const { syncedSnapshot, ...currentMenu } = menuData;
    if (!syncedSnapshot) return true;
    return JSON.stringify(currentMenu) !== JSON.stringify(syncedSnapshot);
  }, [menuData]);

  const revertChanges = useCallback(() => {
    if (menuData.syncedSnapshot) {
      dispatch(addMenu(menuData.syncedSnapshot));
    }
  }, [dispatch, menuData.syncedSnapshot]);

  return {
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
  };
}
