import DriverCardAvatar from "./DriverCardAvatar";
import DriverCardInfo from "./DriverCardInfo";
import DriverCardDuesAndActions from "./DriverCardDuesAndActions";
import { FormattedDriverForAssignCard } from "@/types/components";

type Props = {
  driver: FormattedDriverForAssignCard;
  selectedDriver: string | null;
  setSelectedDriver: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function AssignDriverCard({
  driver,
  selectedDriver,
  setSelectedDriver,
}: Props) {
  return (
    <div
      className={`flex items-center space-x-4 rounded-lg p-2 cursor-pointer ${
        selectedDriver === driver.id
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent"
      }`}
      onClick={() => setSelectedDriver(driver.id)}
    >
      <DriverCardAvatar avatar={driver.avatar} name={driver.name} />
      <DriverCardInfo status={driver.status} name={driver.name} />
      <DriverCardDuesAndActions driverId={driver.id} orderDues={driver.ordersDues} />
    </div>
  );
}
