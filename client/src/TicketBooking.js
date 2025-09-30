import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./TicketBooking.css";

function TicketBooking() {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedDate, selectedTime, movie } = location.state || {};

    const rows = ["A", "B", "C", "D", "E"];
    const cols = 8;

    // Simulated unavailable seats
    const unavailableSeats = ["A3", "B5", "C2", "D7"];
    const [selectedSeats, setSelectedSeats] = useState([]);

    // User state
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

    const handleSeatClick = (seat) => {
        if (unavailableSeats.includes(seat)) return;

        if (selectedSeats.includes(seat)) {
            setSelectedSeats(selectedSeats.filter((s) => s !== seat));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const ticketPrice = movie?.ticketPrice || 0;
    const totalCost = selectedSeats.length * ticketPrice;

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/"); // go to home
    };

    return (
        <div className="ticket-booking-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="app-name">PulseCinema</div>
                <ul className="nav-links">
                    <li><Link to="/" className="nav-link">Home</Link></li>
                    <li>Movies</li>
                    <li>About</li>
                    <li>Contact</li>
                </ul>

                {/* Login / Logout button */}
                {user ? (
                    <button className="login-btn" onClick={handleLogout}>
                        Logout
                    </button>
                ) : (
                    <Link to="/login">
                        <button className="login-btn">Login</button>
                    </Link>
                )}
            </nav>

            <div className="booking-container">
                <h2>Ticket Booking</h2>
                <p>
                    Movie: <strong>{movie?.title || "N/A"}</strong> |
                    Date: <strong>{selectedDate || "Not selected"}</strong> |
                    Time: <strong>{selectedTime || "Not selected"}</strong>
                </p>

                <div className="screen">
                    <h3>SCREEN</h3>
                </div>

                <div className="seating-chart">
                    {rows.map((row) => (
                        <div className="row" key={row}>
                            <span className="row-label">{row}</span>
                            {[...Array(cols)].map((_, i) => {
                                const seatId = `${row}${i + 1}`;
                                let seatClass = "seat";
                                if (unavailableSeats.includes(seatId)) seatClass += " unavailable";
                                else if (selectedSeats.includes(seatId)) seatClass += " selected";

                                return (
                                    <div
                                        key={seatId}
                                        className={seatClass}
                                        onClick={() => handleSeatClick(seatId)}
                                        title={seatId}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="legend">
                    <div className="legend-item">
                        <span className="legend-color available"></span> Available
                    </div>
                    <div className="legend-item">
                        <span className="legend-color selected"></span> Selected
                    </div>
                    <div className="legend-item">
                        <span className="legend-color unavailable"></span> Unavailable
                    </div>
                </div>

                <div className="summary" style={{ padding: "20px", marginTop: "20px", lineHeight: "1.6" }}>
                    <p style={{ margin: "5px 0" }}>
                        <strong>Selected Seats:</strong> {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                    </p>
                    <p style={{ margin: "5px 0" }}>
                        <strong>Total Tickets:</strong> {selectedSeats.length}
                    </p>
                    <p style={{ margin: "5px 0" }}>
                        <strong>Total Cost:</strong> LKR {totalCost.toFixed(2)}
                    </p>

                    <button
                        className="book-btn"
                        disabled={selectedSeats.length === 0} // disabled if no seats
                        style={{
                            backgroundColor: selectedSeats.length === 0 ? "#ccc" : "#007bff",
                            cursor: selectedSeats.length === 0 ? "not-allowed" : "pointer",
                            color: "#fff",
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "16px",
                            marginTop: "10px"
                        }}
                        onClick={() =>
                            navigate("/ticket-confirmation", {
                                state: { movie, selectedDate, selectedTime, selectedSeats }
                            })
                        }
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TicketBooking;
