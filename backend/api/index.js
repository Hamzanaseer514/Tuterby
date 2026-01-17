const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const fetch = global.fetch;

/* ===============================
   ENV VALIDATION (SAFE FOR VERCEL)
================================= */
const requiredEnvVars = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "FRONTEND_URL",
  "MONGO_URI",
  "JWT_SECRET",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing env variable: ${key}`);
  }
}

/* ===============================
   DATABASE CONNECTION (CACHED)
================================= */
const { ConnectToDB } = require("../Configuration/db");

let isDBConnected = false;

const connectDBOnce = async () => {
  if (isDBConnected) return;

  await ConnectToDB();
  isDBConnected = true;
  console.log("✅ MongoDB connected");
};

/* ===============================
   WEBHOOK SECURITY
================================= */
const webhookSecurity = (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).send("Missing stripe signature");

  const timestamp = sig.split(",")[0].split("=")[1];
  const now = Math.floor(Date.now() / 1000);

  if (now - parseInt(timestamp) > 300) {
    return res.status(400).send("Webhook timestamp too old");
  }

  next();
};

/* ===============================
   RAW BODY WEBHOOK (FIRST)
================================= */
app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  webhookSecurity,
  require("../Routes/stripeWebhook")
);

/* ===============================
   MIDDLEWARE
================================= */
app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ===============================
   DB INIT MIDDLEWARE
================================= */
app.use(async (req, res, next) => {
  try {
    await connectDBOnce();
    next();
  } catch (err) {
    console.error("❌ DB connection failed", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

/* ===============================
   ROUTES
================================= */
app.get("/", (req, res) => {
  res.send("Hi, TutorNearby API 🚀");
});

app.use("/api/auth", require("../Routes/UserRoute"));
app.use("/api/tutor", require("../Routes/tutorRoutes"));
app.use("/api/admin", require("../Routes/adminRoutes"));
app.use("/api/payment", require("../Routes/PaymentRoute"));
app.use("/api/parent", require("../Routes/ParentRoutes"));
app.use("/api/public", require("../Routes/publicRoutes"));
app.use("/api/assignments", require("../Routes/assignmentRoutes"));

/* ===============================
   STRIPE TEST
================================= */
app.get("/test-stripe", async (req, res) => {
  try {
    const resp = await fetch("https://api.stripe.com/v1/charges", {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });
    res.json({ ok: resp.ok, status: resp.status });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ===============================
   ERROR HANDLER
================================= */
const { errorHandler } = require("../Middleware/errorHandler");
app.use(errorHandler);

/* ===============================
   EXPORT (NO LISTEN)
================================= */
module.exports = app;
