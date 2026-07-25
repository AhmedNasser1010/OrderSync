"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  level: DiscountLevel;
  initialData?: DiscountObject;
  isEditing?: boolean;
}

const DEFAULT_CONDITIONS: DiscountConditions = {
  operator: "AND",
  rules: [],
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function DiscountDialog({
  open,
  onOpenChange,
  onSubmit,
  level,
  initialData,
  isEditing = false,
}: DiscountDialogProps) {
  const t = useTranslations("DiscountDialog");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("P");
  const [value, setValue] = useState<number>(0);
  const [minOrderTotal, setMinOrderTotal] = useState<number>(0);
  const [minCartItems, setMinCartItems] = useState<number>(0);
  const [conditions, setConditions] = useState<DiscountConditions>(DEFAULT_CONDITIONS);
  const [startAt, setStartAt] = useState("");
  const [expireAt, setExpireAt] = useState("");
  const [timeRulesEnabled, setTimeRulesEnabled] = useState(false);
  const [timeRulesDays, setTimeRulesDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [timeRulesStart, setTimeRulesStart] = useState("12:00");
  const [timeRulesEnd, setTimeRulesEnd] = useState("15:00");
  const [stackingMode, setStackingMode] = useState<StackingMode>("highest");
  const [priority, setPriority] = useState<number>(0);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);

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
      if (initialData.timeRules) {
        setTimeRulesEnabled(initialData.timeRules.enabled);
        setTimeRulesDays(initialData.timeRules.days);
        setTimeRulesStart(initialData.timeRules.startTime);
        setTimeRulesEnd(initialData.timeRules.endTime);
      }
      setStackingMode(initialData.stackingMode ?? "highest");
      setPriority(initialData.priority ?? 0);
      setSegments(initialData.segments ?? []);
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
    setTimeRulesEnabled(false);
    setTimeRulesDays([1, 2, 3, 4, 5]);
    setTimeRulesStart("12:00");
    setTimeRulesEnd("15:00");
    setStackingMode("highest");
    setPriority(0);
    setSegments([]);
  };

  const toggleDay = (day: number) => {
    setTimeRulesDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || value <= 0) return;

    const discount: DiscountObject = {
      id: initialData?.id ?? crypto.randomUUID(),
      code: code.trim().toUpperCase(),
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
      active: initialData?.active ?? true,
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
            {isEditing ? t("editTitle") : t("addTitle")}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("codeLabel")}
            </label>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("codePlaceholder")}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("messageLabel")}
            </label>
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePlaceholder")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("typeLabel")}
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="w-full h-8 px-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="P">{t("typePercentage")}</option>
                <option value="FIXED">{t("typeFixed")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("valueLabel")}
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
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("minOrderTotal")}
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
                  {t("minCartItems")}
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
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("startDate")}
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
                {t("endDate")}
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
                className="text-sm font-medium text-foreground"
              >
                {t("timeRules")}
              </label>
            </div>

            {timeRulesEnabled && (
              <div className="space-y-2 pl-6">
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
                      {t(`days.${day}`)}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      {t("startTime")}
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
                      {t("endTime")}
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
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("targetSegments")}
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
                      {t(`segments.${seg}`)}
                    </button>
                  )
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {segments.length === 0
                  ? t("segmentsAll")
                  : t("segmentsCount", { count: segments.length })}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("stackingMode")}
              </label>
              <select
                value={stackingMode}
                onChange={(e) => setStackingMode(e.target.value as StackingMode)}
                className="w-full h-8 px-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="highest">{t("stacking.highest")}</option>
                <option value="lowest">{t("stacking.lowest")}</option>
                <option value="stack">{t("stacking.stack")}</option>
                <option value="priority">{t("stacking.priority")}</option>
                <option value="exclusive">{t("stacking.exclusive")}</option>
              </select>
            </div>
            {stackingMode === "priority" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("priorityLabel")}
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
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              {isEditing ? t("saveChanges") : t("addDiscount")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
