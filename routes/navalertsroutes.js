import express from "express";
import User from "../models/user.js";
import checkauth from "../middlewares/checkauth.js";
import Notification from "../models/notification.js";

const router = express.Router();

router.get("/sums", checkauth, async (req, res) => {
  try {
    const totalNotif = await Notification.find({
      recipiants: req.userId,
      isRead: false,
    })
      .countDocuments()
      .exec();

    const authUserReq = await User.findById(req.userId, "conRequests");

    const totalReq = await User.find({
      _id: { $in: authUserReq.conRequests },
    })
      .countDocuments()
      .exec();

    res.json({ totalNotif, totalReq });
  } catch (err) {
    res.json({ message: "server error" });
  }
});
export default router;
