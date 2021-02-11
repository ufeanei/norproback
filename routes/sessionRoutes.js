import express from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import configs from "../config/env";
import xss from "xss"; // for sanitizing inputs

import User from "../models/user.js";

const router = express.Router();
const env = process.env.NODE_ENV || "developement";
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// signup new users
router.post("/new", urlencodedParser, async (req, res, next) => {
  // clean inputs
  const { email, fullName, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: xss(email) });
    if (existingUser)
      return res.status(400).json({
        emailErr: "Din e-post finnes allrede i vart system. Logg inn",
      });

    const confirmToken = nanoid();
    const confirmDigest = await bcrypt.hash(confirmToken, 8);
    const hashedPassword =
      password.length > 0 ? await bcrypt.hash(password, 8) : "";

    const newUser = new User({
      email: xss(email),
      password: hashedPassword,
      fullName: xss(fullName),
      confirmDigest,
    });

    const savedUser = await newUser.save();
    const mes = savedUser ? "success" : "failed";
    //here we will insert code to send email for confirmation
    res.status(200).json({ message: mes });
  } catch (err) {
    // construct errors object just like err object on the front end
    const { email, fullName, password } = err.errors;
    let errors = {};
    errors.emailErr = email;
    errors.fullNameErr = fullName;
    errors.passwordErr = password;
    res.status(404).json(errors);
  }
});

// login
router.post("/login", urlencodedParser, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: xss(email) });
    if (user && User.authenticatd(password, user.password)) {
      let token;
      token = jwt.sign(
        { userId: user.id, email: user.email },
        configs[env].tksecret,
        { expiresIn: "1hr" }
      );
      res.status(201).json({ userid: user.id, email: user.email, token });
    } else {
      res.status(400).json({ emailErr: "Epost eller passord er ugyldig." });
    }
  } catch (err) {
    res.status(400).json({ emailErr: "Epost eller password wrong" });
  }
});

export default router;
