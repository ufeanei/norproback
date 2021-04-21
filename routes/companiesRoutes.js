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
  console.log(company);
  company.pageadminids.push(req.userId);
  console.log(company);
  try {
    const com = await company.save();

    if (com) {
      const resp = await User.updateOne(
        { _id: req.userId },
        { $push: { pageadminof: com._id } }
      );
      res.json({ message: "company created" });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get a company by id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const company = await Company.findById(id);
    if (company) {
      res.json({ company });
    } else {
      res.json({ message: "not found" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get a company by id
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
    if (company) {
      res.json({ company });
    } else {
      res.json({ message: "not found" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

//edit company with id in params
router.post("/:id/edit", urlencodedParser, checkauth, async (req, res) => {
  const id = req.params.id;
  const r = req.body;
  try {
    const company = await Company.findOneAndUpdate(
      { _id: id },
      { $set: req.body }
    );
    if (company) {
      res.json({ message: "company saved" });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// delete a company with id in params
router.delete("/:id", checkauth, async (req, res) => {
  const id = req.params.id;
  try {
    const company = await Company.deleteOne({ _id: id });
    if (company) {
      res.json({ message: "company deleted" });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

export default router;
