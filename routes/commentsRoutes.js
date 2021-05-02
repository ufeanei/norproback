import express from "express";
import checkauth from "../middlewares/checkauth.js";
const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

import Comment from "../models/comment.js";
import Post from "../models/post.js";

router.get("/", checkauth, async (req, res) => {
  const perPage = 4;
  const page = req.query.page || 1;
  const postid = req.params.pid; // add index for postId
  try {
    const comments = await Comment.find({ postId: postid })
      .sort({ datePosted: -1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const counts = await Comment.find({ postId: postid })
      .countDocuments()
      .exec();
    const pages = Math.ceil(counts / perPage);
    res.json({
      comments: comments,
      page: parseInt(page),
      pages: pages,
      total: counts,
      perPage: perPage,
    });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

router.post("/", urlencodedParser, checkauth, async (req, res) => {
  const comment = new Comment(req.body);
  try {
    const savedCom = await comment.save();
    if (savedCom) {
      const post = await Post.findOneAndUpdate(
        { _id: pid },
        { $inc: { comments: 1 } },
        { new: true }
      );
      res.json({ message: "message saved" });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

router.delete("/:id/delete", checkauth, async (req, res) => {
  let commentid = req.params.cid;
  try {
    const deletedCom = await Comment.findOneAndDelete({ _id: commentid });
    if (deleteCom) {
      const updatePost = await Post.findOneAndUpdate(
        { _id: deletedCom.postId },
        { $inc: { comments: -1 } },
        { new: true }
      );

      res.json({ message: "comment deleted" });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

export default router;
