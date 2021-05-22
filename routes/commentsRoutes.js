import express from "express";
import checkauth from "../middlewares/checkauth.js";
const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

import Comment from "../models/comment.js";
import Post from "../models/post.js";

// get paginated comments for a post
router.get("/:postId", checkauth, async (req, res) => {
  const perPage = 4;
  const page = req.query.page || 1;
  const pId = req.params.postId; // add index for postId
  try {
    const comments = await Comment.find({ postId: pId })
      .populate("author", "fullName latestJob latestCompany profilePic")
      .sort({ datePosted: 1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const counts = await Comment.find({ postId: pId }).countDocuments().exec();
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
  const postId = req.body.postId;
  const comment = new Comment(req.body);
  try {
    const savedCom = await comment.save();
    if (savedCom) {
      const result = await Post.updateOne(
        { _id: postId },
        { $inc: { comments: 1 } }
      );
      res.json({
        savedComment: { _id: comment._id, datePosted: comment.datePosted },
      });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// update comment. we make sure only the author can do that by including his id in the uery predicate
router.post("/:id/edit", urlencodedParser, checkauth, async (req, res) => {
  const commentId = req.params.id;
  const uId = req.userId;
  const comment = req.body;

  try {
    const resp = await Comment.updateOne(
      { _id: commentId, author: uId },
      { $set: comment }
    );
    res.json({ message: "comment edited" });
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
