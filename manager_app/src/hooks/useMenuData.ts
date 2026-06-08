"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  MenuData,
  MenuCategory,
  MenuDocument,
  MenuItem,
} from "@/lib/types/types";
import { useAppDispatch, useAppSelector } from "@/lib/rtk/hooks";
import { userUid } from "@/lib/rtk/slices/constantsSlice";
import {
  useFetchMenuDataQuery,
  useFetchUserDataQuery,
  useSyncMenuDataMutation,
} from "@/lib/rtk/api/firestoreApi";
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
  updateCategory as updateCategoryAction,
  updateItem as updateItemAction,
} from "@/lib/rtk/slices/menuSlice";

const STORAGE_KEY = "restaurant_menu_data";

type RawMenuCategory = {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  visibility?: boolean;
  visible?: boolean;
  topMenu?: boolean;
  position?: number;
  timestamp?: number | string;
  images?: string | string[];
  backgrounds?: string | string[];
  image?: string;
  [key: string]: any;
};

type RawMenuItem = {
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
  timestamp?: number | string;
  discount?: any;
  sizes?: { size?: string; price?: string | number }[];
  images?: string | string[];
  backgrounds?: string | string[];
  image?: string;
  [key: string]: any;
};

type RawMenuData = {
  categories?: RawMenuCategory[];
  items?: RawMenuItem[];
  lastSynced?: string;
  [key: string]: any;
};

const emptyMenuData: MenuData = {
  categories: [],
  lastSynced: new Date().toISOString(),
};

function extractBackgrounds(obj: any): string[] {
  if (!obj) return [];
  const backgrounds = obj.backgrounds ?? obj.images ?? obj.image;
  if (Array.isArray(backgrounds))
    return backgrounds.filter((img) => typeof img === "string" && img.trim());
  if (typeof backgrounds === "string" && backgrounds.trim())
    return [backgrounds];
  return [];
}

function normalizeDiscount(discount: any): MenuItem["discount"] {
  if (!discount) return { type: "percentage", value: 0, active: false };

  if (
    typeof discount === "object" &&
    typeof discount.type === "string" &&
    typeof discount.value !== "undefined"
  ) {
    return {
      type: discount.type === "fixed" ? "fixed" : "percentage",
      value: Number(discount.value) || 0,
      active: Boolean(discount.active),
    };
  }

  if (typeof discount?.code === "string") {
    const [rawType, rawValue] = discount.code.split("-");
    const parsedType =
      rawType?.toLowerCase() === "fixed" || rawType?.toUpperCase() === "FIXED"
        ? "fixed"
        : "percentage";

    return {
      type: parsedType,
      value: Number(rawValue) || 0,
      active: true,
    };
  }

  return { type: "percentage", value: 0, active: false };
}

function normalizeSizes(
  sizes?: { size?: string; price?: string | number }[],
): MenuItem["sizes"] {
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
            ? size.price
            : typeof size?.price === "string"
              ? size.price
              : "",
      };
    })
    .filter(Boolean) as NonNullable<MenuItem["sizes"]>;

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

function normalizeMenuData(rawData?: RawMenuData): MenuData {
  if (!rawData?.categories || !Array.isArray(rawData.categories)) {
    return emptyMenuData;
  }

  const categories: MenuCategory[] = rawData.categories.map(
    (category, index) => ({
      id: category.id ?? `cat-${index}`,
      title: category.title ?? category.name ?? "Category",
      description: category.description ?? "",
      visible: category.visibility ?? category.visible ?? true,
      featured: !!category.topMenu,
      timestamp:
        typeof category.timestamp === "number"
          ? category.timestamp
          : typeof category.timestamp === "string"
            ? parseInt(category.timestamp, 10) || Date.now()
            : Date.now(),
      position:
        typeof category.position === "number" ? category.position : index,
      items: [],
      backgrounds: extractBackgrounds(category),
    }),
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
      const mappedItem: MenuItem = {
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
        visible: item.visibility ?? item.visible ?? true,
        featured: !!item.topMenu,
        timestamp:
          typeof item.timestamp === "number"
            ? item.timestamp
            : typeof item.timestamp === "string"
              ? parseInt(item.timestamp, 10) || Date.now()
              : Date.now(),
        discount: normalizeDiscount(item.discount),
        sizes: normalizeSizes(item.sizes),
        backgrounds: extractBackgrounds(item),
      };

      const category = categoryMap.get(categoryId) ?? defaultCategory;
      if (category) {
        category.items.push(mappedItem);
      }
    });
  }

  return {
    categories,
    lastSynced: rawData.lastSynced ?? emptyMenuData.lastSynced,
  };
}

type FirestoreMenuData = MenuDocument;

function createFirestoreMenuData(
  menuData: MenuData,
  accessToken?: string,
): FirestoreMenuData {
  const firestoreMenuData = {
    categories: menuData.categories.map(({ items, ...category }) => category),
    items: menuData.categories.flatMap((category) => category.items),
    lastSynced: menuData.lastSynced,
    accessToken,
  };

  return stripUndefined(firestoreMenuData);
}

export function useMenuData() {
  const dispatch = useAppDispatch();
  const uid = useAppSelector(userUid);
  const menuData = useAppSelector((state) => state.menu);

  const { data: user } = useFetchUserDataQuery(uid ?? skipToken);
  const resId = user?.accessToken;
  const { data: menuDataDB } = useFetchMenuDataQuery(resId ?? skipToken);
  const [syncMenuData] = useSyncMenuDataMutation();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const saveToLocalStorage = useCallback((data: MenuData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("[v0] Failed to save menu data:", e);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MenuData;
        dispatch(addMenu(parsed));
      } catch (e) {
        console.error("[v0] Failed to parse menu data:", e);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (!menuDataDB) {
      return;
    }

    const normalized = normalizeMenuData(menuDataDB as RawMenuData);
    dispatch(addMenu(normalized));
  }, [menuDataDB, dispatch]);

  useEffect(() => {
    saveToLocalStorage(menuData);
  }, [menuData, saveToLocalStorage]);

  const updateCategory = useCallback(
    (categoryId: string, updates: Partial<MenuCategory>) => {
      dispatch(updateCategoryAction({ id: categoryId, updates }));
    },
    [dispatch],
  );

  const updateMenuItem = useCallback(
    (itemId: string, updates: Partial<MenuItem>) => {
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
          updateItemAction({ id: itemId, updates: { visible: !item.visible } }),
        );
      }
    },
    [dispatch, menuData.categories],
  );

  // const toggleItemFeatured = useCallback(
  //   (itemId: string) => {
  //     const item = menuData.categories
  //       .flatMap((c) => c.items)
  //       .find((i) => i.id === itemId);
  //     if (item) {
  //       dispatch(
  //         updateItemAction({
  //           id: itemId,
  //           updates: { featured: !item.featured },
  //         }),
  //       );
  //     }
  //   },
  //   [dispatch, menuData.categories],
  // );

  const toggleCategoryVisibility = useCallback(
    (categoryId: string) => {
      const category = menuData.categories.find((c) => c.id === categoryId);
      if (category) {
        dispatch(
          updateCategoryAction({
            id: categoryId,
            updates: { visible: !category.visible },
          }),
        );
      }
    },
    [dispatch, menuData.categories],
  );

  // const toggleCategoryFeatured = useCallback(
  //   (categoryId: string) => {
  //     const category = menuData.categories.find((c) => c.id === categoryId);
  //     if (category) {
  //       dispatch(
  //         updateCategoryAction({
  //           id: categoryId,
  //           updates: { featured: !category.featured },
  //         }),
  //       );
  //     }
  //   },
  //   [dispatch, menuData.categories],
  // );

  const updateItemDiscount = useCallback(
    (itemId: string, discount: MenuItem["discount"]) => {
      dispatch(updateItemAction({ id: itemId, updates: { discount } }));
    },
    [dispatch],
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
      const firestoreMenuData = createFirestoreMenuData(syncedMenuData, resId);

      await syncMenuData({ resId, menu: firestoreMenuData }).unwrap();
      dispatch(setLastSynced(syncedMenuData.lastSynced));

      setSyncMessage("Menu synced successfully!");
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (error: any) {
      setSyncMessage("Failed to sync menu");
      console.error("[v0] Sync error:", error?.message ?? error);
    } finally {
      setIsSyncing(false);
    }
  }, [dispatch, menuData, resId, syncMenuData]);

  const addCategory = useCallback(
    (title: string, description: string) => {
      const newCategory: MenuCategory = {
        id: `cat-${Date.now()}`,
        title,
        description,
        visible: true,
        featured: false,
        timestamp: Date.now(),
        position: menuData.categories.length,
        items: [],
        backgrounds: [],
      };
      dispatch(addCategoryAction(newCategory));
      return newCategory;
    },
    [dispatch, menuData.categories.length],
  );

  const addMenuItem = useCallback(
    (
      categoryId: string,
      title: string,
      description: string,
      price: number,
      sizes?: { size: string; price: string | number }[],
    ) => {
      const newItem: MenuItem = {
        id: `item-${Date.now()}`,
        title,
        description,
        price,
        category: categoryId,
        visible: true,
        featured: false,
        timestamp: Date.now(),
        discount: { type: "percentage", value: 0, active: false },
        sizes,
        backgrounds: [],
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

  return {
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
  };
}
