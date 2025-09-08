// Controllers/PaymentController.js
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const router = express.Router();
const StudentPayment = require("../Models/studentPaymentSchema");

// @desc    Create Stripe Checkout Session (with better design + details)
// @route   POST /api/payment/create-checkout-session
// @access  Private

exports.createCheckoutSession = async (req, res) => {
    try {
      const {
        amount, // ✅ final discounted amount (98)
        paymentId,
        tutorName,
        subject,
        academicLevel,
        studentEmail,
        payment_type,
        total_sessions_per_month,
        base_amount,
        discount_percentage,
        isParentPayment, // ✅ New: Flag for parent payments
        studentName, // ✅ New: Child's name for parent payments
      } = req.body;
  
      // Build product description based on payment type
      let description;
      if (isParentPayment) {
        // Parent payment description
        description = `👨‍👩‍👧‍👦 Parent Payment for ${studentName} | 📚 ${subject} Tutoring Package | 👨‍🏫 Tutor: ${tutorName} | 🎯 Level: ${academicLevel} | 💰 Rate: £${base_amount}/hr | 📅 ${total_sessions_per_month} sessions/month | 🎁 ${discount_percentage > 0 ? discount_percentage + "% off" : "No discount"} | 💳 Total: £${amount}`;
      } else {
        // Student payment description (existing)
        description = `📚 ${subject} Tutoring Package | 👨‍🏫 Tutor: ${tutorName} | 🎯 Level: ${academicLevel} | 💰 Rate: £${base_amount}/hr | 📅 ${total_sessions_per_month} sessions/month | 🎁 ${discount_percentage > 0 ? discount_percentage + "% off" : "No discount"} | 💳 Total: £${amount}`;
      }
  
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: studentEmail,
  
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: isParentPayment 
                  ? `👨‍👩‍👧‍👦 ${studentName} - ${subject} Tutoring | ${academicLevel} | ${tutorName} | £${amount}`
                  : `🎓 ${subject} Tutoring - ${academicLevel} Level | ${tutorName} | £${amount}`,
                description: description.trim(), // ✅ nicely formatted
              },
              unit_amount: amount * 100, // ✅ final discounted charge
            },
            quantity: 1,
          },
        ],
  
        metadata: {
          paymentId,
          tutorName,
          subject,
          academicLevel,
          payment_type,
          studentEmail,
          total_sessions_per_month,
          base_amount,
          discount_percentage,
          final_amount: amount,
          isParentPayment: isParentPayment ? "true" : "false", // ✅ Store parent payment flag
          studentName: studentName || "", // ✅ Store child's name
        },
  
        success_url: `${process.env.FRONTEND_URL}/payment-result?success=true&PI=${paymentId}&isParentPayment=${isParentPayment}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-result?success=false&PI=${paymentId}&isParentPayment=${isParentPayment}`,
  
        billing_address_collection: 'auto',
        locale: 'en-GB',
   
         
  
        custom_text: {
          submit: {
            message: isParentPayment 
              ? `🎉 Thank you for choosing ${tutorName} for ${studentName}'s ${subject} tutoring! 
  
  This payment will grant ${studentName} access for 30 days. You'll get a confirmation email and ${studentName} can start scheduling sessions right after payment.`
              : `🎉 Thank you for choosing ${tutorName} for your ${subject} tutoring! 
  
  This payment will grant you access for 30 days. You'll get a confirmation email and can start scheduling sessions right after payment.`,
          },
        },
  
        payment_method_options: {
          card: { request_three_d_secure: 'automatic' },
        },
  
        customer_creation: 'always',
  
        payment_intent_data: {
          metadata: {
            paymentId,
            tutorName,
            subject,
            academicLevel,
            payment_type,
            studentEmail,
            total_sessions_per_month,
            base_amount,
            discount_percentage,
            final_amount: amount,
            isParentPayment: isParentPayment ? "true" : "false", // ✅ Store in payment intent
            studentName: studentName || "", // ✅ Store child's name
          },
          description: isParentPayment 
            ? `👨‍👩‍👧‍👦 Parent Payment: ${studentName} - ${tutorName} - ${subject} - ${academicLevel}`
            : `🎓 Tutor Payment: ${tutorName} - ${subject} - ${academicLevel}`,
          receipt_email: studentEmail,
        },
  
        allow_promotion_codes: true,
        // phone_number_collection: { enabled: true },
      });
  
      res.json({ url: session.url });
    } catch (err) {
      console.error("❌ Error creating checkout session:", err);
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to confirm payment" });
    }
};



