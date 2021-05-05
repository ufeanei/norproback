import mongoose from "mongoose";

var commentSchema = new mongoose.Schema({
  postId: mongoose.Schema.Types.ObjectId,
  datePosted: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comAuthor: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  commentText: String,
  //clikes: Number,
  //clikedBy: [mongoose.Schema.Types.ObjectId]
});

var Comment = mongoose.model("Comment", commentSchema);
export default Comment;

// create index on postid
