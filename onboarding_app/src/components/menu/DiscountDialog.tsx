"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetHelp } from "@/components/ui/widget-help";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ConditionsEditor } from "./ConditionsEditor";
import type {
  DiscountObject,
  DiscountLevel,
  DiscountType,
  DiscountConditions,
  StackingMode,
  CustomerSegment,
} from "@ordersync/types";

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (discount: DiscountObject) => void;
  onDelete?: () => void;
  level: DiscountLevel;
  initialData?: DiscountObject;
  isEditing?: boolean;
}

const DEFAULT_CONDITIONS: DiscountConditions = {
  operator: "AND",
  rules: [],
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const DAY_LABELS: Record<(typeof DAY_KEYS)[number], string> = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

const SEGMENT_LABELS: Record<CustomerSegment, string> = {
  new: "New",
  active: "Active",
  inactive: "Inactive",
  vip: "VIP",
  at_risk: "At Risk",
  custom: "Custom",
};

const STACKING_LABELS: Record<StackingMode, string> = {
  highest: "Highest",
  lowest: "Lowest",
  stack: "Stack",
  priority: "Priority",
  exclusive: "Exclusive",
};

export function DiscountDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  level,
  initialData,
  isEditing = false,
}: DiscountDialogProps) {
  const [message, setMessage] = useState(initialData?.message ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(
    initialData?.type ?? "P",
  );
  const [value, setValue] = useState<number>(initialData?.value ?? 0);
  const [minOrderTotal, setMinOrderTotal] = useState<number>(
    initialData?.minOrderTotal ?? 0,
  );
  const [minCartItems, setMinCartItems] = useState<number>(
    initialData?.minCartItems ?? 0,
  );
  const [conditions, setConditions] = useState<DiscountConditions>(
    initialData?.conditions ?? DEFAULT_CONDITIONS,
  );
  const [startAt, setStartAt] = useState(
    initialData?.startAt
      ? new Date(initialData.startAt).toISOString().slice(0, 16)
      : "",
  );
  const [expireAt, setExpireAt] = useState(
    initialData?.expireAt
      ? new Date(initialData.expireAt).toISOString().slice(0, 16)
      : "",
  );
  const [timeRulesEnabled, setTimeRulesEnabled] = useState(
    initialData?.timeRules?.enabled ?? false,
  );
  const [timeRulesDays, setTimeRulesDays] = useState<number[]>(
    initialData?.timeRules?.days ?? [1, 2, 3, 4, 5],
  );
  const [timeRulesStart, setTimeRulesStart] = useState(
    initialData?.timeRules?.startTime ?? "12:00",
  );
  const [timeRulesEnd, setTimeRulesEnd] = useState(
    initialData?.timeRules?.endTime ?? "15:00",
  );
  const [stackingMode, setStackingMode] = useState<StackingMode>(
    initialData?.stackingMode ?? "highest",
  );
  const [priority, setPriority] = useState<number>(
    initialData?.priority ?? 0,
  );
  const [segments, setSegments] = useState<CustomerSegment[]>(
    initialData?.segments ?? [],
  );
  const [active, setActive] = useState(initialData?.active ?? true);

  const resetForm = () => {
    setMessage("");
    setDiscountType("P");
    setValue(0);
    setMinOrderTotal(0);
    setMinCartItems(0);
    setConditions(DEFAULT_CONDITIONS);
    setStartAt("");
    setExpireAt("");
    setTimeRulesEnabled(false);
    setTimeRulesDays([1, 2, 3, 4, 5]);
    setTimeRulesStart("12:00");
    setTimeRulesEnd("15:00");
    setStackingMode("highest");
    setPriority(0);
    setSegments([]);
    setActive(true);
  };

  const generateAutoMessage = () => {
    const parts: string[] = [];
    const valueFormatted = discountType === "P" ? `${value}%` : `${value} EGP`;
    parts.push(`${valueFormatted} off`);

    if (level === "order") {
      parts.push("your order");
      if (minOrderTotal > 0) {
        parts.push(`on orders over $${minOrderTotal} EGP`);
      }
      if (minCartItems > 0) {
        parts.push(`with ${minCartItems}+ items`);
      }
    }

    if (segments.length > 0) {
      const segmentLabels = segments.map((s) => SEGMENT_LABELS[s]).join(", ");
      parts.push(`for ${segmentLabels}`);
    }

    if (timeRulesEnabled && timeRulesDays.length > 0) {
      const dayLabels = timeRulesDays.map((d) => DAY_LABELS[DAY_KEYS[d]]).join(", ");
      parts.push(`during ${dayLabels}`);
    }

    setMessage(parts.join(" ").trim());
  };

  const toggleDay = (day: number) => {
    setTimeRulesDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value <= 0) return;

    const discount: DiscountObject = {
      id: initialData?.id ?? crypto.randomUUID(),
      code: `${discountType}-${value}`.toUpperCase(),
      message: message.trim(),
      level,
      type: discountType,
      value,
      itemId: initialData?.itemId,
      categoryId: initialData?.categoryId,
      minOrderTotal: level === "order" && minOrderTotal > 0 ? minOrderTotal : undefined,
      minCartItems: level === "order" && minCartItems > 0 ? minCartItems : undefined,
      conditions,
      startAt: startAt ? new Date(startAt).getTime() : null,
      expireAt: expireAt ? new Date(expireAt).getTime() : null,
      timeRules: timeRulesEnabled
        ? {
            enabled: true,
            days: timeRulesDays,
            startTime: timeRulesStart,
            endTime: timeRulesEnd,
          }
        : null,
      stackingMode,
      priority: priority || undefined,
      segments: segments.length > 0 ? segments : undefined,
      active,
    };

    onSubmit(discount);
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
            {isEditing ? "Edit Discount" : "Add Discount"}
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
            <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              Message
              <WidgetHelp widgetKey="discountMessageHelp" />
              {value > 0 && (
                <button
                  type="button"
                  onClick={generateAutoMessage}
                  className="ms-auto text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Auto Fill
                </button>
              )}
            </label>
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. 20% off your order!"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                Type
                <WidgetHelp widgetKey="discountTypeHelp" />
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
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                Value
                <WidgetHelp widgetKey="discountValueHelp" />
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

          {level === "order" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  Min Order Total
                  <WidgetHelp widgetKey="minOrderTotalHelp" />
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
                <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  Min Cart Items
                  <WidgetHelp widgetKey="minCartItemsHelp" />
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
          )}

          <ConditionsEditor conditions={conditions} onChange={setConditions} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                Start Date
                <WidgetHelp widgetKey="discountDateHelp" />
              </label>
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                End Date
                <WidgetHelp widgetKey="discountDateHelp" />
              </label>
              <Input
                type="datetime-local"
                value={expireAt}
                onChange={(e) => setExpireAt(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="timeRules"
                checked={timeRulesEnabled}
                onChange={(e) => setTimeRulesEnabled(e.target.checked)}
                className="rounded"
              />
              <label
                htmlFor="timeRules"
                className="text-sm font-medium text-foreground flex items-center gap-1.5"
              >
                Time-Based Rules
                <WidgetHelp widgetKey="discountTimeRulesHelp" />
              </label>
            </div>

            {timeRulesEnabled && (
              <div className="space-y-2 ps-6">
                <div className="flex gap-1">
                  {DAY_KEYS.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`w-8 h-8 text-xs rounded-md transition-colors ${
                        timeRulesDays.includes(i)
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={timeRulesStart}
                      onChange={(e) => setTimeRulesStart(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={timeRulesEnd}
                      onChange={(e) => setTimeRulesEnd(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                Target Segments
                <WidgetHelp widgetKey="targetSegmentsHelp" />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(["new", "active", "inactive", "vip", "at_risk"] as const).map(
                  (seg) => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() =>
                        setSegments((prev) =>
                          prev.includes(seg)
                            ? prev.filter((s) => s !== seg)
                            : [...prev, seg]
                        )
                      }
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                        segments.includes(seg)
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {SEGMENT_LABELS[seg]}
                    </button>
                  )
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {segments.length === 0
                  ? "Applies to all customers"
                  : `${segments.length} segment(s) selected`}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                Stacking Mode
                <WidgetHelp widgetKey="discountStackingHelp" />
              </label>
              <select
                value={stackingMode}
                onChange={(e) => setStackingMode(e.target.value as StackingMode)}
                className="w-full h-8 px-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {(Object.keys(STACKING_LABELS) as StackingMode[]).map((mode) => (
                  <option key={mode} value={mode}>
                    {STACKING_LABELS[mode]}
                  </option>
                ))}
              </select>
            </div>
            {stackingMode === "priority" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Priority
                </label>
                <Input
                  type="number"
                  value={priority || ""}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1"
            >
              {isEditing ? "Save Changes" : "Add Discount"}
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
          {isEditing && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete();
                onOpenChange(false);
              }}
              className="w-full"
            >
              <Trash2 size={14} className="me-1.5" />
              Delete Discount
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
