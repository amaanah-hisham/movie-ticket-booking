import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Movies.css";

function Movies() {
    const [movies, setMovies] = useState([]);
    const [form, setForm] = useState({
        title: "",
        storyline: "",
        ticketPrice: "",
        image: null, 
    });
    const [editingId, setEditingId] = useState(null);

    // Fetch movies
    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        const res = await axios.get("http://localhost:5000/api/movies");
        setMovies(res.data);
    };

    // Handle form input
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            setForm({ ...form, image: files[0] }); // store file
        } else if (name === "ticketPrice") {
            // Allow only digits
            const numericValue = value.replace(/\D/g, ""); // remove non-digits
            setForm({ ...form, [name]: numericValue });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    // Create or Update movie
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.image) {
            alert("Please select a movie image.");
            return;
        }

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("storyline", form.storyline);
        formData.append("ticketPrice", form.ticketPrice);
        formData.append("image", form.image); // safe now

        try {
            if (editingId) {
                await axios.put(
                    `http://localhost:5000/api/movies/${editingId}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
            } else {
                await axios.post("http://localhost:5000/api/movies", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            setForm({ title: "", storyline: "", ticketPrice: "", image: null });
            setEditingId(null);
            fetchMovies();
        } catch (err) {
            console.error(err);
            alert("Server error while saving movie.");
        }
    };


    // Edit movie
    const handleEdit = (movie) => {
        setForm({
            title: movie.title,
            storyline: movie.storyline,
            ticketPrice: movie.ticketPrice,
            image: null, // leave null, user can re-upload if needed
        });
        setEditingId(movie._id);
    };

    // Delete movie
    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:5000/api/movies/${id}`);
        fetchMovies();
    };

    return (
        <div className="movies-admin">
            <h2>Manage Movies</h2>

            {/* Movie Form */}
            <form onSubmit={handleSubmit} className="movie-form">
                <div className="form-group">
                    <label htmlFor="title">Movie Title</label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        placeholder="Enter movie title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="storyline">Storyline</label>
                    <textarea
                        name="storyline"
                        id="storyline"
                        placeholder="Enter movie storyline"
                        value={form.storyline}
                        onChange={handleChange}
                        required
                        rows="4"
                    />
                </div>

                <div className="form-group price-group">
                    <label htmlFor="ticketPrice">Ticket Price</label>
                    <div className="price-input-wrapper">
                        <span className="currency">LKR</span>
                        <input
                            type="text"
                            name="ticketPrice"
                            id="ticketPrice"
                            placeholder="0"
                            value={form.ticketPrice}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="image">Movie Image</label>
                    <input
                        type="file"
                        name="image"
                        id="image"
                        accept="image/*"
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="submit-btn">
                    {editingId ? "Update" : "Add"} Movie
                </button>
            </form>


            <div style={{ height: "100px" }}></div>


            {/* Movie List */}

            <h2 className="movies-heading">Movies</h2>
            <div className="movie-list-horizontal" style={{ marginTop: "40px" }}>
                {movies.map((movie) => (
                    <div key={movie._id} className="movie-card">
                        {movie.image && (
                            <img
                                src={
                                    typeof movie.image === "string"
                                        ? `http://localhost:5000/uploads/${movie.image}`
                                        : URL.createObjectURL(movie.image)
                                }
                                alt={movie.title}
                            />
                        )}
                        <h3>{movie.title}</h3>
                        {/* <p>{movie.storyline}</p> */}
                        <p>Price: LKR {movie.ticketPrice}</p>
                        {/* Removed Edit button */}
                        <button onClick={() => handleDelete(movie._id)}>Delete</button>
                    </div>
                ))}
            </div>


        </div>
    );
}

export default Movies;
