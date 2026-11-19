
import api from "../../utils/api";

import {
  cartRequest,
  cartSuccess,
  cartFail,
} from "../slices/cartSlice";

// FETCH CART ITEMS
export const fetchCartItems = () => async (dispatch) => {
  try {
    dispatch(cartRequest());

    const { data } = await api.get("/v1/eats/cart/get-cart");

    dispatch(cartSuccess(data.cart));

    console.log("CART API:", data.cart);

    return data.cart;
  } catch (error) {
    const message =
      error.response?.data?.message || "Unable to fetch cart";

    dispatch(cartFail(message));

    return null;
  }
};

// ADD ITEM TO CART
export const addItemToCart =
  (foodItemId, restaurantId, quantity) => async (dispatch) => {
    try {
      dispatch(cartRequest());

      const { data } = await api.post(
        "/v1/eats/cart/add-to-cart",
        {
          foodItemId,
          restaurantId,
          quantity,
        }
      );

      dispatch(cartSuccess(data.cart));

      return data.cart;
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to add item to cart";

      dispatch(cartFail(message));

      return null;
    }
  };

// UPDATE CART QUANTITY
export const updateCartQuantity =
  (foodItemId, quantity) => async (dispatch) => {
    try {
      dispatch(cartRequest());

      const { data } = await api.post(
        "/v1/eats/cart/update-cart-item",
        {
          foodItemId,
          quantity,
        }
      );

      dispatch(cartSuccess(data.cart));

      return data.cart;
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to update cart quantity";

      dispatch(cartFail(message));

      return null;
    }
  };

// REMOVE ITEM FROM CART
export const removeItemFromCart =
  (foodItemId) => async (dispatch) => {
    try {
      dispatch(cartRequest());

      const { data } = await api.delete(
        "/v1/eats/cart/delete-cart-item",
        {
          data: { foodItemId },
        }
      );

      dispatch(cartSuccess(data.cart));

      return data.cart;
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to remove cart item";

      dispatch(cartFail(message));

      return null;
    }
  };
