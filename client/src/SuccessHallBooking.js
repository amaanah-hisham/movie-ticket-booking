import React from "react";
import { useNavigate } from "react-router-dom";
import "./Success.css";

export default function Success() {
    const navigate = useNavigate();

    return (
        <div className="success-page">
            <div className="success-container">
                <h1>🎉 Booking Successful!</h1>
                <p>Thank you for your booking. We will Contact you shortly.</p>
                <div className="success-actions">
                    <button
                        className="home-btn"
                        onClick={() => navigate("/")}
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
