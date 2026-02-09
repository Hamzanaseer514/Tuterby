// Routes/PaymentRoute.js
const express = require("express");
const router = express.Router();
const { createCheckoutSession, confirmPayment, cancelPayment } = require("../Controllers/PaymentController");

// ✅ ab sirf controller use karo
router.post("/create-checkout-session", createCheckoutSession);
router.post("/confirm/:paymentId", confirmPayment);
router.post("/cancel/:paymentId", cancelPayment);

module.exports = router;
