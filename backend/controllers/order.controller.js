const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const razorpay = require("../config/razorpay");

// 1. POST /orders/create-payment-order
exports.createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName?.trim() ||
      !shippingAddress.phone?.trim() ||
      !shippingAddress.addressLine1?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.state?.trim() ||
      !shippingAddress.pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required",
      });
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain 6 digits",
      });
    }

    const customer = await Customer.findById(userId);
    if (!customer || !customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    let calculatedTotal = 0;
    const orderItemsSnapshot = [];

    // Re-verify stock and latest database prices
    for (const item of customer.cart) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "One or more products in your cart no longer exist",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} units remaining.`,
        });
      }

      calculatedTotal += product.price * item.quantity;

      orderItemsSnapshot.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });
    }

    // Create ShopKart pending order
    const shopKartOrder = await Order.create({
      user: userId,
      items: orderItemsSnapshot,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      totalAmount: calculatedTotal,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    // Create Razorpay Order (amount must be in paise: ₹1 = 100 paise)
    const options = {
      amount: Math.round(calculatedTotal * 100),
      currency: "INR",
      receipt: shopKartOrder._id.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save razorpayOrderId to the ShopKart order
    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    return res.status(200).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID, // Safe to send Public Key ID
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error initiating payment order",
      error: error.message,
    });
  }
};

// 2. POST /orders/verify-payment
exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters",
      });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // HMAC SHA-256 signature verification using the database-stored order ID
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "FAILED";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Payment verification failed.",
      });
    }

    // Mark order as PAID & PLACED
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Deduct stock from products
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user cart in MongoDB only after verification succeeds
    await Customer.findByIdAndUpdate(userId, { $set: { cart: [] } });

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error verifying payment",
      error: error.message,
    });
  }
};

// 3. GET /orders
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({
      user: userId,
      paymentStatus: "PAID",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error fetching orders",
      error: error.message,
    });
  }
};

// 4. GET /orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check ownership
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not own this order.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error fetching order",
      error: error.message,
    });
  }
};