const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Movie = require("../models/Movies");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

// GET /api/admin/total-users
router.get("/total-users", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        console.log("Total users in DB:", totalUsers);
        res.json({ totalUsers });
    } catch (err) {
        console.error("Error fetching total users:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/admin/total-movies
router.get("/total-movies", async (req, res) => {
    try {
        const totalMovies = await Movie.countDocuments();
        console.log("Total movies in DB:", totalMovies);
        res.json({ totalMovies });
    } catch (err) {
        console.error("Error fetching total movies:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/admin/total-bookings
router.get("/total-bookings", async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        console.log("Total bookings in DB:", totalBookings);
        res.json({ totalBookings });
    } catch (err) {
        console.error("Error fetching total bookings:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// GET /api/admin/total-revenue
router.get("/total-revenue", async (req, res) => {
    try {
        const result = await Booking.aggregate([
            {
                $match: { paymentStatus: "paid" }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $toDouble: "$totalAmount" } }
                }
            }
        ]);

        const totalRevenue = result[0]?.totalRevenue || 0;
        console.log("Total revenue:", totalRevenue);
        res.json({ totalRevenue });
    } catch (err) {
        console.error("Error fetching total revenue:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// GET /api/admin/average-ticket-price
router.get("/average-ticket-price", async (req, res) => {
    try {
        const result = await Booking.aggregate([
            {
                $match: { paymentStatus: "paid" }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalSeats: { $sum: { $size: "$selectedSeats" } }
                }
            },
            {
                $project: {
                    _id: 0,
                    averageTicketPrice: {
                        $cond: [
                            { $eq: ["$totalSeats", 0] },
                            0,
                            { $divide: ["$totalRevenue", "$totalSeats"] }
                        ]
                    }
                }
            }
        ]);

        const averageTicketPrice = result[0]?.averageTicketPrice || 0;
        console.log("Average ticket price:", averageTicketPrice);
        res.json({ averageTicketPrice });
    } catch (err) {
        console.error("Error fetching average ticket price:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/admin/top-selling-movies
router.get("/top-selling-movies", async (req, res) => {
    try {
        const topMovies = await Booking.aggregate([
            { $match: { paymentStatus: "paid" } },
            {
                $group: {
                    _id: "$movieId",
                    totalSeats: { $sum: { $size: "$selectedSeats" } },
                    totalRevenue: { $sum: { $toDouble: "$totalAmount" } }
                }
            },
            { $sort: { totalSeats: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "_id",
                    as: "movieDetails"
                }
            },
            { $unwind: "$movieDetails" },
            {
                $project: {
                    _id: 0,
                    movieName: "$movieDetails.title",
                    totalSeats: 1,
                    totalRevenue: 1
                }
            }
        ]);

        res.json(topMovies);
    } catch (err) {
        console.error("Error fetching top selling movies:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/admin/top-earning-movies
router.get("/top-earning-movies", async (req, res) => {
    try {
        const topMovies = await Booking.aggregate([
            { $match: { paymentStatus: "paid" } },
            {
                $group: {
                    _id: "$movieId",
                    totalSeats: { $sum: { $size: "$selectedSeats" } },
                    totalRevenue: { $sum: { $toDouble: "$totalAmount" } }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "_id",
                    as: "movieDetails"
                }
            },
            { $unwind: "$movieDetails" },
            {
                $project: {
                    _id: 0,
                    movieName: "$movieDetails.title",
                    totalSeats: 1,
                    totalRevenue: 1
                }
            }
        ]);

        res.json(topMovies);
    } catch (err) {
        console.error("Error fetching top earning movies:", err);
        res.status(500).json({ message: "Server error" });
    }
});





// GET /api/admin/revenue-per-movie
router.get("/revenue-per-movie", async (req, res) => {
    try {
        const result = await Booking.aggregate([
            { $match: { paymentStatus: "paid" } },
            {
                $group: {
                    _id: "$movieId",
                    totalRevenue: { $sum: { $toDouble: "$totalAmount" } },
                },
            },
            {
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "_id",
                    as: "movieDetails",
                },
            },
            { $unwind: "$movieDetails" },
            {
                $project: {
                    _id: 0,
                    movieName: "$movieDetails.title",
                    totalRevenue: 1,
                },
            },
        ]);

        res.json(result);
    } catch (err) {
        console.error("Error fetching revenue per movie:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/admin/revenue-per-day
router.get("/revenue-per-day", async (req, res) => {
    try {
        const revenueData = await Booking.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: -1 } }, 
            { $limit: 5 }            
        ]);

        // reverse to display oldest to latest
        const formattedData = revenueData
            .reverse()
            .map(item => ({
                date: item._id,
                totalRevenue: item.totalRevenue
            }));

        res.json(formattedData);
    } catch (err) {
        console.error("Error fetching revenue per day:", err);
        res.status(500).json({ message: "Server error" });
    }
});



module.exports = router;
