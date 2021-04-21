var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
  postId: mongoose.Schema.Types.ObjectId,
  //parentId: mongoose.Schema.Types.ObjectId,
  datePosted: { type: Date, default: Date.now },
  author: {
    name: String,
    picture: String,
    id: mongoose.Schema.Types.ObjectId,
    work: String,
  },
  commentText: String,
  //clikes: Number,
  //clikedBy: [mongoose.Schema.Types.ObjectId]
});

var Comment = mongoose.model("Comment", commentSchema);
export default Comment;

// create index on postid
