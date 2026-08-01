"use client";

import { useRef, useState, useEffect } from "react";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = useState(false);
  const filter = useAppSelector((state) => state.filter);

  useEffect(() => {
    setIsActive(filter.includes(filterId));
  }, [filter, filterId]);

  const handleActive = () => {
    setIsActive(!isActive);
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
        isActive && "active"
      )}
      onClick={handleActive}
      ref={buttonRef}
    >
      {children}
      <span className="text-lg ml-1 mb-[2px] hidden">
        <XIcon className="size-4" />
      </span>
    </button>
  );
}

export default Filter;
