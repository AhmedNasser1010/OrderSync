"use client";

import { useState } from "react";
import { CircleHelp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WidgetHelpProps {
  widgetKey: string;
}

const HELP_CONTENT: Record<string, { title: string; description: string }> = {
  targetSegmentsHelp: {
    title: "Target Segments",
    description:
      "Choose which customer groups this discount applies to. Leave empty to apply to all customers. Segments include: New (registered < 30 days), Active (ordered within 14 days), Inactive (no order in 30 days), VIP (high spenders or frequent buyers), and At Risk (previously active but haven't ordered in 21+ days).",
  },
  discountMessageHelp: {
    title: "Message",
    description:
      "The text displayed to customers when this discount is applied. Keep it short and clear, e.g. '20% off for new customers!' or 'Summer sale — 15% off all items'.",
  },
  discountTypeHelp: {
    title: "Type",
    description:
      "Percentage (P) deducts a percentage from the price, e.g. 20 means 20% off. Fixed (FIXED) deducts a specific amount, e.g. 10 means $10 off regardless of the item price.",
  },
  discountValueHelp: {
    title: "Value",
    description:
      "The discount amount. For Percentage type, this is the percent off (e.g. 20 = 20% off). For Fixed type, this is the exact amount to subtract (e.g. 10 = $10 off).",
  },
  discountDateHelp: {
    title: "Dates",
    description:
      "Set a start and end date to limit when this discount is active. Leave both empty for a discount that never expires. If only a start date is set, the discount is active from that date onward. If only an end date is set, the discount is active until that date.",
  },
  discountTimeRulesHelp: {
    title: "Time-Based Rules",
    description:
      "Restrict this discount to specific days and hours. For example, enable this for a 'Happy Hour' discount that only applies Mon–Fri from 12:00 to 15:00. When disabled, the discount is available at all times.",
  },
  discountStackingHelp: {
    title: "Stacking Mode",
    description:
      "Controls how this discount interacts with other active discounts. Highest: only the best discount applies. Lowest: only the smallest discount applies. Stack: all eligible discounts combine. Priority: discounts apply in order set by the manager. Exclusive: if this discount applies, no others can.",
  },
  discountConditionsHelp: {
    title: "Conditions",
    description:
      "Set rules that must be met before a customer can use this discount. Use AND to require all conditions, or OR to require at least one. Available conditions: First Purchase (never ordered before), Total Spent (minimum amount spent), Total Items (minimum items purchased), Total Orders (minimum orders placed), Account Age (days since registration), and Days Since Last Order (days of inactivity).",
  },
  minOrderTotalHelp: {
    title: "Min Order Total",
    description:
      "The minimum order subtotal (before tax and delivery) required for this discount to apply. For example, setting this to 50 means the customer must spend at least 50 to qualify. Leave at 0 for no minimum.",
  },
  minCartItemsHelp: {
    title: "Min Cart Items",
    description:
      "The minimum number of items in the cart required for this discount to apply. For example, setting this to 3 means the customer must have at least 3 items. Leave at 0 for no minimum.",
  },
};

export function WidgetHelp({ widgetKey }: WidgetHelpProps) {
  const [open, setOpen] = useState(false);
  const content = HELP_CONTENT[widgetKey];

  if (!content) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          setOpen(true);
        }}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <CircleHelp className="w-3.5 h-3.5" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{content.title}</DialogTitle>
            <DialogDescription>{content.description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
