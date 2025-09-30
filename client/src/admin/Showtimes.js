import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import "./Showtimes.css";

function Showtimes() {
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [form, setForm] = useState({
    movieId: "",
    date: "",
    times: [""],
  });
  const [filter, setFilter] = useState(""); // for filtering by movie

  useEffect(() => {
    fetchMovies();
    fetchShowtimes();
  }, []);

  const fetchMovies = async () => {
    const res = await axios.get("http://localhost:5000/api/movies");
    setMovies(res.data);
  };

  const fetchShowtimes = async () => {
    const res = await axios.get("http://localhost:5000/api/showtimes");
    // Sort showtimes by date ascending
    const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
    setShowtimes(sorted);
  };

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (name === "times") {
      const newTimes = [...form.times];
      newTimes[index] = value;
      setForm({ ...form, times: newTimes });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addTimeField = () => {
    setForm({ ...form, times: [...form.times, ""] });
  };

  const removeTimeField = (index) => {
    const newTimes = form.times.filter((_, i) => i !== index);
    setForm({ ...form, times: newTimes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const timesArray = form.times.filter((t) => t);
    await axios.post("http://localhost:5000/api/showtimes", {
      movieId: form.movieId,
      date: form.date,
      times: timesArray,
    });
    setForm({ movieId: "", date: "", times: [""] });
    fetchShowtimes();
  };

  // Filter showtimes by selected movie
  const filteredShowtimes = showtimes.filter((show) =>
    filter === "" ? true : show.movieTitle === filter
  );

  return (
    <div className="showtimes-admin">
      <h2>Manage Showtimes</h2>

      {/* Showtime Form */}
      <form onSubmit={handleSubmit} className="showtime-form">
        <div className="form-group">
          <label htmlFor="movie">Movie</label>
          <select
            name="movieId"
            id="movie"
            value={form.movieId}
            onChange={handleChange}
            required
          >
            <option value="">Select Movie</option>
            {movies.map((movie) => (
              <option key={movie._id} value={movie._id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            name="date"
            id="date"
            value={form.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="form-group">
          <label>Show Times</label>
          <div className="times-container">
            {form.times.map((time, index) => (
              <div key={index} className="time-input-wrapper">
                <input
                  type="time"
                  name="times"
                  value={time}
                  onChange={(e) => handleChange(e, index)}
                  required
                />
                {form.times.length > 1 && (
                  <FaTrash
                    className="delete-icon"
                    onClick={() => removeTimeField(index)}
                    title="Remove this time"
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              className="add-time-btn"
              onClick={addTimeField}
            >
              + Add Time
            </button>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Add Showtime
        </button>
      </form>

      {/* Filter Dropdown styled like input */}
      <div className="form-group">
        <label htmlFor="filter">Filter by Movie:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="showtime-form-input"
        >
          <option value="">All Movies</option>
          {movies.map((movie) => (
            <option key={movie._id} value={movie.title}>
              {movie.title}
            </option>
          ))}
        </select>
      </div>

      {/* Showtimes Table */}
      <h2 className="showtimes-heading">Existing Showtimes</h2>
      <table className="showtimes-table">
        <thead>
          <tr>
            <th>Movie</th>
            <th>Date</th>
            <th>Times</th>
          </tr>
        </thead>
        <tbody>
          {filteredShowtimes.map((show) => (
            <tr key={show._id}>
              <td>{show.movieTitle}</td>
              <td>{show.date}</td>
              <td>{show.times.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Showtimes;
