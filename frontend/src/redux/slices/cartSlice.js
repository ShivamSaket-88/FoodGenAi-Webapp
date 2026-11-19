
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  restaurant: {},
  loading: false,
  error: null,
  deliveryInfo: {},
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    cartRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    cartSuccess: (state, action) => {
      const cart = action.payload;

      state.loading = false;
      state.error = null;
      state.cartItems = cart?.items || [];
      state.restaurant = cart?.restaurant || {};
    },

    cartFail: (state, action) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.restaurant = {};
      state.loading = false;
      state.error = null;
    },

    clearErrors: (state) => {
      state.error = null;
    },

    saveDeliveryInfo: (state, action) => {
      state.deliveryInfo = action.payload;
    },
  },
});

export const {
  cartRequest,
  cartSuccess,
  cartFail,
  clearCart,
  clearErrors,
  saveDeliveryInfo,
} = cartSlice.actions;

export default cartSlice.reducer;
