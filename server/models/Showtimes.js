// models/Showtimes.js
const mongoose = require("mongoose");

const ShowtimeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  movieTitle: { type: String }, 
  date: { type: String, required: true },
  times: [{ type: String }], 
});

module.exports = mongoose.model("Showtimes", ShowtimeSchema);
