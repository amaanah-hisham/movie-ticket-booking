// ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.email !== "admin@gmail.com") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
