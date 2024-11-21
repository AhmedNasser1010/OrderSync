import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"

type Props = {
  handleConfirm: () => void;
  setOpen: (open: boolean) => void;
}

export default function Footer({ handleConfirm, setOpen }: Props) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </DialogFooter>
  );
}
