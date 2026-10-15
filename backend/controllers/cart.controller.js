const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper to fetch and populate customer cart cleanly
const getPopulatedCart = async (userId) => {
  const customer = await Customer.findById(userId).populate({
    path: "cart.product",
    select: "name price category image stock",
  });
  // Filter out any entries where the referenced product no longer exists in DB
  return customer.cart.filter((item) => item.product !== null);
};

// POST /cart/:productId - Add item or increment quantity
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: "Product is out of stock" });
    }

    const customer = await Customer.findById(userId);
    const cartItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      // Product exists in cart -> Increment quantity
      const newQuantity = customer.cart[cartItemIndex].quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} units available in stock.`,
        });
      }
      customer.cart[cartItemIndex].quantity = newQuantity;
    } else {
      // Product does not exist -> Push new entry
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();
    const updatedCart = await getPopulatedCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error adding to cart",
      error: error.message,
    });
  }
};

// GET /cart - Get user's cart with populated products
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const validCart = await getPopulatedCart(userId);

    return res.status(200).json({
      success: true,
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error fetching cart",
      error: error.message,
    });
  }
};

// PATCH /cart/:productId - Update specific quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const parsedQty = Number(quantity);
    if (!parsedQty || isNaN(parsedQty) || parsedQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number of at least 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (parsedQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock of ${product.stock}`,
      });
    }

    const customer = await Customer.findById(userId);
    const cartItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    customer.cart[cartItemIndex].quantity = parsedQty;
    await customer.save();

    const updatedCart = await getPopulatedCart(userId);

    return res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart: updatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error updating cart quantity",
      error: error.message,
    });
  }
};

// DELETE /cart/:productId - Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const customer = await Customer.findById(userId);
    const cartItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    customer.cart.splice(cartItemIndex, 1);
    await customer.save();

    const updatedCart = await getPopulatedCart(userId);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: updatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error removing item from cart",
      error: error.message,
    });
  }
};