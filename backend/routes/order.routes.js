const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} = require("../controllers/order.controller");

router.use(protect);

router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

module.exports = router;