import { describe, it, expect } from "vitest";
import randomOrderNumber from "./randomOrderId";

describe("randomOrderNumber", () => {
  it("always returns a 4-digit number", () => {
    for (let i = 0; i < 1000; i++) {
      const n = randomOrderNumber();
      expect(n).toBeGreaterThanOrEqual(1000);
      expect(n).toBeLessThanOrEqual(9999);
    }
  });
});
