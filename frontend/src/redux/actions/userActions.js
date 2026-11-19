
import api from "../../utils/api";

import {
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
} from "../slices/userSlice";

// LOGIN
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch(loginRequest());

    const { data } = await api.post("/v1/users/login", {
      email,
      password,
    });

    dispatch(loginSuccess(data.data.user));

    return true;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Login failed";

    dispatch(loginFail(message));

    return false;
  }
};

// REGISTER
export const register = (userData) => async (dispatch) => {
  try {
    dispatch(loginRequest());

    const { data } = await api.post("/v1/users/signup", userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    dispatch(loginSuccess(data.data.user));

    return true;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Registration failed";

    dispatch(loginFail(message));

    return false;
  }
};

// LOAD LOGGED-IN USER
export const loadUser = () => async (dispatch) => {
  try {
    dispatch(loadUserRequest());

    const { data } = await api.get("/v1/users/me");

    dispatch(loginSuccess(data.user));

    return true;
  } catch (error) {
    dispatch(loadUserFail());

    return false;
  }
};

// LOGOUT
export const logout = () => async (dispatch) => {
  try {
    await api.get("/v1/users/logout");

    dispatch(logoutSuccess());

    return true;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Logout failed";

    dispatch(logoutFail(message));

    return false;
  }
};

// UPDATE PROFILE
export const updateProfile = (userData) => async (dispatch) => {
  try {
    dispatch(updateRequest());

    const { data } = await api.put("/v1/users/me/update", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    dispatch(updateSuccess(data.success));

    return true;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Profile update failed";

    dispatch(updateFail(message));

    return false;
  }
};
