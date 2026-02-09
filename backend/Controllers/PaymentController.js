// Controllers/PaymentController.js
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const StudentPayment = require("../Models/studentPaymentSchema");
const s3KeyToUrl = require("../Utils/s3KeyToUrl");


// @desc    Create Stripe Checkout Session (with better design + details)
// @route   POST /api/payment/create-checkout-session
// @access  Private

exports.createCheckoutSession = async (req, res) => {
  console.log("🔵 [DEBUG] ========== CREATE CHECKOUT SESSION START ==========");
  console.log("🔵 [DEBUG] Step 1: Request received");
  console.log("🔵 [DEBUG] Request body:", JSON.stringify(req.body, null, 2));
  console.log("🔵 [DEBUG] Request headers:", JSON.stringify(req.headers, null, 2));

  try {
    console.log("🔵 [DEBUG] Step 2: Extracting request parameters");
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
        days_remaining,
      isParentPayment , // ✅ New: Flag for parent payments
        studentName, // ✅ New: Child's name for parent payments
      } = req.body;

    console.log("🔵 [DEBUG] Extracted parameters:");
    console.log("🔵 [DEBUG] - amount:", amount);
    console.log("🔵 [DEBUG] - paymentId:", paymentId);
    console.log("🔵 [DEBUG] - tutorName:", tutorName);
    console.log("🔵 [DEBUG] - subject:", subject);
    console.log("🔵 [DEBUG] - academicLevel:", academicLevel);
    console.log("🔵 [DEBUG] - studentEmail:", studentEmail);
    console.log("🔵 [DEBUG] - payment_type:", payment_type);
    console.log("🔵 [DEBUG] - total_sessions_per_month:", total_sessions_per_month);
    console.log("🔵 [DEBUG] - base_amount:", base_amount);
    console.log("🔵 [DEBUG] - discount_percentage:", discount_percentage);
    console.log("🔵 [DEBUG] - days_remaining:", days_remaining);
    console.log("🔵 [DEBUG] - isParentPayment:", isParentPayment);
    console.log("🔵 [DEBUG] - studentName:", studentName);

      // Validate required fields
    console.log("🔵 [DEBUG] Step 3: Validating required fields");
    console.log("🔵 [DEBUG] - paymentId exists:", !!paymentId);
    console.log("🔵 [DEBUG] - amount exists:", !!amount);
    console.log("🔵 [DEBUG] - studentEmail exists:", !!studentEmail);

      if (!paymentId || !amount || !studentEmail) {
      console.log("❌ [DEBUG] Validation failed: Missing required fields");
      console.log("❌ [DEBUG] - paymentId:", paymentId);
      console.log("❌ [DEBUG] - amount:", amount);
      console.log("❌ [DEBUG] - studentEmail:", studentEmail);
        return res.status(400).json({ 
          error: "Missing required fields: paymentId, amount, or studentEmail" 
        });
      }
    console.log("✅ [DEBUG] Required fields validation passed");

      // Validate payment doesn't already exist or is already paid
    console.log("🔵 [DEBUG] Step 4: Checking existing payment status");
    console.log("🔵 [DEBUG] - Searching for payment with ID:", paymentId);

      const existingPayment = await StudentPayment.findById(paymentId);
    console.log("🔵 [DEBUG] - Existing payment found:", !!existingPayment);

    if (existingPayment) {
      console.log("🔵 [DEBUG] - Existing payment status:", existingPayment.payment_status);
      console.log("🔵 [DEBUG] - Existing payment details:", {
        id: existingPayment._id,
        status: existingPayment.payment_status,
        amount: existingPayment.monthly_amount,
        student: existingPayment.student_id,
        tutor: existingPayment.tutor_id
      });
    }

      if (existingPayment && existingPayment.payment_status === 'paid') {
      console.log("❌ [DEBUG] Payment already processed - returning error");
        return res.status(400).json({ 
          error: "Payment already processed" 
        });
      }
    console.log("✅ [DEBUG] Payment status validation passed");

      // ✅ Validate and sanitize amount to prevent floating-point precision issues
    console.log("🔵 [DEBUG] Step 5: Processing and validating amount");
    console.log("🔵 [DEBUG] - Original amount:", amount);
    console.log("🔵 [DEBUG] - Amount type:", typeof amount);

      const sanitizedAmount = Math.round(parseFloat(amount) * 100) / 100; // Round to 2 decimal places
      const amountInCents = Math.round(sanitizedAmount * 100); // Convert to cents and round to integer

    console.log("🔵 [DEBUG] - Sanitized amount:", sanitizedAmount);
    console.log("🔵 [DEBUG] - Amount in cents:", amountInCents);
    console.log("🔵 [DEBUG] - Amount validation (cents > 0):", amountInCents > 0);
      
      if (amountInCents <= 0) {
      console.log("❌ [DEBUG] Invalid amount - returning error");
        return res.status(400).json({ error: "Invalid amount" });
      }
    console.log("✅ [DEBUG] Amount validation passed");
  
      // Build product description based on payment type
    console.log("🔵 [DEBUG] Step 6: Building product description");
    console.log("🔵 [DEBUG] - isParentPayment:", isParentPayment);

      let description;
      if (isParentPayment) {
        // Parent payment description
        description = `👨‍👩‍👧‍👦 Parent Payment for ${studentName} | 📚 ${subject} Tutoring Package | 👨‍🏫 Tutor: ${tutorName} | 🎯 Level: ${academicLevel} | 💰 Rate: £${base_amount}/hr | 📅 ${total_sessions_per_month} sessions/month | 🎁 ${discount_percentage > 0 ? discount_percentage + "% off" : "No discount"} | 💳 Total: £${sanitizedAmount}`;
      console.log("🔵 [DEBUG] - Using parent payment description");
      } else {
        // Student payment description (existing)
        description = `📚 ${subject} Tutoring Package | 👨‍🏫 Tutor: ${tutorName} | 🎯 Level: ${academicLevel} | 💰 Rate: £${base_amount}/hr | 📅 ${total_sessions_per_month} sessions/month | 🎁 ${discount_percentage > 0 ? discount_percentage + "% off" : "No discount"} | 💳 Total: £${sanitizedAmount}`;
      console.log("🔵 [DEBUG] - Using student payment description");
    }

    console.log("🔵 [DEBUG] - Generated description:", description);

    console.log("🔵 [DEBUG] Step 7: Creating Stripe checkout session");
    console.log("🔵 [DEBUG] - Stripe secret key configured:", !!process.env.STRIPE_SECRET_KEY);
    console.log("process.env.STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY);
    console.log("🔵 [DEBUG] - Frontend URL:", process.env.FRONTEND_URL);
  
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
                  ? `👨‍👩‍👧‍👦 ${studentName} - ${subject} Tutoring | ${academicLevel} | ${tutorName} | £${sanitizedAmount}`
                  : `🎓 ${subject} Tutoring - ${academicLevel} Level | ${tutorName} | £${sanitizedAmount}`,
                description: description.trim(), // ✅ nicely formatted
              },
              unit_amount: amountInCents, // ✅ final discounted charge (properly rounded integer)
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
          final_amount: sanitizedAmount,
          isParentPayment: isParentPayment ? "true" : "false", // ✅ Store parent payment flag
          studentName: studentName || "", // ✅ Store child's name
        },
  
        success_url: `${process.env.FRONTEND_URL}/payment-result?success=true&PI=${paymentId}&isParentPayment=${isParentPayment}`,
        // success_url: `https://www.tutornearby.co.uk/payment-result?success=true&PI=${paymentId}&isParentPayment=${isParentPayment}`,
        // cancel_url: `https://www.tutornearby.co.uk/payment-result?success=false&PI=${paymentId}&isParentPayment=${isParentPayment}`,
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
            final_amount: sanitizedAmount,
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
  
    console.log("✅ [DEBUG] Stripe session created successfully");
    console.log("🔵 [DEBUG] - Session ID:", session.id);
    console.log("🔵 [DEBUG] - Session URL:", session.url);
    console.log("🔵 [DEBUG] - Session status:", session.status);
    console.log("🔵 [DEBUG] - Session payment status:", session.payment_status);
    console.log("🔵 [DEBUG] - Session customer email:", session.customer_email);
    console.log("🔵 [DEBUG] - Session amount total:", session.amount_total);
    console.log("🔵 [DEBUG] - Session currency:", session.currency);

    console.log("🔵 [DEBUG] Step 8: Sending success response");
      res.json({ 
        success: true,
        url: session.url,
        sessionId: session.id 
      });

    console.log("✅ [DEBUG] ========== CREATE CHECKOUT SESSION SUCCESS ==========");
    } catch (err) {
    console.log("❌ [DEBUG] ========== CREATE CHECKOUT SESSION ERROR ==========");
    console.error("❌ [DEBUG] Error creating checkout session:", {
        error: err.message,
      errorType: err.type,
      errorCode: err.code,
        paymentId: req.body.paymentId,
      amount: req.body.amount,
      stack: err.stack
    });

    console.log("🔵 [DEBUG] Error details:");
    console.log("🔵 [DEBUG] - Error message:", err.message);
    console.log("🔵 [DEBUG] - Error type:", err.type);
    console.log("🔵 [DEBUG] - Error code:", err.code);
    console.log("🔵 [DEBUG] - Error status:", err.statusCode);
      
      // Return appropriate error based on error type
      if (err.type === 'StripeInvalidRequestError') {
      console.log("❌ [DEBUG] Stripe invalid request error - returning 400");
        return res.status(400).json({ 
          error: "Invalid payment request",
          details: err.message 
        });
      }
      
    console.log("❌ [DEBUG] Generic error - returning 500");
      res.status(500).json({ 
        error: "Internal Server Error",
        message: "Failed to create checkout session"
      });

    console.log("❌ [DEBUG] ========== ERROR HANDLING COMPLETE ==========");
    }
  };
  


exports.confirmPayment = async (req, res) => {
  console.log("🟡 [DEBUG] ========== CONFIRM PAYMENT START ==========");
  console.log("🟡 [DEBUG] Step 1: Request received");
  console.log("🟡 [DEBUG] Request params:", req.params);
  console.log("🟡 [DEBUG] Request body:", req.body);
  console.log("🟡 [DEBUG] Request headers:", req.headers);

    const { paymentId } = req.params;
  console.log("🟡 [DEBUG] - Extracted paymentId:", paymentId);

    try {
        // Calculate validity period (30 days from now)
    console.log("🟡 [DEBUG] Step 2: Calculating validity period");
        const validityStartDate = new Date();
        const validityEndDate = new Date(validityStartDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days

    console.log("🟡 [DEBUG] - Validity start date:", validityStartDate.toISOString());
    console.log("🟡 [DEBUG] - Validity end date:", validityEndDate.toISOString());
    console.log("🟡 [DEBUG] - Validity period: 30 days");

    console.log("🟡 [DEBUG] Step 3: Updating payment record");
    console.log("🟡 [DEBUG] - Searching for payment with ID:", paymentId);

    const updateData = {
            payment_status: "paid",
            validity_status: "active",
            payment_date: new Date(),
            gateway_transaction_id: "manual_confirmation", // ya koi Stripe ID agar available
            academic_level_paid: true, // Now tutor can create sessions for this academic level
            validity_end_date: validityEndDate,
            validity_start_date: validityStartDate,
    };

    console.log("🟡 [DEBUG] - Update data:", updateData);

    const payment = await StudentPayment.findByIdAndUpdate(paymentId, updateData, { new: true })
        .populate({
            path: "student_id",
            populate: {
                path: "user_id",
                select: "full_name email photo_url"
            }
        })
        .populate({
            path: "tutor_id",
            populate: {
                path: "user_id",
                select: "full_name email photo_url"
            }
        });

    console.log("🟡 [DEBUG] - Payment update result:", !!payment);

        if (!payment) {
      console.log("❌ [DEBUG] Payment not found - returning 404");
            return res.status(404).json({ error: "Payment not found" });
        }

    console.log("✅ [DEBUG] Payment updated successfully");
    console.log("🟡 [DEBUG] - Updated payment details:", {
      id: payment._id,
      status: payment.payment_status,
      validity_status: payment.validity_status,
      academic_level_paid: payment.academic_level_paid,
      validity_start_date: payment.validity_start_date,
      validity_end_date: payment.validity_end_date
    });

        // Convert S3 keys to URLs for profile photos
    console.log("🟡 [DEBUG] Step 4: Converting S3 keys to URLs");
        const paymentObj = payment.toObject();
        
        // Convert student photo URL to S3 URL
        if (paymentObj.student_id?.user_id?.photo_url) {
      console.log("🟡 [DEBUG] - Converting student photo URL");
      console.log("🟡 [DEBUG] - Original student photo URL:", paymentObj.student_id.user_id.photo_url);
            paymentObj.student_id.user_id.photo_url = await s3KeyToUrl(paymentObj.student_id.user_id.photo_url);
      console.log("🟡 [DEBUG] - Converted student photo URL:", paymentObj.student_id.user_id.photo_url);
    } else {
      console.log("🟡 [DEBUG] - No student photo URL to convert");
        }

        // Convert tutor photo URL to S3 URL
        if (paymentObj.tutor_id?.user_id?.photo_url) {
      console.log("🟡 [DEBUG] - Converting tutor photo URL");
      console.log("🟡 [DEBUG] - Original tutor photo URL:", paymentObj.tutor_id.user_id.photo_url);
            paymentObj.tutor_id.user_id.photo_url = await s3KeyToUrl(paymentObj.tutor_id.user_id.photo_url);
      console.log("🟡 [DEBUG] - Converted tutor photo URL:", paymentObj.tutor_id.user_id.photo_url);
    } else {
      console.log("🟡 [DEBUG] - No tutor photo URL to convert");
        }

    console.log("🟡 [DEBUG] Step 5: Sending success response");
    console.log("🟡 [DEBUG] - Response data prepared");
        res.json({ success: true, payment: paymentObj });

    console.log("✅ [DEBUG] ========== CONFIRM PAYMENT SUCCESS ==========");
    } catch (err) {
    console.log("❌ [DEBUG] ========== CONFIRM PAYMENT ERROR ==========");
    console.error("❌ [DEBUG] Error confirming payment:", {
      error: err.message,
      errorType: err.name,
      stack: err.stack,
      paymentId: req.params.paymentId
    });

    console.log("🔵 [DEBUG] Error details:");
    console.log("🔵 [DEBUG] - Error message:", err.message);
    console.log("🔵 [DEBUG] - Error name:", err.name);
    console.log("🔵 [DEBUG] - Error code:", err.code);

        res.status(500).json({ error: "Failed to confirm payment" });

    console.log("❌ [DEBUG] ========== ERROR HANDLING COMPLETE ==========");
    }
};

// @desc    Mark payment as failed/canceled (when user cancels checkout or payment fails)
// @route   POST /api/payment/cancel/:paymentId
// @access  Private (call from payment-result when success=false)
exports.cancelPayment = async (req, res) => {
  const { paymentId } = req.params;
  try {
    const payment = await StudentPayment.findByIdAndUpdate(
      paymentId,
      {
        payment_status: "failed",
        academic_level_paid: false,
        validity_status: "expired",
        gateway_transaction_id: "user_canceled_or_failed",
      },
      { new: true }
    );
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json({ success: true, payment_status: "failed" });
  } catch (err) {
    console.error("Cancel payment error:", err);
    res.status(500).json({ error: "Failed to cancel payment" });
  }
};

