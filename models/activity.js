var mongoose = require("mongoose");

// on NorgePro, activities are only generated when a user posts, comments a posts, like, loves or share a post
//activities are not generated if someone liked a comment or reply a comment. we intend to give just a simple recency based newsfeed with no ranking

var activitySchema = new mongoose.Schema({
  actor: {
    // who did the action
    id: mongoose.Schema.Types.ObjectId,
    name: String,
  },
  verb: String, // did he liked commented, post, shared, loved
  obj: { type: mongoose.Schema.Types.ObjectId }, // on what data did the action happen. populate this during query
  recency: { type: Date, default: Date.now },
});

//to prevent a post activity appearing more than once if say two users like it, or two users shared it,
// we must aggregate activities on verb during the fan out read algorithm

//this design allows for edit and delete of posts. edit and delete of comments, unfollow and unfriend

var Activity = mongoose.model("Activity", activitySchema);
export default Activity;
