import express from "express";
import mongoose from "mongoose";
import Notification from "../models/notification.js";

import checkauth from "../middlewares/checkauth.js";
import Job from "../models/job.js";
const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

// new notification
router.post("/", urlencodedParser, checkauth, async (req, res) => {
  const notif = req.body;

  const newNotif = new Notification(notif);
  // add more to job before saving

  try {
    const savedNotif = await newNotif.save();

    res.json({ message: "notif saved" });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get all unread notification paginated query
router.get("/", urlencodedParser, checkauth, async (req, res) => {
  const perPage = 10;
  const page = req.query.page || 1;

  try {
    const notifications = await Notification.find({
      recipiants: req.userId,
      isRead: false,
    })
      .populate("sender", "fullName profilePic")
      .populate("comSender", "name logo")
      .sort({ createdAt: 1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const total = await Notification.find({
      recipiants: req.userId,
      isRead: false,
    })
      .countDocuments()
      .exec();
    res.json({ notifications, total });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// change status of notification to isRead=true
router.get(
  "/changestatus/:id",
  urlencodedParser,
  checkauth,
  async (req, res) => {}
);

// delete notification
router.delete(
  "/notification/:id",
  urlencodedParser,
  checkauth,
  async (req, res) => {}
);

export default router;
