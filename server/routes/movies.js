const express = require("express");
const router = express.Router();
const Movie = require("../models/Movies"); 
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); 

// CREATE movie
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, storyline, ticketPrice } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Movie image is required." });
    }

    const movie = new Movie({
      title,
      storyline,
      ticketPrice: Number(ticketPrice),
      image: req.file.filename,
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) { // duplicate title
      res.status(400).json({ message: "Movie title already exists." });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});




// READ all movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE movie
router.put("/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE movie
router.delete("/:id", async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: "Movie deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
