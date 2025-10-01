const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const moviesRoute = require("./routes/movies");
const showtimesRouter = require("./routes/showtimes");
const paymentRoutes = require("./routes/payment");
const bookingRoutes = require("./routes/bookings");
const reviewRoutes = require("./routes/reviews");
const couponRoutes = require("./routes/couponRoutes");
const adminRoutes = require("./routes/admin");
const { webhookHandler } = require("./routes/payment");

const app = express();
const path = require("path");

// CORS
app.use(cors({ origin: "http://localhost:3000", methods: ["GET", "POST", "PUT", "DELETE"] }));

// ⚠️ Stripe webhook route FIRST (before body parsers)
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Normal body parsing for everything else
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normal API routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", moviesRoute);
app.use("/api/showtimes", showtimesRouter);
app.use("/api/payment", paymentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);
// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
