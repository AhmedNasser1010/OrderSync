import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bike } from "lucide-react";

export default function AssignDialogTrigger() {
  return (
    <DialogTrigger asChild className="disabled-click-1">
      <Button variant="outline" size="sm" className="flex items-center">
        <Bike className="mr-2 h-4 w-4" />
        Assign
      </Button>
    </DialogTrigger>
  );
}
