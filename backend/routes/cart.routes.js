const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
} = require("../controllers/cart.controller");

router.use(protect); // Ensure user is authenticated via JWT cookie

router.get("/", getCart);
router.post("/:productId", addToCart);
router.patch("/:productId", updateQuantity);
router.delete("/:productId", removeFromCart);

module.exports = router;