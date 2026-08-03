"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/rtk/hooks";
import MenuItemCard from "@/components/RestaurantMenu/MenuItemCard";
import type { CategoryType, ItemType, SizeType } from "@ordersync/types";

type ItemWithSelection = ItemType & { selectedSize?: SizeType | null };

const MenuSection = ({
  category,
  resID,
  status,
}: {
  category: CategoryType;
  resID: string;
  status: string;
}) => {
  const menuItems = useAppSelector((state) => state.menu.items);
  const t = useTranslations();
  const [showCategory, setShowCategory] = useState(true);

  const filteredMenuItems = useMemo<ItemWithSelection[]>(() => {
    const menu = menuItems.filter(
      (item: ItemType) =>
        item.category === category.id && item.visibility !== false
    );
    return menu.map((item) => ({
      ...item,
      selectedSize:
        item?.sizes?.length && item?.sizes?.[0]?.price && item?.sizes?.[0]
          ? item.sizes[0]
          : null,
    }));
  }, [menuItems, category.id]);

  if (!filteredMenuItems.length) return null;

  return (
    <section id={`category-${category.id}`} className="scroll-mt-36">
      <div className="flex items-center justify-between gap-3 py-5">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-color-2 to-[#ffab4a]" />
          <div>
            <h2 className="font-ProximaNovaBold text-xl text-color-1 sm:text-2xl">
              {category.title}
            </h2>
            {category.description && (
              <p className="font-ProximaNovaThin text-sm text-color-8">
                {category.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-color-7 px-2.5 py-1 font-ProximaNovaSemiBold text-xs text-color-6">
            {filteredMenuItems.length} {t("Items")}
          </span>
          <button
            type="button"
            onClick={() => setShowCategory((v) => !v)}
            aria-expanded={showCategory}
            aria-label={showCategory ? t("Collapse") : t("Expand")}
            className="grid size-8 place-items-center rounded-full text-color-9 transition-colors hover:bg-color-7 cursor-pointer"
          >
            {showCategory ? (
              <ChevronUp className="size-5" />
            ) : (
              <ChevronDown className="size-5" />
            )}
          </button>
        </div>
      </div>

      {showCategory && (
        <div>
          {filteredMenuItems.map((item) => (
            <div
              key={item?.id}
              className="border-b border-dashed border-color-7 last:border-none"
            >
              <MenuItemCard item={item} resID={resID} status={status} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MenuSection;
