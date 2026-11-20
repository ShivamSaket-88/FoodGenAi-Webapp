
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
  console.log("CART 1: Controller reached");

  const userId = req.user._id;
  const { foodItemId, restaurantId } = req.body;
  const quantity = Number(req.body.quantity);

  try {
    console.log("CART 2: Request body received");

    // बाकी validation तुम्हारी पहले वाली ही रहेगी

    const foodItem = await FoodItem.findById(foodItemId);
    console.log("CART 3: Food item query completed");

    const restaurant = await Restaurant.findById(restaurantId);
    console.log("CART 4: Restaurant query completed");

    let cart = await Cart.findOne({ user: userId });
    console.log("CART 5: Cart query completed");

    // बाकी पुराना code
  } catch (error) {
    console.error("Add to cart error:", error);
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
