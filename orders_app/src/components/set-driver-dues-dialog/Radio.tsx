import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Props = {
  duesOption: string;
  setDuesOption: (value: string) => void;
};

export default function Radio({ duesOption, setDuesOption }: Props) {
  return (
    <RadioGroup value={duesOption} onValueChange={setDuesOption}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="zero" id="zero" />
        <Label htmlFor="zero">Set to Zero</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="custom" id="custom" />
        <Label htmlFor="custom">Custom Amount</Label>
      </div>
    </RadioGroup>
  );
}
