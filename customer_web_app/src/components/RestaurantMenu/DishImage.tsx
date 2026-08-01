"use client";

import type { ItemType } from "@ordersync/types";

const DishImage = ({ item }: { item: ItemType }) => {
  return (
    <div className="dish-image-container">
      <button className="cursor-pointer w-[118px] h-24 rounded-md">
        <img
          src={item?.backgrounds?.[0] || "/assets/FoodAndDrinkDesign.svg"}
          alt="menu-img"
          className="rounded-md w-[118px] h-24 object-cover"
        />
      </button>
    </div>
  );
};

export default DishImage;
