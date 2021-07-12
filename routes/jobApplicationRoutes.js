import express from "express";
import mongoose from "mongoose";
import JobApplication from "../models/jobapplication.js";
import checkauth from "../middlewares/checkauth.js";
import Job from "../models/job.js";
const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

// get applications for a job. make sure only the job poster can do this
//by including his id as part of search predicate
router.get("/privatejob/:jobId", checkauth, async (req, res) => {
  const jobId = req.params.jobId;
  const userId = req.userId;

  try {
    const applications = await JobApplication.find({
      job: jobId,
      jobPostedBy: userId,
    })
      .populate(
        "applicant",
        "profilPic totalExp  highestDiploma name latestJob fylke kommune"
      )
      .lean();

    res.json({ applications });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get applications for a job linked to a company. only company admins can do this
router.get("/job/:jobId", checkauth, async (req, res) => {
  const jobId = req.params.jobId;
  const userId = req.userId;
  const perPage = 1;
  const page = req.query.page || 1;

  let status;

  switch (req.query.status) {
    case "all":
      status = { $in: ["Under Review", "Shortlisted", "Invited"] };
      break;
    case "shortlisted":
      status = "Shortlisted";
      break;
    case "invited":
      status = "Invited";
      break;
    default:
      status = { $in: ["Under Review", "Shortlisted", "Invited"] };
  }
  try {
    const applications = await JobApplication.find(
      {
        job: jobId,
        status: status,
      },
      "-cv"
    )
      .populate(
        "applicant",
        "fullName profilePic totalExp  highestDiploma name latestJob fylke kommune"
      )
      .populate("jobCom", "pageAdminIds")
      .sort({ "applicant.totalExp": -1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    let facets;
    if (req.query.pageload) {
      // aggregate only when applicant manager page loads first time or is refreshed
      // lookup stage is to get jobtitle when page loads or refreshes
      facets = await JobApplication.aggregate([
        { $match: { job: mongoose.Types.ObjectId(jobId) } }, // manual type casting in aggregation
        {
          $lookup: {
            from: "jobs",
            pipeline: [
              { $match: { _id: mongoose.Types.ObjectId(jobId) } }, // manual type casting in aggregation
              { $project: { title: 1 } },
            ],
            as: "job",
          },
        },

        {
          $group: {
            _id: "$status",
            total: { $sum: 1 },
            job: { $first: "$job" },
          },
        },
      ]);
    }

    // make sure auth user is admin to company that posted the job
    if (req.query.pageload) {
      if (
        applications.length &&
        applications[0].jobCom.pageAdminIds.includes(userId)
      ) {
        res.json({ applications, facets });
      } else if (
        applications.length &&
        !applications[0].jobCom.pageAdminIds.includes(userId)
      ) {
        res.json({ message: "server error" });
      } else {
        res.json({ applications, facets }); // send empty applications and facets
      }
    } else {
      if (
        applications.length &&
        applications[0].jobCom.pageAdminIds.includes(userId)
      ) {
        res.json({ applications });
      } else if (
        applications.length &&
        !applications[0].jobCom.pageAdminIds.includes(userId)
      ) {
        res.json({ message: "server error" });
      } else {
        res.json({ applications }); // send empty applications and facets
      }
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// save new application
router.post("/", urlencodedParser, checkauth, async (req, res) => {
  const appli = req.body;
  const jobId = req.body.job;

  // check whether the user has not previously applied to this job
  try {
    const app = await JobApplication.findOne({
      job: jobId,
      applicant: req.userId,
    });
    if (app) {
      res.json({ message: "Already applied" });
    } else {
      const appOb = new JobApplication(appli);
      const savedApp = await appOb.save();
      // optionally you can remove await and let it run in the background
      const resp = await Job.updateOne(
        { _id: jobId },
        { $inc: { applicants: 1 } }
      );
      res.json({ message: "new jobapp saved" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// change status. only jobowner can do this
router.post(
  "/:id/changestatus",
  urlencodedParser,
  checkauth,
  async (req, res) => {
    const appId = req.body.id;
    const status = req.body.status;

    try {
      const appOb = await JobApplication.updateOne(
        { _id: appId },
        { $set: { status: status } }
      );
      if (appOb) {
        res.json({ message: status });
      } else {
        res.json({ message: "server error" });
      }
    } catch (err) {
      res.json({ message: "server error" });
    }
  }
);

// delete application. This can only be done by applicants
router.delete("/:id", checkauth, async (req, res) => {
  // need to pass in too the id of the job

  const jobId = req.query.jobId;
  const appId = req.params.id;
  try {
    const resp = JobApplication.deleteOne({
      _id: appId,
      applicant: req.userId,
    });

    const resp2 = await Job.updateOne(
      { _id: jobId },
      { $inc: { applicants: -1 } }
    );

    res.json({ message: "application deleted" });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get all applications by a user. paginated query
router.get("/users/:id", checkauth, async (req, res) => {
  const perPage = 3;
  const page = req.query.page || 1;

  try {
    const applications = await JobApplication.find(
      {
        applicant: req.userId,
      },
      "-cv"
    )
      .populate("job", "title status")
      .sort({ createdAt: 1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const total = await JobApplication.find({
      applicant: req.userId,
    }).countDocuments();

    res.json({ applications, total });
  } catch (err) {
    res.json({ message: "server error" });
  }
});

router.get("/cv/:id", checkauth, async (req, res) => {
  const applicantid = req.params.id;

  try {
    const application = await JobApplication.findById(applicantid, "cv");

    res.json({ cv: application.cv });
  } catch (err) {
    res.json({ message: "server error" });
  }
});
export default router;
