import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Coupons.css";

function Coupons() {
    const [totalCoupons, setTotalCoupons] = useState(0);
    const [error, setError] = useState("");
    const [customCode, setCustomCode] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");

    const fetchCouponsCount = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/coupons");
            setTotalCoupons(res.data.totalCoupons);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch coupon count");
        }
    };

    useEffect(() => {
        fetchCouponsCount();
    }, []);

    // Add custom coupon
    const handleAddCoupon = async (e) => {
        e.preventDefault();
        setError("");

        if (!customCode || customCode.length !== 8) {
            setError("Coupon must be exactly 8 characters");
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/coupons/add", { code: customCode });
            setCustomCode("");
            fetchCouponsCount();
            alert("Custom coupon added successfully!");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to add coupon");
        }
    };

    // Generate random coupon
    const handleGenerateCoupon = async () => {
        setError("");
        try {
            const res = await axios.post("http://localhost:5000/api/coupons/generate");
            setGeneratedCode(res.data.code);
            fetchCouponsCount();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to generate coupon");
        }
    };

    return (
        <div className="coupons-page">
            <h2 className="page-title">Manage Coupons</h2>

            <div className="coupons-card">
                {/* Section 1: Generate Random Coupon */}
                <div className="section">
                    <h3>Generate Random Coupon</h3>
                    <button onClick={handleGenerateCoupon}>Generate Coupon</button>
                    {generatedCode && <p className="generated-code">Generated Code: {generatedCode}</p>}
                </div>

                {/* Section 2: Add Custom Coupon */}
                <div className="section">
                    <h3>Add Custom Coupon</h3>
                    <form className="coupon-form" onSubmit={handleAddCoupon}>
                        <input
                            type="text"
                            placeholder="Enter 8-char coupon"
                            value={customCode}
                            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                            maxLength={8}
                        />
                        <button type="submit">Add Coupon</button>
                    </form>
                </div>

                {error && <p className="error">{error}</p>}

                {/* Total Coupons */}
                <div className="coupon-list">
                    <h3>Total Coupons: {totalCoupons}</h3>
                </div>
            </div>
        </div>

    );
}

export default Coupons;
