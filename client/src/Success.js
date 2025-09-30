import React from "react";
import { useNavigate } from "react-router-dom";
import "./Success.css"; // optional, for styling

export default function Success() {
    const navigate = useNavigate();

    return (
        <div className="success-page">
            <div className="success-container">
                <h1>🎉 Payment Successful!</h1>
                <p>Thank you for your booking. Your payment has been processed successfully.</p>
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
