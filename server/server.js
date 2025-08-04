const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Middleware
app.use(cors());
app.use(express.json()); // For JSON requests
app.use(express.urlencoded({ extended: true })); // For form data
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Import DB connection
const { ConnectToDB } = require("./Configuration/db");

// Routes
const UserRoute = require("./Routes/UserRoute");
const tutorRoutes = require("./Routes/tutorRoutes");
const adminRoutes = require("./Routes/adminRoutes");

// Mount Routes
app.use('/api/auth', UserRoute);
app.use('/api/tutor', tutorRoutes);
app.use('/api/admin', adminRoutes);

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
