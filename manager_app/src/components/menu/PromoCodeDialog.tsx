"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ConditionsEditor } from "./ConditionsEditor";
import type {
  PromoCode,
  DiscountType,
  DiscountConditions,
} from "@ordersync/types";

interface PromoCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (promoCode: PromoCode) => void;
  restaurantId: string;
  initialData?: PromoCode;
  isEditing?: boolean;
}

const DEFAULT_CONDITIONS: DiscountConditions = {
  operator: "AND",
  rules: [],
};

export function PromoCodeDialog({
  open,
  onOpenChange,
  onSubmit,
  restaurantId,
  initialData,
  isEditing = false,
}: PromoCodeDialogProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("P");
  const [value, setValue] = useState<number>(0);
  const [minOrderTotal, setMinOrderTotal] = useState<number>(0);
  const [minCartItems, setMinCartItems] = useState<number>(0);
  const [conditions, setConditions] = useState<DiscountConditions>(DEFAULT_CONDITIONS);
  const [startAt, setStartAt] = useState("");
  const [expireAt, setExpireAt] = useState("");
  const [usageLimit, setUsageLimit] = useState<number>(0);
  const [perUserLimit, setPerUserLimit] = useState<number>(1);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setMessage(initialData.message);
      setDiscountType(initialData.type);
      setValue(initialData.value);
      setMinOrderTotal(initialData.minOrderTotal ?? 0);
      setMinCartItems(initialData.minCartItems ?? 0);
      setConditions(initialData.conditions);
      setStartAt(
        initialData.startAt
          ? new Date(initialData.startAt).toISOString().slice(0, 16)
          : ""
      );
      setExpireAt(
        initialData.expireAt
          ? new Date(initialData.expireAt).toISOString().slice(0, 16)
          : ""
      );
      setUsageLimit(initialData.usageLimit ?? 0);
      setPerUserLimit(initialData.perUserLimit ?? 1);
      setActive(initialData.active ?? true);
    } else {
      resetForm();
    }
  }, [initialData, open]);

  const resetForm = () => {
    setCode("");
    setMessage("");
    setDiscountType("P");
    setValue(0);
    setMinOrderTotal(0);
    setMinCartItems(0);
    setConditions(DEFAULT_CONDITIONS);
    setStartAt("");
    setExpireAt("");
    setUsageLimit(0);
    setPerUserLimit(1);
    setActive(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || value <= 0) return;

    const promoCode: PromoCode = {
      id: initialData?.id ?? crypto.randomUUID(),
      restaurantId,
      code: code.trim().toUpperCase(),
      message: message.trim(),
      level: "order",
      type: discountType,
      value,
      minOrderTotal: minOrderTotal > 0 ? minOrderTotal : undefined,
      minCartItems: minCartItems > 0 ? minCartItems : undefined,
      conditions,
      startAt: startAt ? new Date(startAt).getTime() : null,
      expireAt: expireAt ? new Date(expireAt).getTime() : null,
      usageLimit: usageLimit > 0 ? usageLimit : null,
      usageCount: initialData?.usageCount ?? 0,
      perUserLimit: perUserLimit > 0 ? perUserLimit : undefined,
      active,
    };

    onSubmit(promoCode);
    resetForm();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-[60]"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full md:w-96 max-h-[85vh] overflow-y-auto bg-card border border-border rounded-t-lg md:rounded-lg p-6 shadow-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Promo Code" : "Create Promo Code"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Enabled
            </label>
            <Switch
              checked={active}
              onCheckedChange={setActive}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Promo Code
            </label>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SUMMER2024"
              className="uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Message
            </label>
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. 15% off with code SUMMER2024"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="w-full h-8 px-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="P">Percentage (%)</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Value
              </label>
              <Input
                type="number"
                value={value || ""}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Min Order Total
              </label>
              <Input
                type="number"
                value={minOrderTotal || ""}
                onChange={(e) =>
                  setMinOrderTotal(parseFloat(e.target.value) || 0)
                }
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Min Cart Items
              </label>
              <Input
                type="number"
                value={minCartItems || ""}
                onChange={(e) =>
                  setMinCartItems(parseInt(e.target.value) || 0)
                }
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Usage Limit
              </label>
              <Input
                type="number"
                value={usageLimit || ""}
                onChange={(e) =>
                  setUsageLimit(parseInt(e.target.value) || 0)
                }
                min="0"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Per User Limit
              </label>
              <Input
                type="number"
                value={perUserLimit || ""}
                onChange={(e) =>
                  setPerUserLimit(parseInt(e.target.value) || 1)
                }
                min="1"
                placeholder="1"
              />
            </div>
          </div>

          <ConditionsEditor conditions={conditions} onChange={setConditions} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Start Date
              </label>
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                End Date
              </label>
              <Input
                type="datetime-local"
                value={expireAt}
                onChange={(e) => setExpireAt(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              {isEditing ? "Save Changes" : "Create Promo Code"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
