import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaTicketAlt, FaDollarSign, FaFilm } from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import "./AdminDashboard.css";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#FF9800", "#9C27B0"];

function AdminDashboard() {
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalBookings, setTotalBookings] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [averageTicketPrice, setAverageTicketPrice] = useState(0);

    const [topEarningMovies, setTopEarningMovies] = useState([]);
    const [topSellingMovies, setTopSellingMovies] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);
    const [revenuePerDay, setRevenuePerDay] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersRes = await axios.get("http://localhost:5000/api/admin/total-users");
                setTotalUsers(usersRes.data.totalUsers);

                const bookingsRes = await axios.get("http://localhost:5000/api/admin/total-bookings");
                setTotalBookings(bookingsRes.data.totalBookings);

                const revenueRes = await axios.get("http://localhost:5000/api/admin/total-revenue");
                setTotalRevenue(revenueRes.data.totalRevenue);

                const avgPriceRes = await axios.get("http://localhost:5000/api/admin/average-ticket-price");
                setAverageTicketPrice(avgPriceRes.data.averageTicketPrice);

                const topEarningRes = await axios.get("http://localhost:5000/api/admin/top-earning-movies");
                setTopEarningMovies(topEarningRes.data);

                const topSellingRes = await axios.get("http://localhost:5000/api/admin/top-selling-movies");
                setTopSellingMovies(topSellingRes.data);

                const revenueResPerMovie = await axios.get("http://localhost:5000/api/admin/revenue-per-movie");
                setPieChartData(revenueResPerMovie.data);

                const revenueResPerDay = await axios.get("http://localhost:5000/api/admin/revenue-per-day");
                setRevenuePerDay(revenueResPerDay.data);


            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="dashboard-container">
            {/* === First Row: Top Cards === */}
            <div className="cards-container">
                <div className="card">
                    <FaUsers className="card-icon" />
                    <div>
                        <h3>Total Users</h3>
                        <p>{totalUsers}</p>
                    </div>
                </div>

                <div className="card">
                    <FaTicketAlt className="card-icon" />
                    <div>
                        <h3>Total Bookings</h3>
                        <p>{totalBookings}</p>
                    </div>
                </div>

                <div className="card">
                    <FaDollarSign className="card-icon" />
                    <div>
                        <h3>Total Revenue</h3>
                        <p>
                            LKR{" "}
                            {totalRevenue.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </p>
                    </div>
                </div>

                <div className="card">
                    <FaFilm className="card-icon" />
                    <div>
                        <h3>Avg Ticket Price</h3>
                        <p>
                            LKR{" "}
                            {averageTicketPrice.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* === Second Row: Top Revenue Movies + Pie Chart === */}
            <div className="bottom-section">
                <div className="top-movies">
                    <h3>Top Revenue Generating Movies</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Movie Name</th>
                                <th>Total Seats</th>
                                <th>Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topEarningMovies.map((movie, index) => (
                                <tr key={index}>
                                    <td>{movie.movieName}</td>
                                    <td>{movie.totalSeats}</td>
                                    <td>
                                        LKR{" "}
                                        {movie.totalRevenue.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="dummy-space">
                    <h3>Revenue Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                dataKey="totalRevenue"
                                nameKey="movieName"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                label={false} // <-- disable labels on the slices
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) =>
                                    `LKR ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                                }
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>
            <div style={{ height: "40px" }}></div>


            {/* === Third Row: Top Selling Movies === */}
            <div className="bottom-section">
                <div className="top-movies">
                    <h3>Top Selling Movies (by Tickets Sold)</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Movie Name</th>
                                <th>Total Seats</th>
                                <th>Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topSellingMovies.map((movie, index) => (
                                <tr key={index}>
                                    <td>{movie.movieName}</td>
                                    <td>{movie.totalSeats}</td>
                                    <td>
                                        LKR{" "}
                                        {movie.totalRevenue.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="dummy-space">
                    <h3>Revenue Growth </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenuePerDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip
                                formatter={(value) =>
                                    `LKR ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                                }
                            />
                            <Legend />
                            <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;
