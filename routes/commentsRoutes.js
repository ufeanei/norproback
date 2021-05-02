import express from "express";
import checkauth from "../middlewares/checkauth.js";
const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

import Comment from "../models/comment.js";
import Post from "../models/post.js";


router.get('/', checkauth, (req, res)=>{
    const perPage = 4,
    page = req.query.page || 1,
    postid = req.params.pid; // add index for postId
})
exports.getcomments = function (req, res, next) {
  

  const comments = await Comment.find({ postId: postid })
    .sort({ datePosted: -1 })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, comments) {
      if (err) {
        res.send("<span class='errr'>error. can't load comments</span>");
      } else {
        Comment.find({ postId: postid })
          .countDocuments()
          .exec(function (err, counts) {
            if (err) {
              res.send("<span class='errr'>error. can't load comments</span>");
            } else {
              let pages = Math.ceil(counts / perPage);
              var payload = {};
              res.render(
                "partials/allcomments",
                { comments, page, pages },
                function (err, html) {
                  payload.comments = html;
                  payload.page = parseInt(page);
                  payload.pages = pages;
                  payload.total = counts;
                  payload.perPage = perPage;
                  res.send(payload);
                }
              );
            }
          });
      }
    });
};

exports.newcomment = function (req, res, next) {
  let current = res.locals.currentUser,
    pid = req.body.postId,
    comment = new Comment(req.body);
  comment.author.name = current.fullName;
  comment.author.picture = current.userimage;
  comment.author.id = current._id;
  comment.author.work = current.latestjob;
  comment.save(function (err, savedcomment) {
    if (err) {
      res.send(
        '<span class="errr">obs serverfeil! kommentar ikke lagret. Prøv igjen</span>'
      );
    } else {
      // create comment activity and save it
      Post.findOneAndUpdate(
        { _id: pid },
        { $inc: { comments: 1 } },
        { new: true },
        function (err2, updatepost) {
          if (err2) {
            res.send('<span class="errr">obs serverfeil! </span>');
          } else {
            let s = "p" + pid; // we need this to get a particular element with s as datapost value
            res.render("partials/commentfragment", {
              savedcomment,
              s,
              ncomments: updatepost.comments,
            });
          }
        }
      );
    }
  });
};

exports.deletecomment = function (req, res, next) {
  let commentid = req.params.cid;
  Comment.findOneAndDelete({ _id: commentid }, function (err, deletedcomment) {
    if (err || !deletedcomment) {
      res.send('<span class="errr">Obs serverfeil!</span>');
    } else {
      Post.findOneAndUpdate(
        { _id: deletedcomment.postId },
        { $inc: { comments: -1 } },
        { new: true },
        function (err2, post) {
          // returns the updated doc when new is true
          if (err2) {
            res.send('<span class="errr">obs serverfeil! </span>');
          } else {
            console.log(post.comments);
            res.json({ mes: "deleted", ncom: post.comments, pid: post._id });
          }
        }
      );
    }
  });
};
export default router