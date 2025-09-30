import React, { useState } from "react";
import { Link } from "react-router-dom"; // import Link
import "./Dashboard.css";
import Movies from "./admin/Movies";
import Showtimes from "./admin/Showtimes";


// Sub-pages
function DashboardHome() {
  return <h2>Welcome to the Admin Dashboard</h2>;
}

function Coupons() {
  return <h2>Manage Coupons</h2>;
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome />;
      case "movies":
        return <Movies />;
        case "shows":
        return <Showtimes />;
      case "coupons":
        return <Coupons />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="dashboard">
      {/* Top Navbar */}
      <nav className="dashboard-navbar">
        <div className="dashboard-logo">PulseCinema</div>
        <div className="dashboard-tabs">
          <button
            className={activeTab === "dashboard" ? "tab-link active" : "tab-link"}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activeTab === "movies" ? "tab-link active" : "tab-link"}
            onClick={() => setActiveTab("movies")}
          >
            Movies
          </button>
          <button
            className={activeTab === "shows" ? "tab-link active" : "tab-link"}
            onClick={() => setActiveTab("shows")}
          >
            Showtimes
          </button>
          <button
            className={activeTab === "coupons" ? "tab-link active" : "tab-link"}
            onClick={() => setActiveTab("coupons")}
          >
            Coupons
          </button>
        </div>

        {/* Home Link on right */}
        <div className="dashboard-home-link">
          <Link to="/" className="home-button">
            Home
          </Link>
        </div>
      </nav>

      {/* Content Area */}
      <div className="dashboard-content">{renderContent()}</div>
    </div>
  );
}

export default Dashboard;
