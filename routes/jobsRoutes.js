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
    if (savedJob) {
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
router.post("/:id/edit", urlencodedParser, checkauth, async (req, res) => {
  const id = req.params.id;
  // remove the applicants property before saving elsean error is triggered
  const job = req.body;
  delete job.applicants;
  try {
    const resp = await Job.updateOne({ _id: id }, { $set: job });
    if (resp) {
      res.json({ message: "job updated" });
    } else {
      console.log("hmmm");
      res.json({ message: "server error" });
    }
  } catch (err) {
    console.log(err);
    res.json({ message: "server error" });
  }
});

// get jobs for the company with id provided
router.get("/companies/:comid", async (req, res) => {
  const companyId = req.params.comid;
  console.log("im here");
  try {
    const jobs = await Job.find({ company: companyId }).populate(
      "company",
      "name logo"
    );
    console.log(jobs);
    res.json({ jobs });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

router.get("/:discipline/home", checkauth, async (req, res) => {
  const discipline = req.params.discipline;
  try {
    const jobs = await Job.find({}, "title fylke kommune comName comlogo")
      .populate("company", "name logo")
      .limit(5)
      .lean();

    if (jobs) {
      res.json({ jobs });
    } else {
      res.json({ message: "not found" });
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

//delete  a job given its id done only by poster or company admin
router.delete("/:id/delete", checkauth, async (req, res) => {
  const jobId = req.params.id;
  uId = req.userId;

  try {
    const resp = await Job.deleteOne({ _id: jobId, postedBy: uId });
    if (resp) {
      res.json({ message: "deleted job" });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get all jobs for index page
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({}, "title fylke kommune comName comlogo")
      .populate("company")
      .lean();
    if (jobs) {
      res.json({ jobs });
    } else {
      res.json({ message: "no jobs" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// user saves a job for future consideration
router.get("/:id/save", checkauth, async (req, res) => {
  const jobId = req.params.id;
  const userId = req.userId;
  try {
    const resp = await User.updateOne(
      { _id: userId },
      { $push: { savedjobs: jobId } }
    );

    res.json({ message: "job saved" });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get find jobs for company given company id

export default router;
