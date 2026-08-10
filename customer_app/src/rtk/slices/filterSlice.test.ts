import { describe, it, expect } from "vitest";
import reducer, {
  addFilter,
  removeFilter,
  clearAll,
  deleteAllExcepts,
} from "./filterSlice";

describe("filterSlice", () => {
  it("starts empty", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual([]);
  });

  it("adds filters", () => {
    let state = reducer([], addFilter("burgers"));
    state = reducer(state, addFilter("pizza"));
    expect(state).toEqual(["burgers", "pizza"]);
  });

  it("removes a filter", () => {
    const state = reducer(["burgers", "pizza"], removeFilter("burgers"));
    expect(state).toEqual(["pizza"]);
  });

  it("is a no-op when removing a missing filter", () => {
    const state = reducer(["burgers"], removeFilter("pizza"));
    expect(state).toEqual(["burgers"]);
  });

  it("clears all filters", () => {
    expect(reducer(["a", "b"], clearAll())).toEqual([]);
  });

  it("keeps only the given filters", () => {
    const state = reducer(["a", "b", "c"], deleteAllExcepts(["a", "c"]));
    expect(state).toEqual(["a", "c"]);
  });
});
