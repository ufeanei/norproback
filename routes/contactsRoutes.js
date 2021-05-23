import express from "express";
import User from "../models/user.js";
import checkauth from "../middlewares/checkauth.js";

const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

////send connection request to another user
router.get("new/:id", checkauth, async (req, res) => {
  const fromId = req.userId;
  const toId = req.params.id;

  try {
    const resp = await User.updateOne(
      { _id: toId },
      { $push: { conRequests: fromId } }
    );
    let = notify = new Notification();
    notify.receiverIds.push(toId);
    notify.type = "connection request";
    notify.personalNote = message;
    notify.sender.name = current.fullName;
    notify.sender.picture = current.userimage;
    notify.save();

    res.json({ message: "connection request sent" });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// accept request
router.get("/users/:id/accept", checkauth, async (req, res) => {
  const receiverId = req.userId; // current user is receiver
  const requesterId = req.params.id; // the one who sent the request

  try {
    const resp = await User.updateOne(
      { _id: requesterid },
      { $push: { connections: currentid } }
    );

    const resp = await User.updateOne(
      { _id: recerverId },
      {
        $push: { connections: requesterId },
        $pull: { conrequests: requesterid },
      }
    );
    // notification sent to the requester telling him his request has been accepted
    let = notify = new Notification();
    notify.receiverIds.push(requesterid);
    notify.type = "connection accepted";
    notify.personalNote = "";
    notify.sender = requesterId;
    notify.save();
    res.json({ message: " contact added" });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get users contacts. should normally be a get but we used post to send contacts list in body
router.post("/users/:id", urlencodedParser, checkauth, async (req, res) => {
  const userId = req.userId;
  const contacts = req.body.contacts;
  var perPage = 9;
  var page = req.query.page || 1;
  try {
    const contacts = await User.find(
      { _id: { $in: contacts } },
      "fullName latestJob profilePic"
    )
      .skip(perPage * page - perPage)
      .limit(perPage)
      .lean();

    res.json({ contacts });
  } catch (err) {
    res.status(201).json({ message: "server error" });
  }
});

// reject a contact request. simply remove the reuestedid from current user conRequest arr
router.get("/:id", checkauth, async (req, res) => {
  const requesterId = req.params.id;

  const resp = await User.updateOne(
    { _id: req.userId },
    { $pull: { conRequests: requesterid } }
  );
  res.json({ message: "request denied" });
});

// cancel a previous contact request. just remove your id from toID's conRequest arr
router.get("/:id", checkauth, async (req, res) => {
  const toId = req.params.id;

  const resp = await User.updateOne(
    { _id: toId },
    { $pull: { conRequests: req.userId } }
  );
  res.json({ message: "request cancelled" });
});

// remove contact
router.get("/", checkauth, async (req, res) => {
  // remove his id from current user connections array
  const toBeRemoveId = req.params.id;
  const cuId = req.userId;
  const resp = await User.updateMany(
    { _id: { $in: [cuId, toBeRemoveId] } },
    { $pull: { connections: { $in: [toBeRemoveId, cuId] } } }
  );
  res.json({ message: "contact removed" });
});

// block a user
router.get("/", checkauth, async (req, res) => {
  const idtoblock = req.params.idtoblock;
  const resp = await User.updateOne(
    { _id: req.userId },
    { $push: { blockedusers: idtoblock } }
  );
  res.json({ message: "blocked" });
});

// unblock a user
router.get("/", checkauth, async (req, res) => {
  const blockedId = req.params.blockedid;
  const resp = await User.updateOne(
    { _id: req.userId },
    { $pull: { blockedusers: blockedId } }
  );
  res.json({ message: "unblocked" });
});

export default router;
