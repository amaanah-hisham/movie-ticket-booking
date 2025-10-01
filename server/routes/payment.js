const express = require("express");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");
const Coupon = require("../models/Coupon");
const { deleteCouponByCode } = require("./couponRoutes");
const router = express.Router();

// Webhook handler
async function webhookHandler(req, res) {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Webhook received:", event.type);

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        //const { userId, movieId, selectedDate, selectedTime, selectedSeats, timestamp, mobile } = session.metadata;
        const { userId, movieId, selectedDate, selectedTime, selectedSeats, timestamp, mobile, couponCode } = session.metadata;

        try {
            await Booking.create({
                userId,
                movieId,
                selectedDate,
                selectedTime,
                selectedSeats: selectedSeats ? selectedSeats.split(",") : [],
                totalAmount: session.amount_total / 100,
                paymentStatus: "paid",
                mobile: session.metadata.mobile,
                stripePaymentIntentId: session.payment_intent,
                createdAt: timestamp ? new Date(timestamp) : Date.now(),
            });

            // Delete coupon after successful payment
            if (couponCode) {
                const deleted = await deleteCouponByCode(couponCode);
                if (deleted) {
                    console.log(`✅ Coupon ${couponCode} redeemed and removed from DB`);
                } else {
                    console.log(`⚠️ Coupon ${couponCode} not found or already redeemed`);
                }
            }


            console.log("🎉 Booking saved successfully!");

            // Delete coupon after successful payment
            if (couponCode) {
                await deleteCouponByCode(couponCode);
            }
        } catch (err) {
            console.error("❌ Error saving booking:", err);
        }
    }


    res.json({ received: true });
}


// Checkout session route
router.post("/create-checkout-session", async (req, res) => {
    const { netTotal, userId, movieId, selectedDate, selectedTime, selectedSeats, mobile } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "lkr",
                        product_data: { name: "Movie Ticket" },
                        unit_amount: Math.round(netTotal * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
            metadata: {
                userId,
                movieId,
                selectedDate,
                selectedTime,
                selectedSeats: selectedSeats ? selectedSeats.join(",") : "",
                mobile,
                couponCode: req.body.couponCode || "", 
                timestamp: new Date().toISOString(),
            },


        });

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Payment initialization failed" });
    }
});

module.exports = router;
module.exports.webhookHandler = webhookHandler;

