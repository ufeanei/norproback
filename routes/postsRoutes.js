import express from "express";
import User from "../models/user.js";

const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

import Post from "../models/post.js";
import Activity from "../models/activity.js";
import checkauth from "../middlewares/checkauth.js";

// get all posts by your contacts and companies you follow
router.get("/users/:id/following", checkauth, async (req, res) => {
  const uId = req.userId;
  try {
    const user = await User.findById(
      req.userId,
      "companyFollowed contacts"
    ).lean();
    const mergedArr = [...user.contacts, ...user.companyFollowed];
    const posts = await Post.find({
      $or: [
        { perAuthor: { $in: mergedArr } },
        { comAuthor: { $in: mergedArr } },
      ],
    });

    res.json({ posts });
  } catch (err) {
    res.json({ message: "sever error" });
  }
});

// get all posts you have made
router.get("/users/:id", checkauth, async (req, res) => {
  try {
    const myposts = await Post.find({ perAuthor: req.userId })
      .populate("perAuthor", "fullName profilePic latestJob latestCompany ")
      .lean();
    res.json({ myposts });
  } catch (err) {
    res.json({ message: "sever error" });
  }
});

// create a new post
router.post("/", urlencodedParser, checkauth, async (req, res) => {
  const uId = req.userId;
  try {
    const post = new Post(req.body);
    const savedPost = await post.save();
    if (savedPost) {
      res.json({ message: "post created" });
    } else {
      res.json({ message: "sever error" });
    }
  } catch (err) {
    res.json({ message: "sever error" });
  }

  /*
  let activity = new Activity();
  activity.actor = uId;
  activity.verb = "posted";
  activity.obj = savedpost._id;
  const savedactivity = await activity.save();
  */
});

//get all posts by company with id
router.get("/company/:id", checkauth, async (req, res) => {
  const cId = req.params.id;

  try {
    const posts = await Post.find({ comAuthor: cId })
      .populate("comAuthor", "logo name followers")
      .lean();

    res.json({ posts });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// edit post
router.post("/:id/edit", urlencodedParser, checkauth, async (req, res) => {
  const postId = req.params.id;
  const cUserId = req.userId;
  const post = req.body;

  try {
    const foundPost = await Post.findOneAndUpdate(
      { _id: postId },
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
router.delete("/:id", urlencodedParser, checkauth, async (req, res) => {
  const postId = req.params.id;
  try {
    const resp = await Post.deleteOne({ _id: postId, author: req.userId });
    if (resp) {
      /*
      //also delete the 'posted' activity related to this post
      const deletedActvity = Activity.deleteOne({
        "activity.actor.id": current._id,
        "activity.verb": "posted",
        "activity.obj": post._id,
      });*/
      res.json({ message: "post deleted" });
    } else {
      res.json({ message: "sever error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

router.get("/:id/like", urlencodedParser, checkauth, async (req, res) => {
  const pid = req.params.id;
  const uId = req.userId;

  //const actorName = req.query.actorname;
  try {
    const post = await Post.findById(pid);
    if (post.plikedBy.includes(uId)) {
      const foundPost = await Post.findOneAndUpdate(
        { _id: pid },
        { $pull: { plikedBy: uId }, $inc: { plikes: -1 } },
        { new: true }
      );
      /*
      const resp = await Activity.deleteOne({
        "activity.actor.id": uId,
        "activity.verb": "liked",
        "activity.obj": post._id,
      });*/

      if (foundPost) {
        res.json({ likes: foundPost.plikes });
      } else {
      }
    } else {
      const foundPost = await Post.findOneAndUpdate(
        { _id: pid },
        { $push: { plikedBy: uId }, $inc: { plikes: 1 } },
        { new: true }
      );
      /*
      let activity = new Activity();
      activity.actor.id = uId;
      activity.actor.name = actorName;
      activity.verb = "liked";
      activity.obj = post._id;
      const act = await activity.save();
*/
      res.json({ likes: foundPost.plikes });
    }
  } catch (err) {
    console.log(err);
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

export default router;
