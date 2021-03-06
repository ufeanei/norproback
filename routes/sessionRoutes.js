import express from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
//import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import checkauth from "../middlewares/checkauth.js";

import transporter from "../config/nodemailerTransporter.js";
import configs from "../config/env.js";
import xss from "xss"; // for sanitizing inputs

import User from "../models/user.js";
import crypto from "crypto";

const router = express.Router();
const env = process.env.NODE_ENV || "development";
const urlencodedParser = express.urlencoded({ extended: false });

// signup new users
router.post("/new", urlencodedParser, async (req, res, next) => {
  // clean inputs
  const { email, fullName, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: xss(email) });
    if (existingUser)
      return res.status(400).json({
        message: "Din e-post finnes allerede i vart system. Logg inn",
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
        '<a href="' +
        configs[env].backUrl +
        "/session/confirmEmail?email=" +
        savedUser.email +
        "&token=" +
        confirmToken +
        '">' +
        configs[env].backUrl +
        "/session/confirmEmail?email=" +
        savedUser.email +
        "&token=" +
        confirmToken +
        "</a> <br><p>MVH</p><p>Nopro</p>",
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
router.get("/logout", checkauth, (req, res) => {
  res.cookies("tk", "");
  res.status(301).redirect(configs[env].frontUrl + "/page500");
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
      res
        .status(301)
        .redirect(
          configs[env].frontUrl + "/session/confirmlogin?m=Konto bekreftet"
        );
    } else {
      res
        .status(301)
        .redirect(
          configs[env].frontUrl +
            "/session/confirmlogin?m=Bekreftelseslink er ugyldig"
        );
    }
  } else {
    res
      .status(301)
      .redirect(
        configs[env].frontUrl +
          "/session/confirmlogin?m=Denne lenken er ikke lenger gyldig"
      );
  }
});

router.post("/recoverRequest", urlencodedParser, async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    if (email) {
      const user = await User.findOne({ email });

      if (user) {
        const rt = nanoid();
        const resetDigest = crypto
          .createHash("sha256")
          .update(rt)
          .digest("hex");
        const updatedUser = await User.updateOne(
          { _id: user._id },
          { $set: { resetDigest, resetSentAt: Date.now() } }
        );

        let mailOptions = {
          from: "austinufei@gmail.com",
          to: user.email,
          subject: "Tilbakestill passord",
          html:
            "<h1>Tilbakestille passordet</h1>" +
            "<p>For å tilbakestille passordet ditt, trykk på følgende lenke:</p>" +
            '<a href="' +
            configs[env].backUrl +
            "/session/resetpassform/" +
            rt +
            '">' +
            configs[env].backUrl +
            "/session/resetpassform/" +
            rt +
            "</a> <br> <p>MVH</p><p>Nopro</p>",
        };

        transporter.sendMail(mailOptions, function (error, info) {
          console.log(info);
          if (error) {
            console.log(error);
          }
        });

        res.status(201).json({
          message:
            "En melding med instruksjoner om hvordan du tilbakestiller passordet ditt har blitt sendt til deg via e-post. Kontroller innboksen eller spam-mappen",
        });
      }
    } else {
      res.status(201).json({
        message: "You should receive an email if you are in our system",
      });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

router.get("/resetpassform/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const resetDigest = crypto
      .createHash("sha256")
      .update(req.params.id)
      .digest("hex");

    const user = await User.findOne({ resetDigest });

    if (user) {
      if ((Date.now() - user.resetSentAt.getTime()) / 1000 > 7200) {
        res
          .status(301)
          .redirect(
            configs[env].frontUrl +
              "/session/forgotpass?m=Tilbakestillingsnøkkelen er utgått. Send en ny tilbakestillingsforespørsel"
          );
      } else if (user && user.emailConfirmed) {
        res
          .status(301)
          .redirect(
            configs[env].frontUrl + "/session/resetpassform/" + req.params.id
          );
      } else if (!user.emailConfirmed) {
        res
          .status(301)
          .redirect(
            configs[env].frontUrl +
              "/session/forgotpass?m=E-post ikke bekreftet. Kontroller innboksen eller spam-mappen for bekreftelsese-post"
          );
      } else {
        res
          .status(301)
          .redirect(
            configs[env].frontUrl +
              "/session/forgotpass?m=Tilbakestillingsnøkkelen er feil. Send en ny tilbakestillingsforespørsel"
          );
      }
    } else {
      res
        .status(301)
        .redirect(
          configs[env].frontUrl +
            "session/forgotpass?m=Epostaddressen er ugyldig"
        );
    }
  } catch (err) {
    console.log(err);
    res.status(301).redirect(configs[env].page500);
  }
});

router.post("/resetpassword", urlencodedParser, async (req, res) => {
  const { password, confirmpassword, token } = req.body;

  const resetDigest = crypto.createHash("sha256").update(token).digest("hex");
  try {
    if (password && confirmpassword) {
      if (password.trim() === confirmpassword.trim()) {
        const user = await User.findOne({ resetDigest });

        if (user) {
          const updatedUser = User.updateOne(
            { _id: user._id },
            { $set: { password: bcrypt.hash(password, 8) } }
          );
          res.status(201).json({ message: "success" });
        } else {
          res.status(401).json({ message: "Ugyldig token" });
        }
      } else {
        res.status(401).json({ message: "Passordene stemmer ikke overens" });
      }
    } else {
      res.status(401).json({ message: "serverfeil" });
    }
  } catch (err) {
    res.status(401).json({ message: "serverfeil. Prøv igjen senere" });
  }
});

export default router;
