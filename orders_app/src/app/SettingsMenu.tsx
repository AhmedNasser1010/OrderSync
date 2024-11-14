"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings, TicketX, TicketCheck, KeyRound, Wrench } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { setActiveTab, optionMenuView, setOptionsMenuView, setCloseDayPopup } from "@/rtk/slices/toggleSlice";
import MenuCard from './MenuCard'

function SettingsMenu() {
  const router = useRouter()
  const dispatch = useAppDispatch();
  const optionMenuViewValue = useAppSelector(optionMenuView)

  const afterTriggerAction = (callback: () => void) => {
    callback();
    dispatch(setOptionsMenuView(false));
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
          <SheetDescription>More Settings</SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <MenuCard
            callback={() => afterTriggerAction(() => dispatch(setActiveTab("COMPLETED")))}
            title="Completed Orders"
            icon={<TicketCheck className="h-8 w-8 mb-2" />}
          />
          <MenuCard
            callback={() => afterTriggerAction(() => dispatch(setActiveTab("VOIDED")))}
            title="Rejected Orders"
            icon={<TicketX className="h-8 w-8 mb-2" />}
          />
          <MenuCard
            callback={() => afterTriggerAction(() => dispatch(setCloseDayPopup({ isOpen: true })))}
            title="Close the Day"
            icon={<KeyRound className="h-8 w-8 mb-2" />}
          />
          <MenuCard
            callback={() => afterTriggerAction(() => router.push("/settings"))}
            title="Settings"
            icon={<Wrench className="h-8 w-8 mb-2" />}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default SettingsMenu;
