import { Button } from "@/components/ui/button";

type Props = {
  selectedDriver: string | null;
  handleAssign: () => void;
};

export default function AssignOrderButton({ selectedDriver, handleAssign }: Props) {
  return (
    <Button onClick={handleAssign} disabled={!selectedDriver}>
      Assign Order
    </Button>
  );
}
