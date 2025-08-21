const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const cookieParser = require("cookie-parser");
// ⚠️ Webhook route needs raw body, so put this BEFORE express.json()
app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  require("./Routes/stripeWebhook") // ✅ webhook ka route alag file me rakho
);
// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // tumhare React/Vite frontend ka port
    credentials: true, // agar cookies ya authentication bhejna ho
  })
);
app.use(express.json()); // For JSON requests
app.use(express.urlencoded({ extended: true })); // For form data
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Import DB connection
const { ConnectToDB } = require("./Configuration/db");

// Routes
const UserRoute = require("./Routes/UserRoute");
const tutorRoutes = require("./Routes/tutorRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const paymentRoutes = require("./Routes/PaymentRoute");

// Mount Routes
app.use("/api/auth", UserRoute);
app.use("/api/tutor", tutorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);


// Error handler (should be AFTER routes)
const { errorHandler } = require("./Middleware/errorHandler");
app.use(errorHandler);

// DB Connect and Start Server
ConnectToDB()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });
