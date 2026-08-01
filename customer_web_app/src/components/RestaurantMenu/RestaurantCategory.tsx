"use client";

import { useMemo, useState } from "react";
import { useAppSelector } from "@/rtk/hooks";
import AccordionHeader from "@/components/RestaurantMenu/AccordionHeader";
import AccordionBody from "@/components/RestaurantMenu/AccordionBody";
import type { ItemType, SizeType } from "@ordersync/types";

type ItemWithSelection = ItemType & { selectedSize?: SizeType | null };

const RestaurantCategory = ({
  categoryID,
  resID,
  categoryTitle,
  status,
}: {
  categoryID: string;
  resID: string;
  categoryTitle?: string;
  status: string;
}) => {
  const menuItems = useAppSelector((state) => state.menu.items);
  const [showCategory, setShowCategory] = useState(true);

  const filteredMenuItems = useMemo<ItemWithSelection[]>(() => {
    const menu = menuItems.filter(
      (item: ItemType) => item.category === categoryID
    );
    return menu.map((item) => ({
      ...item,
      selectedSize:
        item?.sizes?.length && item?.sizes?.[0]?.price && item?.sizes?.[0]
          ? item.sizes[0]
          : null,
    }));
  }, [menuItems, categoryID]);

  const handleAccordionBody = () => {
    setShowCategory((showCategory) => !showCategory);
  };

  return (
    <div>
      <AccordionHeader
        itemsLength={filteredMenuItems?.length || ""}
        categoryTitle={categoryTitle}
        handleAccordionBody={handleAccordionBody}
        showCategory={showCategory}
      />

      {showCategory && (
        <AccordionBody
          filteredMenuItems={filteredMenuItems}
          resID={resID}
          status={status}
        />
      )}
    </div>
  );
};

export default RestaurantCategory;
