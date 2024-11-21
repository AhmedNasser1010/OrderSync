import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import Header from "./Header";
import Trigger from "./Trigger";
import SetDuesOption from "./SetDuesOption";

export default function DriverDuesDialog({ driverId }: { driverId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Trigger />
      <DialogContent className="disabled-click-1 sm:max-w-[425px]">
        <Header />
        <SetDuesOption setOpen={setOpen} driverId={driverId} />
      </DialogContent>
    </Dialog>
  );
}
