import express from "express";
import User from "../models/user.js";
import checkauth from "../middlewares/checkauth.js";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const router = express.Router();

router.get("/currentUser", checkauth, async (req, res) => {
  const userId = req.userId;
  const loggedUser = await User.findById(
    userId,
    "-password -emailConfirmed -confirmDigest"
  );

  if (loggedUser) {
    res.status(200).json({ currentUser: loggedUser });
  } else {
    res.status(200).json({ message: "user not logged in" });
  }
});
router.post("/changepassword", checkauth, async (req, res) => {
  const pw = req.body.password.trim();
  const cpw = req.body.confirmpassword.trim();
  const id = req.body.id;

  const passwordHash = await bcrypt.hash(password, 8);
  try {
    if (pw && cpw && pw === cpw) {
      const user = User.updateOne(
        { _id: id },
        { $set: { password: passwordHash } }
      );
      res.status(201).json({ message: "Ditt passord har blitt oppdatert." });
    } else {
      res.status(401).json({ message: "Passordene stemmer ikke overens" });
    }
  } catch (err) {
    res.status(401).json({ message: "Serverfeil" });
  }
});

router.post(
  "/:id/profilepic",
  urlencodedParser,
  checkauth,
  async (req, res) => {
    const id = req.userId;
    try {
      const user = await User.findById(id);

      if (user) {
        const result = await User.updateOne(
          { _id: id },
          { $set: { profilePic: req.body.pic } }
        );

        res.json({ message: "uploaded" });
      } else {
        res.json({ message: "serverfeil. prøv senere" });
      }
    } catch (err) {
      res.status(201).json({ message: "serverfeil. prøv senere" });
    }
  }
);

//inser business card details into user document
router.post(
  "/:id/businesscard",
  urlencodedParser,
  checkauth,
  async (req, res) => {
    const id = req.userId;
    const user = await User.updateOne({ _id: id }, { $set: req.body });
  }
);
export default router;
