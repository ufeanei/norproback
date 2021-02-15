import express from "express";
import User from "../models/user.js";
import checkauth from "../middlewares/checkauth.js";
const router = express.Router();

router.get("/currentUser", checkauth, async (req, res) => {
  const userId = req.userId;
  const loggedUser = await User.findById(
    userId,
    "-password, -emailConfirmed -confirmDigest"
  );

  if (loggedUser) {
    res.status(200).json({ currentUser: loggedUser });
  } else {
    res.status(200).json({ message: "user not logged in" });
  }
});

export default router;
