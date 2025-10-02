const express = require("express");
const router = express.Router();
const HallBooking = require("../models/HallBooking");

// Helper function to convert "1 PM" -> 13 for easier comparison
function hourToNumber(hourStr) {
    const [time, period] = hourStr.split(" ");
    let h = parseInt(time);

    if (period === "AM") {
        if (h === 12) h = 24; // treat 12 AM as end of day
    } else if (period === "PM") {
        if (h !== 12) h += 12;
    }

    return h;
}


// Create a new booking
router.post("/", async (req, res) => {
    try {
        const { userId, date, fromTime, toTime, specialRequest, mobile } = req.body;

        if (!userId || !date || !fromTime || !toTime) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        const requestedFrom = hourToNumber(fromTime);
        const requestedTo = hourToNumber(toTime);

        // Check for existing overlapping bookings
        const existingBookings = await HallBooking.find({ date });

        for (let booking of existingBookings) {
            const existingFrom = hourToNumber(booking.fromTime);
            const existingTo = hourToNumber(booking.toTime);

            if (
                (requestedFrom >= existingFrom && requestedFrom < existingTo) || // starts inside existing
                (requestedTo > existingFrom && requestedTo <= existingTo) ||     // ends inside existing
                (requestedFrom <= existingFrom && requestedTo >= existingTo)     // envelops existing
            ) {
                return res.status(400).json({ message: "This time slot is already booked." });
            }
        }


        const booking = new HallBooking({
            userId,
            date,
            fromTime,
            toTime,
            specialRequest,
            mobile
        });

        await booking.save();

        res.status(201).json({ message: "Booking confirmed!", booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});


// GET all bookings (for the table)
router.get("/", async (req, res) => {
    try {
        const bookings = await HallBooking.find().sort({ date: 1, fromTime: 1 });
        res.status(200).json({ bookings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
