import express from "express";
import JobApplication from "../models/jobapplication.js";
import checkauth from "../middlewares/checkauth.js";

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
router.get("/company/:jobId", checkauth, async (req, res) => {
  const jobId = req.params.jobId;
  const userId = req.userId;

  try {
    const applications = await JobApplication.find({
      job: jobId,
    })
      .populate(
        "applicant",
        "profilPic totalExp  highestDiploma name latestJob fylke kommune"
      )
      .populate("jobCom", "pageAdminIds")
      .lean();
    if (applications) {
      if (userId in applications[0].jobCom.pageAdminIds) {
        res.json({ applications });
      } else {
        res.json({ message: "server error" });
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
      if (savedApp) {
        res.json({ message: "new jobapp saved" });
      } else {
        res.json({ message: "server error" });
      }
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// change status. only jobowner can do this
router.post("/:id/status", urlencodedParser, checkauth, async (re, res) => {
  const appId = req.body.id;
  const status = req.body.status;
  try {
    const appOb = JobApplication.updateOne(
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
});

// delete application. This can only be done by applicants
router.delete("/:id", checkauth, async (re, res) => {
  const appId = req.params.id;
  try {
    const resp = JobApplication.deleteOne({
      _id: appId,
      applicant: req.userId,
    });
    if (resp) {
      res.json({ message: "application deleted" });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get all applications by a user. paginated query
router.get("/users/:id", checkauth, async (req, res) => {
  const perPage = 5;
  const page = req.query.page || 1;

  try {
    const applications = await JobApplication.find(
      {
        applicant: req.userId,
      },
      "-cv"
    )
      .populate("job", "title status")
      .sort({ datePosted: 1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const total = await JobApplication.find({
      applicant: req.userId,
    }).countDocuments();
    console.log(applications.length);
    res.json({ applications, total });
  } catch (err) {
    res.json({ message: "server error" });
  }
});
export default router;
