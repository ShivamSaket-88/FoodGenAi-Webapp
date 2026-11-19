
const Cart = require("../models/cartModel");
const FoodItem = require("../models/foodItem");
const Restaurant = require("../models/restaurant");

// Common populated cart response
const getPopulatedCart = async (userId) => {
  return await Cart.findOne({ user: userId })
    .populate({
      path: "items.foodItem",
      select: "name price images stock",
    })
    .populate({
      path: "restaurant",
      select: "name",
    });
};

// Standard empty cart response
const emptyCart = {
  items: [],
  restaurant: null,
};

// ADD ITEM TO CART
async function addItemToCart(req, res) {
  const userId = req.user._id;
  const { foodItemId, restaurantId } = req.body;
  const quantity = Number(req.body.quantity);

  try {
    if (!foodItemId || !restaurantId ||
        !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item, restaurant or quantity",
      });
    }

    const foodItem = await FoodItem.findById(foodItemId);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (typeof foodItem.stock === "number" && quantity > foodItem.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (cart && cart.restaurant.toString() !== restaurantId.toString()) {
      await Cart.deleteOne({ _id: cart._id });
      cart = null;
    }

    if (!cart) {
      cart = new Cart({
        user: userId,
        restaurant: restaurantId,
        items: [{ foodItem: foodItemId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.foodItem.toString() === foodItemId.toString()
      );

      if (itemIndex > -1) {
        const newQuantity = cart.items[itemIndex].quantity + quantity;

        if (
          typeof foodItem.stock === "number" &&
          newQuantity > foodItem.stock
        ) {
          return res.status(400).json({
            success: false,
            message: "Requested quantity exceeds available stock",
          });
        }

        cart.items[itemIndex].quantity = newQuantity;
      } else {
        cart.items.push({ foodItem: foodItemId, quantity });
      }
    }

    await cart.save();

    const updatedCart = await getPopulatedCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: updatedCart || emptyCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to add item to cart",
    });
  }
}

// UPDATE CART ITEM QUANTITY
async function updateCartItemQuantity(req, res) {
  const userId = req.user._id;
  const { foodItemId } = req.body;
  const quantity = Number(req.body.quantity);

  try {
    if (
      !foodItemId ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item or quantity",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.foodItem.toString() === foodItemId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Food item not found in cart",
      });
    }

    const foodItem = await FoodItem.findById(foodItemId);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    if (
      typeof foodItem.stock === "number" &&
      quantity > foodItem.stock
    ) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const updatedCart = await getPopulatedCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: updatedCart || emptyCart,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update cart",
    });
  }
}

// DELETE CART ITEM
async function deleteCartItem(req, res) {
  const userId = req.user._id;
  const { foodItemId } = req.body;

  try {
    if (!foodItemId) {
      return res.status(400).json({
        success: false,
        message: "Food item ID is required",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.foodItem.toString() === foodItemId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Food item not found in cart",
      });
    }

    cart.items.splice(itemIndex, 1);

    if (cart.items.length === 0) {
      await Cart.deleteOne({ _id: cart._id });

      return res.status(200).json({
        success: true,
        message: "Cart is now empty",
        cart: emptyCart,
      });
    }

    await cart.save();

    const updatedCart = await getPopulatedCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart item deleted",
      cart: updatedCart || emptyCart,
    });
  } catch (error) {
    console.error("Delete cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete cart item",
    });
  }
}

// GET CART
async function getCartItem(req, res) {
  const userId = req.user._id;

  try {
    const cart = await getPopulatedCart(userId);

    return res.status(200).json({
      success: true,
      cart: cart || emptyCart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch cart",
    });
  }
}

module.exports = {
  addItemToCart,
  updateCartItemQuantity,
  deleteCartItem,
  getCartItem,
};
