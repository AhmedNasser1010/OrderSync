import { describe, it, expect } from "vitest";
import reducer, {
  initUser,
  clearUser,
  addUserHomeLocation,
  addUserAddress,
  updateUserName,
  updateUserPhone,
  updateUserSecondPhone,
  updateUserAddress,
  updateUserLocation,
} from "./userSlice";

describe("userSlice", () => {
  it("starts as an empty object", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({});
  });

  it("initializes the user document", () => {
    const user = {
      uid: "uid-1",
      userInfo: { uid: "uid-1", name: "Nasser" },
      isActive: true,
    };
    expect(reducer(undefined, initUser(user))).toEqual(user);
  });

  it("clears the user", () => {
    const state = reducer(undefined, initUser({ uid: "uid-1" }));
    expect(reducer(state, clearUser())).toEqual({});
  });

  it("adds a home latlng without clobbering the address", () => {
    let state = reducer(undefined, addUserAddress("El Ayat"));
    state = reducer(state, addUserHomeLocation([30, 31]));
    expect(state.locations).toEqual({
      home: { latlng: [30, 31], address: "El Ayat" },
    });
  });

  it("updates name, phone and second phone", () => {
    let state = reducer(undefined, updateUserName("Nasser"));
    state = reducer(state, updateUserPhone("+201000000000"));
    state = reducer(state, updateUserSecondPhone("+201111111111"));
    expect(state.userInfo).toEqual({
      name: "Nasser",
      phone: "+201000000000",
      secondPhone: "+201111111111",
    });
  });

  it("updates the home address and location separately", () => {
    let state = reducer(undefined, addUserHomeLocation([1, 2]));
    state = reducer(state, updateUserAddress("Work"));
    expect(state.locations.home).toEqual({ latlng: [1, 2], address: "Work" });
    state = reducer(state, updateUserLocation([3, 4]));
    expect(state.locations.home).toEqual({ latlng: [3, 4], address: "Work" });
  });
});
