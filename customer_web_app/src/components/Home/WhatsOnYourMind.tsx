"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useAppDispatch } from "@/rtk/hooks";
import { addFilter, clearAll } from "@/rtk/slices/filterSlice";
import { cn } from "@/lib/utils";

const categories = [
  { id: "italian-pizza", img: "https://i.imgur.com/avMww3r.jpg" },
  { id: "sandwiches", img: "https://i.imgur.com/jh2GEIS.jpg" },
  { id: "pasta", img: "https://i.imgur.com/y44eLlr.jpg" },
];

function WhatsOnYourMind() {
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const t = useTranslations();
  const isRTL = locale === "ar";

  const handleFoodScrollLeft = () => {
    const foodCategory = document.querySelector(".food-category");
    foodCategory && (foodCategory.scrollLeft = foodCategory.scrollLeft - 250);
  };

  const handleFoodScrollRight = () => {
    const foodCategory = document.querySelector(".food-category");
    foodCategory && (foodCategory.scrollLeft = foodCategory.scrollLeft + 250);
  };

  const handleTriggerFilter = (tag: string) => {
    dispatch(clearAll());
    dispatch(addFilter(tag));
    document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="img-carousel" className="relative">
      <h2 className="font-GrotBlack text-2xl pb-5">{t("What's on your mind?")}</h2>
      <div
        className={cn(
          "scroll-buttons absolute top-0 flex gap-2",
          isRTL ? "left-10" : "right-10"
        )}
      >
        <button
          onClick={handleFoodScrollLeft}
          className={cn(
            "flex justify-center cursor-pointer rounded-full border border-color-7 p-2.5 hover:bg-color-7/30",
            isRTL && "order-1"
          )}
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <button
          onClick={handleFoodScrollRight}
          className="flex justify-center cursor-pointer rounded-full border border-color-7 p-2.5 hover:bg-color-7/30"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
      <div className="food-category overflow-x-scroll scroll-smooth scrollbar-hide max-w-[1500px]">
        <div className="flex gap-6">
          {categories?.map((category) => (
            <div
              className="cursor-pointer"
              key={category?.id}
              onMouseUp={() => handleTriggerFilter(category.id)}
            >
              <div className="w-36">
                <img src={category?.img} alt="category" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhatsOnYourMind;
