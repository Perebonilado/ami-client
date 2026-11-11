import { createSlice } from "@reduxjs/toolkit";

/** App state that isn't server data. */
interface SessionState {
  /** True after someone logs out, so pages that need an account ask before signing them back in. */
  signedOut: boolean;
}

const initialState: SessionState = { signedOut: false };

export const session = createSlice({
  name: "session",
  initialState,
  reducers: {
    signedOut(state) {
      state.signedOut = true;
    },
    signedIn(state) {
      state.signedOut = false;
    },
  },
});

export const { signedOut, signedIn } = session.actions;
