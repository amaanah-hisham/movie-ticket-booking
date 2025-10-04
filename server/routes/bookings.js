// routes/bookings.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");

// GET /api/bookings/seats?movieId=...&date=...&time=...
router.get("/seats", async (req, res) => {
  try {
    const { movieId, date, time } = req.query;

    console.log("=== SEATS API CALLED ===");
    console.log("Raw query params:", req.query);
    console.log("Parsed params:", { movieId, date, time });

    if (!movieId || !date || !time) {
      console.log("❌ Missing parameters");
      return res.status(400).json({ message: "Missing parameters" });
    }

    // Validate and convert movieId to ObjectId
    let movieObjectId;
    try {
      movieObjectId = new mongoose.Types.ObjectId(movieId);
      console.log("✅ Converted movieId to ObjectId:", movieObjectId);
    } catch (err) {
      console.log("❌ Invalid movieId format:", movieId);
      return res.status(400).json({ message: "Invalid movie ID format" });
    }

    // Log the exact query we're sending to MongoDB
    const query = {
      movieId: movieObjectId,
      selectedDate: date,
      selectedTime: time,
      paymentStatus: "paid"
    };
    
    console.log("MongoDB Query:", JSON.stringify(query, null, 2));

    // First, check what bookings exist with this movieId
    console.log("🔍 Checking bookings with movieId:", movieObjectId);
    const bookingsWithThisMovie = await Booking.find({ 
      movieId: movieObjectId 
    });
    
    console.log(`Found ${bookingsWithThisMovie.length} total bookings for this movie`);
    bookingsWithThisMovie.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`, {
        date: booking.selectedDate,
        time: booking.selectedTime,
        seats: booking.selectedSeats
      });
    });

    // getting specific bookings for date/time
    const bookings = await Booking.find(query);
    
    console.log(`📊 Found ${bookings.length} bookings matching exact criteria`);
    
    if (bookings.length === 0) {
      console.log("ℹ️ No bookings found for this specific movie/date/time combination");
    } else {
      bookings.forEach((booking, index) => {
        console.log(`Match ${index + 1}:`, {
          id: booking._id,
          seats: booking.selectedSeats,
          date: booking.selectedDate,
          time: booking.selectedTime
        });
      });
    }

    // Flatten all arrays of seats into one array
    const bookedSeats = bookings.reduce((acc, booking) => {
      if (Array.isArray(booking.selectedSeats)) {
        acc.push(...booking.selectedSeats);
      }
      return acc;
    }, []);

    console.log("All booked seats (flat):", bookedSeats);
    
    // Remove duplicates
    const uniqueBookedSeats = [...new Set(bookedSeats)];
    
    console.log("✅ Unique booked seats to return:", uniqueBookedSeats);
    console.log("=== END SEATS API ===\n");

    res.json(uniqueBookedSeats);
    
  } catch (err) {
    console.error("❌ Error fetching booked seats:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Temporary debug endpoint
router.get("/debug-bookings", async (req, res) => {
  try {
    const bookings = await Booking.find({});
    console.log("=== ALL BOOKINGS IN DATABASE ===");
    const simplifiedBookings = bookings.map(booking => ({
      _id: booking._id,
      movieId: booking.movieId,
      movieIdString: booking.movieId.toString(),
      selectedDate: booking.selectedDate,
      selectedTime: booking.selectedTime,
      selectedSeats: booking.selectedSeats,
      paymentStatus: booking.paymentStatus
    }));
    console.log("All bookings:", JSON.stringify(simplifiedBookings, null, 2));
    res.json(simplifiedBookings);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;