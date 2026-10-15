const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Helper to validate ObjectId format
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /wishlist/:productId - Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Verify product exists in DB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(userId);

    // Prevent duplicates (409 Conflict)
    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    customer.wishlist.push(productId);
    await customer.save();
    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error adding to wishlist",
      error: error.message,
    });
  }
};

// GET /wishlist - Get current authenticated user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const customer = await Customer.findById(userId).populate({
      path: "wishlist",
      select: "name price category image stock",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Filter out any null references (e.g. if a product was deleted from DB)
    const validWishlist = customer.wishlist.filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error fetching wishlist",
      error: error.message,
    });
  }
};

// DELETE /wishlist/:productId - Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await Customer.findById(userId);

    const itemIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    customer.wishlist.splice(itemIndex, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error removing from wishlist",
      error: error.message,
    });
  }
};

// PATCH /wishlist/:productId/toggle - Bonus challenge: Toggle add/remove
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(userId);
    const itemIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let isAdded = false;

    if (itemIndex > -1) {
      customer.wishlist.splice(itemIndex, 1);
      isAdded = false;
    } else {
      customer.wishlist.push(productId);
      isAdded = true;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: isAdded
        ? "Product added to wishlist"
        : "Product removed from wishlist",
      isWishlisted: isAdded,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error toggling wishlist",
      error: error.message,
    });
  }
};