import { useState } from "react";
import Radio from "./Radio";
import CustomAmount from "./CustomAmount";
import Footer from "./Footer";
import { useSetDriverDuesMutation } from "@/rtk/api/firestoreApi"

type Props = {
  driverId: string;
  setOpen: (open: boolean) => void;
};

export default function SetDuesOption({ driverId, setOpen }: Props) {
  const [duesOption, setDuesOption] = useState("zero");
  const [customDues, setCustomDues] = useState("");
  const [setDriverDues] = useSetDriverDuesMutation();

  const handleConfirm = () => {
    const duesValue = duesOption === "zero" ? 0 : parseFloat(customDues);
    console.log(`Setting driver ${driverId} dues to: ${duesValue}`);
    setDriverDues({ driverId, duesValue });
    setOpen(false);
  };

  return (
    <>
      <div className="grid gap-4 py-4">
        <Radio duesOption={duesOption} setDuesOption={setDuesOption} />
        {duesOption === "custom" && (
          <CustomAmount customDues={customDues} setCustomDues={setCustomDues} />
        )}
      </div>
      <Footer handleConfirm={handleConfirm} setOpen={setOpen} />
    </>
  );
}
