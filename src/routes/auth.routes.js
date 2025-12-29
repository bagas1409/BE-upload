import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password wajib diisi" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });

    res.status(201).json({ message: "Register berhasil" });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validasi input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    // 2️⃣ Cari user
    const user = await User.findOne({ email });
    if (!user) {
      // jangan bocorkan mana yg salah
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    // 3️⃣ Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    // 4️⃣ Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 5️⃣ Response aman
    res.json({
      message: "Login berhasil",
      token,
    });
  } catch (err) {
    next(err); // lempar ke global error handler
  }
});

export default router;
