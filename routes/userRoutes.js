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

// insert the new password into db
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

// insert userprofile picture to db
router.post(
  "/:id/profilepic",
  urlencodedParser,
  checkauth,
  async (req, res) => {
    const id = req.userId;
    try {
      const result = await User.findOneAndUpdate(
        { _id: id },
        { $set: { profilePic: req.body.pic } }
      );

      if (user) {
        res.json({ message: "uploaded" });
      } else {
        res.json({ message: "serverfeil. prøv senere" });
      }
    } catch (err) {
      res.status(201).json({ message: "serverfeil. prøv senere" });
    }
  }
);

//insert business card details into user document
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

// get business card data for edit form
router.get("/getcard", checkauth, async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(
      userId,
      "discipline latestJob latestCompany totalExp jobStatus fylke kommune diplomaField fullName highestDiploma"
    );
    res.json({ user });
  } catch (err) {
    res.json({ message: "sever error" });
  }
});

// get a user from the db given hyis id
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);

    if (user) {
      res.status(200).json({ user });
    } else {
      res.json({ message: "user not found" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get all users from id meet the predicate condition
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ users });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// add a new experience or modify the user's experiences array
router.post("/newexp", urlencodedParser, checkauth, async (req, res) => {
  const id = req.userId;
  try {
    // if action is insert a new experience
    const result = await User.findOneAndUpdate(
      { _id: id },
      { $push: { experiences: req.body.exp } }
    );

    if (user) {
      res.json({ message: " exp added" });
    } else {
      res.json({ message: "serverfeil. prøv senere" });
    }
  } catch (err) {
    res.status(201).json({ message: "serverfeil. prøv senere" });
  }
});

//add a new education
router.post("/newedu", urlencodedParser, checkauth, async (req, res) => {
  const id = req.userId;
  try {
    const result = await User.findOneAndUpdate(
      { _id: id },
      { $push: { experiences: req.body.exp } }
    );

    if (user) {
      res.json({ message: " exp added" });
    } else {
      res.json({ message: "serverfeil. prøv senere" });
    }
  } catch (err) {
    res.status(201).json({ message: "serverfeil. prøv senere" });
  }
});

// delete an education from education array givin the id of the edu as :id
router.post("/removeedu/:id", urlencodedParser, checkauth, async (req, res) => {
  const id = req.userId;
  try {
    const user = await User.findOneAndUpdate(
      { _id: id },
      { $pull: { education: { _id: req.params.id } } }
    );

    if (user) {
      res.json({ message: " edu deleted" });
    } else {
      res.json({ message: "serverfeil. prøv senere" });
    }
  } catch (err) {
    res.status(201).json({ message: "serverfeil. prøv senere" });
  }
});

// delete an exp from education array givin the id of the edu as :id
router.post("/removeexp/:id", urlencodedParser, checkauth, async (req, res) => {
  const id = req.userId;
  try {
    const user = await User.findOneAndUpdate(
      { _id: id },
      { $pull: { experiences: { _id: req.params.id } } }
    );

    if (user) {
      res.json({ message: " exp deleted" });
    } else {
      res.json({ message: "serverfeil. prøv senere" });
    }
  } catch (err) {
    res.status(201).json({ message: "serverfeil. prøv senere" });
  }
});

export default router;
