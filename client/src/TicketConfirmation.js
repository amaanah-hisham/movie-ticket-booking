import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./TicketConfirmation.css";
import "./headerAndfooter.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import CryptoJS from "crypto-js";


const stripePromise = loadStripe("YOUR_STRIPE_PUBLISHABLE_KEY"); // replace with your Stripe publishable key

function CheckoutForm({ netTotal }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        // Create payment intent on backend
        axios.post("http://localhost:5000/api/payment/create-payment-intent", {
            amount: Math.round(netTotal * 100), // Stripe amount in cents
            currency: "lkr",
        })
            .then(res => setClientSecret(res.data.clientSecret))
            .catch(err => console.error(err));
    }, [netTotal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        const card = elements.getElement(CardElement);
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card }
        });

        if (error) {
            alert(error.message);
        } else if (paymentIntent.status === "succeeded") {
            alert("Payment successful!");
            navigate("/"); // Redirect to home or booking history
        }

    };

    return (
        <form onSubmit={handleSubmit} className="stripe-form">
            <h3>Total Payment: LKR {netTotal.toFixed(2)}</h3>
            <CardElement className="card-element" />
            <button type="submit" className="pay-btn" disabled={!stripe}>Pay Now</button>
        </form>
    );
}

function TicketConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { movie, selectedDate, selectedTime, selectedSeats } = location.state || {};

    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

    const ticketPrice = movie?.ticketPrice || 0;
    const total = selectedSeats.length * ticketPrice;

    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const netTotal = total - discount;
    const [mobile, setMobile] = useState("");


    const handlePayNow = async () => {
        if (!mobile) {
            alert("Mobile number is mandatory");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/api/payment/create-checkout-session", {
                netTotal,
                userId: user?.id,
                movieId: movie._id,
                selectedDate,
                selectedTime,
                selectedSeats,
                mobile,
                couponCode: coupon || "",
            });

            window.location.href = res.data.url; // redirect to Stripe hosted checkout
            if (coupon) {
                await axios.post("http://localhost:5000/api/coupons/redeem", { code: coupon });
                console.log(`Coupon ${coupon} deleted successfully after redemption`);
            }
        } catch (err) {
            console.error("Stripe session error:", err.response?.data || err.message);
            alert("Payment initialization failed");
        }
    };

    const handleApplyCoupon = async () => {
        if (!coupon) {
            alert("Please enter a coupon code.");
            return;
        }

        try {
            const res = await axios.get(`http://localhost:5000/api/coupons/validate/${coupon}`);
            if (res.data.valid) {
                // Calculate 10% discount capped at 1000
                const discountAmount = Math.min(total * 0.1, 1000);
                setDiscount(discountAmount);
                alert(`Coupon applied! You got LKR ${discountAmount.toFixed(2)} discount.`);
            } else {
                setDiscount(0);
                setCoupon("");  // ✅ clear invalid coupon from input field
                alert("Invalid coupon.");
            }
        } catch (err) {
            console.error(err);
            setDiscount(0);
            setCoupon("");  // ✅ also clear on server error
            alert(err.response?.data?.message || "Failed to validate coupon");
        }
    };


    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/"); // Redirect to home after logout
    };

    return (
        <div className="ticket-confirmation-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="app-name">PulseCinema</div>
                <ul className="nav-links">
                    <li><Link to="/" className="nav-link">Home</Link></li>
                    <li>Movies</li>
                    <li>About</li>
                    <li>Contact</li>
                </ul>

                {/* Login / Logout */}
                {user ? (
                    <button className="login-btn" onClick={handleLogout}>Logout</button>
                ) : (
                    <Link to="/login">
                        <button className="login-btn">Login</button>
                    </Link>
                )}
            </nav>

            <div className="confirmation-container">
                <h2>Booking Confirmation</h2>

                {/* Booking Details */}
                <div className="ticket-info">
                    <h3>Booking Details</h3>
                    <div className="info-row">
                        <span className="label">Movie:</span>
                        <span className="value">{movie?.title || "N/A"}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Date:</span>
                        <span className="value">{selectedDate || "N/A"}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Showtime:</span>
                        <span className="value">{selectedTime || "N/A"}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Seats:</span>
                        <span className="value">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Email:</span>
                        <span className="value">{user?.email || "Guest"}</span>
                    </div>
                </div>

                {/* Coupon Section */}
                <div className="coupon-section">
                    <label htmlFor="coupon">Coupon Code</label>
                    <input
                        type="text"
                        id="coupon"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Enter coupon code"
                    />
                    <button onClick={handleApplyCoupon} className="apply-coupon-btn">Apply</button>
                </div>


                {/* Purchase Summary */}
                <div className="purchase-summary">
                    <h3>Purchase Summary</h3>
                    <div className="summary-row">
                        <span>Total:</span>
                        <span>LKR {total.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Discount:</span>
                        <span>LKR {discount.toFixed(2)}</span>
                    </div>
                    <div className="summary-row net-total">
                        <span>Net Total:</span>
                        <span>LKR {netTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Mobile Number */}
                <div className="mobile-input">
                    <label htmlFor="mobile">
                        Mobile Number <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                        type="tel"
                        id="mobile"
                        value={mobile}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) setMobile(value); // only digits
                        }}
                        placeholder="Enter your mobile number"
                        required
                    />
                </div>

                {/* Pay Now Button */}
                <button className="pay-btn" onClick={handlePayNow}>
                    Pay Now
                </button>
            </div>

            <footer className="footer">
                <p>© 2025 PulseCinema. All Rights Reserved.</p>
            </footer>
        </div>
    );
}

export default TicketConfirmation;
