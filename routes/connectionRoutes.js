import express from "express";
import User from "../models/user.js";
import checkauth from "../middlewares/checkauth.js";
import Notification from "../models/notification.js";

const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

////send connection request to another user
router.get("/new/:id", checkauth, async (req, res) => {
  const fromId = req.userId; // current user is sending the request
  const toId = req.params.id;
  const fromName = req.query.fromName;

  try {
    if (fromId === toId) {
      // prevent authuser sending request to himself
      res.json({ message: "server error" });
    } else {
      const resp = await User.updateOne(
        { _id: toId },
        { $push: { conRequests: fromId } }
      );
      const resp2 = await User.updateOne(
        { _id: fromId },
        { $push: { conRequestsSent: toId } }
      );
      // sent note to the one receiviong the request
      let notify = new Notification();
      notify.receiverIds = [toId];
      notify.type = "connection request";
      notify.personalNote = `You received a contact request from ${fromName}`;
      notify.sender = fromId;
      notify.url = `/contacts/requests`;
      notify.save();
      res.json({ message: "connection request sent" });
    }
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
      { _id: requesterId },
      {
        $push: { connections: receiverId },
        $pull: { conRequestsSent: receiverId },
      }
    );

    const authUser = await User.findOneAndUpdate(
      { _id: receiverId },
      {
        $push: { connections: requesterId },
        $pull: { conRequests: requesterid },
      },
      {
        useFindAndModify: false,
        select: {
          fullName: 1,
        },
      }
    );
    // notification sent to the requester telling him his request has been accepted
    let notify = new Notification();
    notify.receiverIds = [requesterId];
    notify.type = "connection accepted";
    notify.personalNote = `${authUser.fullName} has accepted your contact request`;
    notify.sender = fromId;
    notify.url = `/users/${fromId} `;
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

// reject a contact request. simply remove the requesting id from current user conRequest arr
router.get("/:id", checkauth, async (req, res) => {
  const requesterId = req.params.id;

  const resp = await User.updateOne(
    { _id: req.userId },
    { $pull: { conRequests: requesterid } }
  );

  const resp2 = await User.updateOne(
    { _id: requesterId },
    { $pull: { conRequestsSent: req.userId } }
  );
  res.json({ message: "request denied" });
});

// get all contact requests made to authuser
router.get("/requests", checkauth, async (req, res) => {
  const perPage = 2;
  const page = req.query.page || 1;
  try {
    const contacts = await User.findById(req.userId, "conrequest")
      .populate("conrequest", "fullname profilePic latestJob latestCompany")
      .sort({ fullName: 1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .lean()
      .exec();

    res.json({ contacts });
  } catch (err) {
    res.json({ message: "server error" });
  }
});
// get all contact requests sent by authuser
router.get("/requestsent", checkauth, async (req, res) => {
  const perPage = 2;
  const page = req.query.page || 1;
  try {
    const reqSent = await User.findById(req.userId, "conRequestsSent")
      .populate(
        "conRequestsSent",
        "fullname profilePic latestJob latestCompany"
      )
      .sort({ fullName: 1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .lean()
      .exec();

    res.json({ reqSent });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// cancel a previous contact request. just remove your id from toID's conRequest arr
router.get("/cancelrequest/:id", checkauth, async (req, res) => {
  const toId = req.params.id;

  const resp = await User.updateOne(
    { _id: toId },
    { $pull: { conRequests: req.userId } }
  );
  const resp2 = await User.updateOne(
    { _id: req.userId },
    { $pull: { conRequestsSent: req.userId } }
  );

  res.json({ message: "request cancelled" });
});

// remove contact
router.get("/deletecontact/:id", checkauth, async (req, res) => {
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
router.get("/block/:id", checkauth, async (req, res) => {
  const idtoblock = req.params.idtoblock;
  const resp = await User.updateOne(
    { _id: req.userId },
    { $push: { blockedusers: idtoblock } }
  );
  res.json({ message: "blocked" });
});

// unblock a user
router.get("/unblock/:id", checkauth, async (req, res) => {
  const blockedId = req.params.blockedid;
  const resp = await User.updateOne(
    { _id: req.userId },
    { $pull: { blockedusers: blockedId } }
  );
  res.json({ message: "unblocked" });
});

export default router;
