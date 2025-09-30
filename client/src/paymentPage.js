// import React from "react";
// import axios from "axios";

// function PaymentPage({ netTotal }) {
//   const handleCheckout = async () => {
//     const { data } = await axios.post("http://localhost:5000/api/payment/create-checkout-session", {
//       amount: netTotal * 100, // in cents
//       currency: "usd",
//     });

//     window.location.href = data.url; // Redirect to Stripe hosted checkout
//   };

//   return (
//     <div style={{ textAlign: "center", marginTop: "50px" }}>
//       <h2>Proceed to Payment</h2>
//       <button onClick={handleCheckout} className="pay-btn">
//         Pay Now
//       </button>
//     </div>
//   );
// }

// export default PaymentPage;
