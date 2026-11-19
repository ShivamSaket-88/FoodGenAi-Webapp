
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
  authLoading: false,
  isAuthenticated: false,
  error: null,
  isUpdated: false,
  message: null,
  success: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    // Login and Register
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      state.loading = false;
      state.authLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },

    loginFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Check existing logged-in user
    loadUserRequest: (state) => {
      state.authLoading = true;
    },

    loadUserFail: (state) => {
      state.authLoading = false;
      state.isAuthenticated = false;
      state.user = null;
    },

    // Logout
    logoutSuccess: (state) => {
      state.loading = false;
      state.authLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },

    logoutFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update Profile
    updateRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    updateSuccess: (state, action) => {
      state.loading = false;
      state.isUpdated = action.payload;
    },

    updateFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateReset: (state) => {
      state.isUpdated = false;
    },

    clearErrors: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFail,
  loadUserRequest,
  loadUserFail,
  logoutSuccess,
  logoutFail,
  updateRequest,
  updateSuccess,
  updateFail,
  updateReset,
  clearErrors,
} = userSlice.actions;

export default userSlice.reducer;
