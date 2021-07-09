import express from "express";

//import bodyParser from "body-parser";

import checkauth from "../middlewares/checkauth.js";
import transporter from "../config/nodemailerTransporter.js";
import configs from "../config/env.js";
import xss from "xss"; // for sanitizing inputs
import User from "../models/user.js";

const router = express.Router();
const env = process.env.NODE_ENV || "development";
const urlencodedParser = express.urlencoded({ extended: false });

// signup new users
router.post("/", urlencodedParser, checkauth, async (req, res, next) => {
  // clean inputs

  const { mess, toEmail, toName, fromEmail, fromName, subject } = req.body;

  try {
    let mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: xss(subject),
      html:
        xss(mess) +
        "<p>Sendt fra " +
        '<a href="' +
        configs[env].frontUrl +
        '">' +
        "<b>Nopro</b>" +
        "</a> </p> <b>Nopro is Norway's leading  oil and gas professional network</b>",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      }
    });

    res.json({ message: "message sent" });
  } catch (err) {
    console.log(err);
    res.json({ message: "server error. try later" });
  }
});

export default router;
