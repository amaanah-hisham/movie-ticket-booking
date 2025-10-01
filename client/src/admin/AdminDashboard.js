import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const res = await axios.get("/api/admin/total-users"); 
        setTotalUsers(res.data.totalUsers); 
      } catch (err) {
        console.error("Error fetching total users:", err);
      }
    };

    fetchTotalUsers();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="cards">
        <div className="card">
          <h3>Total Users</h3>
          <p>{totalUsers}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
