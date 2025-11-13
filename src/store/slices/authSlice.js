/**
 * Auth Slice - Minimal Client State
 * 
 * Purpose:
 * Store authenticated user data for global access across the app.
 * All API operations (login, logout, etc.) are handled by authApi (RTK Query).
 * 
 * State:
 * - user: Current user object (id, email, role, etc.)
 * - isAuthenticated: Boolean flag for auth status
 * 
 * Actions:
 * - setUser: Store user after successful login/signup
 * - clearUser: Remove user on logout
 * 
 * Note: Loading states and errors are managed by RTK Query hooks,
 * not in this slice. This is purely for storing the current user.
 */

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
