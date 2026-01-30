import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import Header from "./Header";
import SetDuesOption from "./SetDuesOption";

export default function DriverDuesDialog({ children, driverId }: { children: React.ReactNode; driverId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {children}
      </DialogTrigger>
      <DialogContent className="disabled-click-1 sm:max-w-[425px]">
        <Header />
        <SetDuesOption setOpen={setOpen} driverId={driverId} />
      </DialogContent>
    </Dialog>
  );
}
