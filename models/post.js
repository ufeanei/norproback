import mongoose from "mongoose";

var postSchema = new mongoose.Schema({
  postText: { type: String, trim: true },
  postPic: String,
  datePosted: { type: Date, default: Date.now },
  /*
  author: {
    name: { type: String },
    company: { type: Boolean, default: false },
    pic: String,
    followers: Number,
    id: mongoose.Schema.Types.ObjectId,
    jobtitle: String,
    latestcompany: String,
  },*/

  perAuthor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comAuthor: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  comments: { type: Number, default: 0 },
  plikes: { type: Number, default: 0 },
  plikedBy: [mongoose.Schema.Types.ObjectId],
});

var Post = mongoose.model("Post", postSchema);
export default Post;
