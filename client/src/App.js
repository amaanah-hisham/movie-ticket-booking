import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import bannerImg from "./images/banner.jpg";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Movies from "./admin/Movies";
import MovieInfo from "./MovieInfo";
import TicketBooking from "./TicketBooking";
import ProtectedRoute from "./ProtectedRoute";
import TicketConfirmation from "./TicketConfirmation";
import PaymentPage from "./paymentPage";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Success from "./Success";
const stripePromise = loadStripe("YOUR_STRIPE_PUBLISHABLE_KEY");

function Home() {
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check logged in user
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }

    // Fetch movies from backend
    const fetchMovies = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/movies");
        setMovies(response.data);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="app-name">PulseCinema</div>
        <ul className="nav-links">
          <li>Home</li>
          <li>Movies</li>
          <li>About</li>
          <li>Contact</li>
          {user && user.email === "admin@gmail.com" && (
            <li>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            </li>
          )}
        </ul>

        {user ? (
          <button className="login-btn" onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">
            <button className="login-btn">Login</button>
          </Link>
        )}
      </nav>

      {/* Header Banner */}
      <header className="header-banner">
        <img src={bannerImg} alt="Movie Banner" />
      </header>

      {/* Now Showing Section */}
      <section className="now-showing">
        <h2>Now Showing</h2>
        <div className="movie-scroll">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div className="movie-card" key={movie._id}>
                {movie.image && (
                  <img
                    src={`http://localhost:5000/uploads/${movie.image}`}
                    alt={movie.title}
                  />
                )}
                <p>{movie.title}</p>
                <Link to="/movieInfo" state={{ movie }}>
                  <button className="more-info-btn">More Info</button>
                </Link>
              </div>
            ))
          ) : (
            <p>Loading movies...</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 MyMovieApp. All Rights Reserved.</p>
      </footer>
    </div>
  );
}


function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/movieInfo" element={<MovieInfo />} />
        <Route path="/ticketBooking" element={<TicketBooking />} />
        <Route path="/ticket-confirmation" element={<TicketConfirmation />} />
        <Route
          path="/payment"
          element={
            <Elements stripe={stripePromise}>
              <PaymentPage />
            </Elements>
          }
        />
        <Route path="/success" element={<Success />} />


      </Routes>
    </Router>
  );
}

export default AppWrapper;
