import express from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import checkauth from "../middlewares/checkauth.js";

import transporter from "../config/nodemailerTransporter.js";
import configs from "../config/env.js";
import xss from "xss"; // for sanitizing inputs

import User from "../models/user.js";

const router = express.Router();
const env = process.env.NODE_ENV || "development";
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// signup new users
router.post("/new", urlencodedParser, async (req, res, next) => {
  // clean inputs
  const { email, fullName, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: xss(email) });
    if (existingUser)
      return res.status(400).json({
        message: "Din e-post finnes allrede i vart system. Logg inn",
      });

    const confirmToken = nanoid();
    const confirmDigest = await bcrypt.hash(confirmToken, 8);
    const hashedPassword =
      password.trim().length > 0 ? await bcrypt.hash(password, 8) : "";

    const newUser = new User({
      email: xss(email),
      password: hashedPassword,
      fullName: xss(fullName),
      confirmDigest,
    });

    const savedUser = await newUser.save();
    let mailOptions = {
      from: "austinufei@gmail.com",
      to: savedUser.email,
      subject: "Bekrefte epost og aktiver kontoen din",
      html:
        "<p>Velkommen til Nopro!</p>" +
        "<p>Bekreft e-posten din ved å klikke på følgende lenke eller kopiere den til nettleseren din og trykk på ENTER</p>" +
        '<a href="http://localhost:5000/session/confirmEmail?email=' +
        savedUser.email +
        "&token=" +
        confirmToken +
        '">' +
        "https://localhost:5000/session/confirmEmail?email=" +
        savedUser.email +
        "&token=" +
        confirmToken +
        "</a> <br><p>MVH</p><p>Oilhub</p>",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      }
    });
    const mes = savedUser
      ? "Vellykket registrering. En  bekreftelsese-post har blitt sendt til din e-post adresse. Kontroller innboksen eller spam-mappen"
      : "Ugyldige legitimasjon";

    res.status(200).json({ message: mes });
  } catch (err) {
    res.status(500).json({ message: "Systemfeil, prøve senere" });
  }
});

// login
router.post("/login", urlencodedParser, async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: xss(email) });
  if (user) {
    const resp = await bcrypt.compare(password, user.password);

    if (resp) {
      let token;
      token = jwt.sign({ userId: user.id }, configs[env].tksecret);
      res.cookie("tk", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        httpOnly: true, // in production add secure: true for https transmission
      });
      user.password = "";
      res.status(201).json(user);
    } else {
      res.status(400).json({ message: "Epost eller passord er ugyldig." });
    }
  } else {
    res.status(400).json({ message: "Epost eller passord er ugyldig." });
  }
});

// logout
router.get("/any", checkauth, (req, res) => {
  res.cookies("tk", "");
  res.status(201).json({ message: "success" });
});

router.get("/confirmEmail", async (req, res) => {
  const { email, token } = req.query;
  const user = await User.findOne({ email });
  if (user && !user.emailConfirmed) {
    const check = await bcrypt.compare(token, user.confirmDigest);

    if (check) {
      const updatedUser = await User.updateOne(
        { _id: user._id },
        { $set: { emailConfirmed: true } }
      );
      let token;
      token = jwt.sign({ userId: user.id }, configs[env].tksecret);
      res.cookie("tk", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        httpOnly: true, // in production add secure: true for https transmission
      });
      res.status(301).redirect(configs[env].accConfirmRedirectUrl);
    } else {
      res
        .status(301)
        .redirect(
          configs[env].accConfirmRedirectUrl + "?m=Bekreftelseslink er ugyldig"
        );
    }
  } else {
    res
      .status(301)
      .redirect(configs[env].accConfirmRedirectUrl + "?m=E-post er bekreftet");
  }
});

export default router;
