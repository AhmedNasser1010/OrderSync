import type { DiscountObject, DiscountType } from "./types";

export const generateDiscountObj = (
  code: string,
  message: string,
  options?: Partial<Omit<DiscountObject, "code" | "message">>
): DiscountObject | null => {
  if (!code) return null;

  const fullRegex =
    /([A-Za-z]+)-([0-9]+)(?:_SWITCH\{([A-Za-z0-9:;_-]+)\})?(?:_EXP([0-9]+)-([0-9]+))?(?:_LIM([0-9]+)-([0-9]+))?(?:_STACK\{([A-Za-z]+)\})?(?:_PRIO([0-9]+))?/i;

  const matches = code.match(fullRegex);
  if (!matches) return null;

  const [, typeStr, valueStr, switchPart, , , limTotal, limPerUser, stackStr, prioStr] = matches;

  const discountType = typeStr?.toUpperCase() as DiscountType;
  if (discountType !== "P" && discountType !== "FIXED") return null;

  const conditions: DiscountObject["conditions"] = { operator: "AND", rules: [] };

  if (switchPart) {
    const conditionRegex = /([A-Za-z]+)-([0-9]+)/gi;
    let match;
    while ((match = conditionRegex.exec(switchPart)) !== null) {
      conditions.rules.push({
        type: match[1].toUpperCase() as DiscountObject["conditions"]["rules"][number]["type"],
        value: Number(match[2]),
      });
    }
  }

  return {
    id: options?.id ?? "",
    code,
    message,
    level: options?.level ?? "item",
    type: discountType,
    value: Number(valueStr),
    itemId: options?.itemId,
    categoryId: options?.categoryId,
    minOrderTotal: options?.minOrderTotal,
    minCartItems: options?.minCartItems,
    conditions: options?.conditions ?? conditions,
    stackingMode: options?.stackingMode,
    priority: prioStr ? Number(prioStr) : options?.priority,
    startAt: options?.startAt ?? null,
    expireAt: options?.expireAt ?? null,
    usageLimit: limTotal ? Number(limTotal) : options?.usageLimit ?? null,
    usageCount: options?.usageCount ?? 0,
    perUserLimit: limPerUser ? Number(limPerUser) : options?.perUserLimit,
    timeRules: options?.timeRules ?? null,
    segments: options?.segments,
    active: options?.active ?? true,
  };
};
