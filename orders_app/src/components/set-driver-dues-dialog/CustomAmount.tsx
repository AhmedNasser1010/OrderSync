import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

type Props = {
  customDues: string;
  setCustomDues: (value: string) => void;
};

export default function CustomAmount({ customDues, setCustomDues }: Props) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="custom-dues" className="text-right">
        Amount
      </Label>
      <div className="col-span-3 relative">
        <DollarSign
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          size={16}
        />
        <Input
          id="custom-dues"
          value={customDues}
          onChange={(e) => setCustomDues(e.target.value)}
          className="pl-8"
          placeholder="Enter amount"
          type="number"
          step="0.01"
          min="0"
        />
      </div>
    </div>
  );
}
