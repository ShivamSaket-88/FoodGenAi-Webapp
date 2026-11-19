
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndianRupeeSign } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  addItemToCart,
  updateCartQuantity,
  removeItemFromCart,
} from "../redux/actions/cartActions";

import axios from "axios";
import { getMenus } from "../redux/actions/menuActions";

const Fooditem = ({ fooditem, restaurant }) => {
  const [quantity, setQuantity] = useState(1);
  const [showButtons, setShowButtons] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // User State
  const { user, isAuthenticated } = useSelector(
    (state) => state.user
  );

  const loggedIn = Boolean(user) || isAuthenticated;

  // Cart State
  const { cartItems } = useSelector((state) => state.cart);

  // Sync quantity with Redux cart
  useEffect(() => {
    const cartItem = cartItems.find(
      (item) => item.foodItem?._id === fooditem._id
    );

    if (cartItem) {
      setQuantity(cartItem.quantity);
      setShowButtons(true);
    } else {
      setQuantity(1);
      setShowButtons(false);
    }
  }, [cartItems, fooditem._id]);

  // Add Item To Cart
  const addToCartHandler = async () => {
    if (!loggedIn) {
      toast.info("Please login to add items to cart");
      navigate("/users/login");
      return;
    }

    if (user?.role === "admin") {
      return;
    }

    if (!fooditem.stock || fooditem.stock < 1) {
      toast.error("This item is out of stock");
      return;
    }

    setCartLoading(true);

    try {
      const result = await dispatch(
        addItemToCart(fooditem._id, restaurant, 1)
      );

      if (result) {
        toast.success("Item added to cart");
      } else {
        toast.error("Unable to add item to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Something went wrong");
    } finally {
      setCartLoading(false);
    }
  };

  // Increase Quantity
  const increaseQty = async () => {
    if (cartLoading) return;

    const newQuantity = quantity + 1;

    if (
      typeof fooditem.stock === "number" &&
      newQuantity > fooditem.stock
    ) {
      toast.error("Exceeded stock limit");
      return;
    }

    setCartLoading(true);

    try {
      const result = await dispatch(
        updateCartQuantity(fooditem._id, newQuantity)
      );

      if (!result) {
        toast.error("Unable to update quantity");
      }
    } catch (error) {
      console.error("Increase quantity error:", error);
      toast.error("Something went wrong");
    } finally {
      setCartLoading(false);
    }
  };

  // Decrease Quantity
  const decreaseQty = async () => {
    if (cartLoading) return;

    if (quantity <= 1) {
      setCartLoading(true);

      try {
        const result = await dispatch(
          removeItemFromCart(fooditem._id)
        );

        if (!result) {
          toast.error("Unable to remove item");
        }
      } catch (error) {
        console.error("Remove item error:", error);
        toast.error("Something went wrong");
      } finally {
        setCartLoading(false);
      }

      return;
    }

    setCartLoading(true);

    try {
      const result = await dispatch(
        updateCartQuantity(fooditem._id, quantity - 1)
      );

      if (!result) {
        toast.error("Unable to update quantity");
      }
    } catch (error) {
      console.error("Decrease quantity error:", error);
      toast.error("Something went wrong");
    } finally {
      setCartLoading(false);
    }
  };

  // Admin Delete Food Item
  const deleteFoodItemHandler = async () => {
    if (!window.confirm("Delete this food item?")) return;

    try {
      await axios.delete(`/api/v1/eats/item/${fooditem._id}`, {
        withCredentials: true,
      });

      toast.success("Food item deleted successfully");

      if (restaurant) {
        dispatch(getMenus(restaurant));
      }
    } catch (error) {
      console.error("Delete food item error:", error);

      toast.error(
        error.response?.data?.message || "Unable to delete item"
      );
    }
  };

  return (
    <div className="col-sm-12 col-md-6 col-lg-3 my-3">
      <div className="card p-3 rounded">

        {/* Food Image */}
        <img
          className="card-img-top mx-auto food-image"
          src={
            fooditem.images?.[0]?.url ||
            "/images/placeholder.png"
          }
          alt={fooditem.name || "Food item"}
        />

        <div className="card-body d-flex flex-column">

          {/* Food Name */}
          <h5 className="card-title">
            {fooditem.name}
          </h5>

          {/* Description */}
          <p className="fooditem_des">
            {fooditem.description}
          </p>

          {/* Price */}
          <p className="card-text">
            <FontAwesomeIcon
              icon={faIndianRupeeSign}
              size="xs"
            />
            {fooditem.price}
          </p>

          {/* Add To Cart / Quantity Controls */}
          {!showButtons ? (
            user?.role !== "admin" && (
              <button
                id="cart_btn"
                type="button"
                className="btn btn-primary ml-4"
                disabled={
                  cartLoading || !fooditem.stock || fooditem.stock < 1
                }
                onClick={addToCartHandler}
              >
                {cartLoading ? "Adding..." : "Add to Cart"}
              </button>
            )
          ) : (
            <div className="stockCounter d-inline">

              <button
                type="button"
                className="btn btn-danger minus"
                disabled={cartLoading}
                onClick={decreaseQty}
              >
                -
              </button>

              <input
                type="number"
                className="form-control count d-inline"
                value={quantity}
                readOnly
              />

              <button
                type="button"
                className="btn btn-primary plus"
                disabled={cartLoading}
                onClick={increaseQty}
              >
                +
              </button>

            </div>
          )}

          <hr />

          {/* Stock Status */}
          <p>
            Status:
            <span
              className={
                fooditem.stock > 0
                  ? "greenColor"
                  : "redColor"
              }
            >
              {fooditem.stock > 0
                ? ` In Stock (${fooditem.stock})`
                : " Out of Stock"}
            </span>
          </p>

          {/* Admin Delete */}
          {loggedIn && user?.role === "admin" && (
            <button
              type="button"
              className="btn btn-danger btn-sm mt-2"
              onClick={deleteFoodItemHandler}
            >
              Delete
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default Fooditem;
