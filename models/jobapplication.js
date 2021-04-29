import mongoose from "mongoose";

jobapplicationSchema = new mongoose.Schema({
  coverletter: String,
  cv: String,
  status: String,
  jobtitle: String,
  jobid: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now() },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

var Jobapplication = mongoose.model("Jobapplication", jobapplicationSchema);
export default Jobapplication;
