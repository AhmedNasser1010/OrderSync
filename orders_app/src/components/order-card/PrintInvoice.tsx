import useOrderHandler from "@/hooks/order-handlers/useOrderHandlers";
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react'
import { MainTabTypes } from "@/types/components";

export default function PrintInvoice({ activeTabValue }: { activeTabValue: MainTabTypes; }) {
  const {
    handlePrintInvoice,
  } = useOrderHandler();

  return (
    activeTabValue !== "RECEIVED" && (
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrintInvoice}
        className="disabled-click-1 flex items-center"
      >
        <Printer className="mr-2 h-4 w-4" />
        Print Invoice
      </Button>
    )
  );
}

{
  /* Accept, Reject Buttons Are Disabled */
}
{
  /* {order.accepted ? (
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrintInvoice}
        className="disabled-click-1 flex items-center"
      >
        <Printer className="mr-2 h-4 w-4" />
        Print Invoice
      </Button>
    ) : (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onMouseUp={handleAcceptOrder}
          className="flex items-center"
        >
          <Check className="mr-2 h-4 w-4" />
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRejectOrder}
          className="flex items-center"
        >
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </div>
    )} */
}
