import express from "express";
import User from "../models/user.js";
import Job from "../models/job.js";
import checkauth from "../middlewares/checkauth.js";

const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

router.post("/", urlencodedParser, checkauth, async (req, res) => {
  const job = req.body;
  job.postedBy = req.userId;
  const newJob = new Job(job);
  // add more to job before saving

  try {
    const savedJob = await newJob.save();

    console.log(savedJob);
    if (savedJob) {
      console.log("im here");
      res.json({ message: "job saved" });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    console.log(err.errors);
    res.json({ message: "server error" });
  }
});

//edit a job
router.post("/:id", urlencodedParser, checkauth, async (req, res) => {
  const id = req.params.id;
  // add more to job before saving
  try {
    const resp = await Job.updateOne({ _id, id }, { $set: req.body });
    if (resp) {
      res.json({ message: "job updated" });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

//view  a job given its id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  // add more to job before saving
  try {
    const job = await Job.findById(id)
      .populate("company", "sector size logo name descr followers")
      .lean();

    if (job) {
      res.json({ job });
    } else {
      res.json({ message: "not found" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

//delete  a job given its id
router.get("/:id/delete", checkauth, async (req, res) => {
  const id = req.params.id;
  uId = req.userId;
  // add more to job before saving
  try {
    const job = await Job.findOneAndUpdate(
      { _id: id, postedBy: uId },
      { $set: req.body }
    );
    if (resp) {
      res.json({ job });
    } else {
      res.json({ message: "not found" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({}, "title fylke kommune comName comlogo")
      .populate("company")
      .lean();
    console.log(jobs);
    if (jobs) {
      res.json({ jobs });
    } else {
      res.json({ message: "no jobs" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

export default router;
