import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFetchDriversDataQuery } from "@/rtk/api/firestoreApi";
import { accessToken } from "@/rtk/slices/constantsSlice";
import { useAppSelector } from "@/rtk/hooks";
import { Driver } from "@/types/driver";
import { FormattedDriverForAssignCard } from "@/types/components";
import useAssign from "@/hooks/order-handlers/useAssign";
import useOrders from "@/hooks/useOrders";

import AssignDialogTrigger from "@/components/assign-order-dialog/AssignDialogTrigger";
import AssignDialogHeader from "@/components/assign-order-dialog/AssignDialogHeader";
import AssignOrderButton from "@/components/assign-order-dialog/AssignOrderButton";
import AssignSearchBox from "@/components/assign-order-dialog/AssignSearchBox";
import AssignDriverCard from "@/components/assign-order-dialog/AssignDriverCard";

export default function AssignOrder({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const resAccessToken = useAppSelector(accessToken);
  const { data: driversData } = useFetchDriversDataQuery(resAccessToken);
  const assign = useAssign();
  const { getOrder, isLoading } = useOrders();

  const drivers = useMemo(() => {
    return driversData && driversData.length
      ? driversData.map((driver: Driver) => ({
          id: driver.uid,
          name: driver.userInfo.name,
          avatar: "/placeholder.svg?height=40&width=40",
          ordersDues: driver.ordersDues,
          status:
            driver.online.byManager && driver.online.byUser
              ? driver.queue.length
                ? "On delivery"
                : "Available"
              : "Off duty",
        }))
      : [];
  }, [driversData]);

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (isLoading === false) {
      const order = getOrder(orderId) || null;
      if (order) {
        setSelectedDriver(order.delivery.uid);
      }
    }
  }, [getOrder, isLoading, orderId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AssignDialogTrigger />
      <DialogContent className="disabled-click-1 sm:max-w-[425px]">
        <AssignDialogHeader />
        <div className="grid gap-4 py-4">
          <AssignSearchBox
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setSelectedDriver={setSelectedDriver}
            drivers={drivers}
          />
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {filteredDrivers.map((driver: FormattedDriverForAssignCard) => (
              <AssignDriverCard
                key={driver.id}
                driver={driver}
                selectedDriver={selectedDriver}
                setSelectedDriver={setSelectedDriver}
              />
            ))}
          </ScrollArea>
        </div>
        <AssignOrderButton
          handleAssign={() =>
            assign(selectedDriver, orderId, () => setOpen(false))
          }
          selectedDriver={selectedDriver}
        />
      </DialogContent>
    </Dialog>
  );
}
