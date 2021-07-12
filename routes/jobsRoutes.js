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
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get jobs for the company with id provided
router.get("/companies/:comid", async (req, res) => {
  const companyId = req.params.comid;
  console.log(" not real");
  try {
    const jobs = await Job.find({ company: companyId }).populate(
      "company",
      "name logo"
    );

    res.json({ jobs });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get jobs for the company with id provided
router.get("/admin/companies/:comid", async (req, res) => {
  const companyId = req.params.comid;

  const perPage = 2;
  const page = req.query.page || 1;

  try {
    const jobs = await Job.find(
      {
        company: companyId,
      },
      "title datePosted status views applicants"
    )

      .sort({ datePosted: 1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .lean()
      .exec();
    const total = await Job.find({
      company: companyId,
    }).countDocuments();

    res.json({ jobs, total });
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
  const jobid = req.params.id;
  try {
    const job = await Job.findOneAndUpdate(
      { _id: jobid },
      { $inc: { views: 1 } },
      { useFindAndModify: false, new: true }
    )
      .populate("company", "sector size logo name descr followers")
      .lean();

    res.json({ job });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

//delete  a job given its id done only by poster or company admin
router.delete("/:id/delete", checkauth, async (req, res) => {
  const jobId = req.params.id;
  const uId = req.userId;
  const admin = req.query.admin;
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
router.get("/save/:id", checkauth, async (req, res) => {
  const jobId = req.params.id;
  const userId = req.userId;

  try {
    const resp = await User.updateOne(
      { _id: userId },
      { $addToSet: { savedjobs: jobId } }
    );

    res.json({ message: "job saved" });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get all jobsby a user. paginated query
router.get("/users/:id", checkauth, async (req, res) => {
  const perPage = 5;
  const page = req.query.page || 1;

  try {
    const jobs = await Job.find(
      {
        postedBy: req.userId,
      },
      "title datePosted status views applicants"
    )

      .sort({ datePosted: 1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .lean()
      .exec();
    const total = await Job.find({
      postedBy: req.userId,
    }).countDocuments();

    res.json({ jobs, total });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get all jobs saved by a user. paginated query
router.post(
  "/saved/users/:id",
  urlencodedParser,
  checkauth,
  async (req, res) => {
    let savedJobs;
    const perPage = 5;
    const page = req.query.page || 1;

    // there is an edge case if user reloads the page making this request. this make savedjobs from auth user null
    //we must therefore find the auth user and extracts his savedjobs array and use in our request
    try {
      if (!Object.keys(req.body).length) {
        // user reloads page
        const user = await User.findById(req.userId, "savedjobs").lean();
        savedJobs = user.savedjobs;
      } else {
        savedJobs = req.body; // normal case when no refresh of requesting page
      }
      const jobs = await Job.find(
        {
          _id: { $in: savedJobs },
        },
        "title status "
      )

        .sort({ datePosted: 1 })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .lean()
        .exec();
      const total = await Job.find({
        _id: { $in: savedJobs },
      }).countDocuments();

      res.json({ jobs, total });
    } catch (err) {
      res.json({ message: "server error" });
    }
  }
);
export default router;
