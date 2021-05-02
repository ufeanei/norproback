import express from "express";
import User from "../models/user.js";

const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

import Post from "../models/post.js";
import Activity from "./models/activity.js";

// create a new post
router.post("/", urlencodedParser, checkauth, async (req, res) => {
  const uId = req.userId;
  let current = res.locals.currentUser;
  var post = new Post();
  post.posttext = req.body.posttext;
  post.author.name = current.fullName;
  post.author.pic = current.userimage;
  post.author.id = current._id;
  post.author.jobtitle = current.latestjob;
  post.author.latestcompany = current.latestcompany;
  const savedPost = await post.save();
  let activity = new Activity();
  activity.actor = uId;
  activity.verb = "posted";
  activity.obj = savedpost._id;
  const savedactivity = await activity.save();
});

router.post("/:id/edit", urlencodedParser, checkauth, async (req, res) => {
  const postId = req.params.id;
  const cUserId = req.userId;
  const post = req.body;
  try {
    const foundPost = await Post.findOneAndUpdate(
      { _id: postId, author: cUserId },
      { $set: post }
    );

    if (foundPost) {
      res.json({ message: "post edited" });
    } else {
      res.json({ message: "sever error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// delete a post by author
router.delete("/:id/delete", urlencodedParser, checkauth, async (req, res) => {
  const postId = req.params.id;
  try {
    const resp = await Post.deleteOne({ _id: postId, author: req.userId });
    if (resp) {
      //also delete the 'posted' activity related to this post
      const deletedActvity = Activity.deleteOne({
        "activity.actor.id": current._id,
        "activity.verb": "posted",
        "activity.obj": post._id,
      });
      res.json({ message: "post deleted" });
    } else {
      res.json({ message: "sever error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

router.get("/:id/like", urlencodedParser, checkauth, async (req, res) => {
  const pid = req.params.pid;
  const uId = req.userId;
  const actorName = req.query.actorname;
  try {
    const post = await Post.findById(pid);
    if (post.plikesBy.include(uId)) {
      const foundPost = await Post.findOneAndUpdate(
        { _id: pid },
        { plikedBy: { $pull: uId, $inc: { plikes: -1 } } },
        { new: true }
      );
      const resp = await Activity.deleteOne({
        "activity.actor.id": uId,
        "activity.verb": "liked",
        "activity.obj": post._id,
      });
      res.json({ nlike: post.plikes, message: " post unliked" });
    } else {
      const foundPost = await Post.findOneAndUpdate(
        { _id: pid },
        { plikedBy: { $push: uId }, $inc: { plikes: 1 } },
        { new: true }
      );

      let activity = new Activity();
      activity.actor.id = uId;
      activity.actor.name = actorName;
      activity.verb = "liked";
      activity.obj = post._id;
      const act = await activity.save();

      res.json({ nlike: post.plikes });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

router.get("/:id/share", checkauth, async (req, res) => {
  const postId = re.params.id;
  cUserId = req.userId;
  let activity = new Activity();
  activity.actor.id = current._id;
  activity.actor.name = current.fullName;
  activity.verb = "shared";
  activity.obj = postid;
  try {
    const savedActivity = await activity.save();
    if (savedActivity) {
      res.json({ message: "post shared" });
    } else {
      res.json({ message: "serverErr" });
    }
  } catch (err) {
    res.json({ message: "serverErr" });
  }
});
