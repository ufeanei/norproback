import express from "express";
import User from "../models/user.js";
import checkauth from "../middlewares/checkauth.js";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

router.get("/currentUser", checkauth, async (req, res) => {
  const userId = req.userId;
  try {
    const loggedUser = await User.findById(
      userId,
      "-password -emailConfirmed -confirmDigest"
    );

    if (loggedUser) {
      res.status(200).json({ currentUser: loggedUser });
    } else {
      res.status(200).json({ message: "user not logged in" });
    }
  } catch (err) {
    res.status(302).redirect(configs[env].page500);
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

    try {
      const user = await User.updateOne({ _id: id }, { $set: req.body });
      res.json({ message: "success" });
    } catch (err) {
      res.json({ message: "serverfeil. prøv senere" });
    }
  }
);

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  console.log(req.originalUrl);

  try {
    const user = await User.findById(id);
    console.log(user);
    if (user) {
      res.status(200).json({ user });
    } else {
      res.json({ message: "user not found" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ users });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

export default router;
