const Stripe = require("stripe");
require("dotenv").config(); // only needed locally

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

(async () => {
  try {
    const customers = await stripe.customers.list({ limit: 1 });
    console.log("✅ Stripe connection successful!");
  } catch (err) {
    console.error("❌ Stripe test failed:", err.message);
  }
})();
