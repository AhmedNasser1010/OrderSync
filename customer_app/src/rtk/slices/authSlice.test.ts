import reducer, {
  setAuthLoading,
  setAuthenticated,
  setUnauthenticated,
  setAuthError,
  clearAuthError,
  setIdToken,
  setOnboardingComplete,
  resetAuth,
  type AuthState,
} from "./authSlice";

const initial: AuthState = {
  status: "loading",
  uid: null,
  idToken: null,
  error: null,
  isOnboardingComplete: false,
};

describe("authSlice", () => {
  it("starts in loading state", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(initial);
  });

  it("setAuthLoading clears error and sets loading", () => {
    const state = reducer(initial, setAuthLoading());
    expect(state.status).toBe("loading");
    expect(state.error).toBeNull();
  });

  it("setAuthenticated stores uid and idToken", () => {
    const state = reducer(
      initial,
      setAuthenticated({ uid: "uid-1", idToken: "tok-1" })
    );
    expect(state.status).toBe("authenticated");
    expect(state.uid).toBe("uid-1");
    expect(state.idToken).toBe("tok-1");
    expect(state.error).toBeNull();
  });

  it("setUnauthenticated clears identity", () => {
    let state = reducer(
      initial,
      setAuthenticated({ uid: "uid-1", idToken: "tok-1" })
    );
    state = reducer(state, setUnauthenticated());
    expect(state.status).toBe("unauthenticated");
    expect(state.uid).toBeNull();
    expect(state.idToken).toBeNull();
  });

  it("setAuthError stores typed error", () => {
    const state = reducer(
      initial,
      setAuthError({ code: "auth/popup-closed-by-user", message: "nope" })
    );
    expect(state.error).toEqual({
      code: "auth/popup-closed-by-user",
      message: "nope",
    });
  });

  it("clearAuthError removes the error", () => {
    let state = reducer(
      initial,
      setAuthError({ code: "auth/error", message: "oops" })
    );
    state = reducer(state, clearAuthError());
    expect(state.error).toBeNull();
  });

  it("setIdToken updates only the token", () => {
    let state = reducer(
      initial,
      setAuthenticated({ uid: "uid-1", idToken: "tok-1" })
    );
    state = reducer(state, setIdToken("tok-2"));
    expect(state.idToken).toBe("tok-2");
    expect(state.uid).toBe("uid-1");
  });

  it("setOnboardingComplete toggles completion flag", () => {
    const state = reducer(initial, setOnboardingComplete(true));
    expect(state.isOnboardingComplete).toBe(true);
  });

  it("resetAuth returns to initial", () => {
    let state = reducer(
      initial,
      setAuthenticated({ uid: "uid-1", idToken: "tok-1" })
    );
    state = reducer(state, setOnboardingComplete(true));
    state = reducer(state, resetAuth());
    expect(state).toEqual(initial);
  });
});
