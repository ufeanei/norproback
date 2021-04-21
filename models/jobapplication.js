var mongoose = require("mongoose");

jobapplicationSchema = new mongoose.Schema({
  coverletter: String,
  cv: String,
  status: String,
  jobtitle: String,
  jobid: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now() },
  applicant: {
    id: mongoose.Schema.Types.ObjectId,
    picture: String,
    name: String,
    latestjob: String,
    highestdiplome: String,
    location: String, // combine kommune and city here
  },
});

var Jobapplication = mongoose.model("Jobapplication", jobapplicationSchema);
export default Jobapplication;
