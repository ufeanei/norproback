import express from "express";
import checkauth from "../middlewares/checkauth.js";
const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

import User from "../models/user.js";
import Post from "../models/post.js";
import Job from "../models/job.js";

router.get("/home/:id/", checkauth, async (req, res) => {
  const userId = req.userId;
  try {
    const jobs = await Job.find({ category: discipline });
    const users = await User.find({ discipline });
    const posts = await Post.find({ category: discipline });
    res.json({ jobs, users, posts });
  } catch (e) {
    res.json({ message: "server Err" });
  }
});
