import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./TicketBooking.css";

function TicketBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log("=== TICKET BOOKING COMPONENT RENDERED ===");
  console.log("Location state:", location.state);
  
  const { selectedDate, selectedTime, movie } = location.state || {};

  // CRITICAL: Make sure we have the movie object with _id
  console.log("Extracted props:", { 
    movie: movie?.title, 
    selectedDate, 
    selectedTime,
    movieId: movie?._id,
    movieObject: movie 
  });

  const rows = ["A", "B", "C", "D", "E"];
  const cols = 8;

  const [unavailableSeats, setUnavailableSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  useEffect(() => {
    console.log("=== USE EFFECT TRIGGERED ===");
    
    if (!movie || !movie._id) {
      console.log("❌ Missing movie or movie._id");
      setError("Movie information is missing. Please go back and try again.");
      return;
    }

    if (!selectedDate || !selectedTime) {
      console.log("❌ Missing date or time");
      setError("Date or time information is missing.");
      return;
    }

    console.log("✅ All required data present:", {
      movieId: movie._id,
      movieTitle: movie.title,
      selectedDate,
      selectedTime
    });

    const fetchUnavailableSeats = async () => {
      setLoading(true);
      setError("");
      
      try {
        console.log("🔄 Starting API call...");
        
        const params = {
          movieId: movie._id, // This should be the string ID like "68dabfda9099842766d6e43a"
          date: selectedDate,
          time: selectedTime,
        };
        
        console.log("API call params:", params);
        console.log("Movie ID type:", typeof movie._id);
        console.log("Movie ID value:", movie._id);

        const res = await axios.get("http://localhost:5000/api/bookings/seats", {
          params: params,
        });
        
        console.log("✅ API Response received:");
        console.log("Response status:", res.status);
        console.log("Response data:", res.data);
        console.log("Unavailable seats count:", res.data.length);
        
        setUnavailableSeats(res.data || []);
        
      } catch (err) {
        console.error("❌ API Error:", err);
        console.error("Error response:", err.response?.data);
        setError(`Failed to load seat availability: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUnavailableSeats();
  }, [movie, selectedDate, selectedTime]);

  // Rest of your component remains the same...
  const handleSeatClick = (seat) => {
    if (unavailableSeats.includes(seat)) {
      return;
    }
    
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const getSeatClass = (seat) => {
    let seatClass = "seat";
    if (unavailableSeats.includes(seat)) seatClass += " unavailable";
    else if (selectedSeats.includes(seat)) seatClass += " selected";
    return seatClass;
  };

  const ticketPrice = movie?.ticketPrice || 0;
  const totalCost = selectedSeats.length * ticketPrice;

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  if (!movie || !selectedDate || !selectedTime) {
    return (
      <div className="ticket-booking-page">
        <div className="error-message">
          <h2>Booking Information Missing</h2>
          <p>Please go back and select a movie, date, and time first.</p>
          <Link to="/">
            <button className="book-btn">Go Home</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
  <div className="ticket-booking-page">
    {/* Navbar */}
    <nav className="navbar">
      <div className="app-name">PulseCinema</div>
      <ul className="nav-links">
        <li>
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>
        <li>Movies</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
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
        Movie: <strong>{movie.title}</strong> | Date:{" "}
        <strong>{selectedDate}</strong> | Time:{" "}
        <strong>{selectedTime}</strong>
      </p>

      {loading ? (
        <div className="loading-message">Loading seat availability...</div>
      ) : (
        <>
          <div className="screen">
            <h3>SCREEN</h3>
          </div>

          <div className="seating-chart">
            {rows.map((row) => (
              <div className="row" key={row}>
                <span className="row-label">{row}</span>
                {[...Array(cols)].map((_, i) => {
                  const seatId = `${row}${i + 1}`;
                  return (
                    <div
                      key={seatId}
                      className={getSeatClass(seatId)}
                      onClick={() => handleSeatClick(seatId)}
                      title={`Seat ${seatId}`}
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

          <div className="summary">
            <p>
              <strong>Selected Seats:</strong>{" "}
              {selectedSeats.length ? selectedSeats.join(", ") : "None"}
            </p>
            <p>
              <strong>Total Tickets:</strong> {selectedSeats.length}
            </p>
            <p>
              <strong>Total Cost:</strong> LKR {totalCost.toFixed(2)}
            </p>

            <button
              className="book-btn"
              disabled={selectedSeats.length === 0}
              onClick={() =>
                navigate("/ticket-confirmation", {
                  state: { movie, selectedDate, selectedTime, selectedSeats, totalCost },
                })
              }
            >
              Confirm Booking
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);

}

export default TicketBooking;