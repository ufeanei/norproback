import express from "express";
import User from "../models/user.js";
import Job from "../models/job.js";
import JobApplication from "../models/jobapplication.js";
import checkauth from "../middlewares/checkauth.js";

const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

// get applications for a job. make sure only the jobowner can do this
router.get("/:jobId", checkauth, async (req, res) => {
  const jobId = req.params.jobId;
  try {
    const applications = await JobApplication.find({ jobId: jobid })
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

// save new application
router.post("/", urlencodedParser, checkauth, async (re, res) => {
  const appli = req.body;
  appli.applicant = req.userId;
  appli.status = "Under Review";

  try {
    const appOb = new JobApplication(appli);
    if (appOb) {
      res.json({ message: "new jobapp saved" });
    } else {
      res.json({ message: "sever error" });
    }
  } catch (err) {
    res.json({ message: "sever error" });
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
      res.json({ message: "sever error" });
    }
  } catch (err) {
    res.json({ message: "sever error" });
  }
});

export default router;
