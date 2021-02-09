import express from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import bodyParser from "body-parser";

import User from "../models/user.js";

const router = express.Router();

const urlencodedParser = bodyParser.urlencoded({ extended: false });

// signup new users
router.post("/create", urlencodedParser, async (req, res, next) => {
  const { email, fullName, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        message: "Din e-post finnes allrede i vart system. Logg inn",
      });

    const confirmToken = nanoid();
    const confirmDigest = await bcrypt.hash(confirmToken, 8);
    const hashedPassword =
      password.length > 0 ? await bcrypt.hash(password, 8) : "";
    console.log(hashedPassword);

    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      confirmDigest,
    });

    const results = await newUser.save();

    //here we will insert code to send email for confirmation
    res.status(200).json({ results });
  } catch (err) {
    res.status(404).json({ message: err.errors });
  }
});

// login
router.post("/login", urlencodedParser, async (req, res, next) => {});

export default router;
