const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const CryptoJS = require("crypto-js");
require("dotenv").config(); // make sure env variables are loaded
const SECRET_KEY = process.env.SECRET_KEY;

// Helper: Generate random 8-char coupon
const generateCoupon = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let coupon = "";
  for (let i = 0; i < 8; i++) {
    coupon += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return coupon;
};

// Helper: Deterministic encryption
const encryptCode = (code) => {
  // AES encrypt
  return CryptoJS.AES.encrypt(code, SECRET_KEY).toString();
};

// POST /api/coupons/add - Add custom coupon
router.post("/add", async (req, res) => {
  try {
    let code = req.body.code;
    if (!code || code.length !== 8) {
      return res.status(400).json({ message: "Coupon must be exactly 8 characters" });
    }

    const encryptedCode = encryptCode(code);

    const exists = await Coupon.findOne({ code: encryptedCode });
    if (exists) return res.status(400).json({ message: "Coupon already exists" });

    await Coupon.create({ code: encryptedCode });

    res.status(201).json({ message: "Custom coupon added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/coupons/generate - Generate random coupon
router.post("/generate", async (req, res) => {
  try {
    const code = generateCoupon();
    const encryptedCode = encryptCode(code);

    const exists = await Coupon.findOne({ code: encryptedCode });
    if (exists) return res.status(400).json({ message: "Coupon already exists" });

    await Coupon.create({ code: encryptedCode });

    res.status(201).json({ code, message: "Random coupon generated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/coupons - return total coupon count
router.get("/", async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    res.json({ totalCoupons });
  } catch (err) {
    console.error("Error fetching coupons:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
