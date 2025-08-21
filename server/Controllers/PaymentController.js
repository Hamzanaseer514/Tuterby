// Controllers/PaymentController.js
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const router = express.Router();
const StudentPayment = require("../Models/studentPaymentSchema");

exports.createCheckoutSession = async (req, res) => {
    try {
        const { amount, paymentId } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "gbp",
                        product_data: { name: "Tutor Payment" },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: { paymentId },
            success_url: `${process.env.FRONTEND_URL}/payment-result?success=true&PI=${paymentId}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-result?success=false&PI=${paymentId}`,
        });

        console.log("session", session);
        res.json({ url: session.url });
    } catch (err) {
        console.error("❌ Error creating checkout session", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



exports.confirmPayment = async (req, res) => {
    const { paymentId } = req.params;

    try {

        // Calculate validity period (30 days from now)
        const validityStartDate = new Date();
        const validityEndDate = new Date(validityStartDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days

        const payment = await StudentPayment.findByIdAndUpdate(paymentId, {
            payment_status: "paid",
            payment_date: new Date(),
            gateway_transaction_id: "manual_confirmation", // ya koi Stripe ID agar available
            academic_level_paid: true, // Now tutor can create sessions for this academic level
            validity_end_date: validityEndDate,
            validity_start_date: validityStartDate,

        }, { new: true });
        res.json({ success: true, payment });
        console.log("Payment confirmed:", payment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to confirm payment" });
    }
};



