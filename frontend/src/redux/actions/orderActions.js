
import api from "../../utils/api";

import {
  createOrderRequest,
  createOrderSuccess,
  createOrderFail,
  paymentRequest,
  paymentSuccess,
  paymentFail,
  myOrdersRequest,
  myOrdersSuccess,
  myOrdersFail,
  orderDetailsRequest,
  orderDetailsSuccess,
  orderDetailsFail,
} from "../slices/orderSlice";

// Create Order
export const createOrder = (session_id) => async (dispatch) => {
  try {
    dispatch(createOrderRequest());

    const { data } = await api.post("/v1/eats/orders/new", {
      session_id,
    });

    dispatch(createOrderSuccess(data));
    return data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Unable to create order";

    dispatch(createOrderFail(message));
    return null;
  }
};

// Payment
export const payment = (items, restaurant) => async (dispatch) => {
  try {
    dispatch(paymentRequest());

    const { data } = await api.post("/v1/payment/process", {
      items,
      restaurant,
    });

    if (!data.url) {
      throw new Error("Payment checkout URL was not received");
    }

    dispatch(paymentSuccess());
    window.location.assign(data.url);

    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unable to start payment";

    dispatch(paymentFail(message));
    return null;
  }
};

// My Orders
export const myOrders = () => async (dispatch) => {
  try {
    dispatch(myOrdersRequest());

    const { data } = await api.get("/v1/eats/orders/me/myOrders");

    dispatch(myOrdersSuccess(data.orders));
    return data.orders;
  } catch (error) {
    const message =
      error.response?.data?.message || "Unable to fetch orders";

    dispatch(myOrdersFail(message));
    return null;
  }
};

// Order Details
export const getOrderDetails = (id) => async (dispatch) => {
  try {
    dispatch(orderDetailsRequest());

    const { data } = await api.get(`/v1/eats/orders/${id}`);

    dispatch(orderDetailsSuccess(data.order));
    return data.order;
  } catch (error) {
    const message =
      error.response?.data?.message || "Unable to fetch order details";

    dispatch(orderDetailsFail(message));
    return null;
  }
};
