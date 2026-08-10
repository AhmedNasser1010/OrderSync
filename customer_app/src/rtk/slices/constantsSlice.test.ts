import { describe, it, expect } from "vitest";
import reducer, {
  setUserUid,
  setAccessToken,
  setOrderId,
  userUid,
  accessToken,
} from "./constantsSlice";

describe("constantsSlice", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({
      userUid: null,
      accessToken: null,
      orderId: null,
    });
  });

  it("sets userUid, accessToken and orderId", () => {
    let state = reducer(undefined, setUserUid("uid-1"));
    state = reducer(state, setAccessToken("token-1"));
    state = reducer(state, setOrderId("order-1"));
    expect(state).toEqual({
      userUid: "uid-1",
      accessToken: "token-1",
      orderId: "order-1",
    });
  });

  it("accepts null to clear values", () => {
    let state = reducer(undefined, setUserUid("uid-1"));
    state = reducer(state, setUserUid(null));
    expect(state.userUid).toBeNull();
  });

  it("exposes userUid and accessToken selectors", () => {
    const state = {
      constants: reducer(undefined, setAccessToken("tok")),
    };
    expect(userUid(state)).toBeNull();
    expect(accessToken(state)).toBe("tok");
  });
});
