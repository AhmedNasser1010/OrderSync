import { Inbox } from "lucide-react";
import type { MainTabTypes } from "@/types/orders";

const tabMessages: Record<MainTabTypes, string> = {
  RECEIVED: "No new orders have come in yet.",
  PREPARING: "No orders are currently being prepared.",
  DELIVERY: "No orders are out for delivery.",
  COMPLETED: "No orders have been fulfilled yet.",
  VOIDED: "No voided orders.",
};

export default function NoOrders({ activeTab }: { activeTab: MainTabTypes }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">
        No Orders Found
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        {tabMessages[activeTab]}
      </p>
    </div>
  );
}
