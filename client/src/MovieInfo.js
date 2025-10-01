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
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState("");
    const [rating, setRating] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            // Convert _id to string in case it’s an object
            const userObj = JSON.parse(loggedInUser);
            userObj._id = userObj._id?.$oid || userObj._id;
            setUser(userObj);
        }

        if (movie?._id) {
            const fetchShowtimes = async () => {
                try {
                    const res = await axios.get(`http://localhost:5000/api/showtimes`);
                    const movieShows = res.data.filter(s => s.movieId === (movie._id.$oid || movie._id));
                    setShowData(movieShows);
                } catch (err) {
                    console.error("Error fetching showtimes:", err);
                }
            };
            fetchShowtimes();

            fetchReviews(); // fetch reviews from backend
        }
    }, [movie]);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reviews/${movie._id.$oid || movie._id}`);
            const formattedReviews = res.data.map(r => ({
                user: r.user || "Anonymous",
                text: r.review,
                rating: r.rating
            }));
            setReviews(formattedReviews);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        }
    };

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
        navigate("/");
    };

    const handleAddReview = async () => {
        if (!user) {
            alert("You need to log in to leave a review!");
            navigate("/login");
            return;
        }

        if (newReview.trim() === "" || rating === 0) {
            alert("Please enter review text and select a rating.");
            return;
        }

        try {
            // Correctly get user ID (localStorage uses 'id', not '_id')
            const movieId = String(movie._id);
            const userId = user._id ? String(user._id) : String(user.id);

            console.log("Sending IDs to backend:", { movieId, userId });

            const res = await axios.post("http://localhost:5000/api/reviews", {
                movieId,
                userId,
                review: newReview.trim(),
                rating
            });

            console.log("Response from backend:", res.data);

            const savedReview = {
                user: user.username,
                text: res.data.review,
                rating: res.data.rating
            };

            setReviews([...reviews, savedReview]);
            setNewReview("");
            setRating(0);

            alert("Review submitted successfully!");
        } catch (err) {
            console.error("Failed to save review:", err.response?.data || err.message);
            alert("Failed to save review: " + (err.response?.data?.message || err.message));
        }
    };



    return (
        <div className="ticket-booking-page">
            <nav className="navbar">
                <div className="app-name">PulseCinema</div>
                <ul className="nav-links">
                    <li><Link to="/" className="nav-link">Home</Link></li>
                    <li>Movies</li>
                    <li>About</li>
                    <li>Contact</li>
                </ul>

                {user ? (
                    <button className="login-btn" onClick={handleLogout}>Logout</button>
                ) : (
                    <Link to="/login"><button className="login-btn">Login</button></Link>
                )}
            </nav>

            <div style={{ height: "100px" }}></div>

            <div className="banner">
                {movie?.image ? (
                    <img src={`http://localhost:5000/uploads/${movie.image}`} alt={movie.title} />
                ) : (
                    <img src={bannerImg} alt="Movie Banner" />
                )}
            </div>

            <div className="booking-container">
                <h2>{movie?.title || "Movie Details"}</h2>
                <p>{movie?.storyline}</p>

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

                {selectedTime && (
                    <div className="selection-summary">
                        <button className="book-btn" onClick={handleBookTickets}>Book Tickets</button>
                    </div>
                )}
            </div>

            <div className="reviews-section">
                <h3 className="reviews-title">Movie Reviews</h3>

                {reviews.length > 0 && (
                    <div className="average-rating">
                        <span className="avg-stars">
                            {"⭐".repeat(Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length))}
                        </span>
                        <span className="avg-score">
                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} / 5
                        </span>
                        <span className="total-reviews">({reviews.length} reviews)</span>
                    </div>
                )}

                <div className="reviews-list">
                    {reviews.length > 0 ? (
                        reviews.map((r, idx) => (
                            <div key={idx} className="review-card">
                                <div className="review-header">
                                    <span className="review-user">{r.user}</span>
                                    <span className="review-stars">{"⭐".repeat(r.rating)}</span>
                                </div>
                                <p className="review-text">{r.text}</p>
                            </div>
                        ))
                    ) : <p className="no-reviews">No reviews yet. Be the first!</p>}
                </div>

                <div className="review-form">
                    <h4 className="form-title">Write a Review</h4>
                    <div className="rating-input">
                        {[1, 2, 3, 4, 5].map(num => (
                            <span
                                key={num}
                                className={`star ${rating >= num ? "filled" : ""}`}
                                onClick={() => setRating(num)}
                            >
                                {rating >= num ? "⭐" : "☆"}
                            </span>
                        ))}
                    </div>
                    <textarea
                        className="review-textarea"
                        placeholder="Share your thoughts about this movie..."
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                    />
                    <button className="submit-review-btn" onClick={handleAddReview}>Submit Review</button>
                </div>
            </div>

            <footer className="footer">
                <p>© 2025 PulseCinema. All Rights Reserved.</p>
            </footer>
        </div>
    );
}

export default MovieInfo;
