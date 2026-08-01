"use client";

import ItemInfoSide from "@/components/RestaurantMenu/ItemInfoSide";
import ItemPreviewSide from "@/components/RestaurantMenu/ItemPreviewSide";
import type { ItemType, SizeType } from "@ordersync/types";

type ItemWithSelection = ItemType & { selectedSize?: SizeType | null };

const AccordionBody = ({
  filteredMenuItems,
  resID,
  status,
}: {
  filteredMenuItems: ItemWithSelection[];
  resID: string;
  status: string;
}) => {
  return (
    <div className="accordion-body">
      {filteredMenuItems?.map((item) => (
        <div
          key={item?.id}
          className="item flex items-start justify-between pb-8"
        >
          <ItemInfoSide item={item} resID={resID} />
          <ItemPreviewSide item={item} status={status} resID={resID} />
        </div>
      ))}
    </div>
  );
};

export default AccordionBody;
