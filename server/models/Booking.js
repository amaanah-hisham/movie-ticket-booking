const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    selectedDate: { type: String, required: true },
    selectedTime: { type: String, required: true },
    selectedSeats: [{ type: String }],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, default: "pending" },
    stripePaymentIntentId: { type: String },
    mobile: { type: String }, 
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", BookingSchema);
