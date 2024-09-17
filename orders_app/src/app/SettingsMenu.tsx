"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings, FileText, Calendar, BarChart3 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/rtk/hooks";
import { setActiveTab, optionMenuView, setOptionsMenuView, setCloseDayPopup } from "@/lib/rtk/slices/toggleSlice";
import MenuCard from './MenuCard'

function SettingsMenu() {
  const dispatch = useAppDispatch();
  const optionMenuViewValue = useAppSelector(optionMenuView)

  const afterTriggerAction = (callback: () => void) => {
    callback();
    // dispatch(setOptionsMenuView(false));
  }

  return (
    <Sheet open={optionMenuViewValue} onOpenChange={(value) => dispatch(setOptionsMenuView(value))}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-[32px] w-[32px]">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open settings menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg min-h-[50vh]">
        <SheetHeader>
          <SheetTitle>More</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <MenuCard
            callback={() => afterTriggerAction(() => dispatch(setActiveTab("COMPLETED")))}
            title="View Closed Orders"
            icon={<FileText className="h-8 w-8 mb-2" />}
          />
          <MenuCard
            callback={() => afterTriggerAction(() => dispatch(setCloseDayPopup({ isOpen: true })))}
            title="Close the Day"
            icon={<Calendar className="h-8 w-8 mb-2" />}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default SettingsMenu;
