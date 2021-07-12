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
  const page = req.query.page;
  const pageLoaded = req.query.pageLoaded;

  try {
    if (page) {
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
    }
    const total = await Notification.find({
      recipiants: req.userId,
      isRead: false,
    })
      .countDocuments()
      .exec();
    page ? res.json({ notifications, total }) : res.json({ total });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// change status of notification to isRead=true
router.get(
  "/changestatus/:id",
  urlencodedParser,
  checkauth,
  async (req, res) => {
    try {
      const notif = await Notification.updateOne(
        { _id: req.params.id },
        {
          isRead: true,
        }
      );

      return res.json({ message: "success" });
    } catch (err) {
      return res.json({ message: "server error" });
    }
  }
);

// delete notification
router.delete(
  "/notification/:id",
  urlencodedParser,
  checkauth,
  async (req, res) => {
    try {
      const notify = await Notification.deleteOne({
        id: req.params.id,
      });

      return res.json({ message: "deleted" });
    } catch (err) {
      return res.json({ msg: "server error" });
    }
  }
);

export default router;
