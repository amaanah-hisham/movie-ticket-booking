// src/FullHallBooking.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./HallBooking.css";
import "./headerAndfooter.css";

// Separate component for booked/unavailable slots
function BookedSlotsTable() {
    const today = new Date().toISOString().split("T")[0];
    const [bookings, setBookings] = useState([]);
    const [filterDate, setFilterDate] = useState(today); // initialize to today

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/hallBooking");
                const data = await res.json();
                if (res.ok) {
                    setBookings(data.bookings || data);
                }
            } catch (err) {
                console.error("Error fetching bookings:", err);
            }
        };
        fetchBookings();
    }, []);

    // Filter bookings by the selected date
    const filteredBookings = bookings.filter((booking) => booking.date === filterDate);

    return (
        <div className="booked-slots-container">
            <h3>Unavailable Slots</h3>

            {/* Date filter */}
            <div className="form-group">
                <label>Filter by Date:</label>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    min={today}
                />
            </div>

            <div style={{ height: "20px" }}></div>

            <table className="booked-slots-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>From</th>
                        <th>To</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.length === 0 ? (
                        <tr>
                            <td colSpan="3" style={{ textAlign: "center" }}>
                                No bookings for this date
                            </td>
                        </tr>
                    ) : (
                        filteredBookings.map((booking) => (
                            <tr key={booking._id}>
                                <td>{booking.date}</td>
                                <td>{booking.fromTime}</td>
                                <td>{booking.toTime}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

function FullHallBooking() {
    const today = new Date().toISOString().split("T")[0];

    const [selectedDate, setSelectedDate] = useState(today);
    const [fromTime, setFromTime] = useState("");
    const [toTime, setToTime] = useState("");
    const [specialRequest, setSpecialRequest] = useState("");
    const [user, setUser] = useState(null);
    const [mobile, setMobile] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) setUser(JSON.parse(loggedInUser));
    }, []);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!selectedDate || !fromTime || !toTime) {
            alert("Please select date and time");
            return;
        }
        const bookingData = {
            userId: user?.id,
            date: selectedDate,
            fromTime,
            toTime,
            specialRequest,
            mobile,
        };
        try {
            const response = await fetch("http://localhost:5000/api/hallBooking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });
            const data = await response.json();
            if (response.ok) {
                navigate("/successHallBooking", {
                    state: { date: selectedDate, fromTime, toTime, specialRequest, mobile },
                });
            } else {
                alert(data.message || "Failed to book the hall.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong. Please try again later.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
    };

    return (
        <div className="hallbooking-app">
            {/* Navbar */}
            <nav className="navbar">
                <div className="app-name">PulseCinema</div>
                <ul className="nav-links">
                    <li><Link to="/" className="nav-link">Home</Link></li>
                    {/* <li><Link to="/movies" className="nav-link">Movies</Link></li> */}
                    <li><Link to="/about" className="nav-link">About</Link></li>
                    <li><Link to="/hallBooking" className="nav-link">Events</Link></li>
                    {user && user.email === "admin@gmail.com" && (
                        <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
                    )}
                </ul>
                {user ? (
                    <button className="login-btn" onClick={handleLogout}>Logout</button>
                ) : (
                    <Link to="/login"><button className="login-btn">Login</button></Link>
                )}
            </nav>

            {/* Booking Section */}
            <div className="fullhall-container">
                <h2 className="page-title">Book Entire Cinema Hall</h2>
                <p className="page-subtitle">
                    Perfect for private events, birthdays or corporate gatherings !!
                </p>
                <form className="booking-form" onSubmit={handleBooking}>
                    {/* Date */}
                    <div className="form-group">
                        <label>Select Date:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={today}
                            required
                        />
                    </div>

                    {/* Time */}
                    <div className="form-group time-range">
                        <div className="time-field">
                            <label>From:</label>
                            <select value={fromTime} onChange={(e) => setFromTime(e.target.value)} required>
                                <option value="">-- Select Hour --</option>
                                {["6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM"].map(hour => (
                                    <option key={hour} value={hour}>{hour}</option>
                                ))}
                            </select>
                        </div>
                        <div className="time-field">
                            <label>To:</label>
                            <select value={toTime} onChange={(e) => setToTime(e.target.value)} required>
                                <option value="">-- Select Hour --</option>
                                {["6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM"].map(hour => (
                                    <option key={hour} value={hour}>{hour}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Special Requests */}
                    <div className="form-group">
                        <label>Special Requests:</label>
                        <textarea
                            placeholder="Any additional requests?"
                            value={specialRequest}
                            onChange={(e) => setSpecialRequest(e.target.value)}
                        />
                    </div>

                    {/* Mobile */}
                    <div className="form-group">
                        <label>Mobile Number <span style={{ color: "red" }}>*</span></label>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value) && e.target.value.length <= 10)
                                    setMobile(e.target.value);
                            }}
                            placeholder="Enter your mobile number"
                            maxLength={10}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="book-btn"
                        disabled={!user}
                        title={!user ? "Please log in to book the hall" : ""}
                    >
                        Confirm Hall Booking
                    </button>


                </form>
            </div>

            {/* Booked Slots Table */}
            <BookedSlotsTable />

            {/* Footer */}
            <footer className="footer">
                <p>© 2025 PulseCinema. All Rights Reserved.</p>
            </footer>
        </div>
    );
}

export default FullHallBooking;
