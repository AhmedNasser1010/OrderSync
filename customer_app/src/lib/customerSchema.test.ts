import { describe, it, expect } from "vitest";
import customerSchema from "./customerSchema";

describe("customerSchema", () => {
  it("builds the full customer document shape", () => {
    const doc = customerSchema({ uid: "uid-1", provider: "Google" });
    expect(doc.uid).toBe("uid-1");
    expect(doc.isActive).toBe(true);
    expect(doc.userInfo).toMatchObject({
      role: "CUSTOMER",
      uid: "uid-1",
      provider: "Google",
    });
    expect(doc.locations).toMatchObject({
      home: { latlng: [0, 0], address: "" },
      selected: "home",
    });
    expect(doc.trackedOrder).toMatchObject({ id: null, orderNumber: null });
    expect(doc.referral).toMatchObject({ isFirstOrder: true, referredBy: "" });
    expect(doc.restaurants).toEqual([]);
  });

  it("uses provided name, phone, email and avatar", () => {
    const doc = customerSchema({
      uid: "uid-1",
      name: "Nasser",
      email: "nasser@example.com",
      phone: "+201000000000",
      avatar: "https://example.com/a.png",
      provider: "Google",
    });
    expect(doc.userInfo).toMatchObject({
      name: "Nasser",
      email: "nasser@example.com",
      phone: "+201000000000",
      avatar: "https://example.com/a.png",
    });
  });

  it("defaults empty strings when optional info is missing", () => {
    const doc = customerSchema({ uid: "uid-1", provider: "Email" });
    expect(doc.userInfo).toMatchObject({ name: "", email: "", phone: "" });
  });

  it("uses the provided referredBy", () => {
    const doc = customerSchema({
      uid: "uid-1",
      provider: "Google",
      referredBy: "ref-9",
    });
    expect(doc.referral.referredBy).toBe("ref-9");
  });
});
