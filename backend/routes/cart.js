
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const cartController = require("../controllers/cartController");

// All cart operations require authentication
router.use(authController.protect);

// Add item
router.post("/add-to-cart", cartController.addItemToCart);

// Update quantity
router.post("/update-cart-item", cartController.updateCartItemQuantity);

// Delete item
router.delete("/delete-cart-item", cartController.deleteCartItem);

// Get cart
router.get("/get-cart", cartController.getCartItem);

module.exports = router;
