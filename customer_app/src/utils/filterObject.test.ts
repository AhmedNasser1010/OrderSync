import { describe, it, expect } from "vitest";
import filterObject from "./filterObject";

describe("filterObject", () => {
  it("removes null values by default", () => {
    expect(filterObject({ a: 1, b: null, c: "x" })).toEqual({ a: 1, c: "x" });
  });

  it("keeps null values when removeNulls is false", () => {
    expect(filterObject({ a: 1, b: null }, [], false)).toEqual({ a: 1, b: null });
  });

  it("removes the listed keys", () => {
    expect(filterObject({ a: 1, b: 2, c: 3 }, ["b"])).toEqual({ a: 1, c: 3 });
  });

  it("removes both nulls and listed keys at once", () => {
    expect(filterObject({ a: null, b: 2, c: 3 }, ["c"])).toEqual({ b: 2 });
  });

  it("handles an empty object", () => {
    expect(filterObject({})).toEqual({});
  });

  it("does not remove undefined or falsy non-null values", () => {
    expect(filterObject({ a: 0, b: "", c: false, d: undefined })).toEqual({
      a: 0,
      b: "",
      c: false,
      d: undefined,
    });
  });
});
