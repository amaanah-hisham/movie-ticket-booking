const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Review = require("../models/Review");

// POST a new review
router.post("/", async (req, res) => {
  try {
    let { movieId, userId, review, rating } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(movieId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid movieId or userId" });
    }

    // create ObjectId instances
    movieId = new mongoose.Types.ObjectId(movieId);
    userId = new mongoose.Types.ObjectId(userId);

    const newReview = new Review({ movieId, userId, review, rating });
    await newReview.save();

    res.status(201).json(newReview);
  } catch (err) {
    console.error("Error saving review:", err.message, err);
    res.status(500).json({ message: err.message });
  }
});

// GET reviews for a specific movie
router.get("/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movieId" });
    }

    const reviews = await Review.find({ movieId })
      .populate("userId", "username") // fetch only the username
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map(r => ({
      user: r.userId?.username || "Anonymous",
      review: r.review,
      rating: r.rating
    }));

    res.json(formattedReviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
