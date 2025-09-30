import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./MovieInfo.css";
import "./headerAndfooter.css";
import bannerImg from "./images/banner.jpg";

function MovieInfo() {
    const location = useLocation();
    const { movie } = location.state || {}; 
    const [showData, setShowData] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [user, setUser] = useState(null); // track logged-in user
    const navigate = useNavigate();

    useEffect(() => {
        // Check logged-in user
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }

        if (movie?._id) {
            const fetchShowtimes = async () => {
                try {
                    const res = await axios.get(`http://localhost:5000/api/showtimes`);
                    const movieShows = res.data.filter(s => s.movieId === movie._id);
                    setShowData(movieShows);
                } catch (err) {
                    console.error("Error fetching showtimes:", err);
                }
            };
            fetchShowtimes();
        }
    }, [movie]);

    const handleBookTickets = () => {
        if (!user) {
            alert("You need to log in to book tickets!");
            navigate("/login");
            return;
        }

        if (!selectedDate || !selectedTime) return;

        navigate("/ticketBooking", { state: { movie, selectedDate, selectedTime } });
    };

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

            <div style={{ height: "100px" }}></div>

            {/* Banner / Movie Poster */}
            <div className="banner">
                {movie?.image ? (
                    <img
                        src={`http://localhost:5000/uploads/${movie.image}`}
                        alt={movie.title}
                    />
                ) : (
                    <img src={bannerImg} alt="Movie Banner" />
                )}
            </div>

            {/* Movie Info */}
            <div className="booking-container">
                <h2>{movie?.title || "Movie Details"}</h2>
                <p>{movie?.storyline}</p>

                {/* Dates */}
                <div className="dates-container">
                    {showData.length > 0 ? showData.map(show => (
                        <button
                            key={show.date}
                            className={`date-btn ${selectedDate === show.date ? "active" : ""}`}
                            onClick={() => { setSelectedDate(show.date); setSelectedTime(""); }}
                        >
                            {show.date}
                        </button>
                    )) : <p>No showtimes available.</p>}
                </div>

                {/* Times */}
                {selectedDate && (
                    <div className="showtimes-container">
                        <h3>Showtimes for {selectedDate}</h3>
                        <div className="times-list">
                            {showData.find(s => s.date === selectedDate)?.times.map(time => (
                                <button
                                    key={time}
                                    className={`time-btn ${selectedTime === time ? "active" : ""}`}
                                    onClick={() => setSelectedTime(time)}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Book Button */}
                {selectedTime && (
                    <div className="selection-summary">
                        <button className="book-btn" onClick={handleBookTickets}>
                            Book Tickets
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="footer">
                <p>© 2025 PulseCinema. All Rights Reserved.</p>
            </footer>
        </div>
    );
}

export default MovieInfo;
