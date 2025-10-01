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

// Helper to decrypt coupon code
const decryptCode = (encryptedCode) => {
  const bytes = CryptoJS.AES.decrypt(encryptedCode, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// GET /api/coupons/validate/:code
router.get("/validate/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const coupons = await Coupon.find();

    // Decrypt and check if the code exists
    const found = coupons.some(c => decryptCode(c.code) === code);

    if (!found) {
      return res.status(404).json({ valid: false, message: "Invalid coupon" });
    }

    res.json({ valid: true, message: "Coupon is valid" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, message: "Server error", error: err.message });
  }
});

// Delete coupon by code (after redemption)
const deleteCouponByCode = async (code) => {
  const coupons = await Coupon.find();

  for (let c of coupons) {
    if (CryptoJS.AES.decrypt(c.code, SECRET_KEY).toString(CryptoJS.enc.Utf8) === code.toUpperCase()) {
      await Coupon.deleteOne({ _id: c._id });
      console.log(`✅ Coupon ${code} deleted successfully`);
      return true;
    }
  }

  console.log(`⚠️ Coupon ${code} not found or already redeemed`);
  return false;
};

// POST /api/coupons/redeem
router.post("/redeem", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code is required" });

    const deleted = await deleteCouponByCode(code);
    if (!deleted) return res.status(404).json({ message: "Coupon not found or already redeemed" });

    res.json({ message: `Coupon ${code} redeemed successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router; // router for Express
module.exports.deleteCouponByCode = deleteCouponByCode; // helper

