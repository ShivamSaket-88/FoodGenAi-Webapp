
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  fetchCartItems,
  removeItemFromCart,
  updateCartQuantity,
} from "../../redux/actions/cartActions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndianRupee } from "@fortawesome/free-solid-svg-icons";

import { payment } from "../../redux/actions/orderActions";

const Cart = () => {
  const dispatch = useDispatch();

  const { cartItems, restaurant, loading } = useSelector(
    (state) => state.cart
  );

  const { loading: paymentLoading } = useSelector(
    (state) => state.order
  );

  // Fetch Cart Items
  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  // Remove Item From Cart
  const removeCartItemHandler = async (id) => {
    const result = await dispatch(removeItemFromCart(id));

    if (result) {
      toast.success("Item removed from cart");
    } else {
      toast.error("Unable to remove item");
    }
  };

  // Increase Quantity
  const increaseQty = async (id, quantity, stock) => {
    const newQty = quantity + 1;

    if (typeof stock === "number" && newQty > stock) {
      toast.error("Exceeded stock limit");
      return;
    }

    const result = await dispatch(updateCartQuantity(id, newQty));

    if (!result) {
      toast.error("Unable to update quantity");
    }
  };

  // Decrease Quantity
  const decreaseQty = async (id, quantity) => {
    if (quantity <= 1) {
      toast.error("Minimum quantity reached");
      return;
    }

    const result = await dispatch(
      updateCartQuantity(id, quantity - 1)
    );

    if (!result) {
      toast.error("Unable to update quantity");
    }
  };

  // Checkout
  const checkoutHandler = async () => {
    if (!cartItems.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (!restaurant?._id) {
      toast.error("Restaurant information is missing");
      return;
    }

    await dispatch(payment(cartItems, restaurant));
  };

  // Total Quantity
  const totalQuantity = cartItems.reduce(
    (acc, item) => acc + Number(item.quantity || 0),
    0
  );

  // Total Price
  const totalPrice = cartItems.reduce(
    (acc, item) =>
      acc +
      Number(item.quantity || 0) *
        Number(item.foodItem?.price || 0),
    0
  );

  return (
    <>
      <div className="container mt-4">

        {loading && cartItems.length === 0 ? (
          <h3 className="mt-5 text-center">Loading cart...</h3>
        ) : cartItems.length === 0 ? (
          <div className="text-center mt-5">
            <h2>Your Cart is empty</h2>
            <p>Add some delicious food to your cart!</p>
          </div>
        ) : (
          <>
            {/* Cart Heading */}
            <h2 className="mt-4">
              Your Cart: <b>{cartItems.length} items</b>
            </h2>

            {/* Restaurant Name */}
            <h3 className="mt-4">
              Restaurant: <b>{restaurant?.name || "Restaurant"}</b>
            </h3>

            <div className="row d-flex justify-content-between cartt">

              {/* Cart Items */}
              <div className="col-12 col-lg-8">

                {cartItems.map((item) => {
                  const foodItem = item.foodItem || {};
                  const imageUrl =
                    foodItem.images?.[0]?.url || "/images/default-food.png";

                  return (
                    <div className="cart-item" key={item._id}>
                      <div className="row align-items-center">

                        {/* Food Image */}
                        <div className="col-4 col-lg-3">
                          <img
                            src={imageUrl}
                            alt={foodItem.name || "Food item"}
                            height="90"
                            width="115"
                            style={{
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </div>

                        {/* Food Name */}
                        <div className="col-8 col-lg-3">
                          <h5>{foodItem.name || "Food item"}</h5>
                        </div>

                        {/* Price */}
                        <div className="col-4 col-lg-2 mt-3 mt-lg-0">
                          <p id="card_item_price">
                            <FontAwesomeIcon
                              icon={faIndianRupee}
                              size="xs"
                            />
                            {foodItem.price || 0}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="col-5 col-lg-3 mt-3 mt-lg-0">
                          <div className="stockCounter d-inline">

                            <button
                              type="button"
                              className="btn btn-danger minus"
                              disabled={loading}
                              onClick={() =>
                                decreaseQty(
                                  foodItem._id,
                                  item.quantity
                                )
                              }
                            >
                              -
                            </button>

                            <input
                              type="number"
                              className="form-control count d-inline"
                              value={item.quantity}
                              readOnly
                            />

                            <button
                              type="button"
                              className="btn btn-primary plus"
                              disabled={loading}
                              onClick={() =>
                                increaseQty(
                                  foodItem._id,
                                  item.quantity,
                                  foodItem.stock
                                )
                              }
                            >
                              +
                            </button>

                          </div>
                        </div>

                        {/* Delete Item */}
                        <div className="col-3 col-lg-1 mt-3 mt-lg-0">
                          <button
                            type="button"
                            id="delete_cart_item"
                            className="btn btn-danger"
                            disabled={loading}
                            onClick={() =>
                              removeCartItemHandler(foodItem._id)
                            }
                            title="Remove item"
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </div>

                      </div>

                      <hr />
                    </div>
                  );
                })}

              </div>

              {/* Order Summary */}
              <div className="col-12 col-lg-3 my-4">

                <div id="order_summary">
                  <h4>Order Summary</h4>

                  <hr />

                  <p>
                    Subtotal:
                    <span className="order-summary-values">
                      {totalQuantity} (Units)
                    </span>
                  </p>

                  <p>
                    Total:
                    <span className="order-summary-values">
                      <FontAwesomeIcon
                        icon={faIndianRupee}
                        size="xs"
                      />
                      {totalPrice.toFixed(2)}
                    </span>
                  </p>

                  <hr />

                  <button
                    id="checkout_btn"
                    type="button"
                    className="btn btn-primary btn-block"
                    disabled={loading || paymentLoading}
                    onClick={checkoutHandler}
                  >
                    {paymentLoading ? "Processing..." : "Check Out"}
                  </button>

                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </>
  );
};

export default Cart;
