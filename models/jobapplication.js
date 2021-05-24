import mongoose from "mongoose";

const jobapplicationSchema = new mongoose.Schema({
  coverletter: String,
  cv: String,
  status: String,
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  jobPostedby: mongoose.Schema.Types.ObjectId,
  jobCom: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  createdAt: { type: Date, default: Date.now() },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "applicant må fylle ut"],
  },
});

const JobApplication = mongoose.model("Jobapplication", jobapplicationSchema);
export default JobApplication;
