// routes/showtimes.js
const express = require("express");
const router = express.Router();
const Showtime = require("../models/Showtimes");
const Movie = require("../models/Movies");

// GET all showtimes
router.get("/", async (req, res) => {
  try {
    const showtimes = await Showtime.find().populate("movieId");
    // include movie title in response
    const formatted = showtimes.map(s => ({
      _id: s._id,
      movieId: s.movieId._id,
      movieTitle: s.movieId.title,
      date: s.date,
      times: s.times
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new showtime
router.post("/", async (req, res) => {
  try {
    const { movieId, date, times } = req.body;
    const movie = await Movie.findById(movieId);
    const newShowtime = new Showtime({
      movieId,
      movieTitle: movie.title,
      date,
      times
    });
    const saved = await newShowtime.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a showtime
router.delete("/:id", async (req, res) => {
  try {
    await Showtime.findByIdAndDelete(req.params.id);
    res.json({ message: "Showtime deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
