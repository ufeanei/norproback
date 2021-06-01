import express from "express";
import Company from "../models/company.js";
import User from "../models/user.js";

import checkauth from "../middlewares/checkauth.js";
const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

// new company saved
//guard against mongodb injection. clean every input for mongo injection and xss
router.post("/", urlencodedParser, checkauth, async (req, res) => {
  var company = new Company(req.body);

  company.pageAdminIds.push(req.userId);

  try {
    const com = await company.save();

    const resp = await User.updateOne(
      { _id: req.userId },
      { $push: { pageadminof: com._id } }
    );
    res.json({ message: "company created" });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get a company by id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const company = await Company.findById(id);

    res.json({ company });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get a list of companies
router.get("/", async (req, res) => {
  const id = req.params.id;
  try {
    const companies = await Company.find({});
    if (companies) {
      res.json({ companies });
    } else {
      res.json({ message: "not found" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get a company with given its id
router.get("/:id", checkauth, async (req, res) => {
  const id = req.params.id;
  try {
    const company = await Company.findById(id);
    res.json({ company });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

//edit company with id in params
router.post("/:id/edit", urlencodedParser, checkauth, async (req, res) => {
  const id = req.params.id;
  const r = req.body;

  try {
    const resp = await Company.updateOne({ _id: id }, { $set: req.body });
    res.json({ message: "company saved" });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// delete a company with id in params
router.delete("/:id", checkauth, async (req, res) => {
  const id = req.params.id;
  try {
    const resp = await Company.deleteOne({ _id: id });
    res.json({ message: "company deleted" });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// current user follows a company
router.get("/follow/:id", checkauth, async (req, res) => {
  const comId = req.params.id;
  const uId = req.userId;
  try {
    const resp = await User.updateOne(
      { _id: uId },
      { $addToSet: { companyFollowed: comId } }
    );
    if (resp.nModified) {
      const resp2 = await Company.updateOne(
        { _id: comId },
        { $inc: { followers: 1 } }
      );

      res.json({ message: "following" });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

router.get("/unfollow/:id", checkauth, async (req, res) => {
  const comId = req.params.id;
  const uId = req.userId;

  try {
    const resp = await User.updateOne(
      { _id: uId },
      { $pull: { companyFollowed: comId } }
    );
    if (resp.nModified) {
      const resp2 = await Company.updateOne(
        { _id: comId },
        { $inc: { followers: -1 } }
      );

      res.json({ message: "unfollowed" });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

router.get(
  "/admin/:newadminemail/add/:companyid",
  checkauth,
  async (req, res) => {
    try {
      const { newadminemail, companyid } = req.params;
      const user = await User.findOneAndUpdate(
        { email: newadminemail },
        { $addToSet: { pageadminof: companyid } },
        {
          useFindAndModify: false,
          select: {
            fullName: 1,
            latestJob: 1,
            latestCompany: 1,
            profilePic: 1,
          },
        }
      );

      if (user) {
        const resp = await Company.updateOne(
          { _id: companyid },
          { $addToSet: { pageAdminIds: user._id } }
        );

        res.json({ message: "added" });
      } else {
        res.json({ message: " no user" });
      }
    } catch (err) {
      console.log(err);
      res.json({ message: "server error" });
    }
  }
);

router.get(
  "/admin/:newadminemail/add/:companyid",
  checkauth,
  async (req, res) => {
    try {
      const { userId, companyid } = req.params;
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { pageadminof: companyid } },
        {
          useFindAndModify: false,
          select: {
            fullName: 1,
          },
        }
      );

      if (user) {
        const resp = await Company.updateOne(
          { _id: companyid },
          { $pull: { pageAdminIds: userId } }
        );

        res.json({ message: "removed" });
      } else {
        res.json({ message: " no user" });
      }
    } catch (err) {
      console.log(err);
      res.json({ message: "server error" });
    }
  }
);
export default router;
