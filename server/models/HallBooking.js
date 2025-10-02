const mongoose = require("mongoose");

const FullHallBookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    fromTime: { type: String, required: true },
    toTime: { type: String, required: true },
    specialRequest: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    mobile: { type: String, required: true }, 
});

module.exports = mongoose.model("FullHallBooking", FullHallBookingSchema);
