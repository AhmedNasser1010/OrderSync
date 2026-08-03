"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetHelp } from "@/components/ui/widget-help";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { DiscountConditions, ConditionType } from "@ordersync/types";

const CONDITION_TYPES: ConditionType[] = [
  "FIRSTBUY",
  "TOTALSPENT",
  "TOTALITEMS",
  "TOTALORDERS",
  "JOINDATE",
  "LASTORDER",
];

const CONDITION_LABELS: Record<ConditionType, string> = {
  FIRSTBUY: "First Purchase",
  TOTALSPENT: "Total Spent (>=)",
  TOTALITEMS: "Total Items (>=)",
  TOTALORDERS: "Total Orders (>=)",
  JOINDATE: "Account Age (days >=)",
  LASTORDER: "Days Since Last Order (>=)",
  CUSTOMERLTV: "Total Orders (>=)",
};

interface ConditionsEditorProps {
  conditions: DiscountConditions;
  onChange: (conditions: DiscountConditions) => void;
}

export function ConditionsEditor({ conditions, onChange }: ConditionsEditorProps) {
  const addRule = () => {
    onChange({
      ...conditions,
      rules: [...conditions.rules, { type: "FIRSTBUY", value: 0 }],
    });
  };

  const removeRule = (index: number) => {
    onChange({
      ...conditions,
      rules: conditions.rules.filter((_, i) => i !== index),
    });
  };

  const updateRule = (
    index: number,
    field: "type" | "value",
    value: string | number
  ) => {
    const newRules = conditions.rules.map((rule, i) =>
      i === index ? { ...rule, [field]: value } : rule
    );
    onChange({ ...conditions, rules: newRules });
  };

  const toggleOperator = () => {
    onChange({
      ...conditions,
      operator: conditions.operator === "AND" ? "OR" : "AND",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-1.5">Conditions
          <WidgetHelp widgetKey="discountConditionsHelp" />
        </label>
        {conditions.rules.length > 1 && (
          <button
            type="button"
            onClick={toggleOperator}
            className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
          >
            {conditions.operator}
          </button>
        )}
      </div>

      {conditions.rules.map((rule, index) => (
        <div key={index} className="flex items-center gap-2">
          <Select
            value={rule.type}
            onValueChange={(val) => updateRule(index, "type", val)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[70]">
              {CONDITION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {CONDITION_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            value={rule.value || ""}
            onChange={(e) =>
              updateRule(index, "value", parseFloat(e.target.value) || 0)
            }
            placeholder="Value"
            className="w-20"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => removeRule(index)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRule}
        className="w-full"
      >
        <Plus size={14} className="me-1" />
        Add Condition
      </Button>
    </div>
  );
}
