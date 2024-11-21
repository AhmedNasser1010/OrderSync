import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Header() {
  return (
    <DialogHeader>
      <DialogTitle>Set Driver Dues</DialogTitle>
      <DialogDescription>
        Choose whether to set the driver dues to zero or enter a custom amount.
      </DialogDescription>
    </DialogHeader>
  );
}
