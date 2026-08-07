"use client";

import { XIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { addFilter, removeFilter } from "@/rtk/slices/filterSlice";
import { cn } from "@/lib/utils";

function Filter({
  children,
  filterId,
}: {
  children: React.ReactNode;
  filterId: string;
}) {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.filter);

  const isActive = filter.includes(filterId);

  const handleActive = () => {
    if (isActive) {
      dispatch(removeFilter(filterId));
    } else {
      dispatch(addFilter(filterId));
    }
  };

  return (
    <button
      className={cn(
        "filter-btn font-GrotMed text-color-3 text-sm tracking-tight",
        isActive && "active bg-primary/10 border-primary/25"
      )}
      onClick={handleActive}
    >
      {children}
      <span className={cn("text-lg ml-1 mb-[2px]", isActive ? "block" : "hidden")}>
        <XIcon className="size-4" />
      </span>
    </button>
  );
}

export default Filter;
