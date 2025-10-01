const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Movie = require("../models/Movie");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

// GET /api/admin/total-users
router.get("/total-users", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments(); // counts all users
    res.json({ totalUsers });
  } catch (err) {
    console.error("Error fetching total users:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
